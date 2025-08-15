import React, { useState } from 'react';
import axios from 'axios';

function NoiseReduction({ audioData, setAudioData }) {
const [noiseLevel, setNoiseLevel] = useState(0);
const [output, setOutput] = useState(null);

const handleNoiseReduction = async () => {
const response = await axios.post('/api/noise-reduction', {
audioData,
noiseLevel,
});
setOutput(response.data.output);
setAudioData(response.data.output);
};

return (
<div>
<h2>Noise Reduction</h2>
<input
type="range"
value={noiseLevel}
onChange={(e) => setNoiseLevel(e.target.value)}
/>
<button onClick={handleNoiseReduction}>Reduce Noise</button>
{output && (
<div>
<h3>Output:</h3>
<audio controls>
<source
src={`data:audio/wav;base64,${output}`}
type="audio/wav"
/>
</audio>
</div>
)}
</div>
);
}

export default NoiseReduction;
