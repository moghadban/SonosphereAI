# ===== lyrics_generator.py =====

# ----------------------------
# Imports
# ----------------------------
import os
import random
import re
import sqlite3
import sys
import traceback

import markovify
# ===== NEW IMPORTS =====
import nltk
from nltk.corpus import wordnet

from utilities import LANGUAGE_CODE_MAP, genre_bias_text

# Ensure WordNet is downloaded
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

LYRICS_LANGUAGES = ['English', 'Chinese', 'French', 'German', 'Italian', 'Russian', 'Spanish', 'Arabic']

# ----------------------------
# Configuration
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_STATIC = os.path.normpath(os.path.join(BASE_DIR, "../frontend/static"))
DB_FILE_PATH = os.path.join(FRONTEND_STATIC, "lyrics_corpora", "lyrics_corpus.db")
DB_TABLE_NAME = "all_lyrics"

# ----------------------------
# Profanity Setup
# ----------------------------
try:
    from better_profanity import profanity
except ImportError:
    class MockProfanity:
        @staticmethod
        def contains_profanity(word):
            return False


    profanity = MockProfanity()

profanity.load_censor_words()  # default list


# ============================================================
# == CORE HELPERS ==
# ============================================================

def clean_corpus_text(text, language_code):
    if not text or not text.strip():
        return ""
    text = re.sub(r'@@\d+', '', text)
    text = re.sub(r'@![A-Z0-9\-]+', '', text)
    text = re.sub(r'@\([A-Z\-]+\)', '', text)
    text = re.sub(r'@+', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'(\r\n|\r)', '\n', text)

    if language_code == 'ar':
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = re.sub(r'[ \t]+', ' ', line).strip()
            sub_lines = line.split('. ') if '. ' in line else [line]
            for sub_line in sub_lines:
                sub_line = sub_line.strip()
                if len(sub_line.split()) >= 3:
                    if not sub_line.endswith(('.', '?', '!')):
                        sub_line += '.'
                    cleaned_lines.append(sub_line)
        return "\n".join(cleaned_lines)

    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return "\n".join([line for line in lines if len(line.split()) >= 2])


def emphasize_bias_in_corpus(corpus_text, bias, min_corpus_size=10000, multiplier=3):
    if not bias or len(bias.strip()) < 3:
        return corpus_text
    bias_lower = bias.strip().lower()
    lines = [line for line in corpus_text.split('\n') if line.strip()]
    emphasized_lines = []
    for line in lines:
        emphasized_lines.append(line)
        if bias_lower in line.lower():
            for _ in range(multiplier):
                emphasized_lines.append(line)
    new_corpus = "\n".join(emphasized_lines)
    while len(new_corpus) < min_corpus_size:
        new_corpus += "\n" + "\n".join(emphasized_lines[:5])
    return new_corpus


def soft_censor_text(text):
    def censor_word(match):
        word = match.group()
        norm = re.sub(r'[^a-zA-Z]', '', word).lower()
        if profanity.contains_profanity(norm):
            return word[0] + '*' * (len(word) - 1)
        return word

    return re.sub(r'\b[\w\'!@#\$%\^&*\-]+\b', censor_word, text, flags=re.UNICODE)


def is_profane_sentence(text):
    """
    Checks if a sentence contains any profanity without censoring it.
    (NEW HELPER FUNCTION FOR PROFANITY FILTERING)
    """
    # Find all words/tokens in the text
    words = re.findall(r'\b[\w\'!@#\$%\^&*\-]+\b', text, flags=re.UNICODE)
    for word in words:
        # Normalize the word for the profanity check
        norm = re.sub(r'[^a-zA-Z]', '', word).lower()
        # If profanity is found, return True immediately
        if profanity.contains_profanity(norm):
            return True
    return False


def log_data_snippet(data_string, max_length=500):
    if data_string:
        total_length = len(data_string)
        snippet = data_string[:max_length]
        print("\n--- DEBUG: Data Snippet Preview ---", file=sys.stderr)
        print(f"Total Data Length (Characters): {total_length}", file=sys.stderr)
        print("--- Start Snippet (First 500 chars) ---", file=sys.stderr)
        print(snippet, file=sys.stderr)
        print("--- End Snippet ---", file=sys.stderr)
    else:
        print("\n--- DEBUG: Data is EMPTY ---", file=sys.stderr)


def remove_internal_repetition(line, min_n=2, max_n=5):
    words = line.split()
    original_len = len(words)
    for n in range(max_n, min_n - 1, -1):
        if original_len < n * 2:
            continue
        i = 0
        new_words = []
        while i < original_len:
            if (i + 2 * n) <= original_len:
                p1 = words[i:i + n]
                p2 = words[i + n:i + 2 * n]
                if p1 == p2:
                    new_words.extend(p1)
                    i += 2 * n
                    continue
            new_words.append(words[i])
            i += 1
        if len(new_words) < original_len:
            return " ".join(new_words)
    return line


# ============================================================
# == STOP WORDS ==
# ============================================================
STOP_WORDS = {
    "and", "or", "the", "is", "a", "an", "of", "in", "on", "for", "to", "with",
    "و", "في", "من", "على", "عن", "إلى", "أن", "لكن", "كما",
    "的", "了", "在", "是", "我", "有", "和", "不", "你", "他", "她",
    "et", "le", "la", "les", "de", "du", "des", "un", "une", "en",
    "und", "der", "die", "das", "ein", "eine", "zu", "mit", "von",
    "e", "il", "la", "lo", "gli", "le", "un", "una", "con", "di",
    "y", "el", "la", "los", "las", "un", "una", "en", "de", "con",
    "и", "в", "на", "с", "что", "это", "как", "но", "а"
}


# ============================================================
# == BIAS SYNONYMS & FILTER ==
# ============================================================

def expand_bias_with_synonyms(bias):
    """Return a set of bias keywords including synonyms (English only)."""
    if not bias or len(bias.strip()) < 3:
        return set()
    words = [w.lower() for w in re.findall(r'\b\w+\b', bias) if w.lower() not in STOP_WORDS]
    expanded = set(words)
    for w in words:
        for syn in wordnet.synsets(w):
            for lemma in syn.lemmas():
                lemma_name = lemma.name().replace('_', ' ').lower()
                if lemma_name not in STOP_WORDS:
                    expanded.add(lemma_name)
    return expanded


def build_bias_filter(bias):
    """Construct SQL LIKE clauses from bias keywords including synonyms."""
    if not bias or len(bias.strip()) < 3:
        return ""
    bias_keywords = expand_bias_with_synonyms(bias)
    if not bias_keywords:
        return ""
    single = [f"Lyrics LIKE '%{w}%'" for w in bias_keywords]
    words_list = list(bias_keywords)
    phrases = []
    for i in range(len(words_list) - 1):
        phrases.append(f"Lyrics LIKE '%{words_list[i]} {words_list[i + 1]}%'")
    all_clauses = single + phrases
    return "(" + " OR ".join(all_clauses) + ")"


def filter_corpus_by_bias(corpus_text, bias_keywords):
    """Keep only lines containing at least one of the bias keywords."""
    if not bias_keywords:
        return corpus_text
    filtered_lines = []
    for line in corpus_text.split('\n'):
        line_lower = line.lower()
        if any(k in line_lower for k in bias_keywords):
            filtered_lines.append(line)
    return "\n".join(filtered_lines)


# ============================================================
# == DATABASE ACCESS ==
# ============================================================

def load_corpus_from_db(language, genre, bias=None):
    if not os.path.exists(DB_FILE_PATH):
        print(f"[WARN] DB file missing: {DB_FILE_PATH}")
        return None
    language_input = language.strip().lower() if language else ''
    genre = genre.strip().lower() if genre else ''
    lang_code = LANGUAGE_CODE_MAP.get(language_input, 'en')
    print(f"[DEBUG] DB Lookup: Language='{lang_code}', Genre='{genre}', Bias='{bias}'")
    base_query = f"SELECT Lyrics FROM {DB_TABLE_NAME}"
    bias_filter = build_bias_filter(bias)
    queries = [
        f"{base_query} WHERE LOWER(Language)='{lang_code}' AND LOWER(Genre)='{genre}'" + (
            f" AND {bias_filter}" if bias_filter else ""),
        f"{base_query} WHERE LOWER(Language)='{lang_code}' AND LOWER(Genre) IN ('{genre}', 'rap', 'hip-hop')" + (
            f" AND {bias_filter}" if bias_filter else ""),
        f"{base_query} WHERE LOWER(Language)='{lang_code}'" + (f" AND {bias_filter}" if bias_filter else "")
    ]
    results = []
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE_PATH)
        cursor = conn.cursor()
        for q in queries:
            cursor.execute(q)
            new = [row[0] for row in cursor.fetchall() if row[0] and row[0].strip()]
            if new:
                print(f"[INFO] Query succeeded: {q.split('WHERE')[1][:80]}...")
                results.extend(new)
            if len("\n".join(results)) >= 10000:
                break
        if not results and bias_filter:
            print("[WARN] Bias queries failed — retrying without bias...")
            cursor.execute(f"{base_query} WHERE LOWER(Language)='{lang_code}'")
            results = [row[0] for row in cursor.fetchall() if row[0] and row[0].strip()]
            if results:
                print("[INFO] Fallback succeeded.")
    except sqlite3.Error as e:
        print(f"[ERROR] SQLite Error: {e}", file=sys.stderr)
        return None
    finally:
        if conn:
            conn.close()
    corpus = "\n".join(results)
    if not corpus.strip():
        print(f"[WARN] No DB results for {language}/{genre}", file=sys.stderr)
        return None
    print(f"[DEBUG] Final corpus size: {len(corpus)} chars")
    return corpus


# ============================================================
# == MARKOV MODEL ==
# ============================================================

try:
    from markovify.text import MarkovifyError
except ImportError:
    MarkovifyError = Exception


def build_markov_model_from_text(text, state_size=3):
    if len(text.strip()) < 1000:
        print(f"[ERROR] Corpus too short ({len(text.strip())} chars)", file=sys.stderr)
        return None
    try:
        print(f"[INFO] Building Markov model (state_size={state_size})")
        model = markovify.NewlineText(text, state_size=state_size)
        print(f"[INFO] Model built successfully")
        return model
    except (Exception, MarkovifyError) as e:
        if state_size > 2:
            print(f"[WARN] Failed state_size={state_size}: {e}", file=sys.stderr)
            print("[WARN] Retrying with state_size=2", file=sys.stderr)
            try:
                model = markovify.NewlineText(text, state_size=2)
                print("[INFO] Fallback model built")
                return model
            except (Exception, MarkovifyError) as e2:
                print(f"[ERROR] Final failure: {e2}", file=sys.stderr)
                traceback.print_exc(file=sys.stderr)
                return None
        print(f"[ERROR] Model build failed: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return None


# ============================================================
# == LYRICS GENERATION ==
# ============================================================

def generate_lyrics_with_markov(
        language='English',
        genre='Pop',
        min_lines=4,
        max_lines=8,
        attempts_per_line=20,
        bias=None,
        max_words_per_line=12,
        min_corpus_size=10000
):
    lang_code = LANGUAGE_CODE_MAP.get(language.strip().lower(), 'en')
    corpus_raw = load_corpus_from_db(language, genre, bias)
    if not corpus_raw:
        print(f"[WARN] No corpus for {language}/{genre}")
        return None

    bias_keywords = expand_bias_with_synonyms(bias) if bias else None

    def prepare_corpus_for_markov(corpus_text, lang_code):
        lines = corpus_text.split('\n')
        cleaned = []
        for line in lines:
            line = line.strip()
            if not line or len(line.split()) < 3:
                continue
            line_cleaned = re.sub(r"[^\w\s\u0400-\u04FF\u0600-\u06FF\u4e00-\u9fff'!?.,-]", "", line, flags=re.UNICODE)
            if lang_code in ['ru', 'ar', 'zh']:
                letters = re.findall(r'\w', line_cleaned, flags=re.UNICODE)
                latin_count = sum(1 for c in letters if 'a' <= c.lower() <= 'z')
                if latin_count / max(len(letters), 1) > 0.4:
                    continue
            cleaned.append(line_cleaned)
        return "\n".join(cleaned)

    if lang_code == 'ru':
        corpus_clean = prepare_corpus_for_markov_ru(corpus_raw)
        state_size = 2
    elif lang_code == 'zh':
        corpus_clean = prepare_corpus_for_markov_zh(corpus_raw)
        state_size = 2
    else:
        corpus_clean = prepare_corpus_for_markov(corpus_raw, lang_code)
        state_size = 2

    if bias_keywords:
        corpus_clean = filter_corpus_by_bias(corpus_clean, bias_keywords)
        corpus_clean = emphasize_bias_in_corpus(corpus_clean, bias, min_corpus_size)
    else:
        corpus_clean += genre_bias_text(genre, lang_code)
        if bias:
            corpus_clean += f"\n{bias.strip()}\n"

    if len(corpus_clean.strip()) < 1000:
        print("[WARN] Cleaned corpus too short; using raw corpus", file=sys.stderr)
        corpus_clean = corpus_raw

    log_data_snippet(corpus_clean)
    model = build_markov_model_from_text(corpus_clean, state_size=state_size)
    if not model:
        model = build_markov_model_from_text(corpus_clean, state_size=2)
        if not model:
            print("[ERROR] Could not build Markov model")
            return None

    target_lines = random.randint(min_lines, max_lines)
    lines = []
    tries = 0
    max_total = target_lines * attempts_per_line
    while len(lines) < target_lines and tries < max_total:
        tries += 1
        sentence = model.make_sentence(tries=50, max_overlap_ratio=0.7)
        if not sentence:
            sentence = model.make_short_sentence(120)
        if sentence:
            cleaned = re.sub(r"[^\w\s\u0400-\u04FF\u0600-\u06FF\u4e00-\u9fff'!?.,-]", "", sentence,
                             flags=re.UNICODE).strip()
            words = cleaned.split()
            if len(words) > max_words_per_line:
                words = words[:max_words_per_line]
            cleaned = " ".join(words)
            cleaned = remove_internal_repetition(cleaned, min_n=2, max_n=5)
            candidate = [l.strip() for l in cleaned.split('\n') if l.strip()]
            for l in candidate:
                if len(l.split()) >= 3 and l not in lines and len(lines) < target_lines:
                    # 💡 MODIFIED LOGIC: Check for profanity and discard line if found
                    if is_profane_sentence(l):
                        # Skip this line completely and let the while loop attempt a new sentence
                        continue
                    lines.append(l)  # Append the clean line
    if not lines:
        print("[WARN] No lines generated", file=sys.stderr)
        return None
    return "\n".join(lines)


# ============================================================
# == RUSSIAN & CHINESE CLEANING FUNCTIONS ==
# ============================================================

def prepare_corpus_for_markov_ru(corpus_text):
    lines = corpus_text.split('\n')
    cleaned = []
    seen = set()
    for line in lines:
        line = line.strip()
        if not line or len(line.split()) < 2:
            continue
        if any(keyword in line.lower() for keyword in ["дмитрий", "денис", "рашид", "и сл"]):
            continue
        if line not in seen:
            cleaned.append(line)
            seen.add(line)
    return "\n".join(cleaned)


def prepare_corpus_for_markov_zh(corpus_text):
    lines = corpus_text.split('\n')
    cleaned = []
    seen = set()
    for line in lines:
        raw = line.strip()
        if not raw or len(raw.split()) < 2:
            continue
        if re.search(r'[A-Za-z]', raw):
            continue
        normalized = re.sub(r'\s+', ' ', raw).strip()
        if normalized not in seen:
            cleaned.append(normalized)
            seen.add(normalized)
    return "\n".join(cleaned)
