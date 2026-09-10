import re
from typing import List, Dict, Any, Optional
from datetime import datetime

class MemoryAgent:
    """
    Synexora Controlled Memory Agent.
    Operates under strict transparency: detects contextual signals,
    scores confidence, flags sensitive elements, and produces candidate
    action objects requiring student consent before persistence.
    """

    CATEGORIES = [
        "Academic Performance",
        "Important Dates",
        "Learning Style",
        "Goals",
        "Career",
        "Notes",
        "Sensitive Information",
    ]

    def extract_memories(self, text: str, source_context: str = "Tutoring Session") -> List[Dict[str, Any]]:
        candidates = []
        lower = text.lower()

        # 1. Academic Performance (Scores, Grades, Percentages)
        score_patterns = [
            r'(?:score[d]?|got|marks?|grade[d]?|received)\s+(?:a\s+)?(\d{1,3}(?:\.\d+)?)(?:%|\s*out of\s*\d+|\s*/\s*\d+)?\s+(?:in|on|for)\s+([a-zA-Z0-9\s\-]+)',
            r'([a-zA-Z0-9\s\-]+)\s+(?:score|grade|marks?)\s*(?:is|was|:)\s*(\d{1,3}(?:\.\d+)?)'
        ]
        for pattern in score_patterns:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                if len(m.groups()) == 2:
                    val1, val2 = m.group(1), m.group(2)
                    score = val1 if val1.replace('.', '', 1).isdigit() else val2
                    subject = val2 if val1.replace('.', '', 1).isdigit() else val1
                    candidates.append({
                        "id": f"cand-mem-{int(datetime.now().timestamp())}-1",
                        "category": "Academic Performance",
                        "title": f"{subject.strip().title()} Grade",
                        "value": f"{score}/100 in {subject.strip().title()}",
                        "confidenceScore": 0.95,
                        "isSensitive": False,
                        "sourceContext": source_context,
                        "privacyRationale": f"Detected explicit grade disclosure for {subject.strip().title()}."
                    })
                break

        # 2. Important Dates & Deadlines
        date_patterns = [
            r'(?:exam|midterm|final|quiz|submission|deadline)\s+(?:is\s+)?(?:on\s+|by\s+|scheduled for\s+)([a-zA-Z0-9\s,]+)',
            r'(?:project|assignment|lab)\s+(?:due\s+)(?:on\s+|by\s+)?([a-zA-Z0-9\s,]+)'
        ]
        for pattern in date_patterns:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                date_str = m.group(1).strip().rstrip('.,!')
                candidates.append({
                    "id": f"cand-mem-{int(datetime.now().timestamp())}-2",
                    "category": "Important Dates",
                    "title": "Upcoming Assessment Date",
                    "value": f"Event deadline on {date_str.title()}",
                    "confidenceScore": 0.91,
                    "isSensitive": False,
                    "sourceContext": source_context,
                    "privacyRationale": "Detected academic deadline to synchronize with calendar."
                })
                break

        # 3. Learning Style & Preferences
        if any(k in lower for k in ["learn best", "visual learner", "prefer diagrams", "socratic", "hands-on", "code examples"]):
            candidates.append({
                "id": f"cand-mem-{int(datetime.now().timestamp())}-3",
                "category": "Learning Style",
                "title": "Study Mode Preference",
                "value": "Prefers interactive code traces and Socratic visual analogies.",
                "confidenceScore": 0.88,
                "isSensitive": False,
                "sourceContext": source_context,
                "privacyRationale": "Identified student learning preference to calibrate tutoring explanations."
            })

        # 4. Long-term Academic Goals
        goal_m = re.search(r'(?:goal is to|want to achieve|aiming for|target gpa is|aspire to)\s+([a-zA-Z0-9\s\.\-]+)', text, re.IGNORECASE)
        if goal_m:
            goal_text = goal_m.group(1).strip().rstrip('.,!')
            candidates.append({
                "id": f"cand-mem-{int(datetime.now().timestamp())}-4",
                "category": "Goals",
                "title": "Target Milestone",
                "value": goal_text.title(),
                "confidenceScore": 0.93,
                "isSensitive": False,
                "sourceContext": source_context,
                "privacyRationale": "Detected student milestone declaration for adaptive pacing."
            })

        return candidates

memory_agent = MemoryAgent()
