import librosa
from flask_cors import CORS
import numpy as np
from flask import Flask, render_template, request, jsonify
import os  # Import os for file path handling

# Note: In a real app, you would also need to import soundfile or scipy.io.wavfile
# for saving the processed audio (y_processed).

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static', )
CORS(app)

# --- 1. DEFINE CORE DATA STRUCTURES (UPDATED EDITS FOR PROPERTY-BASED EDITING) ---
# These lists are passed to index.html to populate the <select> menus
INSTRUMENTS = [
    {"code": "piano", "name": "Piano"},
    {"code": "guitar", "name": "Guitar"},
    {"code": "violin", "name": "Violin"},
    {"code": "drums", "name": "Drums"},
    {"code": "bass", "name": "Bass"},
    {"code": "flute", "name": "Flute"},
    {"code": "bell", "name": "Bell"},
]

# UPDATED: Changed from audio effects to MIDI-like property features
EDITS = [
    {"code": "pitch_bend", "name": "Pitch Bend (Value)"},
    {"code": "volume_adjust", "name": "Volume Adjust (Value)"},
    {"code": "note_duration", "name": "Set Duration (Value)"},
    {"code": "note_start_time", "name": "Set Start Time (Value)"},
    {"code": "note_end_time", "name": "Set End Time (Value)"},
]

# Lists required for the complex vocal generation form (kept from previous iteration)
GENRES = [
    'Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'Electronic', 'Country',
    'R&B', 'Metal', 'Reggae', 'Bollywood', 'Latin', 'Ambient'
]

LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Arabic'
]

VOCAL_STYLES = [
    'Male', 'Female', 'Boy', 'Girl', 'Choir'
]

ARTIST_STYLES = [
    'Ariana Grande', 'Beyoncé', 'Taylor Swift', 'Justin Bieber', 'Dua Lipa', 'The Beatles'
]


# --- 2. MAIN ROUTE ---
@app.route('/')
def index():
    """Renders the main page and passes all required lists for the dropdowns."""
    return render_template(
        'index.html',
        instruments=INSTRUMENTS,
        edits=EDITS,
        genres=GENRES,
        languages=LANGUAGES,
        vocal_styles=VOCAL_STYLES,
        artist_styles=ARTIST_STYLES
    )


# --- 3. HELPER FUNCTIONS ---

def convert_vocals_to_instrument(vocals_path, instrument):
    """Core logic for vocals to instrument conversion."""
    try:
        y, sr = librosa.load(vocals_path)
        y_harmonic, y_percussive = librosa.effects.hpss(y)

        if instrument == 'piano':
            y_instrument = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=2)
        elif instrument == 'guitar':
            y_instrument = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=4)
        elif instrument == 'violin':
            y_instrument = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=6)
        elif instrument == 'drums':
            y_instrument = y_percussive
        elif instrument == 'bass':
            y_instrument = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=-2)
        elif instrument == 'flute':
            y_instrument = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=8)
        elif instrument == 'bell':
            y_instrument = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=10)
        else:
            raise ValueError('Invalid instrument')

        # NOTE: You MUST save the y_instrument numpy array to a WAV file here
        # For now, we just return the status for mock success.

        return y_instrument, sr
    except Exception as e:
        print(f"Error converting vocals: {e}")
        return np.array([]), None


# NEW HELPER: For MIDI-like note property editing
def edit_note_properties(note_data, feature, value):
    """
    Mocks editing a note object based on MIDI-like properties.
    In a real app, this would modify a structured note object (e.g., from a score).
    """
    # Mock structured note data (pitch, volume, duration, etc.)
    # In a real app, this would load from a database or MIDI file
    mock_note = {
        'id': note_data,
        'pitch': 60,  # Middle C
        'volume': 100,
        'duration': 1.0,
        'start_time': 0.0,
        'end_time': 1.0
    }

    try:
        value = float(value)  # Ensure value is numeric for calculations
    except ValueError:
        return None, "Value must be a number."

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
        return None, 'Invalid feature type.'

    # Mock the saving process:
    # 1. Update the score/MIDI data with the modified note
    # 2. Re-render the audio file (or MIDI data)
    return mock_note, "Success"


def generate_vocals(instrument, genre, language, vocal_style, artist_style, text_input, voice_upload):
    """Stub for the complex AI vocal generation logic."""
    source = "Text Input" if text_input else "Voice Upload"
    print(f"Starting vocal generation via {source}...")
    # This is a mock function, it returns a status instead of actual audio data
    return {
        'instrument': instrument,
        'genre': genre,
        'status': 'Processing complete for AI Vocal Generation'
    }


# --- UPDATED: Enhanced noise reduction logic ---
def reduce_noise(audio_path):
    """
    Noise reduction helper using a spectral masking simulation,
    aligning with the goal of providing a non-trivial audio processing function.
    """
    try:
        y, sr = librosa.load(audio_path)

        # 1. Compute the short-time Fourier transform (STFT)
        S_full, phase = librosa.magphase(librosa.stft(y))

        # 2. Create a simple soft mask (spectral gate simulation)
        # This helps in defining which parts of the spectrogram are "signal" vs "noise"
        S_mask = librosa.util.softmask(S_full, margin=4, power=1)

        # 3. Apply the mask to reduce content below a certain threshold
        S_reduced = S_full * S_mask

        # 4. Invert the STFT to get the processed time-series audio
        noise_reduced = librosa.istft(S_reduced * phase)

        return noise_reduced, sr
    except Exception as e:
        print(f"Error reducing noise: {e}")
        return np.array([]), None


# --- 4. ROUTE: AI VOCAL GENERATION (Uses Stub Helper) ---
@app.route('/generate_vocals', methods=['POST'])
def generate_vocals_route():
    # Gather all parameters from the new form
    instrument = request.form.get('instrument')
    genre = request.form.get('genre')
    language = request.form.get('language')
    vocal_style = request.form.get('vocal_style')
    artist_style = request.form.get('artist_style')
    text_input = request.form.get('text_input')
    voice_upload = request.files.get('voice_upload')

    if not any([text_input, voice_upload]):
        return jsonify(
            {"status": "error", "message": "Please provide either text or a voice file for generation."}), 400

    # Call the helper function stub
    result = generate_vocals(
        instrument, genre, language, vocal_style, artist_style, text_input, voice_upload
    )

    if result:
        return jsonify({"status": "success", "generation_result": result})

    return jsonify({"status": "error", "message": "Generation failed."}), 500


# --- 5. ROUTE: NOTE EDITING (UPDATED FOR MIDI-LIKE PROPERTIES) ---
@app.route('/note_editing', methods=['POST'])
def note_editing():
    note_name = request.form.get('note')
    feature = request.form.get('feature')
    value = request.form.get('value')

    if not all([note_name, feature, value]):
        return jsonify({"status": "error", "message": "Missing note, feature, or value."}), 400

    # Call the new property-based editing function
    edited_note_mock, status = edit_note_properties(note_name, feature, value)

    if status == "Success" and edited_note_mock:
        return jsonify({
            "status": "success",
            "message": f"Note '{note_name}' edited (Feature: {feature}, Value: {value}).",
            "new_note_state": edited_note_mock
        })
    else:
        return jsonify({"status": "error", "message": f"Editing failed: {status}"}), 400


# --- 6. ROUTE: VOCALS TO INSTRUMENT (Uses Integrated Logic) ---
@app.route('/vocals_to_instrument', methods=['POST'])
def vocals_to_instrument():
    if 'vocal_file' not in request.files:
        return jsonify({"status": "error", "message": "No file part in the request."}), 400

    vocal_file = request.files['vocal_file']
    instrument = request.form.get('instrument')

    if vocal_file.filename == '':
        return jsonify({"status": "error", "message": "No selected file."}), 400

    if vocal_file and instrument:
        temp_path = os.path.join('/tmp', vocal_file.filename)
        # Use try/finally to ensure file is deleted
        try:
            vocal_file.save(temp_path)
            y_processed, sr = convert_vocals_to_instrument(temp_path, instrument)

            if y_processed.size > 0:
                # In a real app: save the audio array y_processed to a file and return URL
                return jsonify({"status": "success",
                                "message": f"Conversion to {instrument} complete. Audio ready for download (mocked)."})
            else:
                return jsonify({"status": "error", "message": "Audio processing failed."}), 500
        except ValueError as e:
            return jsonify({"status": "error", "message": str(e)}), 400
        except Exception as e:
            return jsonify({"status": "error", "message": f"Server processing error: {e}"}), 500
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    return jsonify({"status": "error", "message": "Missing file or instrument."}), 400


# --- 7. ROUTE: NOISE REDUCTION (Uses Integrated Logic) ---
@app.route('/noise_reduction', methods=['POST'])
def noise_reduction():
    if 'audio_file' not in request.files:
        return jsonify({"status": "error", "message": "No audio file part."}), 400

    audio_file = request.files['audio_file']
    if audio_file.filename == '':
        return jsonify({"status": "error", "message": "No selected file."}), 400

    if audio_file:
        temp_path = os.path.join('/tmp', audio_file.filename)
        try:
            audio_file.save(temp_path)
            # Calls the updated reduce_noise function
            noise_reduced, sr = reduce_noise(temp_path)

            if noise_reduced.size > 0:
                # In a real app: save the audio array noise_reduced to a file and return URL
                return jsonify(
                    {"status": "success", "message": "Noise reduction complete. Audio ready for download (mocked)."})
            else:
                return jsonify({"status": "error", "message": "Noise reduction processing failed."}), 500
        except Exception as e:
            return jsonify({"status": "error", "message": f"Server processing error: {e}"}), 500
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    return jsonify({"status": "error", "message": "File upload error."}), 400


if __name__ == '__main__':
    os.makedirs('/tmp', exist_ok=True)
    app.run(debug=True)
