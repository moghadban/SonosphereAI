window.InstrumentOptions = ({
  instruments,
  genres,
  languages,
  vocalStyles,
  artistStyles,
  instrumentOptions,
  setInstrumentOptions,
  handleGenerateMusic,
  // --- Missing/Placeholder Props (Required to prevent ReferenceError) ---
  edits, // Likely passed but missing from list
  melodyToLyricsOptions,
  setMelodyToLyricsOptions,
  handleGenerateLyrics,
  noteEditOptions,
  setNoteEditOptions,
  handleNoteEdit // This is the one that caused the previous error!
}) => {
  return (
    <form onSubmit={handleGenerateMusic} className="form-horizontal instrument-options-form-bg">
      <h1 className="text-center header-text-custom">Advanced Instrument Generation Options</h1>
        <h4 className="text-center subheader-text-custom">
            Transform your verses and choruses into fully orchestrated melodies with customizable instrument options.
        </h4>

      <div className="form-group">
        <label className="col-sm-4 control-label">Instrument</label>
        <div className="col-sm-8">
          <select
            className="form-control"
            value={instrumentOptions.instrument}
            onChange={(e) => setInstrumentOptions({ ...instrumentOptions, instrument: e.target.value })}
          >

            {instruments.map((inst) => (
              <option key={inst.code || inst} value={inst.code || inst}>
                {inst.name || inst}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-4 control-label">Genre</label>
        <div className="col-sm-8">
          <select
            className="form-control"
            value={instrumentOptions.genre}
            onChange={(e) => setInstrumentOptions({ ...instrumentOptions, genre: e.target.value })}
          >
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-4 control-label">Language</label>
        <div className="col-sm-8">
          <select
            className="form-control"
            value={instrumentOptions.language}
            onChange={(e) => setInstrumentOptions({ ...instrumentOptions, language: e.target.value })}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-4 control-label">Vocal Style</label>
        <div className="col-sm-8">
          <select
            className="form-control"
            value={instrumentOptions.vocalStyle}
            onChange={(e) => setInstrumentOptions({ ...instrumentOptions, vocalStyle: e.target.value })}
          >
            {vocalStyles.map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-4 control-label">Artist Style</label>
        <div className="col-sm-8">
          <select
            className="form-control"
            value={instrumentOptions.artistStyle}
            onChange={(e) => setInstrumentOptions({ ...instrumentOptions, artistStyle: e.target.value })}
          >
            {artistStyles.map((artist) => (
              <option key={artist} value={artist}>{artist}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="col-sm-4 control-label">Lyrics</label>
        <div className="col-sm-8">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter your lyrics here..."
            value={instrumentOptions.lyrics}
            onChange={(e) => setInstrumentOptions({ ...instrumentOptions, lyrics: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group text-center">
        <div className="col-sm-12">
          <button type="submit" className="btn btn-primary">Generate</button>
        </div>
      </div>
    </form>
  );
};
