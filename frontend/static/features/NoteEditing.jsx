window.NoteEditing = ({ edits, noteEditOptions, setNoteEditOptions, handleNoteEdit }) => {
  const [availableNotes, setAvailableNotes] = React.useState([]);

  // Fetch all notes from the backend once on mount
  React.useEffect(() => {
    fetch('/get_notes')
      .then(res => res.json())
      .then(data => setAvailableNotes(data.notes || []))
      .catch(err => console.error('Failed to fetch notes:', err));
  }, []);

  // Ensure safe defaults
  noteEditOptions = noteEditOptions || { note: '', feature: edits[0]?.code || '', value: 0 };

  return (
    <form onSubmit={handleNoteEdit} className="form-horizontal">
      <h2 className="text-center">Note Editing</h2>

      {/* Select Note */}
      <div className="form-group">
        <label className="col-sm-4 control-label">Select Note</label>
        <div className="col-sm-8">
          <select
            value={noteEditOptions.note}
            onChange={e => setNoteEditOptions({ ...noteEditOptions, note: e.target.value })}
            className="form-control"
            required
          >
            <option value="">-- Select a Note --</option>
            {availableNotes.map((note, idx) => (
              <option key={idx} value={note}>{note}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Select Feature */}
      <div className="form-group">
        <label className="col-sm-4 control-label">Feature</label>
        <div className="col-sm-8">
          <select
            value={noteEditOptions.feature}
            onChange={e => setNoteEditOptions({ ...noteEditOptions, feature: e.target.value })}
            className="form-control"
            required
          >
            {edits.map(edit => (
              <option key={edit.code} value={edit.code}>{edit.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Value */}
      <div className="form-group">
        <label className="col-sm-4 control-label">Value</label>
        <div className="col-sm-8">
          <input
            type="number"
            value={noteEditOptions.value}
            onChange={e => setNoteEditOptions({ ...noteEditOptions, value: e.target.value })}
            className="form-control"
            step="any"
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="form-group">
        <div className="col-sm-8 col-sm-offset-4">
          <button type="submit" className="btn btn-primary">Edit Note</button>
        </div>
      </div>
    </form>
  );
};
