window.VocalOptions = (props) => {
    const {
        // Props this component actually uses
        instruments,
        genres,
        languages,
        instrumentOptions,
        setInstrumentOptions,
        handleGenerateMusic,
        // Placeholder Props (Required to prevent ReferenceError from App.jsx)
        edits,
        vocalStyles,
        artistStyles,
        melodyToLyricsOptions,
        setMelodyToLyricsOptions,
        handleGenerateLyrics,
        noteEditOptions,
        setNoteEditOptions,
        handleNoteEdit
    } = props;

    // Helper to update state for dropdowns/text
    const handleChange = (e) => {
        setInstrumentOptions(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Helper to update state for file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setInstrumentOptions(prev => ({
            ...prev,
            voiceUploadFile: file || null
        }));
    };

    const isUploadSelected = instrumentOptions.voiceUploadFile;

    return (
        // The outer div and active tab class should be consistent with how tabs are handled,
        // but the internal structure will follow InstrumentOptions' form-horizontal style.
        <div className="tab-pane active p-4">
            <form onSubmit={handleGenerateMusic} className="form-horizontal vocal-options-form-bg">
                <h1 className="text-center header-text-custom">Vocal Source Options</h1>
                <h3 className="text-center subheader-text-custom">
                    Choose your desired music style and provide either lyrics or an uploaded vocal track to generate a melody.
                </h3>

                {/* Instrument Selection */}
                <div className="form-group">
                    <label htmlFor="instrument" className="col-sm-4 control-label">Instrument (Melody Target)</label>
                    <div className="col-sm-8">
                        <select
                            id="instrument"
                            name="instrument"
                            value={instrumentOptions.instrument}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            {instruments.map(inst => (
                                <option key={inst.code} value={inst.code}>{inst.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Genre Selection */}
                <div className="form-group">
                    <label htmlFor="genre" className="col-sm-4 control-label">Genre</label>
                    <div className="col-sm-8">
                        <select
                            id="genre"
                            name="genre"
                            value={instrumentOptions.genre}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            {genres.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Language Selection */}
                <div className="form-group">
                    <label htmlFor="language" className="col-sm-4 control-label">Language</label>
                    <div className="col-sm-8">
                        <select
                            id="language"
                            name="language"
                            value={instrumentOptions.language}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            {languages.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* --- Vocal Input Section --- */}
                <div className="form-group" style={{marginTop: '20px', marginBottom: '20px'}}>
                    <div className="col-sm-12">
                        <h4 className="text-center" style={{fontWeight: 'bold'}}>Vocal Input</h4>
                    </div>
                </div>

                {/* Upload Field */}
                <div className="form-group">
                    <label htmlFor="voice_upload" className="col-sm-4 control-label">Upload Vocal (.wav, .mp3, etc.)</label>
                    <div className="col-sm-8">
                        <input
                            type="file"
                            id="voice_upload"
                            name="voice_upload"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="form-control" // form-control style might need custom adjustments for file input, but this is the Bootstrap equivalent
                            style={{height: 'auto'}}
                        />
                         {isUploadSelected && (
                            <p className="help-block text-success">
                                File selected: **{instrumentOptions.voiceUploadFile.name}**. Lyrics will be ignored.
                            </p>
                        )}
                    </div>
                </div>

                {/* OR Separator (Simulated) */}
                <div className="form-group">
                    <div className="col-sm-12 text-center" style={{margin: '10px 0'}}>
                        <strong className="text-muted">OR</strong>
                    </div>
                </div>

                {/* Lyrics Text Area */}
                <div className="form-group">
                    <label htmlFor="lyrics" className="col-sm-4 control-label">Lyrics / Text Input</label>
                    <div className="col-sm-8">
                        <textarea
                            id="lyrics"
                            name="lyrics"
                            rows="3"
                            value={instrumentOptions.lyrics}
                            onChange={handleChange}
                            maxLength="200"
                            placeholder="Enter lyrics here for Text-to-Speech generation..."
                            className="form-control"
                            disabled={isUploadSelected}
                            style={isUploadSelected ? {backgroundColor: '#eee', cursor: 'not-allowed'} : {}}
                        />
                        <span className="help-block">Max 200 characters. Disabled if a file is uploaded.</span>
                    </div>
                </div>

                {/* Generate Button */}
                <div className="form-group text-center">
                    <div className="col-sm-12" style={{marginTop: '20px'}}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Generate Melody
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};