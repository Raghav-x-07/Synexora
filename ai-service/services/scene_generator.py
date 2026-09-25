"""
Scene Generator for Synexora AI Concept Video.
Generates rich, high-resolution educational slide visuals for each scene in the lesson.
Renders clean typography, color-coded badges, visual element cards, and highlight callout boxes.
"""

import os
import sys
import re
from typing import Dict, Any, List
from PIL import Image, ImageDraw, ImageFont

# Dimensions for high-definition 16:9 video frame
WIDTH = 1280
HEIGHT = 720

# Color Palette
BG_DARK = (15, 23, 42)          # Slate 900
BG_CARD = (30, 41, 59)          # Slate 800
BG_CARD_BORDER = (51, 65, 85)   # Slate 700
ACCENT_GREEN = (16, 185, 129)   # Emerald 500
ACCENT_CYAN = (6, 182, 212)     # Cyan 500
ACCENT_PURPLE = (168, 85, 247)  # Purple 500
ACCENT_AMBER = (245, 158, 11)   # Amber 500
TEXT_WHITE = (248, 250, 252)    # Slate 50
TEXT_MUTED = (148, 163, 184)    # Slate 400
TEXT_DARK = (15, 23, 42)


def get_font(size: int, bold: bool = False):
    """Load clean system font or fallback to default."""
    font_names = [
        "arialbd.ttf" if bold else "arial.ttf",
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "calibrib.ttf" if bold else "calibri.ttf",
        "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf",
    ]
    for name in font_names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            pass
    return ImageFont.load_default()


def draw_rounded_rect(draw: ImageDraw.ImageDraw, coords, radius: int, fill, outline=None, width=1):
    """Draw a smooth rounded rectangle."""
    draw.rounded_rectangle(coords, radius=radius, fill=fill, outline=outline, width=width)


def render_scene_image(
    topic: str,
    scene_data: Dict[str, Any],
    scene_idx: int,
    total_scenes: int,
    output_path: str,
    difficulty: str = "beginner"
) -> str:
    """
    Renders a single educational slide image for a scene.
    """
    img = Image.new("RGB", (WIDTH, HEIGHT), color=BG_DARK)
    draw = ImageDraw.Draw(img)

    # 1. Subtle background glow / decorative gradient header
    for y in range(0, 8):
        draw.line([(0, y), (WIDTH, y)], fill=ACCENT_GREEN)

    # 2. Header Bar
    # Synexora Badge
    draw_rounded_rect(draw, (40, 25, 210, 58), radius=6, fill=(16, 185, 129, 40), outline=ACCENT_GREEN, width=1)
    font_brand = get_font(16, bold=True)
    draw.text((55, 32), "SYNEXORA AI", fill=ACCENT_GREEN, font=font_brand)

    # Topic & Difficulty Badge
    font_topic_badge = get_font(15, bold=True)
    draw_rounded_rect(draw, (225, 25, 520, 58), radius=6, fill=BG_CARD, outline=BG_CARD_BORDER, width=1)
    draw.text((240, 32), f"{topic} • {difficulty.upper()}", fill=TEXT_MUTED, font=font_topic_badge)

    # Scene Progress Pill
    progress_text = f"Scene {scene_idx} of {total_scenes}"
    font_prog = get_font(15, bold=True)
    draw_rounded_rect(draw, (WIDTH - 210, 25, WIDTH - 40, 58), radius=6, fill=(6, 182, 212, 30), outline=ACCENT_CYAN, width=1)
    draw.text((WIDTH - 192, 32), progress_text, fill=ACCENT_CYAN, font=font_prog)

    # 3. Main Scene Title
    scene_title = scene_data.get("title", f"Scene {scene_idx}")
    font_title = get_font(32, bold=True)
    draw.text((40, 85), scene_title, fill=TEXT_WHITE, font=font_title)

    # Scene Sub-explanation
    explanation = scene_data.get("explanation", "")
    font_sub = get_font(17, bold=False)
    # Line wrapper for explanation
    words = explanation.split()
    wrapped_lines = []
    current_line = []
    for w in words:
        current_line.append(w)
        if len(" ".join(current_line)) > 80:
            wrapped_lines.append(" ".join(current_line))
            current_line = []
    if current_line:
        wrapped_lines.append(" ".join(current_line))

    y_text = 130
    for line in wrapped_lines[:3]:
        draw.text((40, y_text), line, fill=TEXT_MUTED, font=font_sub)
        y_text += 23

    # 4. Left Column: Visual Elements & Step Cards
    visual_elements: List[str] = scene_data.get("visual_elements", [])
    if not visual_elements:
        visual_elements = ["Core Concept Overview", "Operational Logic", "Verified Result"]

    left_box = (40, 205, 760, 560)
    draw_rounded_rect(draw, left_box, radius=12, fill=BG_CARD, outline=BG_CARD_BORDER, width=1)

    # Left Box Header
    font_card_hdr = get_font(17, bold=True)
    draw.text((65, 222), "CORE MECHANICS & STEP BREAKDOWN", fill=ACCENT_CYAN, font=font_card_hdr)

    # Visual Elements items
    elem_y = 265
    font_elem = get_font(16, bold=False)
    font_elem_bold = get_font(16, bold=True)
    colors = [ACCENT_GREEN, ACCENT_CYAN, ACCENT_PURPLE, ACCENT_AMBER]

    for i, elem in enumerate(visual_elements[:4]):
        dot_color = colors[i % len(colors)]
        # Item container
        draw_rounded_rect(draw, (65, elem_y - 6, 735, elem_y + 48), radius=8, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        # Number badge
        draw_rounded_rect(draw, (75, elem_y - 1, 105, elem_y + 38), radius=6, fill=dot_color)
        draw.text((84, elem_y + 7), str(i + 1), fill=TEXT_DARK, font=font_elem_bold)
        # Element text
        clean_elem = elem[:72] + ("..." if len(elem) > 72 else "")
        draw.text((120, elem_y + 8), clean_elem, fill=TEXT_WHITE, font=font_elem)
        elem_y += 66

    # 5. Right Column: Visual Diagram / Animation Box
    right_box = (785, 205, WIDTH - 40, 560)
    draw_rounded_rect(draw, right_box, radius=12, fill=(24, 33, 47), outline=(6, 182, 212), width=1)

    # Diagram Header
    draw.text((810, 225), "VISUAL SIMULATION", fill=ACCENT_GREEN, font=font_card_hdr)

    # Center Diagram graphic simulation
    visual_type = scene_data.get("visual_type", "diagram")
    font_desc = get_font(15, bold=False)

    # Interactive visual graphic representation inside right box
    center_x = (785 + WIDTH - 40) // 2
    center_y = 350

    # Draw symbolic diagram based on visual type
    if visual_type == "diagram":
        # Draw connected nodes
        node1 = (center_x - 130, center_y - 40, center_x - 30, center_y + 30)
        node2 = (center_x + 30, center_y - 40, center_x + 130, center_y + 30)
        draw_rounded_rect(draw, node1, radius=8, fill=ACCENT_GREEN)
        draw_rounded_rect(draw, node2, radius=8, fill=ACCENT_CYAN)
        draw.text((center_x - 110, center_y - 12), "Input", fill=TEXT_DARK, font=font_elem_bold)
        draw.text((center_x + 45, center_y - 12), "Process", fill=TEXT_DARK, font=font_elem_bold)
        # Connecting line & arrow
        draw.line([(center_x - 30, center_y - 5), (center_x + 30, center_y - 5)], fill=TEXT_WHITE, width=3)
    elif visual_type == "comparison":
        draw_rounded_rect(draw, (center_x - 150, center_y - 45, center_x - 10, center_y + 40), radius=8, fill=(239, 68, 68, 60), outline=(239, 68, 68), width=1)
        draw_rounded_rect(draw, (center_x + 10, center_y - 45, center_x + 150, center_y + 40), radius=8, fill=(16, 185, 129, 60), outline=(16, 185, 129), width=1)
        draw.text((center_x - 120, center_y - 10), "Before / Slow", fill=TEXT_WHITE, font=font_desc)
        draw.text((center_x + 35, center_y - 10), "After / Fast", fill=TEXT_WHITE, font=font_desc)
    else:
        # Default step flow representation
        for idx_step, sx in enumerate([-120, 0, 120]):
            pos = (center_x + sx - 40, center_y - 30, center_x + sx + 40, center_y + 30)
            draw_rounded_rect(draw, pos, radius=6, fill=ACCENT_CYAN if idx_step == 1 else BG_CARD, outline=ACCENT_GREEN if idx_step == 1 else BG_CARD_BORDER, width=1)
            draw.text((center_x + sx - 22, center_y - 12), f"Step {idx_step + 1}", fill=TEXT_WHITE if idx_step != 1 else TEXT_DARK, font=font_desc)

    # Visual note below simulation
    visual_desc = scene_data.get("visual", "Educational step illustration")
    clean_vdesc = visual_desc[:90] + ("..." if len(visual_desc) > 90 else "")
    draw.text((810, 480), "Visual Note:", fill=TEXT_MUTED, font=font_desc)
    draw.text((810, 505), clean_vdesc, fill=TEXT_WHITE, font=font_desc)

    # 6. Bottom Highlight Callout Box
    highlight_text = scene_data.get("highlight_box", f"Takeaway for {topic}")
    bot_box = (40, 580, WIDTH - 40, 685)
    draw_rounded_rect(draw, bot_box, radius=10, fill=(16, 185, 129, 30), outline=ACCENT_GREEN, width=1)

    font_hl_tag = get_font(14, bold=True)
    draw_rounded_rect(draw, (60, 595, 200, 625), radius=5, fill=ACCENT_GREEN)
    draw.text((72, 602), "KEY TAKEAWAY", fill=TEXT_DARK, font=font_hl_tag)

    font_hl = get_font(18, bold=True)
    draw.text((220, 600), highlight_text[:85], fill=TEXT_WHITE, font=font_hl)

    # Save to file
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    return output_path


def generate_scenes_visuals(lesson: Dict[str, Any], output_dir: str) -> List[str]:
    """
    Takes the structured lesson and generates an image for every scene.
    Returns list of generated image filepaths.
    """
    os.makedirs(output_dir, exist_ok=True)
    topic = lesson.get("topic", "Concept")
    difficulty = lesson.get("difficulty", "beginner")
    scenes = lesson.get("scenes", [])
    total = len(scenes)

    image_paths = []
    for idx, sc in enumerate(scenes, start=1):
        filename = f"scene_{idx}.png"
        filepath = os.path.join(output_dir, filename)
        render_scene_image(
            topic=topic,
            scene_data=sc,
            scene_idx=idx,
            total_scenes=total,
            output_path=filepath,
            difficulty=difficulty
        )
        image_paths.append(filepath)

    return image_paths


if __name__ == "__main__":
    from lesson_generator import generate_lesson
    sample = generate_lesson("Binary Search", "beginner")
    out_dir = os.path.join(os.path.dirname(__file__), "..", "generated", "scenes", "test_binary_search")
    res = generate_scenes_visuals(sample, out_dir)
    print(f"Generated {len(res)} scenes in: {out_dir}")
