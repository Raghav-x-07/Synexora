"""
Narration Generator for Synexora AI Concept Video.
Generates spoken voice audio for each educational scene using free/open-source TTS.
Supports gTTS, Windows SAPI5 / pyttsx3, and a zero-dependency WAV duration generator fallback.
"""

import os
import sys
import math
import struct
import wave
from typing import Dict, Any, List


def create_silent_wav(duration_seconds: float, output_path: str, sample_rate: int = 24000):
    """Generates a standard PCM WAV file with silence/ambient tone for fallback timing."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    num_samples = int(duration_seconds * sample_rate)
    with wave.open(output_path, "w") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        # Generate silence with very faint subtle 440Hz tick for testing if desired
        silence_bytes = b"\x00\x00" * num_samples
        wav_file.writeframes(silence_bytes)


def estimate_narration_duration(text: str) -> float:
    """Estimates speaking time based on standard average 130 words per minute."""
    words = len(text.strip().split())
    # Minimum 4.5 seconds per scene, ~0.42 seconds per word
    return max(4.5, round(words * 0.42, 1))


def generate_audio_for_text(text: str, output_path: str) -> float:
    """
    Synthesize audio using free open-source TTS.
    Returns the audio duration in seconds.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # 1. Try gTTS (Google Free TTS)
    try:
        from gtts import gTTS
        tts = gTTS(text=text, lang='en', tld='com', slow=False)
        tts.save(output_path)
        # Check size
        if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
            return estimate_narration_duration(text)
    except Exception as e:
        print(f"[Narration] gTTS fallback triggered: {e}", file=sys.stderr)

    # 2. Try Windows SAPI5 via pyttsx3
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty('rate', 145)
        # If output_path is .mp3, save as .wav for pyttsx3 then return
        wav_path = output_path if output_path.endswith('.wav') else output_path.replace('.mp3', '.wav')
        engine.save_to_file(text, wav_path)
        engine.runAndWait()
        if os.path.exists(wav_path) and os.path.getsize(wav_path) > 1000:
            return estimate_narration_duration(text)
    except Exception as e:
        print(f"[Narration] pyttsx3 fallback triggered: {e}", file=sys.stderr)

    # 3. Fallback: Generate structured timing WAV
    wav_path = output_path if output_path.endswith('.wav') else output_path.replace('.mp3', '.wav')
    duration = estimate_narration_duration(text)
    create_silent_wav(duration, wav_path)
    return duration


def generate_narration_for_lesson(lesson: Dict[str, Any], output_dir: str) -> List[Dict[str, Any]]:
    """
    Generates narration audio for every scene in the lesson.
    Returns list of audio items with path and duration.
    """
    os.makedirs(output_dir, exist_ok=True)
    scenes = lesson.get("scenes", [])
    audio_items = []

    for idx, sc in enumerate(scenes, start=1):
        script = sc.get("narration") or sc.get("explanation") or f"Scene {idx}: {sc.get('title', '')}"
        audio_filename = f"narration_{idx}.mp3"
        audio_path = os.path.join(output_dir, audio_filename)
        
        duration = generate_audio_for_text(script, audio_path)
        # Check which file was written (.mp3 or .wav)
        actual_path = audio_path
        if not os.path.exists(actual_path) and os.path.exists(audio_path.replace('.mp3', '.wav')):
            actual_path = audio_path.replace('.mp3', '.wav')

        audio_items.append({
            "scene_idx": idx,
            "audio_path": actual_path,
            "duration_seconds": duration,
            "script": script
        })

    return audio_items


if __name__ == "__main__":
    test_text = "Binary Search divides a sorted list in half to find elements in logarithmic time."
    out = os.path.join(os.path.dirname(__file__), "..", "generated", "audio", "test_narration.mp3")
    dur = generate_audio_for_text(test_text, out)
    print(f"Generated narration: {out} (Duration: ~{dur}s)")
