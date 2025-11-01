// This entire application is defined in a single file to avoid module/import errors (exports is not defined)
// when using client-side Babel.

// Define the main component
const App = () => {
    // Shared State
    const [status, setStatus] = React.useState('Ready to process audio.');
    // Add the new tab key: 'instrumentOptions'
    const [activeTab, setActiveTab] = React.useState('vocalsToInstrument'); // Default tab

    // State for the new Instrument Options form (based on Old App.js)
    const [instrumentOptions, setInstrumentOptions] = React.useState({
        instrument: 'piano',
        genre: 'pop',
        language: 'english',
        vocalStyle: 'male',
        artistStyle: 'ariana-grande',
    });

    const languages = [
        'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'korean',
    ];

    const handleFileUpload = (endpoint) => async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        setStatus('Processing request...');

        try {
            // Note: Assuming your Flask backend is running on the same host/port.
            // If not, you might need to use a full URL like 'http://localhost:5000/...'
            const response = await fetch(`/${endpoint}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.status === 'success') {
                setStatus(data.message);
            } else {
                setStatus(`Error: ${data.message}`);
            }
        } catch (error) {
            setStatus(`Network Error: Could not connect to backend.`);
            console.error('Fetch error:', error);
        }
    };

    // New submission handler for Instrument Options (based on Old App.js)
    const handleInstrumentOptions = async (event) => {
        event.preventDefault();
        setStatus('Processing instrument options...');

        try {
            const response = await fetch('/instrument_options', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(instrumentOptions),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setStatus(data.message);
            } else {
                setStatus(`Error: ${data.message}`);
            }
        } catch (error) {
            setStatus(`Network Error: Could not connect to backend.`);
            console.error('Fetch error:', error);
        }
    };

    // --- Tab 1: Vocals to Instrument Form ---
    const VocalsToInstrument = () => (
        <form onSubmit={handleFileUpload('vocals_to_instrument')} className="form-horizontal">
            <h2 className="text-center">Vocals to Instrument Conversion</h2>

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
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="instrument" className="col-sm-4 control-label">Target Instrument</label>
                <div className="col-sm-8">
                    <select name="instrument" id="instrument" required className="form-control">
                        <option value="piano">Piano</option>
                        <option value="guitar">Guitar</option>
                        <option value="violin">Violin</option>
                        <option value="drums">Drums</option>
                        <option value="bass">Bass</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <div className="col-sm-8 col-sm-offset-4">
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Convert Vocals
                    </button>
                </div>
            </div>
        </form>
    );

    // --- NEW Tab 2: Instrument Options Form (The missing functionality) ---
    const InstrumentOptionsForm = () => (
        <form onSubmit={handleInstrumentOptions} className="form-horizontal">
            <h2 className="text-center">Advanced Instrument Generation Options</h2>

            <div className="form-group">
                <label htmlFor="opt_instrument" className="col-sm-4 control-label">Instrument</label>
                <div className="col-sm-8">
                    <select
                        name="instrument"
                        id="opt_instrument"
                        required
                        className="form-control"
                        value={instrumentOptions.instrument}
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, instrument: e.target.value})}
                    >
                        <option value="piano">Piano</option>
                        <option value="guitar">Guitar</option>
                        <option value="violin">Violin</option>
                        <option value="drums">Drums</option>
                        <option value="bass">Bass</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="genre" className="col-sm-4 control-label">Genre</label>
                <div className="col-sm-8">
                    <select
                        name="genre"
                        id="genre"
                        required
                        className="form-control"
                        value={instrumentOptions.genre}
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, genre: e.target.value})}
                    >
                        <option value="pop">Pop</option>
                        <option value="rock">Rock</option>
                        <option value="jazz">Jazz</option>
                        <option value="classical">Classical</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="language" className="col-sm-4 control-label">Language</label>
                <div className="col-sm-8">
                    <select
                        name="language"
                        id="language"
                        required
                        className="form-control"
                        value={instrumentOptions.language}
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, language: e.target.value})}
                    >
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="vocal_style" className="col-sm-4 control-label">Vocal Style</label>
                <div className="col-sm-8">
                    <select
                        name="vocal_style"
                        id="vocal_style"
                        required
                        className="form-control"
                        value={instrumentOptions.vocalStyle}
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, vocalStyle: e.target.value})}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="child">Child</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="artist_style" className="col-sm-4 control-label">Artist Style</label>
                <div className="col-sm-8">
                    <input
                        type="text"
                        name="artist_style"
                        id="artist_style"
                        defaultValue="ariana-grande"
                        required
                        className="form-control"
                        value={instrumentOptions.artistStyle}
                        onChange={(e) => setInstrumentOptions({...instrumentOptions, artistStyle: e.target.value})}
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="col-sm-8 col-sm-offset-4">
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Update Options
                    </button>
                </div>
            </div>
        </form>
    );

    // --- Tab 3: Note Editing Form (Mocked) ---
    const NoteEditing = () => (
        <form onSubmit={handleFileUpload('note_editing')} className="form-horizontal">
            <h2 className="text-center">MIDI-like Note Property Editing</h2>

            <div className="row">
                <div className="col-sm-6">
                    <div className="form-group">
                        <label htmlFor="note" className="col-sm-4 control-label">Note ID/Name</label>
                        <div className="col-sm-8">
                            <input type="text" name="note" id="note" defaultValue="C4" required className="form-control" />
                        </div>
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="form-group">
                        <label htmlFor="feature" className="col-sm-4 control-label">Feature to Edit</label>
                        <div className="col-sm-8">
                            <select name="feature" id="feature" required className="form-control">
                                <option value="pitch_bend">Pitch Bend</option>
                                <option value="volume_adjust">Volume Adjust</option>
                                <option value="note_duration">Set Duration</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="value" className="col-sm-4 control-label">Value (e.g., +10, 0.5)</label>
                <div className="col-sm-8">
                    <input type="number" step="any" name="value" id="value" required className="form-control" />
                </div>
            </div>

            <div className="form-group">
                <div className="col-sm-8 col-sm-offset-4">
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Apply Edit (Mock)
                    </button>
                </div>
            </div>
        </form>
    );

    // --- Tab 4: Noise Reduction Form ---
    const NoiseReduction = () => (
        <form onSubmit={handleFileUpload('noise_reduction')} className="form-horizontal">
            <h2 className="text-center">Noise Reduction (Spectral Masking)</h2>

            <div className="form-group">
                <label htmlFor="audio_file" className="col-sm-4 control-label">Upload Audio File (WAV/MP3)</label>
                <div className="col-sm-8">
                    <input
                        type="file"
                        name="audio_file"
                        id="audio_file"
                        accept=".wav,.mp3"
                        required
                        className="form-control file-input"
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="col-sm-8 col-sm-offset-4">
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Reduce Noise
                    </button>
                </div>
            </div>
        </form>
    );

    // --- Main Render ---
    return (
        // Main Card Container: Using a custom class for styling the panel/card
        <div className="container-fluid app-card">

             <h1 className="text-center header-text-custom">Audio Toolkit</h1>

            {/* Tab Navigation (Bootstrap Nav Tabs) */}
            <ul className="nav nav-tabs nav-justified app-nav-tabs">
                <li role="presentation" className={activeTab === 'vocalsToInstrument' ? 'active' : ''}>
                    <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab('vocalsToInstrument');}}>
                        Vocals to Instrument
                    </a>
                </li>
                {/* NEW TAB ADDED */}
                <li role="presentation" className={activeTab === 'instrumentOptions' ? 'active' : ''}>
                    <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab('instrumentOptions');}}>
                        Instrument Options
                    </a>
                </li>
                <li role="presentation" className={activeTab === 'noteEditing' ? 'active' : ''}>
                    <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab('noteEditing');}}>
                        Note Editing
                    </a>
                </li>
                <li role="presentation" className={activeTab === 'noiseReduction' ? 'active' : ''}>
                    <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab('noiseReduction');}}>
                        Noise Reduction
                    </a>
                </li>
            </ul>

            {/* Tab Content Area: Use a custom class for the content panel */}
            <div className="tab-content app-tab-content justify-content-center">
                {activeTab === 'vocalsToInstrument' && <VocalsToInstrument />}
                {/* NEW TAB CONTENT */}
                {activeTab === 'instrumentOptions' && <InstrumentOptionsForm />}
                {activeTab === 'noteEditing' && <NoteEditing />}
                {activeTab === 'noiseReduction' && <NoiseReduction />}
            </div>

            {/* Status Box (Bootstrap Alert/Panel styling for Status) */}
            <div className="panel panel-default app-status-panel">
                <div className="panel-body">
                    <p className="status-label">Status:</p>
                    <p className={`status-text ${status.includes('Error') ? 'text-danger' : 'text-success'}`}>
                        {status}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --------------------------------------------------------------------------
// Self-Rendering Logic (Equivalent to main.jsx)
// --------------------------------------------------------------------------

// 1. Find the root element where React will mount.
const rootElement = document.getElementById('root');

if (rootElement) {
    // 2. Use ReactDOM to render the App component.
    // React and ReactDOM must be globally available (loaded via CDN in base.html.twig)
    ReactDOM.createRoot(rootElement).render(
        React.createElement(React.StrictMode, null, React.createElement(App))
    );
} else {
    // 3. Log a critical error if the root element is missing.
    console.error("Critical Error: Root element 'root' not found. Check base.html.twig for <div id='root'>.");
}