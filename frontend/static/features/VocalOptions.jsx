// VoiceRecorderModal
const VoiceRecorderModal = ({isOpen, onClose, onSaveRecording, setStatus}) => {
    const [isRecording, setIsRecording] = React.useState(false);
    const [isPlayingReview, setIsPlayingReview] = React.useState(false);
    const [progressReview, setProgressReview] = React.useState(0);
    const [durationReview, setDurationReview] = React.useState("0:00");
    
    const [audioURL, setAudioURL] = React.useState(null);
    const [audioBlob, setAudioBlob] = React.useState(null);
    const mediaRecorderRef = React.useRef(null);
    const streamRef = React.useRef(null);
    const chunksRef = React.useRef([]);
    const audioRefReview = React.useRef(null);
    
    const prompts = [
        "One, two, three, four. My voice is recorded with clarity and precision.",
        "The quick brown fox jumps over the lazy dog, capturing every sound.",
        "A wizard's sleeve, a cozy lair, with velvet moss and starlight fair.",
    ];
    const [selectedPrompt, setSelectedPrompt] = React.useState(prompts[0]);
    
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };
    
    const togglePlayReview = () => {
        const audio = audioRefReview.current;
        if (!audio) return;
        isPlayingReview ? audio.pause() : audio.play();
    };
    
    const seekAudioReview = (e) => {
        const audio = audioRefReview.current;
        if (!audio) return;
        const width = e.currentTarget.clientWidth;
        const clickX = e.nativeEvent.offsetX;
        audio.currentTime = (clickX / width) * audio.duration;
    };
    
    React.useEffect(() => {
        const audio = audioRefReview.current;
        if (!audio || !audioURL) return;
        
        const updateProgress = () => {
            const percent = (audio.currentTime / audio.duration) * 100 || 0;
            setProgressReview(percent);
        };
        const handlePlay = () => setIsPlayingReview(true);
        const handlePause = () => setIsPlayingReview(false);
        const handleEnded = () => {
            setIsPlayingReview(false);
            setProgressReview(0);
        };
        audio.onloadedmetadata = () => {
            setDurationReview(formatTime(audio.duration));
        };
        
        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("ended", handleEnded);
        
        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [audioURL]);
    
    React.useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        };
    }, [audioURL]);
    
    const startRecording = async () => {
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
                setAudioURL(null);
                setAudioBlob(null);
            }
            chunksRef.current = [];
            
            const mimeType = "audio/webm;codecs=opus";
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            streamRef.current = stream;
            
            const mediaRecorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(mimeType) ? {mimeType} : undefined);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const blobType = (chunksRef.current[0] && chunksRef.current[0].type) || "audio/webm";
                const blob = new Blob(chunksRef.current, {type: blobType});
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                setAudioBlob(blob);
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                }
            };
            
            mediaRecorder.start();
            setIsRecording(true);
            setStatus("Recording...");
        } catch (err) {
            console.error("[recorder] startRecording error:", err);
            setStatus("Error: Microphone access denied or failed.");
        }
    };
    
    const stopRecording = () => {
        try {
            const mr = mediaRecorderRef.current;
            if (mr && mr.state === "recording") mr.stop();
        } catch (err) {
            console.error("[recorder] stopRecording error:", err);
        } finally {
            setIsRecording(false);
        }
    };
    
    const resetRecording = () => {
        if (audioURL) {
            URL.revokeObjectURL(audioURL);
            setAudioURL(null);
        }
        if (audioBlob) setAudioBlob(null);
        setIsRecording(false);
        setStatus("Ready to record.");
    };
    
    const saveAndClose = () => {
        if (audioBlob) {
            const ext = audioBlob.type.includes("wav")
                        ? "wav"
                        : audioBlob.type.includes("mpeg") || audioBlob.type.includes("mp3")
                          ? "mp3"
                          : "webm";
            const filename = `user_vocal_upload.${ext}`;
            const recordedFile = new File([audioBlob], filename, {type: audioBlob.type});
            onSaveRecording(recordedFile);
            setStatus("Vocal track recorded and ready for synthesis.");
        } else {
            setStatus("No recording saved.");
        }
        resetRecording();
        onClose();
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="modal fade in" role="dialog" tabIndex="-1" style={{display: "block", marginLeft: '20px'}}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" data-bs-theme="dark" className="close" onClick={onClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className="modal-title">🎙️ Record Your Voice Prompt</h4>
                    </div>
                    <div className="modal-body">
                        <p className="text-center font-bold">Please read the following prompt clearly:</p>
                        <div className="well prompt-box">
                            <p className="text-lg text-center well-inner">"{selectedPrompt}"</p>
                        </div>
                        
                        <div className="text-center mt-3 mb-4">
                            <div className="btn-group btn-group-prompt" role="group" data-toggle="buttons">
                                {prompts.map((prompt, index) => (
                                    <label
                                        key={index}
                                        className={`btn ${selectedPrompt === prompt ? "btn-lg-default active" : "btn-lg-default-inactive"}`}
                                        onClick={() => setSelectedPrompt(prompt)}
                                    >
                                        <input type="radio" name="promptOptions" readOnly/> Prompt {index + 1}
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        {/* Unified Record Button Styled like Play/Pause */}
                        <div className="text-center mt-4">
                            <div className="pulse-wrapper">
                                <div className={`sound-pulse ${isRecording ? "active" : ""}`}>
                                    <div className="pulse-circle-record"></div>
                                
                                </div>
                                
                                <div className="custom-audio-player" style={{justifyContent: "center"}}>
                                    <button
                                        type="button"
                                        className={`play-btn ${isRecording ? "pause" : "play"}`}
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={!navigator.mediaDevices}
                                    >
                                        {isRecording ? "⏹" : "⏺"}
                                    </button>
                                </div>
                            </div>
                            
                            {isRecording && <div className="recording-indicator blink"/>}
                        </div>
                        
                        {/* Review Player */}
                        {audioURL && (
                            <div className="mt-4 text-center">
                                <p>Review your recording (Duration: {durationReview}):</p>
                                <div className="audio-container"
                                     style={{border: "1px solid #3A3E53", borderRadius: "4px"}}>
                                    <div className={`visualizer ${isPlayingReview ? "active" : ""}`}>
                                        {Array.from({length: 16}).map((_, i) => (
                                            <span key={i} style={{"--i": i}}></span>
                                        ))}
                                    </div>
                                    
                                    <div className="custom-audio-player">
                                        <button
                                            type="button"
                                            className={`play-btn ${isPlayingReview ? "pause" : "play"}`}
                                            onClick={togglePlayReview}
                                        >
                                            {isPlayingReview ? "❚❚" : "▶"}
                                        </button>
                                        <div className="progress-container" onClick={seekAudioReview}>
                                            <div className="progress-bar" style={{width: `${progressReview}%`}}></div>
                                        </div>
                                        <audio ref={audioRefReview} src={audioURL}/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-lg" onClick={onClose} disabled={isRecording}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-lg" onClick={saveAndClose}
                                disabled={isRecording || !audioBlob}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade in"></div>
        </div>
    );
};


// Main VocalOptions component
window.VocalOptions =
    ({
         instruments,
         genres,
         languages,
         instrumentOptions,
         setInstrumentOptions,
         handleGenerateMusic,
         isProcessing,
         ttsEngines,
         ttsEngine,
         setTtsEngine,
         setStatus,
         isSubmitting,
         outputFileType,
         setOutputFileType,
         activeTab
     }) => {
        // Use the 3 generated URLs stored in instrumentOptions
        const finalAudioUrl = instrumentOptions.generatedAudioUrlVocalOptions;
        const musicAudioUrl = instrumentOptions.generatedMusicUrlVocalOptions;
        const vocalAudioUrl = instrumentOptions.generatedVocalUrlVocalOptions;
        
        // --- RESTORED GENERATED PLAYER STATE DEFINITIONS ---
        const [isPlayingMain, setIsPlayingMain] = React.useState(false);
        const [progressMain, setProgressMain] = React.useState(0);
        const audioRefMain = React.useRef(null);
        const outputTypes = ["wav", "mp3", "flac", "opus", "ogg"];
        const [isPlayingMusic, setIsPlayingMusic] = React.useState(false);
        const [progressMusic, setProgressMusic] = React.useState(0);
        const audioRefMusic = React.useRef(null);
        
        const [isPlayingVocal, setIsPlayingVocal] = React.useState(false);
        const [progressVocal, setProgressVocal] = React.useState(0);
        const audioRefVocal = React.useRef(null);
        
        const [mainInfo, setMainInfo] = React.useState({size: "", duration: ""});
        const [musicInfo, setMusicInfo] = React.useState({size: "", duration: ""});
        const [vocalInfo, setVocalInfo] = React.useState({size: "", duration: ""});
        // --------------------------------------------------------
        
        // State for the recording modal
        const [isModalOpen, setIsModalOpen] = React.useState(false);
        
        // PLAYER STATE for the user's recorded file
        const [isPlayingRecorded, setIsPlayingRecorded] = React.useState(false);
        const [progressRecorded, setProgressRecorded] = React.useState(0);
        const audioRefRecorded = React.useRef(null);
        const [recordedInfo, setRecordedInfo] = React.useState({size: "", duration: ""});
        
        // Use a state variable to hold the object URL, generated only when the file changes.
        const [recordedAudioUrlState, setRecordedAudioUrlState] = React.useState(null);
        
        
        // Utility Functions
        const formatBytes = (bytes) => {
            if (!bytes) return "0 KB";
            const sizes = ["Bytes", "KB", "MB", "GB"];
            const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
            return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
        };
        
        const formatTime = (seconds) => {
            if (!seconds || isNaN(seconds)) return "0:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s.toString().padStart(2, "0")}`;
        };
        
        // --- NEW: Mode constants and helper ---
        const MODES = [
            {value: 'full_music', label: 'Text to Song'},
            {value: 'tts_only', label: 'Text to Speech'},
        ];
        const isTtsOnlyMode = instrumentOptions.mode === 'tts_only';
        const isFullMusicMode = instrumentOptions.mode === 'full_music'; // Explicit check for clarity
        // --- END NEW ---
        
        const fetchFileSize = async (url, setter) => {
            if (!url) return;
            try {
                const response = await fetch(url, {method: "HEAD"});
                const size = response.headers.get("content-length");
                setter((prev) => ({...prev, size: formatBytes(size)}));
            } catch (error) {
                console.warn("Could not fetch file size:", error);
            }
        };
        
        // Audio playback controls
        const togglePlay = (audioRef, isPlaying, setIsPlaying) => {
            const audio = audioRef.current;
            if (!audio) return;
            isPlaying ? audio.pause() : audio.play();
        };
        
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
        
        // Function to save the file from the modal to App state
        const handleSaveRecording = (file) => {
            // Save the recorded audio file to the state
            setInstrumentOptions(prev => ({
                ...prev,
                voiceUploadFile: file,
                // The lyrics are now mandatory, so we DO NOT clear them here.
            }));
        };
        
        // Update canSubmit logic to require lyrics regardless of file presence
        const canSubmit = (instrumentOptions.lyrics && instrumentOptions.lyrics.trim().length >= 4);
        // Also require a voice file in VocalOptions mode
        const isDisabled = !canSubmit || isSubmitting || !instrumentOptions.voiceUploadFile;
        
        // Removed logic to clear voiceUploadFile when typing lyrics
        const handleLyricsChange = (e) => {
            setInstrumentOptions({
                                     ...instrumentOptions,
                                     lyrics: e.target.value,
                                     // The voiceUploadFile is now only cleared by the "Clear Recorded Voice" button
                                 });
        };
        
        // --- Manage recordedAudioUrlState ---
        const recordedAudioUrl = instrumentOptions.voiceUploadFile ? recordedAudioUrlState : null;
        
        React.useEffect(() => {
            let url;
            const file = instrumentOptions.voiceUploadFile;
            
            if (file) {
                url = URL.createObjectURL(file);
                setRecordedAudioUrlState(url);
                
                // Clean up the previous object URL if it exists
                return () => {
                    if (recordedAudioUrlState) URL.revokeObjectURL(recordedAudioUrlState);
                };
            } else {
                setRecordedAudioUrlState(null);
            }
        }, [instrumentOptions.voiceUploadFile]);
        
        
        // --- PLAYER SETUP EFFECTS ---
        React.useEffect(() => {
            const setupAudioSync = (audioRef, setIsPlaying, setProgress, url, setInfo) => {
                const audio = audioRef.current;
                if (!audio || !url) return;
                const updateProgress = () => {
                    const percent = (audio.currentTime / audio.duration) * 100 || 0;
                    setProgress(percent);
                };
                const handlePlay = () => setIsPlaying(true);
                const handlePause = () => setIsPlaying(false);
                const handleEnded = () => {
                    setIsPlaying(false);
                    setProgress(0);
                };
                audio.onloadedmetadata = () => {
                    setInfo((prev) => ({...prev, duration: formatTime(audio.duration)}));
                };
                audio.addEventListener("timeupdate", updateProgress);
                audio.addEventListener("play", handlePlay);
                audio.addEventListener("pause", handlePause);
                audio.addEventListener("ended", handleEnded);
                // Return a cleanup function for this specific listener group
                return () => {
                    audio.removeEventListener("timeupdate", updateProgress);
                    audio.removeEventListener("play", handlePlay);
                    audio.removeEventListener("pause", handlePause);
                    audio.removeEventListener("ended", handleEnded);
                };
            };
            
            // --- BINDINGS FOR GENERATED TRACKS ---
            let cleanupMain, cleanupMusic, cleanupVocal;
            
            // We only bind and fetch size for the tracks that should be displayed based on the mode
            if (finalAudioUrl) {
                fetchFileSize(finalAudioUrl, setMainInfo);
                cleanupMain = setupAudioSync(audioRefMain, setIsPlayingMain, setProgressMain, finalAudioUrl, setMainInfo);
            }
            if (musicAudioUrl) {
                fetchFileSize(musicAudioUrl, setMusicInfo);
                cleanupMusic = setupAudioSync(audioRefMusic, setIsPlayingMusic, setProgressMusic, musicAudioUrl, setMusicInfo);
            }
            if (vocalAudioUrl) {
                fetchFileSize(vocalAudioUrl, setVocalInfo);
                cleanupVocal = setupAudioSync(audioRefVocal, setIsPlayingVocal, setProgressVocal, vocalAudioUrl, setVocalInfo);
            }
            
            // --- BINDING FOR RECORDED TRACK ---
            let cleanupRecorded;
            if (recordedAudioUrl) {
                cleanupRecorded = setupAudioSync(audioRefRecorded, setIsPlayingRecorded, setProgressRecorded, recordedAudioUrl, setRecordedInfo);
            }
            
            // Combined cleanup return
            return () => {
                if (cleanupMain) cleanupMain();
                if (cleanupMusic) cleanupMusic();
                if (cleanupVocal) cleanupVocal();
                if (cleanupRecorded) cleanupRecorded();
            };
        }, [finalAudioUrl, musicAudioUrl, vocalAudioUrl, recordedAudioUrl, activeTab]);
        console.log(activeTab)
        
        // Display all players if generated URLs exist
        if (finalAudioUrl || musicAudioUrl || vocalAudioUrl && activeTab === 'vocalOptions') {
            // --- OUTPUT DISPLAY LOGIC FOR GENERATED TRACKS ---
            
            // If we're in TTS only mode AND we only have the final mix, we show only the main player (1 player)
            const showOnlyMainPlayer = isTtsOnlyMode && finalAudioUrl && activeTab === 'vocalOptions';
            
            // If not processing, show the results
            return (
                <React.Fragment>
                    <div className="form-horizontal output-options-form-bg">
                        <h2 className="header-text-custom">AI Vocal Generation Output</h2>
                        <p className="subheader-text-custom">
                            The processing task has finished. You can listen to and download your new audio below.
                        </p>
                        {/* Main Player (Always visible if finalAudioUrl exists) */}
                        <div className="audio-players-container container-fluid">
                            <div className="row">
                                <div className={`col-sm-${showOnlyMainPlayer ? '12' : '6'}`}>
                                    <div className="audio-container">
                                        <p className="text-lg font-semibold mb-3"
                                           style={{color: "#A6B0E5"}}>{isTtsOnlyMode ? "Generated Speech" : "Final Mix"}</p>
                                        <div className={`visualizer ${isPlayingMain ? "active" : ""}`}>
                                            {Array.from({length: 16}).map((_, i) => (
                                                <span key={i} style={{"--i": i}}></span>))}
                                        </div>
                                        <div className="custom-audio-player">
                                            <button type="button"
                                                    className={`play-btn ${isPlayingMain ? "pause" : "play"}`}
                                                    onClick={() => togglePlay(audioRefMain, isPlayingMain, setIsPlayingMain)}>
                                                {isPlayingMain ? "❚❚" : "▶"}
                                            </button>
                                            <div className="progress-container"
                                                 onClick={(e) => seekAudio(e, audioRefMain)}>
                                                <div className="progress-bar" style={{width: `${progressMain}%`}}></div>
                                            </div>
                                            {finalAudioUrl && (
                                                <a href={finalAudioUrl}
                                                   download={`sonosphere_${isTtsOnlyMode ? 'speech' : 'final_mix'}.wav`}
                                                   className="circular-download-btn" title="Download final mix">
                                                    <DownloadIcon size={18}/>
                                                </a>
                                            )}
                                            <audio ref={audioRefMain}>
                                                {finalAudioUrl && <source src={finalAudioUrl} type="audio/wav"/>}
                                            </audio>
                                        </div>
                                        <div style={{color: "#ccc", fontSize: "1.2rem", marginTop: "0.5rem"}}>
                                            {mainInfo.size && mainInfo.duration ? `Size: ${mainInfo.size} • Duration: ${mainInfo.duration}` : "Loading..."}
                                        </div>
                                        {finalAudioUrl && (
                                            <div className="container-fluid row" style={{marginTop: '2rem'}}>
                                                <div className="col-sm-12">
                                                    <a href={finalAudioUrl}
                                                       download={`sonosphere_${isTtsOnlyMode ? 'speech' : 'final_mix'}.wav`}
                                                       className="btn btn-lg-status"
                                                       title="Download file"> Download&nbsp;&nbsp; <DownloadIcon
                                                        size={18}/> &nbsp;&nbsp;File </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* TWO SIDE PLAYERS (Music & Vocals) - Hidden in tts_only mode */}
                                {!showOnlyMainPlayer && (
                                    <div className="col-sm-6">
                                        <div className="audio-container">
                                            <p className="text-lg font-semibold mb-3"
                                               style={{color: "#A6B0E5"}}>Generated
                                                Music</p>
                                            <div className={`visualizer ${isPlayingMusic ? "active" : ""}`}>
                                                {Array.from({length: 16}).map((_, i) => (
                                                    <span key={i} style={{"--i": i}}></span>))}
                                            </div>
                                            <div className="custom-audio-player">
                                                <button type="button"
                                                        className={`play-btn ${isPlayingMusic ? "pause" : "play"}`}
                                                        onClick={() => togglePlay(audioRefMusic, isPlayingMusic, setIsPlayingMusic)}>
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
                                        </div>
                                        
                                        <div className="audio-container" style={{marginTop: '2rem'}}>
                                            <p className="text-lg font-semibold mb-3"
                                               style={{color: "#A6B0E5"}}>Generated
                                                Vocals</p>
                                            <div className={`visualizer ${isPlayingVocal ? "active" : ""}`}>
                                                {Array.from({length: 16}).map((_, i) => (
                                                    <span key={i} style={{"--i": i}}></span>))}
                                            </div>
                                            <div className="custom-audio-player">
                                                <button type="button"
                                                        className={`play-btn ${isPlayingVocal ? "pause" : "play"}`}
                                                        onClick={() => togglePlay(audioRefVocal, isPlayingVocal, setIsPlayingVocal)}>
                                                    {isPlayingVocal ? "❚❚" : "▶"}
                                                </button>
                                                <div className="progress-container"
                                                     onClick={(e) => seekAudio(e, audioRefVocal)}>
                                                    <div className="progress-bar"
                                                         style={{width: `${progressVocal}%`}}></div>
                                                </div>
                                                {vocalAudioUrl && (
                                                    <a href={vocalAudioUrl} download="sonosphere_vocal.wav"
                                                       className="circular-download-btn" title="Download vocals">
                                                        <DownloadIcon size={18}/>
                                                    </a>
                                                )}
                                                <audio ref={audioRefVocal}>
                                                    {vocalAudioUrl && <source src={vocalAudioUrl} type="audio/wav"/>}
                                                </audio>
                                            </div>
                                            <div style={{color: "#ccc", fontSize: "1.2rem", marginTop: "0.5rem"}}>
                                                {vocalInfo.size && vocalInfo.duration ? `Size: ${vocalInfo.size} • Duration: ${vocalInfo.duration}` : "Loading..."}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            );
        }
        
        return (
            <React.Fragment>
                {/* Using custom header classes for styling consistency */}
                <form className={`form-horizontal instrument-options-form-bg ${isProcessing ? 'hidden' : ''}`}
                      onSubmit={handleGenerateMusic}>
                    {!isProcessing ? (
                        <>
                            {/* Mode Selection (full_music vs tts_only) */}
                            <h1 className="text-center header-text-custom">Lyrics to Melody: Vocal Cloning</h1>
                            <h4 className="text-center subheader-text-custom"> Provide your own voice sample and lyrics
                                for
                                synthesis. </h4>
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Mode</label>
                                <div className="col-sm-8">
                                    <div className="btn-group btn-group-justified" data-toggle="buttons">
                                        {MODES.map((mode) => (
                                            <label
                                                key={mode.value}
                                                className={`btn ${instrumentOptions.mode === mode.value ? 'btn-primary-tts active' : 'btn-primary-tts'}`}
                                                onClick={() => setInstrumentOptions({
                                                                                        ...instrumentOptions,
                                                                                        mode: mode.value
                                                                                    })}
                                            >
                                                <input type="radio" name="modeOptions" value={mode.value}
                                                       checked={instrumentOptions.mode === mode.value} readOnly/>
                                                {mode.label}
                                            </label>
                                        ))}
                                    </div>
                                    <p className="help-block">
                                        Choose to generate a full song (with instrumentals) or only speech.
                                    </p>
                                </div>
                            </div>
                            
                            {/* TTS Engine Selection (Bark/Coqui) */}
                            <div className="form-group">
                                <label className="col-sm-4 control-label">TTS Engine</label>
                                <div className="col-sm-8">
                                    <div className="btn-group btn-group-justified" data-toggle="buttons">
                                        {ttsEngines.map((engine) => (
                                            <label key={engine}
                                                   className={`btn ${ttsEngine === engine ? 'btn-primary-tts active' : 'btn-primary-tts'}`}
                                                   onClick={() => setTtsEngine(engine)}
                                            >
                                                <input type="radio" name="ttsEngine" value={engine}
                                                       checked={ttsEngine === engine} readOnly/>
                                                {engine}
                                            </label>
                                        ))}
                                    </div>
                                    <p className="help-block"> Choose the AI model for vocal
                                        synthesis. {ttsEngine === 'Bark AI' ? ' Bark AI: Hyper-Realistic Singing & Emotion' : ' Coqui XTTS: Expressive, Clear Multi-Lingual Speech'} </p>
                                </div>
                            </div>
                            
                            {/* CONDITIONAL FIELDS: Instrument and Genre are hidden in tts_only mode */}
                            {isFullMusicMode && (
                                <>
                                    {/* Instrument Field */}
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Instrument</label>
                                        <div className="col-sm-8">
                                            <select className="form-control" value={instrumentOptions.instrument}
                                                    onChange={(e) => setInstrumentOptions({
                                                                                              ...instrumentOptions,
                                                                                              instrument: e.target.value
                                                                                          })
                                                    }
                                            >
                                                {/* ERROR FIX APPLIED: Use item.name or item for display/value/key */}
                                                {instruments.map((i) => (
                                                    <option key={i.code || i.name || i} value={i.name || i}>
                                                        {i.name || i}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Genre Field */}
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Genre</label>
                                        <div className="col-sm-8">
                                            <select className="form-control" value={instrumentOptions.genre}
                                                    onChange={(e) => setInstrumentOptions({
                                                                                              ...instrumentOptions,
                                                                                              genre: e.target.value
                                                                                          })
                                                    }
                                            >
                                                {/* ERROR FIX APPLIED: Use item.name or item for display/value/key */}
                                                {genres.map((g) => (
                                                    <option key={g.code || g.name || g} value={g.name || g}>
                                                        {g.name || g}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {/* Language Field - Always visible */}
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Language</label>
                                <div className="col-sm-8">
                                    <select className="form-control" value={instrumentOptions.language}
                                            onChange={(e) => setInstrumentOptions({
                                                                                      ...instrumentOptions,
                                                                                      language: e.target.value
                                                                                  })
                                            }
                                    >
                                        {/* ERROR FIX APPLIED: Use item.name or item for display/value/key */}
                                        {languages.map((l) => (
                                            <option key={l.code || l.name || l} value={l.name || l}>
                                                {l.name || l}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* NOTE: Vocal Style, Male Voice, and Female Voice fields removed as they are not needed for vocal cloning. */}
                            
                            {/* Recorded Voice Player/Uploader */}
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Vocal Track</label>
                                <div className="col-sm-8 text-center">
                                    {recordedAudioUrl ? (
                                        // Display playback controls if a file is recorded/uploaded
                                        <div className="audio-container"
                                             style={{border: "1px solid #3A3E53", borderRadius: "4px"}}>
                                            <p className="text-lg font-semibold mb-3 text-center">Your Recorded
                                                Vocal</p>
                                            <div className={`visualizer ${isPlayingRecorded ? "active" : ""}`}>
                                                {Array.from({length: 16}).map((_, i) => (
                                                    <span key={i} style={{"--i": i}}></span>
                                                ))}
                                            </div>
                                            
                                            <div className="custom-audio-player">
                                                <button type="button"
                                                        className={`play-btn ${isPlayingRecorded ? "pause" : "play"}`}
                                                        onClick={() => togglePlay(audioRefRecorded, isPlayingRecorded, setIsPlayingRecorded)}
                                                >
                                                    {isPlayingRecorded ? "❚❚" : "▶"}
                                                </button>
                                                <div className="progress-container"
                                                     onClick={(e) => seekAudio(e, audioRefRecorded)}>
                                                    <div className="progress-bar"
                                                         style={{width: `${progressRecorded}%`}}></div>
                                                </div>
                                                <audio ref={audioRefRecorded} src={recordedAudioUrl}/>
                                            </div>
                                            
                                            <div style={{color: "#ccc", fontSize: "1.2rem", marginTop: "0.5rem"}}>
                                                {recordedInfo.size && recordedInfo.duration ? `Size: ${recordedInfo.size} • Duration: ${recordedInfo.duration}` : "Loading..."}
                                            </div>
                                            
                                            <div style={{marginTop: '10px'}}>
                                                <button type="button" className="btn btn-sm btn-info"
                                                        onClick={() => setIsModalOpen(true)}
                                                        style={{marginRight: '10px'}}
                                                > Re-record
                                                </button>
                                                {/* Clears the file */}
                                                <button type="button" className="btn btn-sm btn-warning"
                                                        onClick={() => setInstrumentOptions(prev => ({
                                                            ...prev,
                                                            voiceUploadFile: null
                                                        }))}
                                                > Clear Recorded Voice
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                         // Display record button if no file is present
                                         <div className="text-center">
                                             <button
                                                 type="button"
                                                 className={`btn btn-lg btn-block`}
                                                 onClick={() => setIsModalOpen(true)}
                                                 style={{marginBottom: '10px'}}
                                             >
                                                 🎙️ Record Your Voice
                                             </button>
                                             <p className="help-block">Record or upload a voice sample (mandatory for
                                                 synthesis).</p>
                                         </div>
                                     )}
                                </div>
                            </div>
                            
                            {/* Lyrics Field */}
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Lyrics</label>
                                <div className="col-sm-8">
                <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter your lyrics here (4 character minimum)..."
                    value={instrumentOptions.lyrics}
                    onChange={handleLyricsChange}
                />
                                </div>
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
                            <div className="form-group text-center">
                                <div className="col-sm-12">
                                    <button type="submit" className="btn btn-lg" disabled={isDisabled}>
                                        Generate
                                    </button>
                                </div>
                            </div>
                        
                        </>
                    ) : (
                         // When processing, show soundwave loader here
                         <div className="loader-container container-fluid text-center">
                             <div className="soundwave-loader">
                                 {Array.from({length: 10}).map((_, i) => (
                                     <div key={i} className={`bar bar-${i + 1}`}></div>
                                 ))}
                             </div>
                             <p className="status-text text-success mt-4">Generating {instrumentOptions.mode === "tts_only" ? "Speech" : "Music"}</p>
                         </div>
                     )}  </form>
                <VoiceRecorderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSaveRecording={handleSaveRecording}
                    setStatus={setStatus}
                />
            </React.Fragment>
        );
    };