from gtts import gTTS
import numpy as np
from flask import Flask, request, jsonify, render_template_string, send_file
import os
import io


# --- Mocking dependencies for local run and deployment ---
# In a real environment, you would load your model and use real audio libraries.

# Mocking librosa functions
class MockLibrosa:
    def load(self, path):
        print(f"MOCK: Loading audio from {path}")
        # Return mock audio data (1 second of silence at 22050 Hz)
        return np.zeros(22050), 22050

    def output_write_wav(self, path, data, sr):
        print(f"MOCK: Writing WAV file to {path}")
        return path

    class effects:
        def vocal_extract(self, audio, sr):
            print("MOCK: Extracting vocals.")
            # Return mock extracted vocals
            return audio


librosa = MockLibrosa()


# Mocking Keras model and functions
class MockModel:
    def predict(self, features):
        print(f"MOCK: Predicting vocals for features: {features.flatten()}")
        # Return mock prediction data (44100 * 2 length array)
        return np.zeros(88200)


model = MockModel()

# --- Application Setup ---

app = Flask(__name__)

# Define genres
genres = [
    'Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'Electronic', 'Country', 'Folk', 'R&B', 'Metal',
    'Reggae', 'Bollywood', 'Arabic', 'Latin', 'Afrobeat', 'K-Pop', 'J-Pop', 'C-Pop',
    'Musical Theater', 'Opera', 'Choral', 'Instrumental', 'Lo-Fi', 'Ambient', 'New Age', 'Experimental'
]

# Define instruments
# Added 'Full Music' to instruments list

instruments = [
    'Full Music',
    'Piano', 'Guitar', 'Drums', 'Bass', 'Violin', 'Cello', 'Trumpet', 'Saxophone', 'Flute',
    'Clarinet', 'Harp', 'Xylophone', 'Marimba', 'Vibraphone', 'Percussion', 'Accordion',
    'Banjo', 'Mandolin', 'Ukulele', 'Harmonica', 'Bagpipes', 'Sitar', 'Tabla', 'Oud',
    'Qraqeb', 'Riq', 'Darbuka'
]


# Define languages
languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese',
    'Korean', 'Arabic', 'Russian', 'Hindi', 'Bengali', 'Punjabi', 'Urdu', 'Telugu', 'Tamil',
    'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Sindhi', 'Swahili', 'Yoruba',
    'Zulu', 'Amharic', 'Hausa', 'Igbo', 'Shona', 'Wolof'
]

# Define vocal styles
vocal_styles = [
    'Male', 'Female', 'Boy', 'Girl'
]

# Define artist styles
artist_styles = [
    'Ariana Grande', 'Beyoncé', 'Katy Perry', 'Lady Gaga', 'Taylor Swift', 'Justin Bieber',
    'Shawn Mendes', 'Camila Cabello', 'Harry Styles', 'Dua Lipa'
]

# Mock data for other tools (as referenced in the original index.html)
mock_edits = [
    {'code': 'pitch', 'name': 'Change Pitch'},
    {'code': 'tempo', 'name': 'Adjust Tempo'},
    {'code': 'quantize', 'name': 'Quantize Timing'},
]


def generate_vocals(
        instrument,
        genre,
        language,
        vocal_style,
        artist_style,
        voice_upload=None,
        text_input=None):
    output_filename = 'vocals.mp3'

    if voice_upload:
        # Save the uploaded file temporarily (mocked)
        voice_upload.save(output_filename)
        print(f"Processing uploaded file: {output_filename}")
        # In a real app, you would process this file with librosa
        return output_filename  # Return the path/filename for the result page

    elif text_input:
        # Generate vocals from text input using gTTS
        try:
            tts = gTTS(text=text_input, lang='en')
            # Save to a temporary file in memory or disk
            tts.save(output_filename)
            print(f"Generated text-to-speech audio: {output_filename}")
            return output_filename
        except Exception as e:
            print(f"gTTS error: {e}")
            return None

    else:
        # Generate vocals using the mock model logic
        input_features = np.array([
            instruments.index(instrument),
            genres.index(genre),
            languages.index(language),
            vocal_styles.index(vocal_style),
            artist_styles.index(artist_style)
        ])
        input_features = input_features.reshape(1, 5)

        # Mock model prediction
        vocals_data = model.predict(input_features)

        # Mock writing WAV file
        librosa.output_write_wav(output_filename, vocals_data, 44100)

        return output_filename


# Simplified rendering logic using a basic template string
# In a real Flask app, 'render_template' would be used.
# Since we cannot provide multiple files, this acts as the main handler.
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Check which form was submitted (the full vocal form is the main focus)
        if 'genre' in request.form:
            instrument = request.form['instrument']
            genre = request.form['genre']
            language = request.form['language']
            vocal_style = request.form['vocal_style']
            artist_style = request.form['artist_style']
            voice_upload = request.files.get('voice_upload')
            text_input = request.form.get('text_input')

            # Basic validation
            if not text_input and not voice_upload and not all(
                    [instrument, genre, language, vocal_style, artist_style]):
                return "Error: Please provide all required generation parameters, or a text input, or a voice upload.", 400

            vocals_file = generate_vocals(
                instrument, genre, language, vocal_style, artist_style, voice_upload, text_input
            )

            if vocals_file:
                # In a real Flask app, you would render 'output.html'
                # Here, we will just return a simple message since we can't send files properly.
                return f"""
                <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
                    <h1>Generation Complete!</h1>
                    <p>File created: <strong>{vocals_file}</strong></p>
                    <p>Your generated track using the style of <strong>{artist_style}</strong> ({genre}) is ready.</p>
                    <a href="/" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go Back</a>
                </div>
                """
            else:
                return "Error generating audio.", 500

        # Handle other, simpler form submissions if they were still present in the UI
        elif request.form.get('instrument'):
            # This is the old, simple instrument form submission
            return f"MOCK: Instrument generation requested for {request.form['instrument']}.", 200

    # GET request: Render the main page. In a real app, this would render index.html
    # Since we can't render the Twig template, I will demonstrate the full HTML structure
    # in the separate file, assuming the Flask app passes this context:
    context = {
        'instruments': instruments,
        'genres': genres,
        'languages': languages,
        'vocal_styles': vocal_styles,
        'artist_styles': artist_styles,
        'edits': mock_edits
    }

    # Returning a placeholder for the index page since the full UI is in the next file block
    return """
    <h1>SonosphereAI Backend Mock</h1>
    <p>Run the 'index.html' file to see the intended frontend structure.</p>
    """

# We do not run the app here as the file blocks are just for structure.
# if __name__ == '__main__':
#     app.run(debug=True)
