import React, { useState } from 'react';
import axios from 'axios';

function InstrumentOptions() {
const [instrument, setInstrument] = useState('Piano');
const [genre, setGenre] = useState('Pop');
const [language, setLanguage] = useState('English');
const [vocalStyle, setVocalStyle] = useState('Male');
const [artistStyle, setArtistStyle] = useState('Ariana Grande');
const [vocals, setVocals] = useState(null);

const handleSelectInstrument = (event) => {
setInstrument(event.target.value);
};

const handleSelectGenre = (event) => {
setGenre(event.target.value);
};

const handleSelectLanguage = (event) => {
setLanguage(event.target.value);
};

const handleSelectVocalStyle = (event) => {
setVocalStyle(event.target.value);
};

const handleSelectArtistStyle = (event) => {
setArtistStyle(event.target.value);
};

const handleGenerateVocals = async () => {
const voiceUpload = document.getElementById('voice-upload').files[0];
const textInput = document.getElementById('text-input').value;
const response = await axios.post('/api/generate-vocals', {
instrument,
genre,
language,
vocalStyle,
artistStyle,
voiceUpload,
textInput,
});
setVocals(response.data.vocals);
};

return (
<div>
<h1>Instrument Options</h1>
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
<select value={vocalStyle} onChange={handleSelectVocalStyle}>
{vocal_styles.map((vocalStyle) => (
<option value={vocalStyle}>{vocalStyle}</option>
))}
</select>
<select value={artistStyle} onChange={handleSelectArtistStyle}>
{artist_styles.map((artistStyle) => (
<option value={artistStyle}>{artistStyle}</option>
))}
</select>
<input type="file" id="voice-upload" />
<textarea id="text-input" placeholder="Enter text for vocals" />
<button onClick={handleGenerateVocals}>Generate Vocals</button>
{vocals && (
<div>
<h2>Vocals:</h2>
<audio controls>
<source src={`data:audio/wav;base64,${vocals}`} type="audio/wav" />
</audio>
</div>
)}
</div>
);
}

export default InstrumentOptions;