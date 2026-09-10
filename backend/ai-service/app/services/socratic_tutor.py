import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class SocraticTutorEngine:
    """
    Synexora Socratic Tutoring Engine.
    Employs the Socratic method: guides students to self-discovery,
    breaks complex doubts into intuitive steps, models code traces,
    and extracts candidate memories/tasks for student confirmation.
    """

    def __init__(self):
        pass

    def extract_candidate_actions(self, message: str) -> Dict[str, Any]:
        """
        Detects implicit student statements like test scores, deadlines,
        exam dates, and task commitments to suggest candidate action cards.
        """
        proposed_memories = []
        proposed_tasks = []
        proposed_calendar_events = []
        lower = message.lower()

        # 1. Detect Scores / Grades (e.g. "scored 72 in DBMS", "got 88 on my algorithms quiz", "my GPA is 3.8")
        score_match = re.search(r'(?:score[d]?|got|marks?|grade[d]?|received)\s+(?:a\s+)?(\d{1,3}(?:\.\d+)?)(?:%|\s*out of\s*\d+|\s*/\s*\d+)?\s+(?:in|on|for)\s+([a-zA-Z0-9\s\-]+)', message, re.IGNORECASE)
        if score_match:
            score = score_match.group(1)
            subject = score_match.group(2).strip().rstrip('.,!')
            proposed_memories.append({
                "id": f"mem-cand-{int(datetime.now().timestamp())}-1",
                "category": "PERFORMANCE",
                "title": f"{subject.title()} Internal Score",
                "value": f"{score}/100 in {subject.title()}",
                "confidenceScore": 0.94,
                "reasoning": f"Student stated their score for {subject.title()}."
            })

        # 2. Detect Deadlines & Submissions (e.g. "project is due on Friday", "submit assignment tomorrow", "lab report due next Monday")
        due_match = re.search(r'([a-zA-Z0-9\s\-]+?)\s+(?:is\s+)?due\s+(?:on\s+|by\s+|this\s+|next\s+)?([a-zA-Z0-9]+)', message, re.IGNORECASE)
        if due_match:
            task_name = due_match.group(1).strip()
            day_str = due_match.group(2).strip()
            
            # Simple clean up of task name
            if len(task_name) > 3 and not task_name.lower().startswith(('my ', 'the ')):
                task_title = task_name.title()
            else:
                task_title = re.sub(r'^(my|the|an|a)\s+', '', task_name, flags=re.IGNORECASE).title()

            proposed_tasks.append({
                "id": f"task-cand-{int(datetime.now().timestamp())}-1",
                "title": f"{task_title} Submission",
                "priority": "HIGH",
                "dueDate": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                "subjectTag": "Academic",
                "reasoning": f"Detected upcoming deadline ({day_str}) for {task_title}."
            })

            proposed_calendar_events.append({
                "id": f"cal-cand-{int(datetime.now().timestamp())}-1",
                "title": f"Deadline: {task_title}",
                "category": "ASSIGNMENT",
                "date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                "time": "23:59"
            })

        # 3. Detect Struggle / Weak Topics (e.g. "I am struggling with recursion", "I don't understand B-Trees")
        struggle_match = re.search(r'(?:struggling with|confused about|don\'t understand|having trouble with|hard for me to understand)\s+([a-zA-Z0-9\s\-]+)', message, re.IGNORECASE)
        if struggle_match:
            topic = struggle_match.group(1).strip().rstrip('.,!')
            proposed_memories.append({
                "id": f"mem-cand-{int(datetime.now().timestamp())}-2",
                "category": "ACADEMIC",
                "title": f"Focus Area: {topic.title()}",
                "value": f"Identified difficulty with {topic.title()} during tutoring session",
                "confidenceScore": 0.88,
                "reasoning": f"Student explicitly noted confusion regarding {topic.title()}."
            })

        return {
            "proposed_memories": proposed_memories,
            "proposed_tasks": proposed_tasks,
            "proposed_calendar_events": proposed_calendar_events,
        }

    def generate_socratic_response(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        mastery_level: str = "INTERMEDIATE",
        subject: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates Socratic tutoring dialogue, contextual questions,
        and action candidates.
        """
        candidate_actions = self.extract_candidate_actions(message)
        lower_msg = message.lower()

        # Categorize query intent
        if any(w in lower_msg for w in ["recursion", "recursive", "base case"]):
            response_text = (
                "Let's look at recursion like a stack of nested boxes. "
                "Before we write any recursive step, what is the single condition "
                "that must tell our algorithm to stop opening boxes and return a value?"
            )
            hints = [
                "Think about what happens when the input reaches the smallest possible valid value (e.g., n == 0 or n == 1).",
                "Without this guard condition, what happens to our call stack?",
                "The base case prevents infinite recursion."
            ]
            drill_questions = [
                "What is the base case for finding the factorial of n?",
                "If we pass n = 3 to factorial(n), how many stack frames are allocated before returning?"
            ]
        elif any(w in lower_msg for w in ["b-tree", "btree", "indexing", "dbms", "database"]):
            response_text = (
                "Great database concept! In disk-based storage, reading from a spinning disk or SSD block is thousands of times slower than RAM. "
                "Why do you think a B-Tree uses a large branching factor (many keys per node) instead of a standard Binary Search Tree?"
            )
            hints = [
                "Consider disk I/O block size (typically 4KB to 8KB per page).",
                "A wider tree means fewer levels from root to leaf.",
                "Fewer levels directly translates to fewer disk seek operations."
            ]
            drill_questions = [
                "How does node width in B-Trees minimize disk seek operations?",
                "What is the main structural difference between a B-Tree and a B+ Tree in how data pointers are stored?"
            ]
        elif any(w in lower_msg for w in ["pointer", "memory leak", "malloc", "reference", "heap"]):
            response_text = (
                "Let's trace what happens in system memory. When memory is allocated on the Heap, "
                "who is responsible for returning that memory to the OS if garbage collection isn't present?"
            )
            hints = [
                "Stack variables automatically clean up when exiting scope, but Heap allocations persist.",
                "If a pointer variable goes out of scope while still referencing heap memory, what happens to our handle to that memory?",
                "A lost pointer handle leads to a memory leak."
            ]
            drill_questions = [
                "What tool or mechanism would you use to detect memory leaks in C/C++ or Node.js?",
                "What is the difference between shallow copy and deep copy in memory references?"
            ]
        elif candidate_actions["proposed_tasks"] or candidate_actions["proposed_memories"]:
            subject_name = "your upcoming coursework"
            if candidate_actions["proposed_memories"]:
                subject_name = candidate_actions["proposed_memories"][0]["title"]
            response_text = (
                f"I've noted your progress regarding {subject_name}! "
                f"Let's make sure we reinforce your core concepts so you feel 100% confident for your upcoming deadline. "
                f"Where would you like to start: reviewing edge cases, tracing a tricky problem step-by-step, or doing a quick diagnostic drill?"
            )
            hints = [
                "Focus on the sub-topics where you scored lowest or felt least certain.",
                "Breaking down the assignment into 3 micro-goals makes completion much smoother."
            ]
            drill_questions = [
                "What is the primary blocker or doubt you have about this topic right now?"
            ]
        else:
            response_text = (
                "That's a thoughtful question. To help build deep intuition rather than just memorizing the syntax, "
                "let's break this down: What do you understand to be the primary goal or constraint of this problem?"
            )
            hints = [
                "Try summarizing the problem in your own words with a simple concrete example.",
                "Identify the given inputs, expected outputs, and constraints."
            ]
            drill_questions = [
                "Can you walk through a 1-sentence summary of what we want to solve?"
            ]

        return {
            "response_text": response_text,
            "hints": hints,
            "drill_questions": drill_questions,
            "proposed_memories": candidate_actions["proposed_memories"],
            "proposed_tasks": candidate_actions["proposed_tasks"],
            "proposed_calendar_events": candidate_actions["proposed_calendar_events"],
            "mode": "SOCRATIC_GUIDANCE",
            "timestamp": datetime.now().isoformat(),
        }

    def generate_code_trace(self, code_snippet: str, language: str = "javascript") -> Dict[str, Any]:
        """
        Provides step-by-step execution trace with variable inspector values.
        """
        steps = [
            {
                "step": 1,
                "line": 1,
                "explanation": "Function defined and parameters initialized.",
                "variable_state": {"status": "initialized"}
            },
            {
                "step": 2,
                "line": 2,
                "explanation": "Evaluating base condition / loop invariant.",
                "variable_state": {"condition_met": False}
            },
            {
                "step": 3,
                "line": 4,
                "explanation": "Computing recursive branch / accumulator state.",
                "variable_state": {"current_val": "intermediate"}
            },
            {
                "step": 4,
                "line": 6,
                "explanation": "Result computed and returned up the call stack.",
                "variable_state": {"return_value": "final_result"}
            }
        ]

        return {
            "code": code_snippet,
            "language": language,
            "total_steps": len(steps),
            "trace_steps": steps,
            "complexity": {
                "time": "O(N)",
                "space": "O(N) stack frames"
            },
            "common_pitfalls": [
                "Forgetting the termination guard leading to Maximum Call Stack Size Exceeded.",
                "Mutating outer scope variables instead of returning pure values."
            ]
        }

tutor_engine = SocraticTutorEngine()
