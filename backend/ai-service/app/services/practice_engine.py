import json
import logging
import random
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("practice_engine")

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

CURATED_QUESTION_BANK = [
    {
        "id": "q-dbms-bcnf",
        "subject": "Database Management Systems",
        "topic": "Normalization & BCNF",
        "difficulty": "Medium",
        "format": "mcq",
        "title": "Identifying Normal Forms with Transitive Dependencies",
        "question": "Given relation R(A, B, C, D) with functional dependencies { A -> B, B -> C, C -> D, D -> A }. In which normal form is relation R?",
        "options": [
            "1NF only",
            "2NF only",
            "3NF but not BCNF",
            "BCNF"
        ],
        "correctIndex": 3,
        "explanation": "Since every attribute can derive all other attributes (A->B->C->D->A), each attribute {A}, {B}, {C}, {D} is a candidate key. For every functional dependency X -> Y, X is a superkey, which satisfies Boyce-Codd Normal Form (BCNF).",
        "keyConcept": "BCNF requires every determinant to be a superkey.",
        "hints": [
            "Start by computing the attribute closure for each determinant: A+, B+, C+, and D+.",
            "Notice that every single attribute derives {A, B, C, D}. What does that tell you about candidate keys?",
            "If every determinant X in X -> Y is a candidate key, which highest normal form condition is strictly met?"
        ]
    },
    {
        "id": "q-dsa-dp-coin",
        "subject": "Data Structures & Algorithms",
        "topic": "Dynamic Programming",
        "difficulty": "Hard",
        "format": "code_analysis",
        "title": "Space Optimization in Unbounded Knapsack / Coin Change",
        "question": "Analyze the following Python implementation of the Coin Change Problem (minimum coins to make amount):\n\n```python\ndef coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for x in range(coin, amount + 1):\n            dp[x] = min(dp[x], dp[x - coin] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1\n```\n\nWhat is the time and auxiliary space complexity of this optimized 1D DP solution, where C is the number of coins and A is the target amount?",
        "options": [
            "O(C * A) Time, O(C * A) Space",
            "O(C * A) Time, O(A) Space",
            "O(2^C) Time, O(A) Space",
            "O(C * log A) Time, O(1) Space"
        ],
        "correctIndex": 1,
        "explanation": "The outer loop runs C times (for each coin) and the inner loop runs up to A times, giving O(C * A) runtime. The DP array is only of size (amount + 1), using O(A) auxiliary memory instead of O(C * A) in a standard 2D table.",
        "keyConcept": "1D State Compression for Unbounded Knapsack problems.",
        "hints": [
            "Inspect the size of the `dp` array allocation.",
            "Observe the bounds of the nested loops: outer iterates over `coins`, inner from `coin` up to `amount`.",
            "Since the inner loop reuses results from the same coin iteration in increasing order, auxiliary space depends solely on `amount`."
        ]
    },
    {
        "id": "q-os-deadlock",
        "subject": "Operating Systems",
        "topic": "Concurrency & Deadlocks",
        "difficulty": "Medium",
        "format": "mcq",
        "title": "Coffman Conditions for Deadlock Prevention",
        "question": "Which of the following deadlock prevention strategies directly violates the 'Hold and Wait' Coffman condition?",
        "options": [
            "Imposing a strict total ordering on all resource acquisitions (Resource Ordering).",
            "Requiring processes to request and be allocated all necessary resources at once before execution begins.",
            "Allowing preemptive preemption of CPU registers upon interrupt.",
            "Using atomic Test-and-Set hardware lock primitives."
        ],
        "correctIndex": 1,
        "explanation": "Requiring a process to request all its resources at once prevents it from holding allocated resources while waiting for additional ones, directly neutralizing the 'Hold and Wait' condition.",
        "keyConcept": "Hold and Wait Prevention via All-or-Nothing Resource Allocation.",
        "hints": [
            "Review the four Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
            "Hold and Wait occurs when a process holding at least one resource is currently waiting to acquire other resources.",
            "If a process can only start once 100% of its resources are secured upfront, it never holds while waiting."
        ]
    },
    {
        "id": "q-dist-raft",
        "subject": "Distributed Systems",
        "topic": "Consensus & Raft",
        "difficulty": "Hard",
        "format": "short_answer",
        "title": "Leader Election Safety in Raft Consensus",
        "question": "In Raft consensus, how does the voting protocol guarantee that a candidate node with stale/missing log entries cannot be elected as the new cluster leader?",
        "options": [
            "By relying on a synchronized hardware clock and NTP timestamps.",
            "Candidates include their last log index and term in RequestVote RPCs; peers reject candidates whose log is less up-to-date than their own.",
            "Followers only vote for candidates with the lowest node ID during split votes.",
            "The previous leader must explicitly sign a cryptographic token transferring leadership."
        ],
        "correctIndex": 1,
        "explanation": "Raft's RequestVote RPC includes candidate term and lastLogIndex. A voter denies its vote if the candidate's log is less up-to-date (determined by comparing term of last entry, then log length), guaranteeing the Leader Completeness property.",
        "keyConcept": "Election Restriction ensures the chosen leader contains all committed entries from prior terms.",
        "hints": [
            "Think about what information is exchanged during `RequestVote` RPCs.",
            "How does a follower evaluate whether a candidate's log contains the most recent committed log entries?",
            "Look into Raft's Log Up-to-Date comparison rule (higher term wins; if equal, longer log wins)."
        ]
    },
    {
        "id": "q-ai-backprop",
        "subject": "Artificial Intelligence & ML",
        "topic": "Deep Learning & Optimization",
        "difficulty": "Medium",
        "format": "mcq",
        "title": "Vanishing Gradient in Deep Networks",
        "question": "Why does using the Sigmoid activation function $\\sigma(z) = \\frac{1}{1 + e^{-z}}$ in deep multilayer perceptrons often lead to the vanishing gradient problem during backpropagation?",
        "options": [
            "Its derivative $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$ has a maximum value of 0.25, causing gradients to diminish exponentially as they are multiplied through multiple layers.",
            "The Sigmoid function outputs negative values that cancel out upstream weight updates.",
            "Its derivative is unbounded for large input values, causing numerical overflow.",
            "Sigmoid cannot be computed efficiently with matrix multiplication."
        ],
        "correctIndex": 0,
        "explanation": "Since $\\max(\\sigma'(z)) = 0.25$ (at $z=0$), applying the chain rule multiplies several values $\\le 0.25$ for each layer, causing the gradient signal to shrink exponentially as it propagates back to early layers.",
        "keyConcept": "Chain Rule product of bounded activation derivatives causes exponential gradient attenuation.",
        "hints": [
            "Calculate the maximum value of the derivative $f'(z) = f(z)(1 - f(z))$.",
            "Consider what happens when you multiply numbers strictly less than 0.25 across 10 or 20 hidden layers.",
            "Contrast this behavior with non-saturating activations like ReLU ($f'(z) = 1$ for $z > 0$)."
        ]
    }
]

class PracticeEngine:
    def __init__(self):
        self.client = None
        if GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client for PracticeEngine: {e}")

    def generate_problem(
        self,
        subject: str = "Computer Science",
        topic: Optional[str] = None,
        difficulty: str = "Medium",
        format_type: str = "mcq"
    ) -> Dict[str, Any]:
        """Generates an adaptive practice problem using Gemini or curated bank."""
        if self.client:
            prompt = f"""
            You are Synexora's Adaptive Practice AI Engine.
            Generate a single high-quality academic question for a student studying {subject}{f' (Topic: {topic})' if topic else ''}.
            Difficulty: {difficulty}
            Format: {format_type} (options: 'mcq', 'code_analysis', 'short_answer')

            Return strictly valid JSON with this schema:
            {{
                "id": "q-ai-gen",
                "subject": "{subject}",
                "topic": "{topic or 'Core Concepts'}",
                "difficulty": "{difficulty}",
                "format": "{format_type}",
                "title": "Concise Descriptive Title",
                "question": "Clear problem statement. Include markdown code/math if applicable.",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctIndex": 0,
                "explanation": "Deep conceptual explanation detailing why the correct option is right and others are distractors.",
                "keyConcept": "Key formula, theorem, or axiom to remember.",
                "hints": [
                    "Level 1 Hint: Intuitive conceptual nudge without spoiling.",
                    "Level 2 Hint: Mention the relevant constraint or theoretical relation.",
                    "Level 3 Hint: Point out the key logical deduction step."
                ]
            }}
            """
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.7,
                        response_mime_type="application/json"
                    )
                )
                if response.text:
                    parsed = json.loads(response.text)
                    return parsed
            except Exception as e:
                logger.error(f"Gemini problem generation error: {e}")

        # Fallback to curated question bank matching or random
        matching = [q for q in CURATED_QUESTION_BANK if subject.lower() in q["subject"].lower()]
        if not matching:
            matching = CURATED_QUESTION_BANK
        
        selected = random.choice(matching).copy()
        if difficulty and difficulty != "Adaptive":
            selected["difficulty"] = difficulty
        return selected

    def generate_progressive_hint(
        self,
        problem: Dict[str, Any],
        hint_level: int = 1
    ) -> Dict[str, Any]:
        """Returns progressive level 1, 2, or 3 hint."""
        hints = problem.get("hints", [])
        if not hints:
            hints = [
                "Review the core definitions and problem constraints.",
                "Identify the specific theoretical rule or formula governing this scenario.",
                "Look closely at the edge conditions and candidate answers."
            ]
        
        idx = max(0, min(hint_level - 1, len(hints) - 1))
        return {
            "level": hint_level,
            "maxLevel": len(hints),
            "hint": hints[idx],
            "problemId": problem.get("id")
        }

    def evaluate_submission(
        self,
        problem: Dict[str, Any],
        user_answer: Any,
        user_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Evaluates user answer with deep rubric diagnostics and mastery delta."""
        correct_idx = problem.get("correctIndex", 0)
        is_correct = False

        if isinstance(user_answer, int):
            is_correct = (user_answer == correct_idx)
        elif isinstance(user_answer, str) and str(correct_idx) == user_answer:
            is_correct = True
        elif isinstance(user_answer, str) and problem.get("options"):
            try:
                is_correct = (user_answer.strip() == problem["options"][correct_idx].strip())
            except Exception:
                is_correct = False

        score = 100 if is_correct else 0
        topic = problem.get("topic", "General")
        difficulty = problem.get("difficulty", "Medium")

        # Mastery adjustment calculation
        multiplier = 1.0
        if difficulty == "Easy": multiplier = 0.8
        elif difficulty == "Hard": multiplier = 1.4

        mastery_delta = round(15 * multiplier) if is_correct else round(-8 * multiplier)

        rubric_breakdown = {
            "conceptualAccuracy": 100 if is_correct else 25,
            "logicalReasoning": 100 if is_correct else 40,
            "distractorAwareness": 100 if is_correct else 20,
        }

        feedback = ""
        if is_correct:
            feedback = f"Excellent! You demonstrated solid mastery of {topic}. Your deduction aligns with the standard core principles."
        else:
            feedback = f"Not quite. You encountered a common misconception in {topic}. Review the explanation and key takeaway axiom below."

        return {
            "isCorrect": is_correct,
            "score": score,
            "correctIndex": correct_idx,
            "explanation": problem.get("explanation", "Review the concept fundamentals."),
            "keyConcept": problem.get("keyConcept", "Core theoretical foundation."),
            "masteryDelta": mastery_delta,
            "rubricBreakdown": rubric_breakdown,
            "diagnosticFeedback": feedback,
            "topic": topic
        }

    def generate_assessment(
        self,
        subject: str,
        topics: List[str],
        question_count: int = 5,
        difficulty: str = "Medium",
        duration_minutes: int = 20
    ) -> Dict[str, Any]:
        """Generates a complete structured mock assessment exam."""
        questions = []

        if self.client:
            prompt = f"""
            You are Synexora's Exam Diagnostic AI.
            Generate a balanced {question_count}-question comprehensive examination on {subject}.
            Topics covered: {', '.join(topics) if topics else 'Core Subject Syllabus'}.
            Overall Target Difficulty: {difficulty}.

            Return strictly valid JSON with this schema:
            {{
                "title": "{subject} Comprehensive Diagnostic Assessment",
                "subject": "{subject}",
                "difficulty": "{difficulty}",
                "durationMinutes": {duration_minutes},
                "totalPoints": {question_count * 10},
                "questions": [
                    {{
                        "id": "q1",
                        "title": "Question Title",
                        "topic": "Subtopic",
                        "difficulty": "Medium",
                        "format": "mcq",
                        "points": 10,
                        "question": "Problem statement with code or math formatting if relevant.",
                        "options": ["A", "B", "C", "D"],
                        "correctIndex": 0,
                        "explanation": "Comprehensive solution walkthrough.",
                        "keyConcept": "Takeaway rule"
                    }}
                ]
            }}
            """
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.6,
                        response_mime_type="application/json"
                    )
                )
                if response.text:
                    parsed = json.loads(response.text)
                    return parsed
            except Exception as e:
                logger.error(f"Gemini assessment generation error: {e}")

        # Fallback structured assessment generator
        for i in range(question_count):
            q_template = CURATED_QUESTION_BANK[i % len(CURATED_QUESTION_BANK)].copy()
            q_template["id"] = f"exam-q-{i+1}"
            q_template["points"] = 10
            questions.append(q_template)

        return {
            "title": f"{subject} Diagnostic Examination",
            "subject": subject,
            "difficulty": difficulty,
            "durationMinutes": duration_minutes,
            "totalPoints": question_count * 10,
            "questions": questions
        }

practice_engine = PracticeEngine()
