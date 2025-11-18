/* ===== App.jsx (FULL UPDATED FILE) ===== */
const App = () => {
    const [status, setStatus] = React.useState('Ready to process lyrics to music.');
    const [activeTab, setActiveTab] = React.useState('lyricsGenerator'); // default to the new tab name
    const [instruments, setInstruments] = React.useState([]);
    const [edits, setEdits] = React.useState([]);
    const [genres, setGenres] = React.useState([]);
    const [languages, setLanguages] = React.useState([]);
    const [allLanguages, setAllLanguages] = React.useState([]);
    const [lyricsLanguages, setLyricsLanguages] = React.useState([]);
    const [vocalStyles, setVocalStyles] = React.useState([]);
    const [maleVoiceNames, setMaleVoiceNames] = React.useState([]);
    const [femaleVoiceNames, setFemaleVoiceNames] = React.useState([]);
    const [ttsEngines, setTtsEngines] = React.useState([]);
    const [ttsEngine, setTtsEngine] = React.useState('Bark AI');
    const [outputFileType, setOutputFileType] = React.useState("wav");
    const outputTypes = ["wav", "mp3", "flac", "opus", "ogg"];
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [instrumentOptions, setInstrumentOptions] = React.useState({
        instrument: '',
        genre: '',
        language: '',
        vocalStyle: '',
        lyrics: '',
        maleVoiceName: '',
        femaleVoiceName: '',
        voiceUploadFile: null,
        generatedAudioUrl: null,
        generatedMusicUrl: null,
        generatedVocalUrl: null,
        generatedAudioUrlVocalOptions: null,
        generatedMusicUrlVocalOptions: null,
        generatedVocalUrlVocalOptions: null,
        mode: 'full_music',
        ttsEngine: '',
        outputFileType: ""
    });

    const [lyricsGeneratorOptions, setLyricsGeneratorOptions] = React.useState({
        theme: '', lyricsLanguage: '', lyricLength: '', bias: '' // <-- NEW: optional bias/prompt field included in state
    });

    React.useEffect(() => {
        fetch('/api/form_data')
            .then(res => res.json())
            .then(data => {
                setInstruments(data.instruments || []);
                setEdits(data.edits || []);
                setGenres(data.genres || []);
                setLyricsLanguages(data.lyrics_languages || []);
                setVocalStyles(data.vocal_styles || []);
                setMaleVoiceNames(data.male_voice_names || []);
                setFemaleVoiceNames(data.female_voice_names || []);
                setTtsEngines(data.tts_engines || ['Bark AI', 'Coqui XTTS']);
                setLanguages(data.languages || []);
                setAllLanguages(data.languages || []);
                setOutputFileType(data.type || [])
                const defaultGenre = (data.genres && data.genres[0]) || '';
                const defaultLang = (data.languages && data.languages[0]) || '';
                const defaultLyricsLang = (data.lyrics_languages && data.lyrics_languages[0]) || '';
                const defaultVocalStyle = (data.vocal_styles && data.vocal_styles[0]) || '';
                const defaultTtsEngine = (data.tts_engines && data.tts_engines[0]) || 'Bark AI';
                const defaultMaleVoice = (data.male_voice_names && data.male_voice_names[0]) || '';
                const defaultFemaleVoice = (data.female_voice_names && data.female_voice_names[0]) || '';
                setTtsEngine(defaultTtsEngine);
                const defaultOutputFileType = Array.isArray(data.type) ? data.type[0] : data.type || 'wav';
                setOutputFileType(defaultOutputFileType);
                setInstrumentOptions(prev => ({
                    ...prev,
                    instrument: (data.instruments && data.instruments[0] && data.instruments[0].code) || '',
                    genre: defaultGenre,
                    language: defaultLang,
                    vocalStyle: defaultVocalStyle,
                    maleVoiceName: defaultMaleVoice,
                    femaleVoiceName: defaultFemaleVoice,
                    outputFileType: defaultOutputFileType
                }));

                setLyricsGeneratorOptions(prev => ({
                    ...prev, theme: defaultGenre, lyricsLanguage: defaultLyricsLang,

                    lyricLength: 'Medium (8-16 lines)', bias: ''
                }));
            })
            .catch(err => console.error('Failed to fetch form data:', err));
    }, []);
    const handleFileUpload = (type) => async (e) => {
        e.preventDefault();
        setStatus("Reducing Noise");
        setIsProcessing(true)
        const formData = new FormData(e.target);

        try {
            const response = await fetch(`/noise_reduction`, {
                method: "POST", body: formData
            });
            const data = await response.json();
            if (data.status === "success" && data.generation_result) {
                const result = data.generation_result;
                // Update status
                setStatus(result.status || "Noise reduction complete.");
                // Return the result so NoiseReduction.jsx can use it
                return result;
            } else {
                setStatus("Unexpected response from server.");
                return null;
            }
        } catch (err) {
            console.error(err);
            setStatus("Error processing file.");
            return null;
        }
    };


    const handleGenerateMusic = async (event) => {
        event.preventDefault();
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('instrument', instrumentOptions.instrument);
            formData.append('genre', instrumentOptions.genre);
            formData.append('language', instrumentOptions.language);
            formData.append('mode', instrumentOptions.mode);
            const selectedType = (outputFileType) || 'wav';
            formData.append('type', selectedType);
            if (instrumentOptions.mode === "tts_only") {
                setStatus('Generating Speech');
            } else {
                setStatus('Generating Music')
            }
            formData.append('tts_engine', ttsEngine);
            console.log(instrumentOptions.lyrics)
            for (let [key, val] of formData.entries()) {
                console.log(key, val);
            }
            // VocalOptions uses voiceUploadFile OR lyrics
            if (activeTab === 'instrumentOptions') {
                if (instrumentOptions.vocalStyle === 'Male') {
                    formData.append('selected_voice_name', instrumentOptions.maleVoiceName);
                    formData.append('vocal_gender', 'Male');
                } else if (instrumentOptions.vocalStyle === 'Female') {
                    formData.append('selected_voice_name', instrumentOptions.femaleVoiceName);
                    formData.append('vocal_gender', 'Female');
                } else {
                    formData.append('vocal_gender', 'Random');
                    formData.append('selected_voice_name', '');
                }
                formData.append('vocal_style', instrumentOptions.vocalStyle);
                formData.append('lyrics', instrumentOptions.lyrics);
            } else if (activeTab === 'vocalOptions') {
                if (instrumentOptions.voiceUploadFile) {
                    formData.append('voice_upload', instrumentOptions.voiceUploadFile);
                    formData.append('lyrics', instrumentOptions.lyrics);
                } else {
                    formData.append('lyrics', instrumentOptions.lyrics);
                }
            }

            const res = await fetch('/generate_vocals', {method: 'POST', body: formData});
            const data = await res.json();
            let newStatus = `Error: ${data.message}`;
            let audioUrl = null;
            let musicUrl = null;
            let vocalUrl = null;
            if (data.status === 'success') {
                const gen = data.generation_result || {};
                audioUrl = gen.final_audio_url || gen.audio_url || null;
                musicUrl = gen.music_audio_url || null;
                vocalUrl = gen.vocal_audio_url || null;
                newStatus = gen.status || 'Song created!';
            }
            setStatus(newStatus);
            if (activeTab === 'instrumentOptions') {
                setInstrumentOptions(prev => ({
                    ...prev, generatedAudioUrl: audioUrl, generatedMusicUrl: musicUrl, generatedVocalUrl: vocalUrl,
                }));
            } else if (activeTab === 'vocalOptions') {
                setInstrumentOptions(prev => ({
                    ...prev,
                    generatedAudioUrlVocalOptions: audioUrl,
                    generatedMusicUrlVocalOptions: musicUrl,
                    generatedVocalUrlVocalOptions: vocalUrl,
                }));
            } else {
                setInstrumentOptions(prev => ({
                    ...prev, generatedAudioUrl: audioUrl,
                }));
            }
        } catch (err) {
            setStatus('Network Error: Could not connect to backend.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerateLyrics = async (event) => {
        event.preventDefault();
        setIsProcessing(true);
        setStatus('Generating Lyrics');
        try {
            const formData = new FormData();
            // No music upload field now — send only form params per the new design
            formData.append('theme', lyricsGeneratorOptions.theme);

            // Normalize the lyrics language to Title Case English for backend consistency
            const lang = lyricsGeneratorOptions.lyricsLanguage || '';
            const normalizedLang = lang ? (lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()) : 'English';
            formData.append('lyrics_language', normalizedLang);
            formData.append('lyric_length', lyricsGeneratorOptions.lyricLength);
            // Append optional bias/prompt field if present
            if (lyricsGeneratorOptions.bias && lyricsGeneratorOptions.bias.trim().length > 0) {
                formData.append('bias', lyricsGeneratorOptions.bias.trim());
            }
            // New: pass chosen tts_engine optionally — not required for markovify but kept for context
            formData.append('tts_engine', ttsEngine);
            const res = await fetch('/generate_lyrics', {method: 'POST', body: formData});
            const data = await res.json();
            if (data.status === 'success' && data.generation_result && data.generation_result.lyrics_text) {
                setStatus(`Lyrics generated successfully.`);
                setInstrumentOptions(prev => ({...prev, generatedLyrics: data.generation_result.lyrics_text}));
            } else {
                setStatus(`Error: ${data.message || 'Unknown error.'}`);
            }
        } catch (err) {
            setStatus('Network Error: Could not connect to backend.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setInstrumentOptions(prev => ({
            ...prev, generatedAudioUrl: null, generatedMusicUrl: null, generatedVocalUrl: null
        }));
        switch (activeTab) {
            case 'noiseReduction':
                setStatus('Ready for noise reduction.');
                break;
            case 'instrumentOptions':
                setStatus('Ready to process lyrics to music.');
                break;
            case 'lyricsGenerator':
                setStatus('Ready to generate lyrics.');
                break;
            case 'vocalOptions':
                setStatus('Ready to record and enter lyrics.');
                break;
            default:
                setStatus('Ready.');
        }
        setIsProcessing(false);
    };

    // 1. isSubmitting is just an alias for isProcessing for component clarity
    const isSubmitting = isProcessing;
    const hasMinLengthLyrics = instrumentOptions.lyrics && instrumentOptions.lyrics.trim().length >= 4;
    const hasVoiceFile = !!instrumentOptions.voiceUploadFile;
    const canGenerate = (hasMinLengthLyrics || hasVoiceFile) && !isSubmitting;

    React.useEffect(() => {
        const arabicLang = 'Arabic';
        let newLanguages = [...allLanguages];
        // Safety check: Only run filtering if we have the master list loaded
        if (allLanguages.length === 0) {
            return;
        }
        // Conditional Filtering: If Bark AI is selected, remove Arabic.
        if (ttsEngine === 'Bark AI') {
            newLanguages = allLanguages.filter(lang => lang !== arabicLang);

            // Check and Reset Selected Language if needed
            if (instrumentOptions.language === arabicLang) {
                // If Arabic was selected, default back to 'English'
                setInstrumentOptions(prev => ({
                    ...prev, language: 'English',
                }));
            }
        }
        // Update the visible languages list (only if it has changed)
        if (languages.length !== newLanguages.length || languages.some((lang, i) => lang !== newLanguages[i])) {
            setLanguages(newLanguages);
        }
        // Dependencies: Crucial for telling React when to re-run the effect
    }, [ttsEngine, allLanguages, instrumentOptions.language, setInstrumentOptions, languages, setLanguages]);


    // ---------------------------------------------------------------------
    // 💡 MusicLoaderComponent (same as before but button text/context updated)
    // ---------------------------------------------------------------------
    const MusicLoaderComponent = ({processingText}) => {
        const baseText = processingText;
        const characters = baseText.split('');
        const musicalNotes = ['🎶', '🎹', '🥁', '🎵', '🎸', '🎻', '🎼', '🎺', '🎷', '🪗', '🎚️', '🪘', '🎺', '🎻', '🎛️', '📯', '🪇'];
        const lyricsNotes = ["📖", "📝", "✏️", "📝", "➕", "📄", "✍️", "📜", "💡", "📃", "✨", "📊", "📋"];
        const noiseReductionNotes = ["📝", "🔧", "🔁", "🔨", "🪛", "♻️", "🪚", "🪓", "🔄", "🧹", "🧼", "⚒️", "🔂", "🛠️"];
        const vocalIcons = ["🎙️", "💬", "🎤", "🗣️", "🔊", "🔈", "🎧", "🎚️", "🔉", "🎛️", "📢", "📣", "🗨️",];
        const textLength = characters.length;
        const [pulseIndex, setPulseIndex] = React.useState(0);
        const [isForward, setIsForward] = React.useState(true);
        const pulseInterval = 400;

        React.useEffect(() => {
            if (!baseText) return;
            const intervalId = setInterval(() => {
                setPulseIndex(prevIndex => {
                    let nextIndex;
                    if (isForward) {
                        nextIndex = prevIndex + 1;
                        if (nextIndex >= textLength) {
                            setIsForward(false);
                            return textLength - 2;
                        }
                    } else {
                        nextIndex = prevIndex - 1;
                        if (nextIndex < 0) {
                            setIsForward(true);
                            return 1;
                        }
                    }
                    return nextIndex;
                });
            }, pulseInterval);
            return () => clearInterval(intervalId);
        }, [baseText, textLength, isForward]);
        const textClasses = `status-text text-success text-center`;
        return (<p className={textClasses}>
            {characters.map((char, index) => {
                const isPulsing = index === pulseIndex;
                const note = (isProcessing && status.includes('Generating Lyrics') ? lyricsNotes[index % lyricsNotes.length] : (isProcessing && status.includes('Reducing Noise') ? noiseReductionNotes[index % noiseReductionNotes.length] : status.includes('Generating Speech') ? vocalIcons[index % vocalIcons.length] : musicalNotes[index % musicalNotes.length]));
                const isWordSpacer = char === ' ' && index === 10;
                const containerClass = `pulse-note-char-container ${isPulsing ? 'is-pulsing' : ''} ${isWordSpacer ? 'word-spacer' : ''}`;
                return (<span key={index} className={containerClass}>
              <span className="pulse-char-text" data-note={note}
                    style={{'--note-color': isPulsing ? '#A6B0E5' : 'inherit'}}>
                {isPulsing ? note : char}
              </span>
                    {isPulsing && <span className="pulse-circle-bg"></span>}
            </span>);
            })}
        </p>);
    };
    const translations = {
        English: {
            generate: 'Generating Lyrics'
        }, Arabic: {
            generate: 'Generating Lyrics'
        }, Chinese: {
            generate: '生成歌词'
        }, French: {
            generate: 'Générer les paroles'
        }, German: {
            generate: 'Songtexte erzeugen'
        }, Italian: {
            generate: 'Genera testi'
        }, Russian: {
            generate: 'Сгенерировать текст'
        }, Spanish: {
            generate: 'Generar letras'
        }
    };
    const generatingPhrases = Object.values(translations).map(t => t.generate);
    const isGenerating = generatingPhrases.some(phrase => status.includes(phrase));
    const isReducing = status.includes("Reducing");
    const isGeneratingMusic = status.includes("Generating");
    const TabComponents = {
        lyricsGenerator: window.LyricsGenerator,
        instrumentOptions: window.InstrumentOptions,
        vocalOptions: window.VocalOptions,
        noiseReduction: window.NoiseReduction,
    };
    const ActiveTabComponent = TabComponents[activeTab];
    const currentStatus = status;

    return (<React.Fragment>
        <div className="container-fluid app-card">
            <h1 className="text-center header-text-custom">Audio Toolkit</h1>
            <ul className="nav nav-tabs nav-justified app-nav-tabs">
                <li className={activeTab === 'lyricsGenerator' ? 'active' : ''}>
                    <a className={activeTab !== 'lyricsGenerator' && isProcessing ? "disabled hide-cursor" : ""}
                       href="#" onClick={e => {
                        e.preventDefault();
                        setActiveTab('lyricsGenerator');
                        setStatus('Ready to generate lyrics.');
                    }}>
                        Lyrics Studio
                        <p className="text-small">Lyrics Generation</p>
                    </a>
                </li>
                <li className={activeTab === 'instrumentOptions' ? 'active' : ''}>
                    <a className={activeTab !== 'instrumentOptions' && isProcessing ? "disabled hide-cursor" : ""}
                       href="#" onClick={e => {
                        e.preventDefault();
                        setActiveTab('instrumentOptions');
                        setStatus('Ready to process lyrics to music.');
                    }}>
                        Sonic Studio
                        <p className="text-small">Melody & Speech Generation</p>
                    </a>
                </li>
                <li className={activeTab === 'vocalOptions' ? 'active' : ''}>
                    <a className={activeTab !== 'vocalOptions' && isProcessing ? "disabled hide-cursor" : ""}
                       href="#" onClick={e => {
                        e.preventDefault();
                        setActiveTab('vocalOptions');
                        setStatus('Ready to record and enter lyrics.');
                    }}>
                        Vocal Studio
                        <p className="text-small">Voice & Lyrics Options</p>
                    </a>
                </li>
                <li className={activeTab === 'noiseReduction' ? 'active' : ''}>
                    <a className={activeTab !== 'noiseReduction' && isProcessing ? "disabled hide-cursor" : ""}
                       href="#" onClick={e => {
                        e.preventDefault();
                        setActiveTab('noiseReduction');
                        setStatus('Ready for noise reduction.');
                    }}>
                        Denoise Studio
                        <p className="text-small">Noise Sanitization</p>
                    </a>
                </li>
            </ul>

            <div className="tab-content app-tab-content justify-content-center">
                {ActiveTabComponent && (<ActiveTabComponent
                    instruments={instruments}
                    edits={edits}
                    genres={genres}
                    languages={languages}
                    lyricsLanguages={lyricsLanguages}
                    vocalStyles={vocalStyles}
                    maleVoiceNames={maleVoiceNames}
                    femaleVoiceNames={femaleVoiceNames}
                    ttsEngines={ttsEngines}
                    ttsEngine={ttsEngine}
                    setTtsEngine={setTtsEngine}
                    instrumentOptions={instrumentOptions}
                    setInstrumentOptions={setInstrumentOptions}
                    handleGenerateMusic={handleGenerateMusic}
                    handleGenerateLyrics={handleGenerateLyrics}
                    lyricsGeneratorOptions={lyricsGeneratorOptions}
                    setLyricsGeneratorOptions={setLyricsGeneratorOptions}
                    outputFileType={outputFileType}
                    setOutputFileType={setOutputFileType}
                    currentStatus={status}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    handleReset={handleReset}
                    setStatus={setStatus}
                    handleFileUpload={handleFileUpload}
                    isSubmitting={isSubmitting}
                    canGenerate={canGenerate}
                    activeTab={activeTab}
                />)}
            </div>
            <div
                className={`panel panel-default app-status-panel ${isProcessing ? "status-bg" : "ai-data-flow-sm"}`}>
                <div className="panel-body">
                    <div className="status-label">Status</div>
                    {(isProcessing && (isGenerating || isReducing || isGeneratingMusic)) ? (
                        <div className="loader-container container-fluid text-center">
                            <div
                                className={`d-inline-block ${status.includes('Generating Music') || status.includes('Generating Speech') ? "visualizer" : isGenerating ? "loader-lyrics" : "loader-tape"} ${isProcessing ? "active" : ""}`}
                            >
                                {Array.from({length: 32}).map((_, i) => (<span key={i} style={{"--i": i}}></span>))}
                            </div>
                            <MusicLoaderComponent processingText={status}/>
                        </div>) : status.includes('created') || status.includes('complete') ? (
                        <div className="alert alert-success align-items-center" role="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"
                                 fill="currentColor" className="bi bi-check-circle-fill mr-2"
                                 viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022l-3.473
        4.425-2.03-2.03a.75.75 0 0 0-1.06 1.06L6.97
        11.03a.75.75 0 0 0 1.079-.02l4.137-5.326a.75.75
        0 0 0-.022-1.08z"/>
                            </svg>
                            <span
                                className="font-weight-bold">  Success!</span> {status.includes('Song created!') ? 'Song creation complete!' : status.replace('Generation complete', '').trim()}
                        </div>) : (
                        <p className={`status-text ${status.includes('Error') ? 'text-danger' : 'text-success'}`}>
                            {status}
                        </p>)}
                </div>
            </div>
        </div>
    </React.Fragment>);
};

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(React.createElement(React.StrictMode, null, React.createElement(App)));
} else {
    console.error("Root element 'root' not found.");
}