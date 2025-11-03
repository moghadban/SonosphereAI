import os
import librosa
import numpy as np
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from gtts import gTTS
import os

app = Flask(
    __name__,
    template_folder='../frontend/static',
    static_folder='../frontend/static'
)
CORS(app)

TMP_DIR = '/tmp'
OUTPUT_DIR = os.path.join('../frontend/static', 'outputs')
os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------
# Core Data Structures - RESTORED VOCAL AND ARTIST STYLES
# -------------------------
INSTRUMENTS = [
    {"code": "full_music", "name": "Full Music"},
    {"code": "piano", "name": "Piano"},
    {"code": "guitar", "name": "Guitar"},
    {"code": "violin", "name": "Violin"},
    {"code": "drums", "name": "Drums"},
    {"code": "bass", "name": "Bass"},
    {"code": "flute", "name": "Flute"},
    {"code": "bell", "name": "Bell"},
]

EDITS = [
    {"code": "pitch_bend", "name": "Pitch Bend (Value)"},
    {"code": "volume_adjust", "name": "Volume Adjust (Value)"},
    {"code": "note_duration", "name": "Set Duration (Value)"},
    {"code": "note_start_time", "name": "Set Start Time (Value)"},
    {"code": "note_end_time", "name": "Set End Time (Value)"},
]

GENRES = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'Electronic', 'Country',
          'R&B', 'Metal', 'Reggae', 'Bollywood', 'Latin', 'Ambient']
LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Arabic']
VOCAL_STYLES = ['Male', 'Female', 'Boy', 'Girl', 'Choir']
ARTIST_STYLES = ['Ariana Grande', 'Beyoncé', 'Taylor Swift', 'Justin Bieber', 'Dua Lipa', 'The Beatles']  # RESTORED


def save_temp_file(uploaded_file):
    # Use a more unique file name
    filename = f"{os.urandom(8).hex()}_{uploaded_file.filename}"
    path = os.path.join(TMP_DIR, filename)
    uploaded_file.save(path)
    return path


def save_output_audio(y, sr, filename):
    path = os.path.join(OUTPUT_DIR, filename)
    # Placeholder for audio saving
    return path


def convert_vocals_to_instrument(vocals_path, instrument):
    try:
        y, sr = librosa.load(vocals_path)
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        pitch_map = {'piano': 2, 'guitar': 4, 'violin': 6, 'bass': -2, 'flute': 8, 'bell': 10}

        if instrument == 'drums':
            y_out = y_percussive
        elif instrument == 'full_music':
            # Full Music: Auto-generate balanced harmonic + percussive track
            y_out = y_harmonic + 0.5 * y_percussive
        else:
            y_out = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=pitch_map.get(instrument, 0))
        return y_out, sr
    except Exception as e:
        print(f"Error converting vocals: {e}")
        return np.array([]), None


def edit_note_properties(note_data, feature, value):
    mock_note = {'id': note_data, 'pitch': 60, 'volume': 100, 'duration': 1.0, 'start_time': 0.0, 'end_time': 1.0}
    try:
        value = float(value)
    except ValueError:
        return None, "Value must be numeric"
    if feature == 'pitch_bend':
        mock_note['pitch'] += value
    elif feature == 'volume_adjust':
        mock_note['volume'] += value
    elif feature == 'note_duration':
        mock_note['duration'] = value
    elif feature == 'note_start_time':
        mock_note['start_time'] = value
    elif feature == 'note_end_time':
        mock_note['end_time'] = value
    else:
        return None, 'Invalid feature'
    return mock_note, "Success"


# -------------------------
# Routes
# -------------------------
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/form_data')
def get_form_data():
    """Returns all data, including restored styles."""
    return jsonify({
        "instruments": INSTRUMENTS,
        "edits": EDITS,
        "genres": GENRES,
        "languages": LANGUAGES,
        "vocal_styles": VOCAL_STYLES,  # RESTORED
        "artist_styles": ARTIST_STYLES  # RESTORED
    })


@app.route('/generate_vocals', methods=['POST'])
def generate_vocals_route():
    try:
        # Collect parameters from the unified form submission
        instrument = request.form.get('instrument')
        genre = request.form.get('genre')
        language = request.form.get('language')

        # Style options (sent by the original 'Instrument Options' tab)
        vocal_style = request.form.get('vocal_style')
        artist_style = request.form.get('artist_style')

        # Content options (sent by EITHER tab)
        lyrics = request.form.get('lyrics')
        voice_upload = request.files.get('voice_upload')

        # Determine the source and proceed with mock processing
        if voice_upload:
            saved_path = save_temp_file(voice_upload)
            print(f"Mock AI processing uploaded vocal at: {saved_path} with: {instrument}, {genre}, {language}")

            return jsonify({
                "status": "success",
                "generation_result": {
                    "status": f"Uploaded vocal processed for {instrument} track and melody generation.",
                    "file_name": os.path.basename(saved_path)}
            })

        elif lyrics:
            try:
                # Handle Text-to-Speech (Lyrics)
                lang_code = language.lower()[:2] if language else 'en'
                tts = gTTS(text=lyrics, lang=lang_code)
                output_path = os.path.join(OUTPUT_DIR, "generated_vocals_tts.mp3")
                tts.save(output_path)

                # Report styles only if they were part of the request (i.e., from the Instrument Options tab)
                style_info = f" (Styles: {vocal_style}, {artist_style})" if vocal_style or artist_style else ""
                print(
                    f"Mock AI generating melody for lyrics: '{lyrics}' with: {instrument}, {genre}, {language}{style_info}")

                return jsonify({
                    "status": "success",
                    "generation_result": {
                        "status": f"Lyrics converted to speech and melody generated for {instrument}{style_info}",
                        "file": os.path.basename(output_path)}
                })
            except Exception as e:
                return jsonify({"status": "error", "message": f"TTS generation failed: {e}"}), 500

        else:
            # Instrumental Only (no vocals/lyrics/upload)
            return jsonify({
                "status": "success",
                "generation_result": {"status": f"Instrumental track generation complete for {instrument}"}
            })

    except Exception as e:
        print(f"Error in /generate_vocals: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/get_notes', methods=['GET'])
def get_notes():
    """Return a list of all possible notes (C0–B8)."""
    notes = []
    for octave in range(0, 9):  # 0–8
        for n in ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']:
            notes.append(f"{n}{octave}")
    return jsonify({'notes': notes})


@app.route('/note_editing', methods=['POST'])
def note_editing_route():
    data = request.get_json()
    note_name = data.get('note')
    feature = data.get('feature')
    value = data.get('value')
    if not all([note_name, feature, value]):
        return jsonify({"status": "error", "message": "Missing note, feature, or value."}), 400
    edited_note, status = edit_note_properties(note_name, feature, value)
    if status == "Success":
        return jsonify({"status": "success", "message": f"Note '{note_name}' edited", "new_note_state": edited_note})
    return jsonify({"status": "error", "message": f"Editing failed: {status}"}), 400

@app.route('/generate_lyrics', methods=['POST'])
def generate_lyrics_route():
    try:
        music_upload = request.files.get('music_upload')
        theme = request.form.get('theme')
        language = request.form.get('language')
        rhyme_scheme = request.form.get('rhyme_scheme')
        lyric_length = request.form.get('lyric_length')

        if not music_upload:
            return jsonify({"status": "error", "message": "No music file uploaded."}), 400

        # Save the uploaded file (mock processing)
        saved_path = save_temp_file(music_upload)

        # Mock AI processing based on melody parameters
        mock_lyrics = f"""
        (Mock Lyrics Generated)
        The rhythm of the music flows,
        A story that the melody knows.
        In {language}, a {theme} refrain,
        Following the {rhyme_scheme} chain.
        This is a mock generation for a {lyric_length} output.
        """

        print(f"Mock AI generated lyrics for music at: {saved_path}. Lyrics: {mock_lyrics}")

        return jsonify({
            "status": "success",
            "generation_result": {
                "status": f"Lyrics generated successfully for music file. Theme: {theme}",
                "lyrics": mock_lyrics,
                "file_name": os.path.basename(saved_path)
            }
        })

    except Exception as e:
        print(f"Error in /generate_lyrics: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
# Run server
if __name__ == '__main__':
    app.run(debug=True)

