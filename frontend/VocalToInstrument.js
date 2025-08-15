import React, { useState } from 'react';
import axios from 'axios';

function VocalToInstrument() {
const [audioData, setAudioData] = useState(null);
const [instrument, setInstrument] = useState('piano');
const [genre, setGenre] = useState('pop');
const [language, setLanguage] = useState('english');
const [output, setOutput] = useState(null);

const handleUpload = (event) => {
setAudioData(event.target.files[0]);
};

const handleSelectInstrument = (event) => {
setInstrument(event.target.value);
};

const handleSelectGenre = (event) => {
setGenre(event.target.value);
};

const handleSelectLanguage = (event) => {
setLanguage(event.target.value);
};

const handleGenerateMusic = async () => {
const response = await axios.post('/api/generate-music', {
audioData,
instrument,
genre,
language,
});
setOutput(response.data.output);
};

return (
<div>
<h1>Vocal to Instrument</h1>
<input type="file" onChange={handleUpload} />
<select value={instrument} onChange={handleSelectInstrument}>
{instruments.map((instrument) => (
<option value={instrument}>{instrument}</option>
))}
</select>
<select value={genre} onChange={handleSelectGenre}>
{genres.map((genre) => (
<option value={genre}>{genre}</option>
))}
</select>
<select value={language} onChange={handleSelectLanguage}>
{languages.map((language) => (
<option value={language}>{language}</option>
))}
</select>
<button onClick={handleGenerateMusic}>Generate Music</button>
{output && (
<div>
<h2>Output</h2>
<audio controls>
<source src={`data:audio/wav;base64,${output}`} type="audio/wav" />
</audio>
</div>
)}
</div>
);
}

export default VocalToInstrument;