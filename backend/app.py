import os
import librosa
import numpy as np
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

# -------------------------
# App Setup
# -------------------------
app = Flask(
    __name__,
    template_folder='../frontend/templates',
    static_folder='../frontend/static'
)
CORS(app)

# Ensure temp and output directories exist
TMP_DIR = '/tmp'
OUTPUT_DIR = os.path.join('../frontend/static', 'outputs')
os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------
# Core Data Structures
# -------------------------
INSTRUMENTS = [
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

GENRES = [
    'Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'Electronic', 'Country',
    'R&B', 'Metal', 'Reggae', 'Bollywood', 'Latin', 'Ambient'
]

LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Arabic'
]

VOCAL_STYLES = ['Male', 'Female', 'Boy', 'Girl', 'Choir']
ARTIST_STYLES = [
    'Ariana Grande', 'Beyoncé', 'Taylor Swift', 'Justin Bieber', 'Dua Lipa', 'The Beatles'
]

# -------------------------
# Helper Functions
# -------------------------

def save_temp_file(uploaded_file):
    path = os.path.join(TMP_DIR, uploaded_file.filename)
    uploaded_file.save(path)
    return path

def save_output_audio(y, sr, filename):
    path = os.path.join(OUTPUT_DIR, filename)
    librosa.output.write_wav(path, y, sr)
    return path

# --- Vocals to Instrument ---
def convert_vocals_to_instrument(vocals_path, instrument):
    try:
        y, sr = librosa.load(vocals_path)
        y_harmonic, y_percussive = librosa.effects.hpss(y)

        pitch_map = {
            'piano': 2, 'guitar': 4, 'violin': 6, 'bass': -2, 'flute': 8, 'bell': 10
        }

        if instrument == 'drums':
            y_out = y_percussive
        elif instrument in pitch_map:
            y_out = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=pitch_map[instrument])
        else:
            raise ValueError("Invalid instrument")

        return y_out, sr
    except Exception as e:
        print(f"Error converting vocals: {e}")
        return np.array([]), None

# --- MIDI-like Note Editing ---
def edit_note_properties(note_data, feature, value):
    mock_note = {
        'id': note_data,
        'pitch': 60, 'volume': 100, 'duration': 1.0, 'start_time': 0.0, 'end_time': 1.0
    }
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

# --- Noise Reduction ---
def reduce_noise(audio_path):
    try:
        y, sr = librosa.load(audio_path)
        S_full, phase = librosa.magphase(librosa.stft(y))
        S_mask = librosa.util.softmask(S_full, margin=4, power=1)
        S_reduced = S_full * S_mask
        y_out = librosa.istft(S_reduced * phase)
        return y_out, sr
    except Exception as e:
        print(f"Error reducing noise: {e}")
        return np.array([]), None

# --- AI Vocal Generation Stub ---
def generate_vocals(instrument, genre, language, vocal_style, artist_style, text_input, voice_upload):
    source = "Text Input" if text_input else "Voice Upload"
    print(f"Mock vocal generation using {source}")
    return {'instrument': instrument, 'genre': genre, 'status': 'Processing complete'}

# -------------------------
# Routes
# -------------------------

@app.route('/')
def index():
    return render_template(
        'index.html',
        instruments=INSTRUMENTS,
        edits=EDITS,
        genres=GENRES,
        languages=LANGUAGES,
        vocal_styles=VOCAL_STYLES,
        artist_styles=ARTIST_STYLES
    )

@app.route('/generate_vocals', methods=['POST'])
def generate_vocals_route():
    instrument = request.form.get('instrument')
    genre = request.form.get('genre')
    language = request.form.get('language')
    vocal_style = request.form.get('vocal_style')
    artist_style = request.form.get('artist_style')
    text_input = request.form.get('text_input')
    voice_upload = request.files.get('voice_upload')

    if not any([text_input, voice_upload]):
        return jsonify({"status": "error", "message": "Provide text or voice file."}), 400

    result = generate_vocals(instrument, genre, language, vocal_style, artist_style, text_input, voice_upload)
    return jsonify({"status": "success", "generation_result": result})

@app.route('/note_editing', methods=['POST'])
def note_editing_route():
    note_name = request.form.get('note')
    feature = request.form.get('feature')
    value = request.form.get('value')

    if not all([note_name, feature, value]):
        return jsonify({"status": "error", "message": "Missing note, feature, or value."}), 400

    edited_note, status = edit_note_properties(note_name, feature, value)
    if status == "Success":
        return jsonify({
            "status": "success",
            "message": f"Note '{note_name}' edited",
            "new_note_state": edited_note
        })
    return jsonify({"status": "error", "message": f"Editing failed: {status}"}), 400

@app.route('/vocals_to_instrument', methods=['POST'])
def vocals_to_instrument_route():
    vocal_file = request.files.get('vocal_file')
    instrument = request.form.get('instrument')

    if not vocal_file or not instrument:
        return jsonify({"status": "error", "message": "Missing file or instrument."}), 400

    temp_path = save_temp_file(vocal_file)
    try:
        y_out, sr = convert_vocals_to_instrument(temp_path, instrument)
        if y_out.size > 0:
            filename = f"{os.path.splitext(vocal_file.filename)[0]}_{instrument}.wav"
            output_path = save_output_audio(y_out, sr, filename)
            return jsonify({"status": "success", "message": f"Converted to {instrument}.", "file": f"/static/outputs/{filename}"})
        else:
            return jsonify({"status": "error", "message": "Audio processing failed."}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/noise_reduction', methods=['POST'])
def noise_reduction_route():
    audio_file = request.files.get('audio_file')
    if not audio_file:
        return jsonify({"status": "error", "message": "No audio file uploaded."}), 400

    temp_path = save_temp_file(audio_file)
    try:
        y_out, sr = reduce_noise(temp_path)
        if y_out.size > 0:
            filename = f"{os.path.splitext(audio_file.filename)[0]}_noise_reduced.wav"
            output_path = save_output_audio(y_out, sr, filename)
            return jsonify({"status": "success", "message": "Noise reduction complete.", "file": f"/static/outputs/{filename}"})
        else:
            return jsonify({"status": "error", "message": "Noise reduction failed."}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
@app.route('/api/form_data')
def get_form_data():
    return jsonify({
        "instruments": INSTRUMENTS,
        "edits": EDITS,
        "genres": GENRES,
        "languages": LANGUAGES,
        "vocal_styles": VOCAL_STYLES,
        "artist_styles": ARTIST_STYLES
    })
# -------------------------
# Run
# -------------------------
if __name__ == '__main__':
    app.run(debug=True)
