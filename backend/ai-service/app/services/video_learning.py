import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("video_learning")

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

PRELOADED_VIDEO_LESSONS = [
    {
        "id": "vid-raft-mit",
        "title": "MIT 6.824: Distributed Systems — Raft Consensus Algorithm",
        "subject": "Distributed Systems",
        "duration": "18:45",
        "embedUrl": "https://www.youtube-nocookie.com/embed/vYp4LYbnnW8",
        "description": "Comprehensive walkthrough of Raft leader election, randomized election timeouts, log matching property, and safety invariants.",
        "chapters": [
            {
                "timestamp": "01:15",
                "seconds": 75,
                "title": "State Machine Replication & The Consensus Problem",
                "summary": "Why replicated state machines require deterministic execution and total order logging.",
                "keyTakeaway": "Safety (Leader Completeness) > Liveness in partitioned networks."
            },
            {
                "timestamp": "05:30",
                "seconds": 330,
                "title": "Raft Leader Election & Randomized Heartbeat Timeouts",
                "summary": "How randomized timeouts (150ms-300ms) prevent split-vote deadlocks.",
                "keyTakeaway": "Followers increment term and vote for at most one candidate per term."
            },
            {
                "timestamp": "11:40",
                "seconds": 700,
                "title": "Log Replication & Log Matching Invariant",
                "summary": "AppendEntries RPC consistency checks and leader overriding uncommitted conflicting entries.",
                "keyTakeaway": "Entries are committed once replicated across a strict majority (Quorum)."
            },
            {
                "timestamp": "15:20",
                "seconds": 920,
                "title": "Election Restriction & Byzantine Safety Guarantees",
                "summary": "Voters deny vote if candidate's log is less up-to-date than their own.",
                "keyTakeaway": "Leader never overwrites its own log entries."
            }
        ],
        "checkpoints": [
            {
                "id": "cp-1",
                "timestamp": "06:15",
                "seconds": 375,
                "question": "What is the primary architectural purpose of using randomized election timeouts in Raft?",
                "options": [
                    "To ensure cryptographic randomness in node token generation.",
                    "To drastically reduce the probability of split votes among candidate nodes.",
                    "To dynamically adjust to fluctuating internet bandwidth.",
                    "To conserve CPU clock cycles on follower nodes."
                ],
                "correctIndex": 1,
                "explanation": "Randomized timeouts spread out when followers transition to candidates, allowing one node to quickly timeout and collect a majority of votes before others."
            },
            {
                "id": "cp-2",
                "timestamp": "12:50",
                "seconds": 770,
                "question": "When is an entry in a Raft leader's log considered safely committed?",
                "options": [
                    "As soon as the leader receives the write request from a client.",
                    "When all nodes in the cluster acknowledge the entry.",
                    "Once replicated on a strict majority (Quorum) of cluster servers.",
                    "After a 5-second fixed buffer window."
                ],
                "correctIndex": 2,
                "explanation": "Quorum replication ensures at least one node in any subsequent election majority contains the committed entry."
            }
        ]
    },
    {
        "id": "vid-bplus-berkeley",
        "title": "UC Berkeley CS186: B+ Tree Storage & Indexing Fundamentals",
        "subject": "Database Management Systems",
        "duration": "15:20",
        "embedUrl": "https://www.youtube-nocookie.com/embed/aZjYr87r1b8",
        "description": "Deep dive into multi-level index structures, internal routing nodes vs leaf pages, and balanced logarithmic search costs.",
        "chapters": [
            {
                "timestamp": "00:45",
                "seconds": 45,
                "title": "Why Disk I/O Dictates Database Tree Architecture",
                "summary": "Contrast between binary search trees (too deep, high I/O) and high-fanout B+ trees.",
                "keyTakeaway": "Fanout of 100+ keeps tree height $\\le 3$ for millions of records."
            },
            {
                "timestamp": "06:10",
                "seconds": 370,
                "title": "Leaf Page Structure & Doubly Linked Pointers",
                "summary": "Leaf nodes store actual record IDs and are linked for sequential range scans.",
                "keyTakeaway": "Range queries do not require re-traversing from the root."
            },
            {
                "timestamp": "10:50",
                "seconds": 650,
                "title": "Node Splitting & Overflow Handling during Insert",
                "summary": "When a page exceeds capacity $2d$, it splits into two nodes of size $d$ and copies/pushes the middle key up.",
                "keyTakeaway": "B+ Trees grow from the bottom up by splitting the root."
            }
        ],
        "checkpoints": [
            {
                "id": "cp-b1",
                "timestamp": "07:30",
                "seconds": 450,
                "question": "Why are the leaf pages of a B+ Tree connected with doubly-linked pointers?",
                "options": [
                    "To enable fast point lookups using binary search.",
                    "To allow efficient bidirectional sequential range scans without root re-traversal.",
                    "To prevent pages from being paged out of the buffer pool.",
                    "To enforce write-ahead logging atomicity."
                ],
                "correctIndex": 1,
                "explanation": "Doubly linked leaf pages let SQL queries like `WHERE age BETWEEN 20 AND 30` find the starting key once, then scan linearly across leaves."
            }
        ]
    }
]

class VideoLearningEngine:
    def __init__(self):
        self.client = None
        if GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client for VideoLearning: {e}")

    def process_video_transcript(
        self,
        video_url: str,
        transcript_text: str,
        subject: str = "Computer Science"
    ) -> Dict[str, Any]:
        """Segments video transcript into timestamped chapters, key takeaways, and in-video checkpoint quizzes."""
        if self.client and len(transcript_text.strip()) > 30:
            prompt = f"""
            You are Synexora's Video & Media Learning AI Engine.
            Analyze the following lecture video transcript on {subject}:
            Transcript:
            "{transcript_text}"

            Return strictly valid JSON with this schema:
            {{
                "title": "Generated Lecture Title",
                "subject": "{subject}",
                "duration": "15:00",
                "embedUrl": "{video_url}",
                "description": "Concise summary of video content.",
                "chapters": [
                    {{
                        "timestamp": "01:30",
                        "seconds": 90,
                        "title": "Chapter Title",
                        "summary": "Detailed conceptual summary.",
                        "keyTakeaway": "Formula / Axiom"
                    }}
                ],
                "checkpoints": [
                    {{
                        "id": "cp-1",
                        "timestamp": "04:00",
                        "seconds": 240,
                        "question": "Diagnostic question testing comprehension of the preceding chapter.",
                        "options": ["A", "B", "C", "D"],
                        "correctIndex": 0,
                        "explanation": "Why the correct option is right."
                    }}
                ]
            }}
            """
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.5,
                        response_mime_type="application/json"
                    )
                )
                if response.text:
                    return json.loads(response.text)
            except Exception as e:
                logger.error(f"Gemini video transcript processing error: {e}")

        # Fallback or curated
        for lesson in PRELOADED_VIDEO_LESSONS:
            if subject.lower() in lesson["subject"].lower():
                return lesson.copy()
        
        return PRELOADED_VIDEO_LESSONS[0].copy()

    def get_preloaded_lessons(self) -> List[Dict[str, Any]]:
        return PRELOADED_VIDEO_LESSONS

video_learning_engine = VideoLearningEngine()
