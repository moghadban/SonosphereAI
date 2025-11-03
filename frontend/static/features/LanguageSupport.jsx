// frontend/LanguageSupport.js
import React, { useState } from 'react';

const LanguageSupport = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTool, setSelectedTool] = useState('Detect Language');
  const [result, setResult] = useState('Enter text and select a tool to begin.');

  const tools = ['Detect Language', 'Generate Phonetics', 'Suggest Lyrics'];

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setResult('Please enter some text or context.');
      return;
    }

    setResult(`Running ${selectedTool}...`);

    // Determine the API endpoint based on the selected tool
    let endpoint = '';
    if (selectedTool === 'Detect Language') {
      endpoint = '/api/language/detect';
    } else if (selectedTool === 'Generate Phonetics') {
      endpoint = '/api/language/phonetics';
    } else if (selectedTool === 'Suggest Lyrics') {
      // For lyric suggestions, treat inputText as a theme/topic
      endpoint = '/api/language/suggest-lyrics';
    }

    try {
      // API call to the backend service (e.g., a route handled by backend/language_support.py)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (response.ok) {
        const data = await response.json();
        // Display the relevant result from the backend response
        setResult(data.output || JSON.stringify(data, null, 2));
      } else {
        setResult(`Error: ${response.statusText}`);
      }
    } catch (error) {
      setResult(`Network error: ${error.message}`);
    }
  };

  return (
    <div className="feature-panel language-support">
      <h2>Language and Lyric Support</h2>
      <p>Use AI to detect language, generate phonetic guides, or suggest lyrics.</p>

      <div className="input-area">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter lyrics, text, or a topic for generation..."
          rows="4"
          className="text-input"
        />

        <div className="tool-selection">
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="select-tool"
          >
            {tools.map(tool => (
              <option key={tool} value={tool}>{tool}</option>
            ))}
          </select>

          <button
            onClick={handleProcess}
            disabled={result.startsWith('Running')}
            className="process-button"
          >
            {result.startsWith('Running') ? 'Processing...' : `Run ${selectedTool}`}
          </button>
        </div>
      </div>

      <div className="result-output">
        <h3>Result</h3>
        <pre>{result}</pre>
      </div>
    </div>
  );
};

// CRITICAL: Export the component for use in App.jsx
export default LanguageSupport;