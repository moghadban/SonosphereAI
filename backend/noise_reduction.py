import librosa
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense


def reduce_noise(audio_file):
    y, sr = librosa.load(audio_file)
    noise_reduced = librosa.effects.noise_reduction(y, sr)
    return noise_reduced


def api_noise_reduction(audio_file):
    noise_reduced = reduce_noise(audio_file)
    return {'output': noise_reduced.tolist()}


if __name__ == '__main__':
    from flask import Flask, request, jsonify
    app = Flask(__name__)


@app.route('/api/noise-reduction', methods=['POST'])
def api_noise_reduction_route():
    audio_file = request.files['audio_file']
    output = api_noise_reduction(audio_file)
    return jsonify(output)


app.run(debug=True)
