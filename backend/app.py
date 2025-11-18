# ===== app.py =====
# ----------------------------------------------------
# Core Application Setup
# ----------------------------------------------------
import os

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename

from instrument_options import (
    VOCAL_STYLES, MALE_VOICE_NAMES, FEMALE_VOICE_NAMES
)
from lyrics_generator import generate_lyrics_with_markov, LYRICS_LANGUAGES
from shared import (
    reduce_noise_return,
    get_lang_abbr,
    analyze_vocal_and_enrich_prompt,
    generate_full_music_with_musicgen,
    generate_vocals_with_tts,
    refine_and_mix_vocal,
    convert_audio_format
)
# ----------------------------------------------------
# Modular Component Imports
# ----------------------------------------------------
from utilities import (
    INSTRUMENTS, GENRES, LANGUAGES, TTS_ENGINES, LANGUAGE_CODE_MAP
)

# ----------------------------------------------------
# Flask Configuration
# ----------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_STATIC = os.path.normpath(os.path.join(BASE_DIR, '../frontend/static'))
TMP_DIR = os.path.join(os.getenv('TEMP', os.path.join(BASE_DIR, 'tmp')), 'sonosphere_tmp')
OUTPUT_DIR = os.path.normpath(os.path.join(FRONTEND_STATIC, 'outputs'))

os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------
# App Setup
# -------------------------
app = Flask(__name__, template_folder=FRONTEND_STATIC, static_folder=FRONTEND_STATIC)
CORS(app)


# ----------------------------------------------------
# Root Route
# ----------------------------------------------------
@app.route('/')
def index():
    """Render frontend index page."""
    return render_template('index.html')


# ----------------------------------------------------
# Form Options API
# ----------------------------------------------------
@app.route('/api/form_data')
def get_form_data():
    return jsonify({
        "instruments": INSTRUMENTS,
        "genres": GENRES,
        "languages": LANGUAGES,
        "lang_map": LANGUAGE_CODE_MAP,
        "lyrics_languages": LYRICS_LANGUAGES,
        "vocal_styles": VOCAL_STYLES,
        "male_voice_names": MALE_VOICE_NAMES,
        "female_voice_names": FEMALE_VOICE_NAMES,
        "tts_engines": TTS_ENGINES,
    })


# ----------------------------------------------------
# Lyrics Generation
# ----------------------------------------------------
@app.route('/generate_lyrics', methods=['POST'])
def generate_lyrics_route():
    """
    Generate lyrics using Markov chain based on language, theme, and length.
    """
    try:
        lyrics_language_raw = request.form.get('lyrics_language', 'English')
        lyrics_language = lyrics_language_raw.strip().title() if lyrics_language_raw else 'English'

        theme = request.form.get('theme', 'Pop')
        lyric_length_label = request.form.get('lyric_length', 'Medium (8-16 lines)')
        bias = request.form.get('bias', None)

        # Determine line count based on provided label
        label_lower = lyric_length_label.lower()
        short_keywords = ['short', 'قصير', '短', 'court', 'kurz', 'corto', 'короткий', 'corto']
        long_keywords = ['long', 'طويل', '长', 'long', 'lang', 'lungo', 'длинный', 'largo']

        if any(k in label_lower for k in short_keywords):
            min_lines, max_lines = 4, 6
        elif any(k in label_lower for k in long_keywords):
            min_lines, max_lines = 16, 20
        else:
            min_lines, max_lines = 8, 12

        lyrics_text = generate_lyrics_with_markov(
            language=lyrics_language,
            genre=theme,
            min_lines=min_lines,
            max_lines=max_lines,
            bias=bias
        )

        if not lyrics_text:
            return jsonify({
                "status": "error",
                "message": f"Could not generate lyrics for {lyrics_language}/{theme}. Corpus may be empty."
            }), 500

        return jsonify({
            "status": "success",
            "generation_result": {
                "lyrics_text": lyrics_text,
                "language": lyrics_language,
                "theme": theme,
                "line_count": len(lyrics_text.splitlines()),
                "min_lines": min_lines,
                "max_lines": max_lines
            }
        })

    except Exception as e:
        print(f"[ERROR] /generate_lyrics: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ----------------------------------------------------
# Noise Reduction (Primary)
# ----------------------------------------------------
@app.route("/noise_reduction", methods=["POST"])
def noise_reduction():
    file_type = request.form.get('type', 'wav')

    # Get uploaded file
    noise_file = request.files.get("audio_file")  # matches <input name="audio_file">
    if not noise_file:
        return jsonify({"status": "error", "message": "No file uploaded."}), 400

    # Save uploaded file temporarily
    # uploaded_file.save(input_path)
    original_filename = secure_filename(f"{os.urandom(8).hex()}_{noise_file.filename}")
    original_path = os.path.join(OUTPUT_DIR, original_filename)
    noise_file.save(original_path)

    # Call noise reduction
    # should return full path to reduced file
    try:
        original_path, reduced_path = reduce_noise_return(original_path)
        reduced_path = convert_audio_format(reduced_path, file_type)
        # Build response
        response_result = {
            "status": "Noise reduction complete!",
            "original_file": os.path.basename(original_path),
            "original_audio_url": f"/static/outputs/{os.path.basename(original_path)}",
            "noise_reduce_file": os.path.basename(reduced_path),
            "noise_reduced_url": f"/static/outputs/{os.path.basename(reduced_path)}"
        }

        return jsonify({"status": "success", "generation_result": response_result})

    except Exception as e:
        print(f"[noise_reduction] error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ----------------------------------------------------
# Generate Vocals + Music + Mixing
# ----------------------------------------------------
@app.route('/generate_vocals', methods=['POST'])
def generate_vocals_route():
    """
    Generates vocals using selected TTS engine, optionally generates music,
    and mixes them unless conditions instruct skipping MusicGen.
    """

    try:
        instrument = request.form.get('instrument', 'full_music')
        genre = request.form.get('genre', 'Pop')
        language = request.form.get('language', 'English')
        lyrics = request.form.get('lyrics', '')
        vocal_style = request.form.get('vocal_style', 'Random')
        selected_voice_name = request.form.get('selected_voice_name', '')
        tts_engine = request.form.get('tts_engine', 'Bark AI')
        voice_upload = request.files.get('voice_upload')
        mode = request.form.get('mode')
        mode = mode.lower()
        print(f"mode: {mode}")
        file_type = request.form.get('type', 'wav')
        print(f"file_type: {file_type}")

        vocal_path = final_path = None
        music_path = None

        # Controls if MusicGen + mixing should be skipped
        skip_musicgen_and_mix = False

        # Handle vocals if lyrics provided
        if lyrics:
            lang_abbr = get_lang_abbr(language)

            vocal_path = generate_vocals_with_tts(
                lyrics, tts_engine, vocal_style, lang_abbr, genre,
                selected_voice_name, instrument, voice_upload, mode
            )

            if not (vocal_path and os.path.exists(vocal_path) and os.path.getsize(vocal_path) > 0):
                return jsonify({"status": "error", "message": f"{tts_engine} generation failed."}), 500

            # Skip mixing when Bark AI creates full_music with Random voice
            if (
                    tts_engine == 'Bark AI'
                    and vocal_style.lower() == "random"
                    and instrument.lower() == "full_music"
                    and not voice_upload
                    and mode == 'full_music'
            ):
                skip_musicgen_and_mix = True
                final_path = vocal_path
            elif (
                    tts_engine in ['Bark AI', 'Coqui XTTS']
                    and vocal_style.lower() in ["random", "male", "female"]
                    and mode != 'full_music'
                    and not voice_upload
            ):
                skip_musicgen_and_mix = True
                final_path = vocal_path
            elif (
                    tts_engine in ['Bark AI', 'Coqui XTTS']
                    and mode != 'full_music'
                    and voice_upload
            ):
                skip_musicgen_and_mix = True
                final_path = vocal_path
        # Music + mixing (if not skipped)
        if vocal_path and final_path is None and not skip_musicgen_and_mix:
            music_prompt = analyze_vocal_and_enrich_prompt(vocal_path, genre, instrument, lyrics)
            music_path = generate_full_music_with_musicgen(prompt=music_prompt)

            if not music_path:
                return jsonify({"status": "error", "message": "Music generation failed."}), 500

            final_path = refine_and_mix_vocal(vocal_path, music_path)

        if not final_path:
            return jsonify({
                "status": "error",
                "message": "Could not finalize track. Check vocal file and instrument selection."
            }), 500

        # Build response
        print(f"full music file_type to be converted to: {file_type}")
        final_path = convert_audio_format(final_path, file_type)
        result = {
            "status": "Song created!",
            "file": os.path.basename(final_path),
            "final_audio_url": f"/static/outputs/{os.path.basename(final_path)}",
            "source": "vocal_only" if skip_musicgen_and_mix else "mixed"
        }

        # Add raw music and raw vocal if available
        if music_path and os.path.exists(music_path):
            print(f"music file_type to be converted to: {file_type}")
            music_path = convert_audio_format(music_path, file_type)
            result["music_file"] = os.path.basename(music_path)
            result["music_audio_url"] = f"/static/outputs/{os.path.basename(music_path)}"

        if vocal_path and os.path.exists(vocal_path):
            print(f"music file_type to be converted to: {file_type}")
            vocal_path = convert_audio_format(vocal_path, file_type)
            result["vocal_file"] = os.path.basename(vocal_path)
            result["vocal_audio_url"] = f"/static/outputs/{os.path.basename(vocal_path)}"

        return jsonify({"status": "success", "generation_result": result})

    except Exception as e:
        print(f"[ERROR] /generate_vocals: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ----------------------------------------------------
# Main Entrypoint
# ----------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
