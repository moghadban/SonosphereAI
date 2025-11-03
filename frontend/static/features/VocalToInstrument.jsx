window.VocalToInstrument = ({
    instruments,
    instrumentOptions,
    setInstrumentOptions,
    handleGenerateMusic,
    // --- Placeholders from App.jsx (Required to avoid ReferenceError) ---
    edits,
    genres,
    languages,
    vocalStyles,
    artistStyles,
    melodyToLyricsOptions,
    setMelodyToLyricsOptions,
    handleGenerateLyrics,
    noteEditOptions,
    setNoteEditOptions,
    handleNoteEdit
}) => {

  // Local handler for file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setInstrumentOptions(prev => ({ ...prev, voiceUpload: file }));
  };

  return (
    <form onSubmit={handleGenerateMusic} className="form-horizontal meldoy-maker-form-bg">
      <h1 className="text-center header-text-custom">Transform Your Voice into Any Instrument</h1>
        <h3 className="subheader-text-custom">Upload an audio file (MP3/WAV) containing a melody or rhythm.
            Select a target instrument to instantly transform your vocal input into a playable MIDI performance.</h3>

      <div className="form-group">
        <label htmlFor="vocal_file" className="col-sm-4 control-label">Upload Vocal Track (WAV/MP3)</label>
        <div className="col-sm-8">
          <input
            type="file"
            name="vocal_file"
            id="vocal_file"
            accept=".wav,.mp3"
            required
            className="form-control file-input"
            onChange={handleFileChange} // <-- fixed here
          />
        </div>
      </div>

   <div className="form-group">
  <label htmlFor="instrument" className="col-sm-4 control-label">Target Instrument</label>
  <div className="col-sm-8">
    <select
      name="instrument"
      id="instrument"
      required
      className="form-control"
      value={instrumentOptions.instrument}
      onChange={e => setInstrumentOptions({ ...instrumentOptions, instrument: e.target.value })}
    >
      {/* The filter method removes the instrument where the code (key) is 'full_music'.
        The map method then runs only on the remaining instruments.
      */}
      {instruments
        .filter(inst => inst.code !== 'full_music') // <-- ADD THIS LINE
        .map(inst => (
          <option key={inst.code} value={inst.code}>{inst.name}</option>
        ))}
    </select>
  </div>
</div>

      <div className="form-group">
        <div className="col-sm-8 col-sm-offset-4">
          <button type="submit" className="btn btn-primary">Convert Vocals</button>
        </div>
      </div>
    </form>
  );
};

