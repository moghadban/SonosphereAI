/* ===== NoiseReduction.jsx (UPDATED FILE) ===== */
window.NoiseReduction =
    ({
         handleFileUpload,
         isProcessing,
         setIsProcessing,
         handleReset,
         outputFileType,
         setOutputFileType
     }) => {
        const [originalAudioUrl, setOriginalAudioUrl] = React.useState(null);
        const [processedAudioUrl, setProcessedAudioUrl] = React.useState(null);
        
        const [isPlayingOriginal, setIsPlayingOriginal] = React.useState(false);
        const [isPlayingProcessed, setIsPlayingProcessed] = React.useState(false);
        
        const [progressOriginal, setProgressOriginal] = React.useState(0);
        const [progressProcessed, setProgressProcessed] = React.useState(0);
        
        const [audioInfoOriginal, setAudioInfoOriginal] = React.useState({size: "", duration: ""});
        const [audioInfoProcessed, setAudioInfoProcessed] = React.useState({size: "", duration: ""});
        
        const audioRefOriginal = React.useRef(null);
        const audioRefProcessed = React.useRef(null);
        
        const outputTypes = ["wav", "mp3", "flac", "opus", "ogg"];
        
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
        
        const DownloadIcon = ({size = 20}) => (
            <span className="glyphicon" style={{fontSize: size}}>&#xe025;</span>
        );
        
        const togglePlay = (ref, isPlaying) => {
            const audio = ref.current;
            if (!audio) return;
            isPlaying ? audio.pause() : audio.play();
        };
        
        const seekAudio = (e, ref) => {
            const audio = ref.current;
            if (!audio) return;
            const width = e.currentTarget.clientWidth;
            const clickX = e.nativeEvent.offsetX;
            audio.currentTime = (clickX / width) * audio.duration;
        };
        
        const setupAudioEffects = (url, ref, setIsPlaying, setProgress, setAudioInfo) => {
            const audio = ref.current;
            if (!audio) return;
            
            const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            const handleEnded = () => {
                setIsPlaying(false);
                setProgress(0);
            };
            
            audio.onloadedmetadata = () => {
                setAudioInfo(prev => ({...prev, duration: formatTime(audio.duration)}));
            };
            
            if (url) fetchFileSize(url, setAudioInfo);
            
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
        };
        
        React.useEffect(() => {
            if (originalAudioUrl) return setupAudioEffects(originalAudioUrl, audioRefOriginal, setIsPlayingOriginal, setProgressOriginal, setAudioInfoOriginal);
        }, [originalAudioUrl]);
        
        React.useEffect(() => {
            if (processedAudioUrl) return setupAudioEffects(processedAudioUrl, audioRefProcessed, setIsPlayingProcessed, setProgressProcessed, setAudioInfoProcessed);
        }, [processedAudioUrl]);
        
        const handleClearAll = () => {
            setOriginalAudioUrl(null);
            setProcessedAudioUrl(null);
            setIsPlayingOriginal(false);
            setIsPlayingProcessed(false);
            setProgressOriginal(0);
            setProgressProcessed(0);
            setAudioInfoOriginal({size: "", duration: ""});
            setAudioInfoProcessed({size: "", duration: ""});
            setIsProcessing(false);
            if (handleReset) handleReset(); // <-- reset App-level status too
        };
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsProcessing(true);
            const result = await handleFileUpload("noise_reduction")(e);
            if (result) {
                if (result.original_audio_url) setOriginalAudioUrl(result.original_audio_url);
                if (result.noise_reduced_url) setProcessedAudioUrl(result.noise_reduced_url);
            }
            setIsProcessing(false);
        };
        
        const renderAudioPlayer = (url, ref, isPlaying, progress, audioInfo, title, downloadFilename) => (
            <div className="audio-container mt-4"
                 style={{
                     padding: '10px',
                     border: '1px solid #3A3E53',
                     borderRadius: '4px',
                     flex: 1,
                     marginRight: '10px'
                 }}>
                <p className="text-lg font-semibold mb-2" style={{color: "#A6B0E5"}}>{title}</p>
                <div className={`visualizer ${isPlaying ? "active" : ""}`}
                     style={{width: '90%', margin: '0 auto 10px'}}>
                    {Array.from({length: 16}).map((_, i) => (<span key={i} style={{"--i": i}}></span>))}
                </div>
                <div className="custom-audio-player" style={{width: '90%', margin: '0 auto'}}>
                    <button type="button" className={`play-btn ${isPlaying ? "pause" : "play"}`}
                            onClick={() => togglePlay(ref, isPlaying)}>
                        {isPlaying ? "❚❚" : "▶"}
                    </button>
                    <div className="progress-container" onClick={(e) => seekAudio(e, ref)}>
                        <div className="progress-bar" style={{width: `${progress}%`}}></div>
                    </div>
                    {url && (
                        <a href={url} download={downloadFilename} className="circular-download-btn"
                           title="Download audio">
                            <DownloadIcon size={18}/>
                        </a>
                    )}
                    <audio ref={ref} src={url}/>
                </div>
                <div style={{color: "#ccc", fontSize: "1.2rem", marginTop: "0.5rem"}}>
                    {audioInfo.size && audioInfo.duration ? `Size: ${audioInfo.size} • Duration: ${audioInfo.duration}` : "Loading..."}
                </div>
                {url && (
                    <div className="row mt-2">
                        <div className="col-sm-12">
                            <a href={url} download={downloadFilename} className="btn btn-lg" title="Download audio">
                                Download&nbsp;&nbsp;<DownloadIcon size={18}/>&nbsp;&nbsp;File
                            </a>
                        </div>
                    </div>
                )}
            </div>
        );
        
        return (
            <React.Fragment>
                <form
                    onSubmit={handleSubmit}
                    className={`form-horizontal noise-reduction-form-bg ${isProcessing ? "hidden" : ""}`}
                >
                    {!isProcessing && (
                        <>
                            <h1 className="text-center header-text-custom">Noise Reduction (Spectral Masking)</h1>
                            <h4 className="text-center subheader-text-custom">Remove noise, clicks, and unwanted sonic
                                artifacts.</h4>
                            <div className="form-group">
                                <label className="col-sm-4 control-label">Upload Audio File (WAV/MP3)</label>
                                <div className="col-sm-8">
                                    <input type="file" name="audio_file" accept=".wav,.mp3" required
                                           className="form-control file-input"/>
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
                            <div className="form-group">
                                <div className="col-sm-12">
                                    <button type="submit" className="btn btn-lg">Reduce Noise</button>
                                    {(originalAudioUrl || processedAudioUrl) && (
                                        <button type="button" className="btn btn-lg ml-2" onClick={handleClearAll}>Clear
                                            All</button>
                                    )}
                                </div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
                                {originalAudioUrl && renderAudioPlayer(originalAudioUrl, audioRefOriginal, isPlayingOriginal, progressOriginal, audioInfoOriginal, "Original Audio", "original_audio.wav")}
                                {processedAudioUrl && renderAudioPlayer(processedAudioUrl, audioRefProcessed, isPlayingProcessed, progressProcessed, audioInfoProcessed, "Noise Reduced Audio", "noise_reduced_audio.wav")}
                            </div>
                        </>
                    )}
                </form>
            </React.Fragment>
        );
    };
