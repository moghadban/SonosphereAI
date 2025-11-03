// frontend/static/features/MelodyOptions.jsx

window.MelodyOptions = (props) => {
    const {
        // Data this component actually uses:
        genres,
        languages,
        melodyToLyricsOptions,
        setMelodyToLyricsOptions,
        handleGenerateLyrics,

        // Missing Core Props (Required for App.jsx compatibility):
        instruments,
        edits,
        vocalStyles,
        artistStyles,
        instrumentOptions,
        setInstrumentOptions,
        handleGenerateMusic,
        noteEditOptions,
        setNoteEditOptions,
        handleNoteEdit
    } = props;

    // Mock Options
    const rhymeSchemes = ['AABB', 'ABAB', 'AABA', 'Free Verse'];
    const lyricLengths = ['Short (4-8 lines)', 'Medium (8-16 lines)', 'Long (16+ lines)'];

    // Helper to update state for dropdowns/text
    const handleChange = (e) => {
        setMelodyToLyricsOptions(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Helper to update state for file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setMelodyToLyricsOptions(prev => ({
            ...prev,
            musicUploadFile: file || null
        }));
    };

    const isUploadSelected = melodyToLyricsOptions.musicUploadFile;


    return (
        <div className="tab-pane active p-4">
            {/* Note: We use the new handler, handleGenerateLyrics, for this form */}
            <form onSubmit={handleGenerateLyrics} className="form-horizontal melody-options-form-bg">
                <h1 className="text-center header-text-custom">📝 Melody to Lyrics</h1>
                <h3 className="text-center subheader-text-custom">
                    Upload a music track (instrumental or with vocals) and our AI will generate matching lyrics.
                </h3>

                {/* File Upload Section */}
                <div className="form-group">
                    <label htmlFor="musicUploadFile" className="col-sm-4 control-label">Upload Music File *</label>
                    <div className="col-sm-8">
                        <input
                            type="file"
                            className="form-control"
                            id="musicUploadFile"
                            name="musicUploadFile"
                            accept="audio/*"
                            onChange={handleFileChange}
                            required
                            style={{height: 'auto'}}
                        />
                         {isUploadSelected && (
                            <p className="help-block text-success">
                                File selected: **{melodyToLyricsOptions.musicUploadFile.name}**.
                            </p>
                        )}
                        <p className="help-block">Accepted formats: MP3, WAV, MIDI, etc. (Max 20MB)</p>
                    </div>
                </div>

                {/* Theme Selection (Reusing Genres for now) */}
                <div className="form-group">
                    <label htmlFor="theme" className="col-sm-4 control-label">Lyric Theme/Mood</label>
                    <div className="col-sm-8">
                        <select
                            className="form-control"
                            id="theme"
                            name="theme"
                            value={melodyToLyricsOptions.theme}
                            onChange={handleChange}
                        >
                            {genres.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Rhyme Scheme Selection */}
                <div className="form-group">
                    <label htmlFor="rhymeScheme" className="col-sm-4 control-label">Rhyme Scheme</label>
                    <div className="col-sm-8">
                        <select
                            className="form-control"
                            id="rhymeScheme"
                            name="rhymeScheme"
                            value={melodyToLyricsOptions.rhymeScheme}
                            onChange={handleChange}
                        >
                            {rhymeSchemes.map(scheme => (
                                <option key={scheme} value={scheme}>{scheme}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Length Selection */}
                <div className="form-group">
                    <label htmlFor="lyricLength" className="col-sm-4 control-label">Lyric Length</label>
                    <div className="col-sm-8">
                        <select
                            className="form-control"
                            id="lyricLength"
                            name="lyricLength"
                            value={melodyToLyricsOptions.lyricLength}
                            onChange={handleChange}
                        >
                            {lyricLengths.map(length => (
                                <option key={length} value={length}>{length}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Language Selection */}
                <div className="form-group">
                    <label htmlFor="language" className="col-sm-4 control-label">Language</label>
                    <div className="col-sm-8">
                        <select
                            className="form-control"
                            id="language"
                            name="language"
                            value={melodyToLyricsOptions.language}
                            onChange={handleChange}
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-group text-center">
                    <div className="col-sm-12" style={{marginTop: '20px'}}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!isUploadSelected}
                        >
                            Generate Lyrics
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};