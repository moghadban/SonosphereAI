// Main App Component
const App = () => {
    // --- Shared State ---
    const [status, setStatus] = React.useState('Ready to process audio.');
    const [activeTab, setActiveTab] = React.useState('vocalsToInstrument');

    // Dynamic data from Flask
    const [instruments, setInstruments] = React.useState([]);
    const [edits, setEdits] = React.useState([]);
    const [genres, setGenres] = React.useState([]);
    const [languages, setLanguages] = React.useState([]);
    const [vocalStyles, setVocalStyles] = React.useState([]);
    const [artistStyles, setArtistStyles] = React.useState([]);

    // Form State
    const [instrumentOptions, setInstrumentOptions] = React.useState({
        instrument: '',
        genre: '',
        language: '',
        vocalStyle: '',
        artistStyle: '',
    });

    const [noteEditOptions, setNoteEditOptions] = React.useState({
        note: 'C4',
        feature: 'pitch_bend',
        value: 0,
    });

    // --- Fetch dynamic form data on mount ---
    React.useEffect(() => {
        fetch('/api/form_data')
            .then(res => res.json())
            .then(data => {
                setInstruments(data.instruments || []);
                setEdits(data.edits || []);
                setGenres(data.genres || []);
                setLanguages(data.languages || []);
                setVocalStyles(data.vocal_styles || []);
                setArtistStyles(data.artist_styles || []);

                // Initialize defaults without optional chaining
                setInstrumentOptions({
                    instrument: (data.instruments && data.instruments[0] && data.instruments[0].code) || '',
                    genre: (data.genres && data.genres[0]) || '',
                    language: (data.languages && data.languages[0]) || '',
                    vocalStyle: (data.vocal_styles && data.vocal_styles[0]) || '',
                    artistStyle: (data.artist_styles && data.artist_styles[0]) || '',
                });
            })
            .catch(err => console.error('Failed to fetch form data:', err));
    }, []);

    // --- Handlers ---
    const handleFileUpload = (endpoint) => async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        setStatus('Processing request...');

        try {
            const response = await fetch(`/${endpoint}`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setStatus(data.status === 'success' ? data.message : `Error: ${data.message}`);
        } catch (error) {
            setStatus('Network Error: Could not connect to backend.');
            console.error('Fetch error:', error);
        }
    };

    const handleInstrumentOptions = async (event) => {
        event.preventDefault();
        setStatus('Processing instrument options...');
        try {
            const res = await fetch('/generate_vocals', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(instrumentOptions),
            });
            const data = await res.json();
            setStatus(data.status === 'success' ? (data.generation_result && data.generation_result.status ? data.generation_result.status : 'Success') : `Error: ${data.message}`);
        } catch (err) {
            setStatus('Network Error: Could not connect to backend.');
            console.error(err);
        }
    };

    const handleNoteEdit = async (event) => {
        event.preventDefault();
        setStatus('Processing note edit...');
        try {
            const res = await fetch('/note_editing', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(noteEditOptions),
            });
            const data = await res.json();
            setStatus(data.status === 'success' ? data.message : `Error: ${data.message}`);
        } catch (err) {
            setStatus('Network Error: Could not connect to backend.');
            console.error(err);
        }
    };

    // --- Tab Components ---
    const VocalsToInstrument = () => (
        <form onSubmit={handleFileUpload('vocals_to_instrument')} className="form-horizontal">
            <h2 className="text-center">Vocals to Instrument Conversion</h2>
            <div className="form-group">
                <label htmlFor="vocal_file" className="col-sm-4 control-label">Upload Vocal Track (WAV/MP3)</label>
                <div className="col-sm-8">
                    <input type="file" name="vocal_file" id="vocal_file" accept=".wav,.mp3" required className="form-control file-input" />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="instrument" className="col-sm-4 control-label">Target Instrument</label>
                <div className="col-sm-8">
                    <select name="instrument" id="instrument" required className="form-control">
                        {instruments.map(inst => (
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

    const InstrumentOptionsForm = () => (
        <form onSubmit={handleInstrumentOptions} className="form-horizontal">
            <h2 className="text-center">Advanced Instrument Generation Options</h2>
            <div className="form-group">
                <label className="col-sm-4 control-label">Instrument</label>
                <div className="col-sm-8">
                    <select
                        className="form-control"
                        value={instrumentOptions.instrument}
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, instrument: e.target.value})}
                    >
                        {instruments.map(inst => (
                            <option key={inst.code} value={inst.code}>{inst.name}</option>
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
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, genre: e.target.value})}
                    >
                        {genres.map(g => (
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
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, language: e.target.value})}
                    >
                        {languages.map(l => (
                            <option key={l} value={l}>{l}</option>
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
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, vocalStyle: e.target.value})}
                    >
                        {vocalStyles.map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-4 control-label">Artist Style</label>
                <div className="col-sm-8">
                    <input
                        type="text"
                        className="form-control"
                        value={instrumentOptions.artistStyle}
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, artistStyle: e.target.value})}
                    />
                </div>
            </div>
            <div className="form-group">
                <div className="col-sm-8 col-sm-offset-4">
                    <button type="submit" className="btn btn-primary">Update Options</button>
                </div>
            </div>
        </form>
    );

    const NoteEditing = () => (
        <form onSubmit={handleNoteEdit} className="form-horizontal">
            <h2 className="text-center">MIDI-like Note Property Editing</h2>
            <div className="form-group">
                <label className="col-sm-4 control-label">Note ID/Name</label>
                <div className="col-sm-8">
                    <input type="text" className="form-control" value={noteEditOptions.note} onChange={e => setNoteEditOptions({...noteEditOptions, note: e.target.value})} />
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-4 control-label">Feature</label>
                <div className="col-sm-8">
                    <select className="form-control" value={noteEditOptions.feature} onChange={e => setNoteEditOptions({...noteEditOptions, feature: e.target.value})}>
                        {edits.map(edit => (
                            <option key={edit.code} value={edit.code}>{edit.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-4 control-label">Value</label>
                <div className="col-sm-8">
                    <input type="number" step="any" className="form-control" value={noteEditOptions.value} onChange={e => setNoteEditOptions({...noteEditOptions, value: e.target.value})} />
                </div>
            </div>
            <div className="form-group">
                <div className="col-sm-8 col-sm-offset-4">
                    <button type="submit" className="btn btn-primary">Apply Edit</button>
                </div>
            </div>
        </form>
    );

    const NoiseReduction = () => (
        <form onSubmit={handleFileUpload('noise_reduction')} className="form-horizontal">
            <h2 className="text-center">Noise Reduction (Spectral Masking)</h2>
            <div className="form-group">
                <label className="col-sm-4 control-label">Upload Audio File (WAV/MP3)</label>
                <div className="col-sm-8">
                    <input type="file" name="audio_file" accept=".wav,.mp3" required className="form-control file-input" />
                </div>
            </div>
            <div className="form-group">
                <div className="col-sm-8 col-sm-offset-4">
                    <button type="submit" className="btn btn-primary">Reduce Noise</button>
                </div>
            </div>
        </form>
    );

    // --- Main Render ---
    return (
        <div className="container-fluid app-card">
            <h1 className="text-center header-text-custom">Audio Toolkit</h1>
            <ul className="nav nav-tabs nav-justified app-nav-tabs">
                <li className={activeTab==='vocalsToInstrument'?'active':''}>
                    <a href="#" onClick={e=>{e.preventDefault(); setActiveTab('vocalsToInstrument')}}>Vocals to Instrument</a>
                </li>
                <li className={activeTab==='instrumentOptions'?'active':''}>
                    <a href="#" onClick={e=>{e.preventDefault(); setActiveTab('instrumentOptions')}}>Instrument Options</a>
                </li>
                <li className={activeTab==='noteEditing'?'active':''}>
                    <a href="#" onClick={e=>{e.preventDefault(); setActiveTab('noteEditing')}}>Note Editing</a>
                </li>
                <li className={activeTab==='noiseReduction'?'active':''}>
                    <a href="#" onClick={e=>{e.preventDefault(); setActiveTab('noiseReduction')}}>Noise Reduction</a>
                </li>
            </ul>
            <div className="tab-content app-tab-content justify-content-center">
                {activeTab==='vocalsToInstrument' && <VocalsToInstrument />}
                {activeTab==='instrumentOptions' && <InstrumentOptionsForm />}
                {activeTab==='noteEditing' && <NoteEditing />}
                {activeTab==='noiseReduction' && <NoiseReduction />}
            </div>
            <div className="panel panel-default app-status-panel">
                <div className="panel-body">
                    <p className="status-label">Status:</p>
                    <p className={`status-text ${status.includes('Error')?'text-danger':'text-success'}`}>{status}</p>
                </div>
            </div>
        </div>
    );
};

// --- Mount React App ---
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        React.createElement(React.StrictMode, null, React.createElement(App))
    );
} else {
    console.error("Root element 'root' not found.");
}
