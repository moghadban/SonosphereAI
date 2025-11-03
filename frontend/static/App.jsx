const App = () => {
  // --- Shared State ---
  const [status, setStatus] = React.useState('Ready to process audio.');
  // NEW TAB ADDED: 'melodyOptions'
  const [activeTab, setActiveTab] = React.useState('melodyOptions'); // **Set default to new tab**

  // Dynamic data from Flask
  const [instruments, setInstruments] = React.useState([]);
// ... (edits, genres, languages, vocalStyles, artistStyles remain the same) ...
  const [edits, setEdits] = React.useState([]);
  const [genres, setGenres] = React.useState([]);
  const [languages, setLanguages] = React.useState([]);
  // RESTORED:
  const [vocalStyles, setVocalStyles] = React.useState([]);
  const [artistStyles, setArtistStyles] = React.useState([]);


  // Form State (Used by various options)
  const [instrumentOptions, setInstrumentOptions] = React.useState({
    instrument: '',
    genre: '',
    language: '',
    vocalStyle: '', // RESTORED for InstrumentOptions
    artistStyle: '', // RESTORED for InstrumentOptions
    lyrics: '',
    voiceUploadFile: null // Shared state for file object (used by VocalOptions/MelodyMaker)
  });

  // NEW STATE: For Melody to Lyrics feature
  const [melodyToLyricsOptions, setMelodyToLyricsOptions] = React.useState({
      musicUploadFile: null,
      theme: '',
      language: '',
      rhymeScheme: '',
      lyricLength: '',
  });

    React.useEffect(() => {
    fetch('/api/form_data')
// ... (rest of useEffect remains the same) ...
      .then(res => res.json())
      .then(data => {
        setInstruments(data.instruments || []);
        setEdits(data.edits || []);
        setGenres(data.genres || []);
        setLanguages(data.languages || []);
        setVocalStyles(data.vocal_styles || []); // RESTORED
        setArtistStyles(data.artist_styles || []); // RESTORED

        // Initialize defaults
        const defaultGenre = (data.genres && data.genres[0]) || '';
        const defaultLang = (data.languages && data.languages[0]) || '';

        setInstrumentOptions(prev => ({
          ...prev,
          instrument: (data.instruments && data.instruments[0] && data.instruments[0].code) || '',
          genre: defaultGenre,
          language: defaultLang,
          vocalStyle: (data.vocal_styles && data.vocal_styles[0]) || '', // RESTORED
          artistStyle: (data.artist_styles && data.artist_styles[0]) || '', // RESTORED
        }));

        // Initialize MelodyToLyrics defaults
        setMelodyToLyricsOptions(prev => ({
            ...prev,
            theme: defaultGenre,
            language: defaultLang,
            rhymeScheme: 'AABB', // Mock default
            lyricLength: 'Medium (8-16 lines)', // Mock default
        }));

      })
      .catch(err => console.error('Failed to fetch form data:', err));
  }, []);

  // --- Handlers ---
const [noteEditOptions, setNoteEditOptions] = React.useState({ note: '', feature: '', value: 0 })

// ... (handleNoteEdit remains the same) ...
const handleNoteEdit = async (event) => {
  event.preventDefault();
  try {
    const res = await fetch('/note_editing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteEditOptions)
    });
    const data = await res.json();
    if (data.status === 'success') {
      setStatus(`Note edited successfully: ${JSON.stringify(data.new_note_state)}`);
    } else {
      setStatus(`Error: ${data.message}`);
    }
  } catch (err) {
    setStatus('Network Error: Could not connect to backend.');
    console.error(err);
  }
};
  const handleGenerateMusic = async (event) => {
    event.preventDefault();
    setStatus('Generating music...');

    try {
      const formData = new FormData();
// ... (FormData append logic remains the same) ...
      formData.append('instrument', instrumentOptions.instrument);
      formData.append('genre', instrumentOptions.genre);
      formData.append('language', instrumentOptions.language);

      // Determine what to send based on which tab submitted the form
      if (activeTab === 'instrumentOptions') {
          // Send all style and lyric options for the original feature
          formData.append('vocal_style', instrumentOptions.vocalStyle);
          formData.append('artist_style', instrumentOptions.artistStyle);
          formData.append('lyrics', instrumentOptions.lyrics);
      } else if (activeTab === 'vocalOptions' || activeTab === 'vocalsToInstrument') { // Include VocalToInstrument/MelodyMaker
          // Send only the required options + file upload/lyrics for the new feature
          if (instrumentOptions.voiceUploadFile) {
              formData.append('voice_upload', instrumentOptions.voiceUploadFile);
              // Clear lyrics if file is uploaded
              formData.append('lyrics', '');
          } else {
              formData.append('lyrics', instrumentOptions.lyrics);
          }
      }
      // Note: MelodyOptions uses its own handler, so we don't worry about it here.

      const res = await fetch('/generate_vocals', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.status === 'success') {
        setStatus(`Generation complete: ${data.generation_result.status}`);
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (err) {
      setStatus('Network Error: Could not connect to backend.');
      console.error(err);
    }
  };

  // NEW HANDLER: For Melody to Lyrics feature
  const handleGenerateLyrics = async (event) => {
      event.preventDefault();
      setStatus('Analyzing melody and generating lyrics...');

      try {
          const formData = new FormData();
          formData.append('music_upload', melodyToLyricsOptions.musicUploadFile);
          formData.append('theme', melodyToLyricsOptions.theme);
          formData.append('language', melodyToLyricsOptions.language);
          formData.append('rhyme_scheme', melodyToLyricsOptions.rhymeScheme);
          formData.append('lyric_length', melodyToLyricsOptions.lyricLength);

          const res = await fetch('/generate_lyrics', { // NEW BACKEND ROUTE
              method: 'POST',
              body: formData
          });

          const data = await res.json();
          if (data.status === 'success') {
              setStatus(`Lyrics generated successfully: ${data.generation_result.status}`);
          } else {
              setStatus(`Error: ${data.message}`);
          }
      } catch (err) {
          setStatus('Network Error: Could not connect to backend.');
          console.error(err);
      }
  };


  // --- Map activeTab to window feature component ---
  const TabComponents = {
    melodyOptions: window.MelodyOptions,
    vocalsToInstrument: window.VocalToInstrument,
    instrumentOptions: window.InstrumentOptions,
    vocalOptions: window.VocalOptions,
    noteEditing: window.NoteEditing,
    noiseReduction: window.NoiseReduction,
  };
  const ActiveTabComponent = TabComponents[activeTab];

  // --- Main Render ---
  return (
    <div className="container-fluid app-card">
      <h1 className="text-center header-text-custom">Audio Toolkit</h1>
      <ul className="nav nav-tabs nav-justified app-nav-tabs">
          <li className={activeTab === 'melodyOptions' ? 'active' : ''}>
              <a href="#" onClick={e => { e.preventDefault(); setActiveTab('melodyOptions'); }}>Melody to Lyrics<p className="text-small">Melody Options</p></a>
          </li>
          <li className={activeTab === 'instrumentOptions' ? 'active' : ''}>
            <a href="#" onClick={e => { e.preventDefault(); setActiveTab('instrumentOptions'); }}>Lyrics to Melody<p className="text-small">Instrument Options</p></a>
        </li>
        <li className={activeTab === 'vocalOptions' ? 'active' : ''}>
            <a href="#" onClick={e => { e.preventDefault(); setActiveTab('vocalOptions'); }}>Lyrics to Melody<p className="text-small">Vocal Options</p></a>
        </li>
        <li className={activeTab === 'vocalsToInstrument' ? 'active' : ''}>
          <a href="#" onClick={e => { e.preventDefault(); setActiveTab('vocalsToInstrument'); }}>Melody Maker<p className="text-small">Vocal to MIDI</p></a>
        </li>
          <li className={activeTab === 'noiseReduction' ? 'active' : ''}>
          <a href="#" onClick={e => { e.preventDefault(); setActiveTab('noiseReduction'); }}>Noise Reduction<p className="text-small">Spectral Masking</p></a>
        </li>

        {/* END NEW TAB */}
        {/*<li className={activeTab === 'noteEditing' ? 'active' : ''}>*/}
        {/* <a href="#" onClick={e => { e.preventDefault(); setActiveTab('noteEditing'); }}>Note Editing</a>*/}
        {/*</li>*/}

      </ul>

      <div className="tab-content app-tab-content justify-content-center">
        {ActiveTabComponent && (
          <ActiveTabComponent
              instruments={instruments}
              edits={edits}
              genres={genres}
              languages={languages}
              vocalStyles={vocalStyles}
              artistStyles={artistStyles}
              instrumentOptions={instrumentOptions}
              setInstrumentOptions={setInstrumentOptions}
              handleGenerateMusic={handleGenerateMusic}
              handleGenerateLyrics={() => handleGenerateLyrics(event)}
              melodyToLyricsOptions={melodyToLyricsOptions}
              setMelodyToLyricsOptions={setMelodyToLyricsOptions}
              noteEditOptions={noteEditOptions}
              setNoteEditOptions={setNoteEditOptions}
              handleNoteEdit={handleNoteEdit}
            />
        )}
      </div>
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

// --- Mount React App ---
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    React.createElement(React.StrictMode, null, React.createElement(App))
  );
} else {
  console.error("Root element 'root' not found.");
}
