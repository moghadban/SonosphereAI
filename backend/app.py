import librosa
from flask_cors import CORS
import numpy as np
from flask import Flask, render_template, request, jsonify
app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static',)
CORS(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/note_editing', methods=['GET', 'POST'])
def note_editing():
    if request.method == 'POST':
        note = request.form['note']
        feature = request.form['feature']
        value = request.form['value']
        edited_note = edit_note(note, feature, value)
        return jsonify(edited_note)
    return render_template('note_editing.html')


@app.route('/instrument_options', methods=['GET', 'POST'])
def instrument_options():
    if request.method == 'POST':
        instrument = request.form['instrument']
        genre = request.form['genre']
        language = request.form['language']
        vocal_style = request.form['vocal_style']
        artist_style = request.form['artist_style']
        options = generate_instrument_options(
            instrument, genre, language, vocal_style, artist_style
        )
        return jsonify(options)
    return render_template('instrument_options.html')


@app.route('/vocals_to_instrument', methods=['GET', 'POST'])
def vocals_to_instrument():
    if request.method == 'POST':
        vocals = request.form['vocals']
        instrument = request.form['instrument']
        output = convert_vocals_to_instrument(vocals, instrument)
        return jsonify(output)
    return render_template('vocals_to_instrument.html')


@app.route('/noise_reduction', methods=['GET', 'POST'])
def noise_reduction():
    if request.method == 'POST':
        audio = request.form['audio']
        output = reduce_noise(audio)
        return jsonify(output)
    return render_template('noise_reduction.html')


def edit_note(note, feature, value):
    note = {
        'pitch': 0,
        'volume': 0,
        'duration': 0,
        'start_time': 0,
        'end_time': 0,
    }
    if feature == 'pitch_bend':
        note['pitch'] += int(value)
    elif feature == 'volume_adjust':
        note['volume'] += int(value)
    elif feature == 'note_duration':
        note['duration'] += int(value)
    elif feature == 'note_start_time':
        note['start_time'] += int(value)
    elif feature == 'note_end_time':
        note['end_time'] += int(value)
    return note


def generate_instrument_options(
        instrument,
        genre,
        language,
        vocal_style,
        artist_style):
    options = {
        'instrument': instrument,
        'genre': genre,
        'language': language,
        'vocal_style': vocal_style,
        'artist_style': artist_style,
    }
    return options


def convert_vocals_to_instrument(vocals, instrument):

    y, sr = librosa.load(vocals)
    if instrument == 'piano':
        y = librosa.effects.pitch_shift(y, sr, n_steps=2)
    elif instrument == 'guitar':
        y = librosa.effects.pitch_shift(y, sr, n_steps=4)
    elif instrument == 'drums':
        y = librosa.effects.time_stretch(y, 1.5)
    elif instrument == 'bass':
        y = librosa.effects.pitch_shift(y, sr, n_steps=-2)
    elif instrument == 'violin':
        y = librosa.effects.pitch_shift(y, sr, n_steps=3)
    return y


def reduce_noise(audio):
    y, sr = librosa.load(audio)
    noise_reduced = librosa.effects.noise_reduction(y, sr)
    return noise_reduced


if __name__ == '__main__':
    app.run(debug=True)
