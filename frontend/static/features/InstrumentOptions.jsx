/* ===== InstrumentOptions.jsx (FULL UPDATED FILE) ===== */
window.InstrumentOptions =
    ({
         instruments,
         genres,
         languages,
         vocalStyles,
         maleVoiceNames,
         femaleVoiceNames,
         instrumentOptions,
         setInstrumentOptions,
         handleGenerateMusic,
         isProcessing,
         handleReset,
         ttsEngines,
         ttsEngine,
         setTtsEngine,
         canGenerate,
         outputFileType,
         setOutputFileType,
         activeTab
     }) => {
        
        /* ===========================
         LANGUAGE MAP + HELPERS
         ============================ */
        const languageMap = {
            English: "en",
            Chinese: "zh",
            French: "fr",
            German: "de",
            Hindi: "hi",
            Italian: "it",
            Japanese: "ja",
            Korean: "ko",
            Polish: "pl",
            Portuguese: "pt",
            Russian: "ru",
            Spanish: "es",
            Turkish: "tr",
            Arabic: "ar",
        };
        /* ==================================
         1. VOICE MAP FOR LANGUAGE FILTERING
         ===================================== */
        const VOICE_MAP = {
            English: {
                male: ["Bryce", "Jake", "Ryan", "Joe", "Noah", "Norman"],
                female: ["Amy", "Jill", "Lily", "Rose", "Mia", "Jenny"]
            },
            Chinese: {
                male: ['Li Wei', 'Jun Hao', 'Chen Ming'],
                female: ['Mei Lin', 'Xiao Yan', 'Lian Hua']
            },
            French: {
                male: ['Jean', 'Luc', 'Marc'],
                female: ['Claire', 'Sophie', 'Elise']
            },
            German: {
                male: ['Lukas', 'Felix', 'Jonas'],
                female: ['Anna', 'Mila', 'Lena']
            },
            Hindi: {
                male: ['Arjun', 'Rohan', 'Vikram'],
                female: ['Asha', 'Mira', 'Priya']
            },
            Italian: {
                male: ['Marco', 'Lorenzo', 'Paolo'],
                female: ['Sofia', 'Giulia', 'Elena']
            },
            Japanese: {
                male: ['Ren', 'Haruto', 'Sora'],
                female: ['Yuna', 'Hana', 'Aiko']
            },
            Korean: {
                male: ['Min Jun', 'Ji Hoon', 'Seung Woo'],
                female: ['Seo Yeon', 'Min Ji', 'Ha Neul']
            },
            Polish: {
                male: ['Adam', 'Tomasz', 'Marek'],
                female: ['Kasia', 'Magda', 'Zofia']
            },
            Portuguese: {
                male: ['Tiago', 'Rafael', 'Bruno'],
                female: ['Inês', 'Marina', 'Carla']
            },
            Russian: {
                male: ['Ivan', 'Nikolai', 'Dmitri'],
                female: ['Nadia', 'Irina', 'Katya']
            },
            Spanish: {
                male: ['Diego', 'Javier', 'Luis'],
                female: ['Lucia', 'Carmen', 'Isabella']
            },
            Turkish: {
                male: ['Emre', 'Can', 'Mert'],
                female: ['Leyla', 'Merve', 'Aylin']
            },
            Arabic: {
                male: ['Omar', 'Sami', 'Ali'],
                female: ['Reem', 'Hind', 'Rana']
            }
        };
        const getLanguageAbbreviation = (languageName) =>
            languageMap[languageName] || languageName;
        const outputTypes = ["wav", "mp3", "flac", "opus", "ogg"];
        /* ======================================
         URLs FOR GENERATED AUDIO (AFTER RUN)
         ======================================= */
        const finalAudioUrl = instrumentOptions.generatedAudioUrl;
        const musicAudioUrl = instrumentOptions.generatedMusicUrl;
        const vocalAudioUrl = instrumentOptions.generatedVocalUrl;
        
        /* ===========================
         GLOBAL PLAYER STATE
         ============================ */
        const [isPlayingMain, setIsPlayingMain] = React.useState(false);
        const [progressMain, setProgressMain] = React.useState(0);
        const audioRefMain = React.useRef(null);
        
        const [isPlayingMusic, setIsPlayingMusic] = React.useState(false);
        const [progressMusic, setProgressMusic] = React.useState(0);
        const audioRefMusic = React.useRef(null);
        
        const [isPlayingVocal, setIsPlayingVocal] = React.useState(false);
        const [progressVocal, setProgressVocal] = React.useState(0);
        const audioRefVocal = React.useRef(null);
        
        const [mainInfo, setMainInfo] = React.useState({size: "", duration: ""});
        const [musicInfo, setMusicInfo] = React.useState({size: "", duration: ""});
        const [vocalInfo, setVocalInfo] = React.useState({size: "", duration: ""});
        const formatBytes = (bytes) => {
            if (!bytes) return "0 KB";
            const sizes = ["Bytes", "KB", "MB", "GB"];
            const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
            return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
        };
        
        const formatTime = (seconds) => {
            if (!seconds || isNaN(seconds)) return "0:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60).toString().padStart(2, "0");
            return `${m}:${s}`;
        };
        
        const fetchFileSize = async (url, setter) => {
            if (!url) return;
            try {
                const response = await fetch(url, {method: "HEAD"});
                const size = response.headers.get("content-length");
                setter((prev) => ({...prev, size: formatBytes(size)}));
            } catch {
            }
        };
        const togglePreview = () => {
            const a = audioRefPreview.current;
            if (!a) return;
            isPlayingPreview ? a.pause() : a.play();
        };
        
        
        /* ===========================
         LOAD DURATIONS
         ============================ */
        React.useEffect(() => {
            const main = audioRefMain.current;
            const music = audioRefMusic.current;
            const vocal = audioRefVocal.current;
            
            if (main)
                main.onloadedmetadata = () =>
                    setMainInfo((prev) => ({...prev, duration: formatTime(main.duration)}));
            
            if (music)
                music.onloadedmetadata = () =>
                    setMusicInfo((prev) => ({...prev, duration: formatTime(music.duration)}));
            
            if (vocal)
                vocal.onloadedmetadata = () =>
                    setVocalInfo((prev) => ({...prev, duration: formatTime(vocal.duration)}));
            
            if (finalAudioUrl) fetchFileSize(finalAudioUrl, setMainInfo);
            if (musicAudioUrl) fetchFileSize(musicAudioUrl, setMusicInfo);
            if (vocalAudioUrl) fetchFileSize(vocalAudioUrl, setVocalInfo);
        }, [finalAudioUrl, musicAudioUrl, vocalAudioUrl]);
        
        React.useEffect(() => {
            if (!instrumentOptions.mode) {
                setInstrumentOptions(prev => ({
                    ...prev,
                    mode: "full_music"
                }));
            }
        }, []);
        /* ===========================
         SYNC PLAYERS
         ============================ */
        const setupAudioSync = (audioRef, setIsPlaying, setProgress) => {
            const audio = audioRef.current;
            if (!audio) return;
            
            const update = () => {
                const pct = (audio.currentTime / audio.duration) * 100 || 0;
                setProgress(pct);
            };
            
            audio.addEventListener("timeupdate", update);
            audio.addEventListener("play", () => setIsPlaying(true));
            audio.addEventListener("pause", () => setIsPlaying(false));
            audio.addEventListener("ended", () => {
                setIsPlaying(false);
                setProgress(0);
            });
            
            return () => {
                audio.removeEventListener("timeupdate", update);
            };
        };
        
        React.useEffect(
            () => setupAudioSync(audioRefMain, setIsPlayingMain, setProgressMain),
            [finalAudioUrl]
        );
        React.useEffect(
            () => setupAudioSync(audioRefMusic, setIsPlayingMusic, setProgressMusic),
            [musicAudioUrl]
        );
        React.useEffect(
            () => setupAudioSync(audioRefVocal, setIsPlayingVocal, setProgressVocal),
            [vocalAudioUrl]
        );
        
        /* ===========================
         VOICE FILTERING LOGIC (NEW BLOCK)
         ============================ */
        const selectedLanguage = instrumentOptions.language;
        
        // Helper to get the correct list of names based on selected language
        const getFilteredVoices = (gender) => {
            const languageVoices = VOICE_MAP[selectedLanguage];
            // Safely return the voice list for the selected language and gender, or an empty array
            return (languageVoices && languageVoices[gender.toLowerCase()]) || [];
        };
        
        const filteredMaleVoices = getFilteredVoices('male');
        const filteredFemaleVoices = getFilteredVoices('female');
        
        
        /* ===========================
         VOICE PREVIEW URL
         ============================ */
        const getVoicePreviewPath = () => {
            const gender = instrumentOptions.vocalStyle.toLowerCase();
            const male = instrumentOptions.maleVoiceName;
            const female = instrumentOptions.femaleVoiceName;
            const abbr = getLanguageAbbreviation(instrumentOptions.language);
            
            if (gender === "male" && male)
                return `/static/voices/male/${abbr}/${abbr}_speaker_${male.toLowerCase().replace(/ /g, '_')}.mp3`;
            
            if (gender === "female" && female)
                return `/static/voices/female/${abbr}/${abbr}_speaker_${female.toLowerCase().replace(/ /g, '_')}.mp3`;
            
            return null;
        };
        
        // NOTE: I added .replace(/ /g, '_') to convert spaces to underscores for file path consistency
        // (e.g., 'Li Wei' -> 'li_wei'). Please ensure your actual file names follow this convention.
        
        const voicePreviewUrl = getVoicePreviewPath();
        
        /* ===========================
         PREVIEW PLAYER STATE
         ============================ */
        const [isPlayingPreview, setIsPlayingPreview] = React.useState(false);
        const [progressPreview, setProgressPreview] = React.useState(0);
        const audioRefPreview = React.useRef(null);
        
        React.useEffect(
            () => setupAudioSync(audioRefPreview, setIsPlayingPreview, setProgressPreview),
            [voicePreviewUrl]
        );
        
        // Toggle play/pause functions
        const togglePlayMain = () => {
            const audio = audioRefMain.current;
            if (!audio) return;
            isPlayingMain ? audio.pause() : audio.play();
        };
        const togglePlayMusic = () => {
            const audio = audioRefMusic.current;
            if (!audio) return;
            isPlayingMusic ? audio.pause() : audio.play();
        };
        const togglePlayVocal = () => {
            const audio = audioRefVocal.current;
            if (!audio) return;
            isPlayingVocal ? audio.pause() : audio.play();
        };
        
        // Seek functions
        const seekAudio = (e, audioRef) => {
            const audio = audioRef.current;
            if (!audio) return;
            const width = e.currentTarget.clientWidth;
            const clickX = e.nativeEvent.offsetX;
            audio.currentTime = (clickX / width) * audio.duration;
        };
        
        const DownloadIcon = ({size = 20}) => (
            <span className="glyphicon">&#xe025;</span>
        );
        console.log(activeTab)
        // Display all players if generated URLs exist
        if (finalAudioUrl || musicAudioUrl || vocalAudioUrl && activeTab === 'instrumentOptions') {
            
            // Determine if we should show the two side players (Music and Vocal)
            // This is true if we are in 'full_music' mode AND all three files are present.
            const showFullPlayers = (
                instrumentOptions.mode === "full_music" &&
                finalAudioUrl &&
                musicAudioUrl &&
                vocalAudioUrl && activeTab === 'instrumentOptions'
            );
            
            // Determine if we should show ONLY the main player
            // This is true if we are in 'tts_only' mode AND the main file is present.
            const showMainPlayerOnly = (
                instrumentOptions.mode === "tts_only" &&
                finalAudioUrl && activeTab === 'instrumentOptions'
            );
            
            // The rendering logic is wrapped inside a single conditional check:
            if (showFullPlayers || showMainPlayerOnly) {
                return (
                    <React.Fragment>
                        <div className="form-horizontal output-options-form-bg">
                            <h2 className="header-text-custom">AI Vocal Generation Output</h2>
                            <p className="subheader-text-custom">
                                The processing task has finished. You can listen to and download your new audio below.
                            </p>
                            
                            {/* MAIN PLAYER (Always shown if the outer IF condition is met) */}
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="audio-container">
                                        <p className="text-xlg font-semibold mb-4" style={{color: "#A6B0E5"}}>Generated
                                            Track Preview</p>
                                        <div className={`visualizer ${isPlayingMain ? "active" : ""}`}>
                                            {Array.from({length: 32}).map((_, i) => (
                                                <span key={i} style={{"--i": i}}></span>))}
                                        </div>
                                        
                                        <div className="custom-audio-player">
                                            <button className={`play-btn ${isPlayingMain ? "pause" : "play"}`}
                                                    onClick={togglePlayMain}>
                                                {isPlayingMain ? "❚❚" : "▶"}
                                            </button>
                                            
                                            <div className="progress-container"
                                                 onClick={(e) => seekAudio(e, audioRefMain)}>
                                                <div className="progress-bar" style={{width: `${progressMain}%`}}></div>
                                            </div>
                                            
                                            {finalAudioUrl && (
                                                <a href={finalAudioUrl} download="sonosphere_final_mix.wav"
                                                   className="circular-download-btn" title="Download final mix">
                                                    <DownloadIcon size={22}/>
                                                </a>
                                            )}
                                            
                                            <audio ref={audioRefMain}>
                                                {finalAudioUrl && <source src={finalAudioUrl} type="audio/wav"/>}
                                            </audio>
                                        </div>
                                        
                                        {/* NEW: File info label */}
                                        <div style={{color: "#ccc", fontSize: "1.2rem", marginTop: "0.5rem"}}>
                                            {mainInfo.size && mainInfo.duration ? `Size: ${mainInfo.size} • Duration: ${mainInfo.duration}` : "Loading..."}
                                        </div>
                                        
                                        <div className="container-fluid row" style={{marginTop: '2rem'}}>
                                            <div className="col-sm-12">
                                                {finalAudioUrl && (
                                                    <a href={finalAudioUrl} download="sonosphere_final_mix.wav"
                                                       className="btn btn-lg" title="Download final mix">
                                                        Download&nbsp;&nbsp;
                                                        <DownloadIcon size={18}/>
                                                        &nbsp;&nbsp;File
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                            </div>
                            
                            {/* TWO SIDE PLAYERS - CONDITIONAL RENDERING */}
                            {showFullPlayers && (
                                <div className="row" style={{marginTop: '2rem', gap: '1rem'}}>
                                    {/* LEFT: Music */}
                                    <div className="col-sm-6">
                                        <div className="audio-container">
                                            <p className="text-lg font-semibold mb-3"
                                               style={{color: "#A6B0E5"}}>Generated Music</p>
                                            <div className={`visualizer ${isPlayingMusic ? "active" : ""}`}>
                                                {Array.from({length: 16}).map((_, i) => (
                                                    <span key={i} style={{"--i": i}}></span>))}
                                            </div>
                                            
                                            <div className="custom-audio-player">
                                                <button className={`play-btn ${isPlayingMusic ? "pause" : "play"}`}
                                                        onClick={togglePlayMusic}>
                                                    {isPlayingMusic ? "❚❚" : "▶"}
                                                </button>
                                                
                                                <div className="progress-container"
                                                     onClick={(e) => seekAudio(e, audioRefMusic)}>
                                                    <div className="progress-bar"
                                                         style={{width: `${progressMusic}%`}}></div>
                                                </div>
                                                
                                                {musicAudioUrl && (
                                                    <a href={musicAudioUrl} download="sonosphere_music.wav"
                                                       className="circular-download-btn" title="Download music">
                                                        <DownloadIcon size={18}/>
                                                    </a>
                                                )}
                                                
                                                <audio ref={audioRefMusic}>
                                                    {musicAudioUrl && <source src={musicAudioUrl} type="audio/wav"/>}
                                                </audio>
                                            </div>
                                            <div style={{color: "#ccc", fontSize: "1.2rem", marginTop: "0.5rem"}}>
                                                {musicInfo.size && musicInfo.duration ? `Size: ${musicInfo.size} • Duration: ${musicInfo.duration}` : "Loading..."}
                                            </div>
                                            {musicAudioUrl && (
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <a href={musicAudioUrl} download="sonosphere_music.wav"
                                                           className="btn btn-lg" title="Download music">
                                                            Download&nbsp;&nbsp;
                                                            <DownloadIcon size={18}/>
                                                            &nbsp;&nbsp;File
                                                        </a></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* RIGHT: Vocals */}
                                    <div className="col-sm-6">
                                        <div className="audio-container">
                                            <p className="text-lg font-semibold mb-3"
                                               style={{color: "#A6B0E5"}}>Generated Vocals</p>
                                            <div className={`visualizer ${isPlayingVocal ? "active" : ""}`}>
                                                {Array.from({length: 16}).map((_, i) => (
                                                    <span key={i} style={{"--i": i}}></span>))}
                                            </div>
                                            
                                            <div className="custom-audio-player">
                                                <button className={`play-btn ${isPlayingVocal ? "pause" : "play"}`}
                                                        onClick={togglePlayVocal}>
                                                    {isPlayingVocal ? "❚❚" : "▶"}
                                                </button>
                                                
                                                <div className="progress-container"
                                                     onClick={(e) => seekAudio(e, audioRefVocal)}>
                                                    <div className="progress-bar"
                                                         style={{width: `${progressVocal}%`}}></div>
                                                </div>
                                                
                                                {vocalAudioUrl && (
                                                    <a href={vocalAudioUrl} download="sonosphere_vocals.wav"
                                                       className="circular-download-btn" title="Download vocals">
                                                        <DownloadIcon size={18}/>
                                                    </a>
                                                )}
                                                
                                                <audio ref={audioRefVocal}>
                                                    {vocalAudioUrl && <source src={vocalAudioUrl} type="audio/wav"/>}
                                                </audio>
                                            </div>
                                            <div style={{color: "#ccc", fontSize: "1.2rem", marginTop: "0.5rem"}}>
                                                {vocalInfo.size && vocalInfo.duration ?
                                                 `Size: ${vocalInfo.size} • Duration: ${vocalInfo.duration}` : "Loading..."}
                                            </div>
                                            {vocalAudioUrl && (
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <a href={vocalAudioUrl} download="sonosphere_vocals.wav"
                                                           className="btn btn-lg" title="Download vocals">
                                                            Download&nbsp;&nbsp;
                                                            <DownloadIcon size={18}/>
                                                            &nbsp;&nbsp;File
                                                        </a></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="row">
                                <div className="col-sm-12">
                                    <button onClick={handleReset} className="btn btn-lg">Generate New Song</button>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                );
            }
        }
        // Default form
        return (
            <form
                onSubmit={handleGenerateMusic}
                className={`form-horizontal instrument-options-form-bg ${isProcessing ? 'hidden' : ''}`}
            >
                {!isProcessing ? (
                    <>
                        <h1 className="text-center header-text-custom">Lyrics to Melody: Full Song Synthesis</h1>
                        <h4 className="text-center subheader-text-custom">
                            Transform your verses and choruses into fully orchestrated melodies.
                        </h4>
                        
                        
                        <div className="form-group">
                            <label className="col-sm-4 control-label">Mode</label>
                            <div className="col-sm-8">
                                <div className="btn-group btn-group-justified" data-toggle="buttons">
                                    
                                    <label
                                        className={`btn ${
                                            instrumentOptions.mode === "full_music"
                                            ? "btn-primary-tts active"
                                            : "btn-primary-tts"
                                        }`}
                                        onClick={() =>
                                            setInstrumentOptions({...instrumentOptions, mode: "full_music"})
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="mode"
                                            value="full_music"
                                            checked={instrumentOptions.mode === "full_music"}
                                            readOnly
                                        />
                                        Text to Song
                                    </label>
                                    
                                    <label
                                        className={`btn ${
                                            instrumentOptions.mode === "tts_only"
                                            ? "btn-primary-tts active"
                                            : "btn-primary-tts"
                                        }`}
                                        onClick={() =>
                                            setInstrumentOptions({...instrumentOptions, mode: "tts_only"})
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="mode"
                                            value="tts_only"
                                            checked={instrumentOptions.mode === "tts_only"}
                                            readOnly
                                        />
                                        Text to Speech
                                    </label>
                                
                                </div>
                                <p className="help-block">
                                    Choose to generate a full song (with instrumentals) or only speech.
                                </p>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="col-sm-4 control-label">TTS Engine</label>
                            <div className="col-sm-8">
                                <div className="btn-group btn-group-justified" data-toggle="buttons">
                                    {ttsEngines.map((engine) => (
                                        <label
                                            key={engine}
                                            className={`btn ${
                                                ttsEngine === engine ? "btn-primary-tts-engine active" : "btn-primary-tts-engine"
                                            }`}
                                            onClick={() => setTtsEngine(engine)}
                                        >
                                            <input
                                                type="radio"
                                                name="ttsEngine"
                                                value={engine}
                                                checked={ttsEngine === engine}
                                                readOnly
                                            />
                                            {engine}
                                        </label>
                                    ))}
                                </div>
                                <p className="help-block">
                                    Choose the AI model for vocal
                                    synthesis. {ttsEngine === 'Bark AI' ? ' Bark AI: Hyper-Realistic Singing & Emotion' : ' Coqui XTTS: Expressive, Clear Multi-Lingual Speech'}
                                </p>
                            </div>
                        </div>
                        
                        {instrumentOptions.mode === "full_music" && (
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Instrument</label>
                                <div className="col-sm-8">
                                    <select
                                        className="form-control"
                                        value={instrumentOptions.instrument}
                                        onChange={(e) =>
                                            setInstrumentOptions({
                                                                     ...instrumentOptions,
                                                                     instrument: e.target.value,
                                                                 })
                                        }
                                    >
                                        {instruments.map((inst) => (
                                            <option key={inst.code || inst} value={inst.code || inst}>
                                                {inst.name || inst}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label className="col-sm-4 control-label">Language</label>
                            <div className="col-sm-8">
                                <select
                                    className="form-control"
                                    value={instrumentOptions.language}
                                    onChange={(e) =>
                                        setInstrumentOptions({
                                                                 ...instrumentOptions,
                                                                 language: e.target.value,
                                                             })
                                    }
                                >
                                    {languages.map((l) => (
                                        <option key={l}>{l}</option>
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
                                    onChange={(e) =>
                                        setInstrumentOptions({
                                                                 ...instrumentOptions,
                                                                 vocalStyle: e.target.value,
                                                             })
                                    }
                                >
                                    {vocalStyles.map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {instrumentOptions.vocalStyle.toLowerCase() === "male" && (
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Male Voice</label>
                                <div className="col-sm-8">
                                    <select
                                        className="form-control"
                                        value={instrumentOptions.maleVoiceName}
                                        onChange={(e) =>
                                            setInstrumentOptions({
                                                                     ...instrumentOptions,
                                                                     maleVoiceName: e.target.value,
                                                                     femaleVoiceName: "",   // clear female when switching
                                                                 })
                                        }
                                    >
                                        <option value="">Select voice</option>
                                        {filteredMaleVoices.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        
                        {instrumentOptions.vocalStyle.toLowerCase() === "female" && (
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Female Voice</label>
                                <div className="col-sm-8">
                                    <select
                                        className="form-control"
                                        value={instrumentOptions.femaleVoiceName}
                                        onChange={(e) =>
                                            setInstrumentOptions({
                                                                     ...instrumentOptions,
                                                                     femaleVoiceName: e.target.value,
                                                                     maleVoiceName: "",   // clear male when switching
                                                                 })
                                        }
                                    >
                                        <option value="">Select voice</option>
                                        {filteredFemaleVoices.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        
                        {voicePreviewUrl && (
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Voice Preview</label>
                                <div className="col-sm-8">
                                    <div className="audio-container">
                                        <div className="custom-audio-player">
                                            <button
                                                className={`play-btn ${
                                                    isPlayingPreview ? "pause" : "play"
                                                }`}
                                                onClick={togglePreview}
                                                type="button"
                                            >
                                                {isPlayingPreview ? "❚❚" : "▶"}
                                            </button>
                                            
                                            <div
                                                className="progress-container"
                                                onClick={(e) => seekAudio(e, audioRefPreview)}
                                            >
                                                <div
                                                    className="progress-bar"
                                                    style={{width: `${progressPreview}%`}}
                                                ></div>
                                            </div>
                                            
                                            <audio ref={audioRefPreview} key={voicePreviewUrl}>
                                                <source src={voicePreviewUrl} type="audio/mp3"/>
                                            </audio>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        
                        {instrumentOptions.mode === "full_music" && (<div className="form-group">
                            <label className="col-sm-4 control-label">Genre</label>
                            <div className="col-sm-8">
                                <select
                                    className="form-control"
                                    value={instrumentOptions.genre}
                                    onChange={(e) =>
                                        setInstrumentOptions({
                                                                 ...instrumentOptions,
                                                                 genre: e.target.value,
                                                             })
                                    }
                                >
                                    {genres.map((g) => (
                                        <option key={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        </div>)}
                        <div className="form-group"><label className="col-sm-4 control-label">Lyrics</label>
                            <div className="col-sm-8"><textarea className="form-control" rows="3"
                                                                placeholder="Enter your lyrics here..."
                                                                value={instrumentOptions.lyrics}
                                                                onChange={(e) => setInstrumentOptions({
                                                                                                          ...instrumentOptions,
                                                                                                          lyrics: e.target.value
                                                                                                      })}/></div>
                        </div>
                        <div className="form-group text-center" style={{marginBottom: "25px"}}>
                            <label className="control-label" style={{fontSize: "1.3rem", color: "#ccc"}}>
                                Output File Type
                            </label>
                            
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                flexWrap: "wrap",
                                gap: "10px",
                                marginTop: "10px"
                            }}>
                                {outputTypes.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`btn ${
                                            outputFileType === type ? "btn-lg-default active" : "btn-lg-default-inactive"
                                        }`}
                                        style={{
                                            minWidth: "90px",
                                            borderRadius: "20px",
                                            fontSize: "1.8rem",
                                            padding: "6px 16px"
                                        }}
                                        onClick={() => setOutputFileType(type)}
                                    >
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Hidden input so backend receives it */}
                            <input type="hidden" name="type" value={outputFileType}/>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-12 text-center">
                                <button
                                    disabled={!canGenerate}
                                    className="btn btn-lg"
                                    type="submit">
                                    Generate
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                     <div className="loader-container container-fluid text-center">
                         <div className="soundwave-loader">
                             {Array.from({length: 10}).map((_, i) => (
                                 <div key={i} className={`bar bar-${i + 1}`}></div>
                             ))}
                         </div>
                         <p className="status-text text-success mt-4">Generating {instrumentOptions.mode === "tts_only" ? "Speech" : "Music"}</p>
                     </div>
                 )}
            </form>
        );
    };