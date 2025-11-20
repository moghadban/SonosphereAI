# ===== shared.py =====
import os
import random
import subprocess

import librosa
import noisereduce as nr
import numpy as np
import soundfile as sf
import torch
import torchaudio
from TTS.api import TTS as CoquiTTS, TTS
from denoiser import pretrained
from denoiser.dsp import convert_audio
from pydub import AudioSegment
from scipy.signal import medfilt
from transformers import AutoProcessor, MusicgenForConditionalGeneration
from werkzeug.utils import secure_filename

# ====================================================
# Directories & Persistent Paths
# ====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.normpath(os.path.join(BASE_DIR, '../frontend/static/outputs'))
TMP_DIR = os.path.normpath(os.path.join(BASE_DIR, '../frontend/static/temp'))

os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ====================================================
# General Utility Helpers
# ====================================================
def convert_audio_format(input_path, desired_format):
    """
    Converts an audio file to WAV, MP3, FLAC, OPUS, or OGG.
    Returns the output file path.
    """

    desired_format = desired_format.lower()

    valid_formats = ["wav", "mp3", "flac", "opus", "ogg"]
    if desired_format not in valid_formats:
        raise ValueError(f"Unsupported output format: {desired_format}")

    # Build output path
    base = os.path.splitext(os.path.basename(input_path))[0]
    output_filename = f"{base}_{os.urandom(6).hex()}_converted.{desired_format}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    # ffmpeg arguments by format
    codec_map = {
        "mp3": ["-acodec", "libmp3lame"],
        "wav": ["-acodec", "pcm_s16le"],
        "flac": ["-acodec", "flac"],
        "opus": ["-acodec", "libopus"],
        "ogg": ["-acodec", "libvorbis"]
    }

    codec_args = codec_map[desired_format]

    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path] + codec_args + [output_path],
            check=True,
            capture_output=True
        )
        print(f"[INFO] Converted → {desired_format}: {output_path}")
        return output_path

    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Format conversion failed: {e.stderr.decode()}")
        return input_path


def safe_join(*paths):
    """Safely join filesystem paths."""
    return os.path.abspath(os.path.join(*paths))


def save_temp_file(uploaded_file):
    """
    Converts uploaded voice files (e.g., webm, wav) to mp3.
    Forces conversion for webm/matroska types.
    Returns the final file path.
    """
    original_filename = secure_filename(f"{os.urandom(8).hex()}_{uploaded_file.filename}")
    input_path = os.path.join(OUTPUT_DIR, original_filename)
    uploaded_file.save(input_path)

    # Detect format using ffprobe
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=format_name",
             "-of", "default=noprint_wrappers=1:nokey=1", input_path],
            capture_output=True, text=True
        )
        format_detected = result.stdout.strip().lower()
        print(f"Detected format: {format_detected}")
    except Exception as e:
        print(f"[ERROR] Could not detect audio format: {e}")
        format_detected = None

    # Determine if conversion is needed
    force_convert = format_detected in ["webm", "matroska"]

    if force_convert or not input_path.lower().endswith(".mp3"):
        output_filename = os.path.splitext(original_filename)[0] + ".mp3"
        output_path = os.path.join(TMP_DIR, output_filename)

        try:
            subprocess.run(
                ["ffmpeg", "-y", "-i", input_path, "-acodec", "libmp3lame", output_path],
                check=True, capture_output=True
            )
            print(f"[INFO] Converted {format_detected or 'unknown'} → mp3: {output_path}")
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"[ERROR] Conversion failed: {e.stderr.decode()}")
            return input_path
    else:
        print("No conversion performed; returning original path.")
        return input_path


def get_language_abbreviation(language):
    """Return short language code for TTS engines."""
    lang_codes = {
        "English": "en", "Chinese": "zh", "French": "fr", "German": "de",
        "Hindi": "hi", "Italian": "it", "Japanese": "ja", "Korean": "ko",
        "Polish": "pl", "Portuguese": "pt", "Russian": "ru", "Spanish": "es",
        "Turkish": "tr"
    }
    return lang_codes.get(language, "en")


# ====================================================
# Noise Reduction Pipeline (Two-stage)
# ====================================================

def reduce_noise_return(input_path):
    """
    Full noise-reduction pipeline:
      • Stage 1: Spectral gating using noisereduce
      • Stage 2: Deep learning denoiser (FB DNS model)
    Returns:
      (original_path, final_denoised_path)
    """
    original_file_path = input_path
    base, ext = os.path.splitext(input_path)

    intermediate_path = base + "_nr_temp" + ext
    final_output_path = base + "_denoised" + ext

    # Stage 1 - classical noise reduction
    y_out, sr = reduce_noise(original_file_path, noise_duration=0.5, prop_decrease=0.9)
    if y_out.size > 0:
        sf.write(intermediate_path, y_out, sr)

    # Stage 2 - deep learning denoiser
    final_denoised_path = reduce_noise_with_denoiser(intermediate_path, final_output_path)

    return original_file_path, final_denoised_path


def reduce_noise_with_denoiser(audio_path, output_path):
    """
    Deep-learning noise reduction using Facebook DNS64 pretrained model.
    Always uses CPU for stability.
    """
    print(f"[INFO] Beginning noise reduction with FB Denoiser model on CPU.")
    try:
        device = 'cpu'
        model = pretrained.dns64().to(device)

        wav, sr = torchaudio.load(audio_path)
        channels = wav.shape[0]

        # Resample & convert for model
        wav = convert_audio(wav.to(device), sr, model.sample_rate, channels)

        with torch.no_grad():
            denoised_wav = model(wav[None])[0]

        torchaudio.save(output_path, denoised_wav.cpu(), model.sample_rate)
        print(f"[INFO] Denoised audio saved to: {output_path}")

        return output_path

    except Exception as e:
        print(f"[ERROR] Deep Learning Denoiser failed: {e}")
        return None


def reduce_noise(audio_path, noise_duration=0.5, prop_decrease=0.9):
    """
    Stage-1 noise reduction using spectral gating (noisereduce library).
    Returns (audio_array, sample_rate).
    """
    print(f"[INFO] Beginning noise reduction with noisereduce (prop_decrease={prop_decrease})")
    try:
        y, sr = librosa.load(audio_path, sr=None)

        noise_len = int(noise_duration * sr)
        noise_clip = y[:noise_len]

        y_reduced_noise = nr.reduce_noise(
            y=y,
            sr=sr,
            y_noise=noise_clip,
            stationary=False,
            prop_decrease=prop_decrease
        )
        print(f"[INFO] End of noisereduce processing.")
        return y_reduced_noise, sr

    except Exception as e:
        print(f"[ERROR] Noise reduction failed for {audio_path}: {e}")
        return np.array([]), None


def get_lang_abbr(language):
    """Duplicate mapping helper (remains unchanged)."""
    lang_codes = {
        "English": "en", "Chinese": "zh", "French": "fr", "German": "de",
        "Hindi": "hi", "Italian": "it", "Japanese": "ja", "Korean": "ko",
        "Polish": "pl", "Portuguese": "pt", "Russian": "ru", "Spanish": "es",
        "Turkish": "tr", "Arabic": "ar"
    }
    return lang_codes.get(language, "en")


# ====================================================
# Music Generation (MusicGen)
# ====================================================

def analyze_vocal_and_enrich_prompt(vocal_path, genre, instrument, lyrics):
    """
    Analyze vocal track (pitch, loudness, dynamics) and produce an enriched
    MusicGen prompt for more controlled final sound.

    The function now accepts 'lyrics' and appends them to the prompt to condition
    the music generation on the specific lyrical content.
    """
    try:
        y, sr = librosa.load(vocal_path, sr=None)

        # Loudness / dynamics
        rms = librosa.feature.rms(y=y)[0]
        avg_rms_db = 20 * np.log10(np.mean(rms) + 1e-8)

        if avg_rms_db > -20:
            loudness_tag = "powerful and aggressive dynamics"
        elif avg_rms_db > -35:
            loudness_tag = "medium dynamics, bright sound"
        else:
            loudness_tag = "subtle and atmospheric feel"

        # Pitch features
        f0, _, _ = librosa.pyin(
            y, fmin=librosa.note_to_hz('C2'),
            fmax=librosa.note_to_hz('C7')
        )
        f0 = np.nan_to_num(f0, nan=0)
        valid_f0 = f0[f0 > 0]

        pitch_tag = ""
        if valid_f0.size > 0:
            avg_pitch_hz = np.mean(valid_f0)
            if avg_pitch_hz > 300:
                pitch_tag = "high-register melody"
            elif avg_pitch_hz < 150:
                pitch_tag = "deep, low-register harmony"
            else:
                pitch_tag = "mid-range vocal pitch"

        # Genre-based tempo interpretation
        if genre.lower() in ['hip-hop', 'electronic']:
            speed_tag = "fast tempo with a driving rhythm"
        elif genre.lower() in ['pop', 'rock', 'metal']:
            speed_tag = "moderate tempo"
        else:
            speed_tag = "smooth and slow tempo"

        if instrument == "full_music":
            base_prompt = f"{genre} song"
        else:
            base_prompt = f"{instrument} {genre} instrumental"

        rich_prompt = (
            f"{base_prompt}, featuring a **{speed_tag}**, with **{pitch_tag}**, "
            f"and **{loudness_tag}**."
        )

        # NEW LOGIC: Append formatted lyrics to the music prompt
        if lyrics and lyrics.strip():
            # Replace newlines with pipe for better conditioning by MusicGen
            formatted_lyrics = lyrics.strip().replace('\n', ' | ')
            rich_prompt += f" The track must feature singing with the following lyrics: '{formatted_lyrics}'."

        print(f"[INFO] Enhanced MusicGen Prompt: {rich_prompt}")
        return rich_prompt

    except Exception as e:
        print(f"[ERROR] Vocal analysis for prompt failed: {e}")
        return f"{instrument} {genre} instrumental"


def generate_full_music_with_musicgen(prompt="A calm piano melody"):
    """
    Generate instrumental music using MusicGen (small model).
    """
    print(f"[INFO] Beginning of the generating music....")
    print(f"[DEBUG] Generating Full Music using MusicGen: {prompt}")
    try:
        processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
        model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

        inputs = processor(text=[prompt], padding=True, return_tensors="pt")
        with torch.no_grad():
            audio_values = model.generate(**inputs, max_new_tokens=512)

        audio_array = audio_values[0, 0].cpu().numpy()
        output_path = safe_join(OUTPUT_DIR, f"musicgen_output_{os.urandom(6).hex()}.wav")

        sf.write(output_path, audio_array, 32000)

        print(f"[INFO] End of the generating music, returned path: {output_path}")
        return output_path

    except Exception as e:
        print(f"[ERROR] MusicGen failed: {e}")
        return None


# ====================================================
# TTS Engines: Bark AI + Coqui XTTS
# ====================================================

def _execute_tts_generation(engine, lyrics, vocal_style, lang_abbr,
                            genre, selected_voice_name, instrument,
                            speed, voice_upload, mode):
    """
    Internal method selecting correct voice file, preparing TTS prompt,
    and generating a vocal track with either Bark AI or Coqui XTTS.
    """
    output_path = safe_join(
        OUTPUT_DIR,
        f"generated_vocals_{engine.lower().replace(' ', '_')}_{os.urandom(6).hex()}.wav"
    )

    action_tag = "singing"
    if genre.lower() in ['hip-hop', 'reggae']:
        action_tag = "rapping"
    elif genre.lower() == 'electronic':
        genre = "edm"

    speaker_wave = None
    speaker_id = None
    voice_file = None

    # -----------------------------------------
    # Voice selection logic (random / specific)
    # -----------------------------------------
    if vocal_style.lower() == 'random' and not voice_upload:
        # Random male/female default folder
        voice_style_folder = random.choice(['male', 'female'])
        voice_dir = os.path.normpath(
            os.path.join(
                BASE_DIR,
                f"../frontend/static/voices/{voice_style_folder}/{lang_abbr}"
            )
        )
        try:
            random_name = random.choice(os.listdir(voice_dir))
            voice_file = random_name
        except IndexError:
            print(f"[ERROR] Voice directory is empty: {voice_dir}")
            voice_file = None

    elif vocal_style.lower() == 'random' and voice_upload and voice_upload.filename:
        voice_dir_temp = save_temp_file(voice_upload)
        voice_dir, file_name = os.path.split(voice_dir_temp)
        voice_file = os.path.basename(voice_dir_temp)

    elif vocal_style.lower() in ['male', 'female'] and not voice_upload:
        voice_style_folder = vocal_style.lower()
        print(f"[INFO] voice style folder: {voice_style_folder}")
        voice_dir = os.path.normpath(
            os.path.join(
                BASE_DIR,
                f"../frontend/static/voices/{voice_style_folder}/{lang_abbr}"
            )
        )

        if selected_voice_name:
            print(f"[INFO] Selected voice: {selected_voice_name}")
            voice_file = f"{lang_abbr}_speaker_{selected_voice_name.lower()}.mp3"
            print(f"[INFO] Voice directory path: {voice_dir}")
            if not os.path.exists(os.path.join(voice_dir, voice_file)):
                # fallback filename structure
                voice_file = f"{lang_abbr}_speaker_{selected_voice_name.lower()}.mp3"

    # Resolve speaker_wav
    if voice_file:
        path = os.path.join(voice_dir, voice_file)
        if os.path.exists(path):
            speaker_wave = path
            speaker_id = voice_file.replace('.mp3', '')

    print(f"[INFO] User uploaded a voice file: {speaker_id}")
    print(f"[INFO] Voice directory path: {speaker_wave}")

    # Ensure Coqui has a voice file
    if engine == 'Coqui XTTS' and not speaker_wave:
        print("[WARN] Coqui XTTS requires a speaker_wav, choosing random fallback.")
        style_fallback = random.choice(['male', 'female'])
        voice_dir = os.path.normpath(
            os.path.join(BASE_DIR, f"../frontend/static/voices/{style_fallback}/{lang_abbr}")
        )
        try:
            voice_file = random.choice(os.listdir(voice_dir))
            speaker_wave = os.path.join(voice_dir, voice_file)
            speaker_id = voice_file.replace(".mp3", "")
        except IndexError:
            raise ValueError(
                "Coqui XTTS requires at least one voice file; none found."
            )

    # -----------------------------------------
    # Bark AI
    # -----------------------------------------
    if engine == 'Bark AI':
        tts = TTS(model_name="tts_models/multilingual/multi-dataset/bark",
                  progress_bar=False, gpu=False)

        prompt = f"[{action_tag} {genre.lower()}] ♪{lyrics}♪"
        if genre.lower() == 'hip-hop':
            prompt = f"[{action_tag}] ♪{lyrics}♪"

        # Special Bark full-music case (random voice)
        if instrument.lower() == 'full_music' and vocal_style.lower() == 'random' and not voice_upload:
            print(f"[INFO] Using Bark AI built-in Random voice")
            print(f"[INFO] prompt: {prompt}")
            tts.tts_to_file(text=prompt, file_path=output_path, speaker_wav=None, speed=speed)
            return output_path
        elif mode != 'full_music' and vocal_style.lower() == 'random' and not voice_upload:
            print(f"[INFO] Using Bark AI built-in Random voice for Text to Speech")
            prompt_text = f"{lyrics}"
            print(f"[INFO] prompt: {prompt_text}")
            tts.tts_to_file(text=prompt_text, file_path=output_path, speaker_wav=None, speed=1.0)
            return output_path
        elif mode != 'full_music' and vocal_style.lower() != 'random' and not voice_upload:
            prompt_text = f"{lyrics}"
            print(f"[INFO] prompt: {prompt_text}")
            print(f"[INFO] Using Bark AI text to speech ({vocal_style}) voice: {speaker_id or 'Random'}")
            print(f"[INFO] prompt: {prompt_text}")
            tts.tts_to_file(
                text=prompt_text,
                file_path=output_path,
                speaker=speaker_id,
                speaker_wav=speaker_wave,
                speed=speed,
            )
            return output_path
        elif mode != 'full_music' and voice_upload:
            prompt_text = f"{lyrics}"
            print(f"[INFO] prompt: {prompt_text}")
            print(f"[INFO] Using Bark AI text to speech ({vocal_style}) voice: {speaker_id or 'Random'}")
            print(f"[INFO] prompt: {prompt_text}")
            tts.tts_to_file(
                text=prompt_text,
                file_path=output_path,
                speaker=speaker_id,
                speaker_wav=speaker_wave,
                speed=speed,
            )
            return output_path
        print(f"[INFO] Using Bark AI ({vocal_style}) voice: {speaker_id or 'Random'}")
        print(f"[INFO] prompt: {prompt}")
        tts.tts_to_file(
            text=prompt,
            file_path=output_path,
            speaker=speaker_id,
            speaker_wav=speaker_wave,
            speed=speed,
        )
        return output_path

    # -----------------------------------------
    # Coqui XTTS
    # -----------------------------------------
    elif engine == 'Coqui XTTS':
        coqui_tts = CoquiTTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")

        if not speaker_wave:
            raise ValueError("Coqui XTTS requires a valid male or female selection.")
        if mode != 'full_music':
            prompt = f"{lyrics}"
            print(f"[INFO] Using Coqui XTTS text to speech voice: {speaker_id or 'Random'}")
            print(f"[INFO] prompt: {prompt}")

            coqui_tts.tts_to_file(
                text=prompt,
                file_path=output_path,
                speaker_wav=speaker_wave,
                speaker_id=speaker_id,
                language=lang_abbr,
                speed=speed,
            )
            return output_path

        prompt = f"♪{lyrics}♪"
        print(f"[INFO] Using Coqui XTTS voice: {speaker_id or 'Random'}")
        print(f"[INFO] prompt: {prompt}")

        coqui_tts.tts_to_file(
            text=prompt,
            file_path=output_path,
            speaker_wav=speaker_wave,
            speaker_id=speaker_id,
            language=lang_abbr,
            speed=speed,
        )
        return output_path

    # Should not occur
    raise EnvironmentError(f"Unsupported TTS engine: {engine}")


def generate_vocals_with_tts(
        lyrics,
        tts_engine,
        vocal_style='Random',
        lang_abbr='en',
        genre='Pop',
        selected_voice_name='',
        instrument='full_music',
        voice_upload=None,
        mode='full_music'):
    """
    Generate vocals with selected TTS engine. Applies noise reduction post-generation
    unless Bark full-music random mode is used.
    """
    # Speed selection based on genre
    speed = 1.0
    if genre.lower() in ['hip-hop', 'reggae']:
        speed = round(random.uniform(1.05, 1.15), 2)
    elif genre.lower() in ['pop', 'r&b', 'country', 'rock', 'metal']:
        speed = round(random.uniform(0.9, 1.05), 2)
    elif genre.lower() == 'electronic':
        speed = round(random.uniform(1.05, 1.20), 2)

    try:
        vocal_path = _execute_tts_generation(
            tts_engine, lyrics, vocal_style, lang_abbr,
            genre, selected_voice_name, instrument,
            speed, voice_upload, mode
        )

        # Bark full-music skip condition
        if (
                vocal_style.lower() == "random"
                and instrument.lower() == "full_music"
                and tts_engine == "Bark AI"
                and not voice_upload
        ):
            return vocal_path

        # Apply 2-stage noise reduction
        original_path, vocal_path = reduce_noise_return(vocal_path)
        return vocal_path

    except Exception as e:
        print(f"[ERROR] TTS Generation failed for {tts_engine}: {e}")
        raise e


# ====================================================
# Vocal Refinement + Mixing
# ====================================================

def refine_and_mix_vocal(vocal_path, music_path, humanize_params=None):
    """
    Combine refined vocals with generated instrumental track.
    Handles pitch-smoothing, vibrato simulation, and final mixdown.
    (Code truncated naturally at file boundary in original.)
    """
    print(f"[INFO] Beginning the refinement and mix process....")

    if humanize_params is None:
        humanize_params = {
            'f0_medfilt': 5,
            'add_vibrato': True,
            'vibrato_depth_semitones': 0.1,
            'vibrato_rate_hz': 5
        }

    clean_path = vocal_path.replace(".mp3", "_clean.wav").replace(".wav", "_clean.wav")
    # Using ffmpeg for loudness normalization
    subprocess.run(["ffmpeg", "-y", "-i", vocal_path, "-af", "loudnorm", clean_path],
                   stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    rvconv_path = clean_path.replace("_clean.wav", "_rvconv.wav")
    AudioSegment.from_file(clean_path).export(rvconv_path, format="wav")

    try:
        y, sr = librosa.load(rvconv_path, sr=None)

        # --- Pitch Extraction and Correction ---
        f0, _, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))

        # Handle None or invalid output from pyin
        if f0 is None or len(f0) == 0 or np.all(np.isnan(f0)):
            print("[WARN] pyin failed to extract pitch — skipping pitch refinement.")
            out_refined = rvconv_path  # Use the raw file
        else:
            # Replace NaNs and negatives
            f0 = np.nan_to_num(f0, nan=librosa.note_to_hz('A4'))
            f0_smooth = medfilt(f0, kernel_size=humanize_params['f0_medfilt'])
            min_freq = librosa.note_to_hz('C2')
            f0_safe = np.where(f0_smooth <= 0, min_freq, f0_smooth)
            # Safe conversion
            try:
                midi = librosa.hz_to_midi(f0_safe)
            except Exception as e:
                print(f"[ERROR] Failed to convert to MIDI: {e}")
                midi = np.zeros_like(f0_safe)

            midi_quant = np.round(midi)
            f0_quant = librosa.midi_to_hz(midi_quant)
            # Calculate average pitch shift needed for correction
            avg_semitone = float(np.nanmean(librosa.hz_to_midi(f0_quant) - librosa.hz_to_midi(f0_smooth)))
            if not np.isfinite(avg_semitone):
                avg_semitone = 0.0

            y2 = librosa.effects.pitch_shift(y, sr=sr, n_steps=avg_semitone)
            out_refined = rvconv_path.replace("_rvconv.wav", "_refined.wav")
            sf.write(out_refined, y2, sr)
            print("Min freq:", np.min(f0_safe), "Max freq:", np.max(f0_safe))

    except Exception as e:
        print(f"[ERROR] Refinement failed: {e}")
        out_refined = rvconv_path

    # --- Mixing ---
    combined_path = safe_join(OUTPUT_DIR, f"final_mix_{os.urandom(6).hex()}.wav")
    subprocess.run(["ffmpeg", "-y", "-i", out_refined, "-i", music_path,
                    "-filter_complex",
                    "[0:a]volume=1.0[vocal];[1:a]volume=0.6[music];[vocal][music]amix=inputs=2:duration=longest",
                    combined_path],
                   stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Stage 2: remove this as it was removing music out
    # original_path, combined_path = reduce_noise_return(combined_path)
    print(f"[INFO] End the refinement and mix process with combined path: {combined_path}")
    return combined_path
