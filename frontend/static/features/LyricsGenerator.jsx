// ===== LyricsGenerator.jsx () =====
// frontend/static/features/LyricsGenerator.jsx
window.LyricsGenerator = (props) => {
  const {
    genres,
    lyricsLanguages,
    lyricsGeneratorOptions,
    setLyricsGeneratorOptions,
    setIsProcessing,
    setStatus
  } = props;

  const supportedLanguages = lyricsLanguages;

  // ADD nativeName to each language
  const translations = {
    English: {
      nativeName: "English",
      header: '📝 Lyrics Generator',
      genres: { Pop: 'Pop', Rock: 'Rock', 'Hip-Hop': 'Hip-Hop', Electronic: 'Electronic', Country: 'Country', 'R&B': 'R&B', Metal: 'Metal', Reggae: 'Reggae' },
      lengths: { short: 'Short (4-8 lines)', medium: 'Medium (8-16 lines)', long: 'Long (16+ lines)' },
      selectLanguage: 'Select Language', selectGenre: 'Select Genre', selectLength: 'Select Length', generate: 'Generating Lyrics'
    },
    Arabic: {
      nativeName: "العربية",
      header: '📝 منشئ الكلمات',
      genres: { Pop: 'بوب', Rock: 'روك', 'Hip-Hop': 'هيب هوب', Electronic: 'إلكتروني', Country: 'كوونتري', 'R&B': 'آر أند بي', Metal: 'ميتال', Reggae: 'ريغي' },
      lengths: { short: 'قصير (4-8 أسطر)', medium: 'متوسط (8-16 سطر)', long: 'طويل (16+ سطر)' },
      selectLanguage: 'اختر اللغة', selectGenre: 'اختر النوع', selectLength: 'اختر الطول', generate: 'إنشاء الكلمات'
    },
    Chinese: {
      nativeName: "中文",
      header: '📝 歌词生成器',
      genres: { Pop: '流行', Rock: '摇滚', 'Hip-Hop': '嘻哈', Electronic: '电子', Country: '乡村', 'R&B': '节奏蓝调', Metal: '金属', Reggae: '雷鬼' },
      lengths: { short: '短 (4-8 行)', medium: '中 (8-16 行)', long: '长 (16+ 行)' },
      selectLanguage: '选择语言', selectGenre: '选择风格', selectLength: '选择长度', generate: '生成歌词'
    },
    French: {
      nativeName: "Français",
      header: '📝 Générateur de paroles',
      genres: { Pop: 'Pop', Rock: 'Rock', 'Hip-Hop': 'Hip-Hop', Electronic: 'Électronique', Country: 'Country', 'R&B': 'R&B', Metal: 'Metal', Reggae: 'Reggae' },
      lengths: { short: 'Court (4-8 lignes)', medium: 'Moyen (8-16 lignes)', long: 'Long (16+ lignes)' },
      selectLanguage: 'Choisir la langue', selectGenre: 'Choisir le genre', selectLength: 'Choisir la longueur', generate: 'Générer les paroles'
    },
    German: {
      nativeName: "Deutsch",
      header: '📝 Liedtextgenerator',
      genres: { Pop: 'Pop', Rock: 'Rock', 'Hip-Hop': 'Hip-Hop', Electronic: 'Elektronisch', Country: 'Country', 'R&B': 'R&B', Metal: 'Metal', Reggae: 'Reggae' },
      lengths: { short: 'Kurz (4-8 Zeilen)', medium: 'Mittel (8-16 Zeilen)', long: 'Lang (16+ Zeilen)' },
      selectLanguage: 'Sprache wählen', selectGenre: 'Genre wählen', selectLength: 'Länge wählen', generate: 'Songtexte erzeugen'
    },
    Italian: {
      nativeName: "Italiano",
      header: '📝 Generatore di testi',
      genres: { Pop: 'Pop', Rock: 'Rock', 'Hip-Hop': 'Hip-Hop', Electronic: 'Elettronica', Country: 'Country', 'R&B': 'R&B', Metal: 'Metal', Reggae: 'Reggae' },
      lengths: { short: 'Corto (4-8 versi)', medium: 'Medio (8-16 versi)', long: 'Lungo (16+ versi)' },
      selectLanguage: 'Seleziona lingua', selectGenre: 'Seleziona genere', selectLength: 'Seleziona lunghezza', generate: 'Genera testi'
    },
    Russian: {
      nativeName: "Русский",
      header: '📝 Генератор текста песен',
      genres: { Pop: 'Поп', Rock: 'Рок', 'Hip-Hop': 'Хип-хоп', Electronic: 'Электронная', Country: 'Кантри', 'R&B': 'R&B', Metal: 'Метал', Reggae: 'Регги' },
      lengths: { short: 'Короткий (4-8 строк)', medium: 'Средний (8-16 строк)', long: 'Длинный (16+ строк)' },
      selectLanguage: 'Выберите язык', selectGenre: 'Выберите жанр', selectLength: 'Выберите длину', generate: 'Сгенерировать текст'
    },
    Spanish: {
      nativeName: "Español",
      header: '📝 Generador de letras',
      genres: { Pop: 'Pop', Rock: 'Rock', 'Hip-Hop': 'Hip-Hop', Electronic: 'Electrónica', Country: 'Country', 'R&B': 'R&B', Metal: 'Metal', Reggae: 'Reggae' },
      lengths: { short: 'Corto (4-8 líneas)', medium: 'Medio (8-16 líneas)', long: 'Largo (16+ líneas)' },
      selectLanguage: 'Seleccionar idioma', selectGenre: 'Seleccionar género', selectLength: 'Seleccionar longitud', generate: 'Generar letras'
    }
  };

  const t = (lang, key, subkey = null) => {
    if (!lang || !translations[lang]) lang = 'English';
    if (subkey)
      return translations[lang][key] && translations[lang][key][subkey]
        ? translations[lang][key][subkey]
        : subkey;
    return translations[lang][key] || translations['English'][key];
  };

  // --- reverse mapping (unchanged) ---
  const genreReverseMap = {};
  Object.keys(translations).forEach(lang => {
    if (lang !== 'English') {
        const englishGenres = translations['English'].genres;
        const currentLangGenres = translations[lang].genres;
        Object.keys(englishGenres).forEach(englishKey => {
            const translatedValue = currentLangGenres[englishKey];
            genreReverseMap[`${lang}_${translatedValue}`] = englishKey;
        });
    }
  });

  const [selectedLanguage, setSelectedLanguage] = React.useState(lyricsGeneratorOptions.lyricsLanguage || '');
  const [selectedGenre, setSelectedGenre] = React.useState(lyricsGeneratorOptions.theme || '');
  const [selectedLength, setSelectedLength] = React.useState(lyricsGeneratorOptions.lyricLength || '');
  const [visibleStep, setVisibleStep] = React.useState(selectedLanguage ? 1 : 0);
  const [generatedPreview, setGeneratedPreview] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formVisible, setFormVisible] = React.useState(true);
  const [biasText, setBiasText] = React.useState(lyricsGeneratorOptions.bias || '');
  const [biasCharCount, setBiasCharCount] = React.useState(biasText.length);

  const lengthMap = {};
  Object.keys(translations).forEach(lang => {
    lengthMap[translations[lang].lengths.short] = 'short';
    lengthMap[translations[lang].lengths.medium] = 'medium';
    lengthMap[translations[lang].lengths.long] = 'long';
  });

  React.useEffect(() => {
    setSelectedLanguage('');
    setSelectedGenre('');
    setSelectedLength('');
    setVisibleStep(0);
    setGeneratedPreview(null);
    setIsSubmitting(false);
    setFormVisible(true);
    setBiasText('');
    setBiasCharCount(0);
    if (typeof setLyricsGeneratorOptions === 'function') {
      setLyricsGeneratorOptions(prev => ({ ...prev, lyricsLanguage: '', theme: '', lyricLength: '', bias: '' }));
    }
    if (typeof setStatus === 'function') {
      setStatus('Ready to generate lyrics');
    }
  }, []);

  const onLanguageSelect = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    if (typeof setLyricsGeneratorOptions === 'function') {
      setLyricsGeneratorOptions(prev => ({ ...prev, lyricsLanguage: lang }));
    }
    if (typeof setStatus === 'function') {
      setStatus('Ready to generate lyrics');
    }
    setSelectedGenre('');
    setSelectedLength('');
    setVisibleStep(lang ? 1 : 0);
  };

  const onGenreSelect = (englishKey) => {
    setSelectedGenre(englishKey);
    if (typeof setLyricsGeneratorOptions === 'function') {
      setLyricsGeneratorOptions(prev => ({ ...prev, theme: englishKey }));
    }
    setVisibleStep(2);
  };

  const onLengthSelect = (e) => {
    const l = e.target.value;
    setSelectedLength(l);
    if (typeof setLyricsGeneratorOptions === 'function') {
      setLyricsGeneratorOptions(prev => ({ ...prev, lyricLength: l }));
    }
    setVisibleStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLanguage || !selectedGenre || !selectedLength) return;

    if (biasText && biasText.trim().length > 0 && biasText.trim().length < 4) {
      setGeneratedPreview('Optional context must be at least 4 characters long.');
      return;
    }

    const normalizedLangLabel = selectedLanguage || 'English';
    const localizedGeneratingText = t(normalizedLangLabel, 'generate');

    if (typeof setStatus === 'function') {
      setStatus(localizedGeneratingText);
    }

    setIsSubmitting(true);
    setIsProcessing(true);
    setFormVisible(false);

    try {
      const internalLength = lengthMap[selectedLength] || 'medium';
      const internalGenre = selectedGenre;
      const fd = new FormData();
      const normalizedLang = selectedLanguage ? (selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1).toLowerCase()) : 'English';
      fd.append('lyrics_language', normalizedLang);
      fd.append('theme', internalGenre);
      fd.append('lyric_length', internalLength);
      if (biasText && biasText.trim().length > 0) fd.append('bias', biasText.trim());

      if (typeof setLyricsGeneratorOptions === 'function') {
        setLyricsGeneratorOptions(prev => ({ ...prev, lyricsLanguage: normalizedLang, theme: internalGenre, lyricLength: internalLength, bias: biasText.trim() }));
      }

      const res = await fetch('/generate_lyrics', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.status === 'success' && data.generation_result?.lyrics_text) {
        setGeneratedPreview(data.generation_result.lyrics_text);
        setStatus(`Lyrics generation complete.`);
        setTimeout(() => {
          document.querySelector('.preview-card')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        setGeneratedPreview(`Error: ${data.message || 'Failed to generate lyrics.'}`);
      }
    } catch (err) {
      console.error(err);
      setGeneratedPreview('Network error while generating lyrics.');
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
      setFormVisible(true);
    }
  };

  const langLabel = selectedLanguage || 'English';
  const genreOptions = genres && genres.length ? genres : Object.keys(translations['English'].genres);
  const lengthOptions = [
    translations[langLabel].lengths.short,
    translations[langLabel].lengths.medium,
    translations[langLabel].lengths.long
  ];

  const canGenerate = selectedLanguage && selectedGenre && selectedLength && !isSubmitting;

  return (
    <div className="tab-pane active p-4">
      {formVisible ? (
        <form onSubmit={handleSubmit} className="form-horizontal melody-options-form-bg lyrics-generator-form fade-in">
          <h1 className="text-center header-text-custom">{t(langLabel, 'header')}</h1>
          <h3 className="text-center subheader-text-custom">
           Create your lyrics with the perfect blend of language, genre, length, and your personalized twist
          </h3>

          <div className="form-group">
            <label htmlFor="language" className="col-sm-4 control-label">{t(langLabel, 'selectLanguage')}</label>
            <div className="col-sm-8">
              <div className="d-flex gap-2 flex-wrap language-pill-row">

                {supportedLanguages.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    className={`btn btn-outline-primary language-pill ${selectedLanguage === lang ? 'active' : ''}`}
                    onClick={() => onLanguageSelect({ target: { value: lang } })}
                  >
                    {translations[lang]?.nativeName || lang}
                  </button>
                ))}

              </div>
            </div>
          </div>

          {visibleStep >= 1 && selectedLanguage && (
            <div className="form-group slide-in">
              <label htmlFor="theme" className="col-sm-4 control-label">{t(selectedLanguage, 'selectGenre')}</label>
              <div className="col-sm-8">
                <div className="d-flex gap-2 flex-wrap genre-pill-row">
                  {genreOptions.map(g => (
                    <button key={g} type="button"
                            className={`btn btn-outline-secondary genre-pill ${selectedGenre === g ? 'selected' : ''}`}
                            onClick={() => onGenreSelect(g)}
                    >
                      {translations[selectedLanguage]?.genres[g] || g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {visibleStep >= 2 && selectedGenre && (
            <div className="form-group slide-in">
              <label htmlFor="lyricLength" className="col-sm-4 control-label">{t(selectedLanguage, 'selectLength')}</label>
              <div className="col-sm-8">
                <div className="d-flex gap-2 flex-wrap length-pill-row">
                  {lengthOptions.map(len => (
                    <button key={len} type="button" className={`btn btn-outline-info length-pill ${selectedLength === len ? 'chosen' : ''}`} onClick={() => onLengthSelect({ target: { value: len } })}>{len}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {visibleStep >= 3 && (
            <div className="form-group slide-in">
              <label htmlFor="bias" className="col-sm-4 control-label">Optional Context / Prompt</label>
              <div className="col-sm-8">
                <textarea
                  id="bias"
                  className="form-control"
                  value={biasText}
                  onChange={(e) => {
                    setBiasText(e.target.value);
                    setBiasCharCount(e.target.value.length);
                    if (typeof setLyricsGeneratorOptions === 'function') {
                      setLyricsGeneratorOptions(prev => ({ ...prev, bias: e.target.value }));
                    }
                  }}
                  placeholder="(Optional) Add a short context, bias, or theme (min 4 chars if provided)"
                  rows="3"
                />
                <small className={`text-muted ${biasCharCount < 4 ? 'text-warning' : ''}`}>{biasCharCount} characters typed. {biasCharCount < 4 ? 'Results may be less accurate.' : ''}</small>
              </div>
            </div>
          )}

          <div className="form-group text-center" style={{ marginTop: '20px' }}>
            <button type="submit" className="btn btn-lg" disabled={!canGenerate}>
              {isSubmitting ? `${t(selectedLanguage, 'generate')}...` : t(selectedLanguage, 'generate')}
            </button>
          </div>
        </form>
      ) : (
        <div className="loading-state text-center p-5 fade-in">
          <h4>{t(langLabel, 'generate')}...</h4>
          <div className="spinner-border text-primary mt-3" role="status"></div>
        </div>
      )}

      {formVisible && (
      generatedPreview &&  <div className="form-group">
          <div className="col-sm-12">
            <div className="card preview-card fade-in">
              <div className="card-header d-flex justify-content-between align-items-center">
                  <p>Preview</p>
                <div className="copy-button-container">
                    <button className="copy-button" onClick={() => navigator.clipboard.writeText(generatedPreview)}> Copy </button>
                    </div>
              </div>
                <pre className="generated-lyrics">{generatedPreview}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
