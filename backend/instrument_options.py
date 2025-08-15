from gtts import gTTS
import librosa
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Define genres
genres = [
    'Pop',
    'Rock',
    'Jazz',
    'Classical',
    'Hip-Hop',
    'Electronic',
    'Country',
    'Folk',
    'R&B',
    'Metal',
    'Reggae',
    'Bollywood',
    'Arabic',
    'Latin',
    'Afrobeat',
    'K-Pop',
    'J-Pop',
    'C-Pop',
    'Musical Theater',
    'Opera',
    'Choral',
    'Instrumental',
    'Lo-Fi',
    'Ambient',
    'New Age',
    'Experimental']

# Define instruments
instruments = [
    'Piano',
    'Guitar',
    'Drums',
    'Bass',
    'Violin',
    'Cello',
    'Trumpet',
    'Saxophone',
    'Flute',
    'Clarinet',
    'Harp',
    'Xylophone',
    'Marimba',
    'Vibraphone',
    'Percussion',
    'Accordion',
    'Banjo',
    'Mandolin',
    'Ukulele',
    'Harmonica',
    'Bagpipes',
    'Sitar',
    'Tabla',
    'Oud',
    'Qraqeb',
    'Riq',
    'Darbuka']

# Define languages
languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Russian',
    'Hindi',
    'Bengali',
    'Punjabi',
    'Urdu',
    'Telugu',
    'Tamil',
    'Marathi',
    'Gujarati',
    'Kannada',
    'Malayalam',
    'Odia',
    'Sindhi',
    'Swahili',
    'Yoruba',
    'Zulu',
    'Amharic',
    'Hausa',
    'Igbo',
    'Shona',
    'Wolof']

# Define vocal styles
vocal_styles = [
    'Male', 'Female', 'Boy', 'Girl'
]

# Define artist styles
artist_styles = [
    'Ariana Grande',
    'Beyoncé',
    'Katy Perry',
    'Lady Gaga',
    'Taylor Swift',
    'Justin Bieber',
    'Shawn Mendes',
    'Camila Cabello',
    'Harry Styles',
    'Dua Lipa']


def generate_vocals(
        instrument,
        genre,
        language,
        vocal_style,
        artist_style,
        voice_upload=None,
        text_input=None):


    if voice_upload:
            # Process uploaded voice
        audio, sr = librosa.load(voice_upload)
        vocals = librosa.effects.vocal_extract(audio, sr)
        return vocals

    elif text_input:
            # Generate vocals from text input using AI
        vocals = generate_vocals_from_text(text_input)
        return vocals

    else:
            # Define the input features
        input_features = np.array([
            instruments.index(instrument),
            genres.index(genre),
            languages.index(language),
            vocal_styles.index(vocal_style),
            artist_styles.index(artist_style)
        ])
        # Reshape the input features
        input_features = input_features.reshape(1, 5)

        # Generate vocals using the model
        vocals = model.predict(input_features)

        # Convert the vocals to audio
        vocals = vocals.reshape(44100, 2)
        librosa.output.write_wav('vocals.wav', vocals, 44100)

        return 'vocals.wav'


def generate_vocals_from_text(text_input):
    tts = gTTS(text=text_input, lang='en')
    vocals = tts.save('vocals.mp3')
    return vocals


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        instrument = request.form['instrument']
        genre = request.form['genre']
        language = request.form['language']
        vocal_style = request.form['vocal_style']
        artist_style = request.form['artist_style']
        voice_upload = request.files.get('voice_upload')
        text_input = request.form.get('text_input')
        vocals = generate_vocals(
            instrument,
            genre,
            language,
            vocal_style,
            artist_style,
            voice_upload,
            text_input)
        return render_template('output.html', vocals=vocals)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
