import numpy as np
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# --------------------------
# Note conversion functions
# --------------------------
def note_to_num(note):
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    return notes.index(note[0]) + int(note[1]) * 12

def num_to_note(num):
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    return notes[num % 12] + str(num // 12)

# --------------------------
# Note editing features
# --------------------------
features = [
    'pitch_bend',
    'volume_adjust',
    'note_duration',
    'note_start_time',
    'note_end_time'
]

def edit_note(note, feature, value):
    if feature == 'pitch_bend':
        note['pitch'] += value
    elif feature == 'volume_adjust':
        note['volume'] += value
    elif feature == 'note_duration':
        note['duration'] = value
    elif feature == 'note_start_time':
        note['start_time'] = value
    elif feature == 'note_end_time':
        note['end_time'] = value
    return note

# --------------------------
# Routes
# --------------------------
@app.route('/edit_note', methods=['POST'])
def edit_note_api():
    note = request.json['note']
    feature = request.json['feature']
    value = request.json['value']
    edited_note = edit_note(note, feature, value)
    return jsonify(edited_note)

@app.route('/get_notes', methods=['GET'])
def get_notes():
    """Return a list of all possible notes (C0–B8)."""
    notes = []
    for octave in range(0, 9):  # 0–8
        for n in ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']:
            notes.append(f"{n}{octave}")
    return jsonify({'notes': notes})

@app.route('/note_editing', methods=['GET', 'POST'])
def note_editing():
    if request.method == 'POST':
        note = request.form['note']
        feature = request.form['feature']
        value = request.form['value']
        edited_note = edit_note(note, feature, value)
        return render_template('note_editing.html', edited_note=edited_note)
    return render_template('note_editing.html')

if __name__ == '__main__':
    app.run(debug=True)
