import React, { useState } from 'react';
import axios from 'axios';

function LanguageSupport({ audioData, setAudioData }) {
const [language, setLanguage] = useState('');
const [phonetics, setPhonetics] = useState('');
const [syntax, setSyntax] = useState('');
const [lyrics, setLyrics] = useState('');

const handleLanguageSupport = async () => {
const response = await axios.post('/api/language-support', {
audioData,
});
setLanguage(response.data.language);
setPhonetics(response.data.phonetics);
setSyntax(response.data.syntax);
setLyrics(response.data.lyrics);
};

return (
<div>
<h2>Language Support</h2>
<button onClick={handleLanguageSupport}>Detect Language</button>
{language && (
<div>
<h3>Detected Language: {language}</h3>
<h3>Phonetics: {phonetics}</h3>
<h3>Syntax: {syntax}</h3>
<h3>Generated Lyrics:</h3>
<pre>{lyrics}</pre>
</div>
)}
</div>
);
}

export default LanguageSupport;