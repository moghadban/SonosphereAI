import librosa
import numpy as np


def vocal_to_instrument(vocal_file, instrument, output_file):
    y, sr = librosa.load(vocal_file)
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    if instrument == 'piano':
        yInstrument = librosa.effects.pitch_shift(y_harmonic, sr, n_steps=2)
    elif instrument == 'guitar':
        yInstrument = librosa.effects.pitch_shift(y_harmonic, sr, n_steps=4)
    elif instrument == 'violin':
        yInstrument = librosa.effects.pitch_shift(y_harmonic, sr, n_steps=6)
    elif instrument == 'drums':
        yInstrument = y_percussive
    elif instrument == 'bass':
        yInstrument = librosa.effects.pitch_shift(y_harmonic, sr, n_steps=-2)
    elif instrument == 'flute':
        yInstrument = librosa.effects.pitch_shift(y_harmonic, sr, n_steps=8)
    elif instrument == 'bell':
        yInstrument = librosa.effects.pitch_shift(y_harmonic, sr, n_steps=10)
    else:
        raise ValueError('Invalid instrument')
        librosa.output.write_wav(output_file, yInstrument, sr)


def get_instrument_options():
    return {
        "instruments": [
            {"code": "piano", "name": "Piano"},
            {"code": "guitar", "name": "Guitar"},
            {"code": "violin", "name": "Violin"},
            {"code": "drums", "name": "Drums"},
            {"code": "bass", "name": "Bass"},
            {"code": "flute", "name": "Flute"},
            {"code": "bell", "name": "Bell"},
        ]
    }


def get_instrument_name(code):
    instruments = get_instrument_options()["instruments"]
    for instrument in instruments:
        if instrument["code"] == code:
            return instrument["name"]
        return None


def note_to_instrument(note, instrument, output_file):
    vocal_file = f'{note}.wav'
    vocal_to_instrument(vocal_file, instrument, output_file)


def note_editing(note, edit_type, output_file):
    y, sr = librosa.load(f'{note}.wav')
    if edit_type == 'pitch_up':
        yEdited = librosa.effects.pitch_shift(y, sr, n_steps=2)
    elif edit_type == 'pitch_down':
        yEdited = librosa.effects.pitch_shift(y, sr, n_steps=-2)
    elif edit_type == 'speed_up':
        yEdited = librosa.effects.time_stretch(y, 1.5)
    elif edit_type == 'speed_down':
        yEdited = librosa.effects.time_stretch(y, 0.5)
    else:
        raise ValueError('Invalid edit type')
        librosa.output.write_wav(output_file, yEdited, sr)


def get_edit_options():
    return {
        "edits": [
            {"code": "pitch_up", "name": "Pitch Up"},
            {"code": "pitch_down", "name": "Pitch Down"},
            {"code": "speed_up", "name": "Speed Up"},
            {"code": "speed_down", "name": "Speed Down"},
        ]
    }


def get_edit_name(code):
    edits = get_edit_options()["edits"]
    for edit in edits:
        if edit["code"] == code:
            return edit["name"]
    return None
