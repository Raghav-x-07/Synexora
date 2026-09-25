"""
Master Video Pipeline for Synexora AI Concept Video Generator.
Orchestrates:
1. Lesson Generation (Structured AI JSON)
2. Scene Visuals Generation (High-Definition Image Slides)
3. Narration Synthesis (Voice Audio)
4. Video Rendering (Final MP4 Video)
"""

import os
import sys
import json
import time
import re
import argparse
from typing import Dict, Any

# Add parent directory to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

from lesson_generator import generate_lesson
from scene_generator import generate_scenes_visuals
from narration import generate_narration_for_lesson
from renderer import render_concept_video


def slugify(text: str) -> str:
    """Sanitize string for clean filenames."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-') or 'concept'


def generate_concept_video(topic: str, difficulty: str = "beginner") -> Dict[str, Any]:
    """
    Complete end-to-end execution of the Concept Video Generator.
    Returns structured results including videoUrl, lesson metadata, and scene file paths.
    """
    start_time = time.time()
    topic_slug = slugify(topic)
    unique_id = f"{topic_slug}-{int(time.time())}"

    # Directory layout
    generated_root = os.path.join(SERVICE_ROOT, "generated")
    scenes_dir = os.path.join(generated_root, "scenes", unique_id)
    audio_dir = os.path.join(generated_root, "audio", unique_id)
    videos_dir = os.path.join(generated_root, "videos")
    os.makedirs(videos_dir, exist_ok=True)

    video_filename = f"{unique_id}.mp4"
    output_video_path = os.path.join(videos_dir, video_filename)

    print(f"[Pipeline] ===============================================")
    print(f"[Pipeline] Starting AI Concept Video Pipeline")
    print(f"[Pipeline] Topic: {topic} | Difficulty: {difficulty}")
    print(f"[Pipeline] ===============================================")

    # 1. Lesson Generation
    print(f"[Pipeline] Stage 1/4: Generating Structured AI Educational Lesson...")
    lesson = generate_lesson(topic, difficulty)

    # 2. Scene Visuals Generation
    print(f"[Pipeline] Stage 2/4: Generating High-Definition Scene Visuals ({len(lesson.get('scenes', []))} scenes)...")
    scene_images = generate_scenes_visuals(lesson, scenes_dir)

    # 3. Narration Generation
    print(f"[Pipeline] Stage 3/4: Generating Voice Audio Narration...")
    audio_items = generate_narration_for_lesson(lesson, audio_dir)

    # 4. Rendering Video
    print(f"[Pipeline] Stage 4/4: Assembling and Rendering MP4 Concept Video...")
    final_video = render_concept_video(scene_images, audio_items, output_video_path)

    elapsed = round(time.time() - start_time, 2)
    print(f"[Pipeline] SUCCESS: Completed in {elapsed}s: {final_video}")

    # Relative video URL accessible by frontend
    video_url = f"/generated-videos/{video_filename}"

    return {
        "success": True,
        "topic": topic,
        "difficulty": difficulty,
        "videoUrl": video_url,
        "videoPath": output_video_path,
        "explanation": lesson.get("summary", ""),
        "lesson": lesson,
        "duration_seconds": lesson.get("duration_seconds_estimate", 40),
        "scenes_count": len(lesson.get("scenes", [])),
        "generation_time_seconds": elapsed,
        "source": lesson.get("source", "ai-pipeline")
    }


def main():
    parser = argparse.ArgumentParser(description="Synexora AI Concept Video Generator CLI")
    parser.add_argument("--topic", type=str, default="Binary Search", help="Topic to explain")
    parser.add_argument("--difficulty", type=str, default="beginner", help="beginner, intermediate, advanced")
    args = parser.parse_args()

    result = generate_concept_video(args.topic, args.difficulty)
    print("\n--- JSON OUTPUT ---")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
