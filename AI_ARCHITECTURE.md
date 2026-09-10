# Synexora — AI & Multi-Agent Architecture

> **Synexora — Your Intelligent Student Operating System**

---

## 1. Multi-Agent System Overview

Synexora acts not as a single prompt-wrapper, but as a coordinated network of specialized autonomous AI agents under an **AI Orchestrator**.

```text
                               ┌─────────────────────┐
                               │   Student Prompt    │
                               └──────────┬──────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │   AI ORCHESTRATOR   │
                               │  - Intent Analysis  │
                               │  - Parallel Routing │
                               └──────────┬──────────┘
                                          │
        ┌───────────────────┬─────────────┴───────┬───────────────────┐
        ▼                   ▼                     ▼                   ▼
┌───────────────┐   ┌───────────────┐     ┌───────────────┐   ┌───────────────┐
│ Learning AI   │   │  Memory Agent │     │  Personal AI  │   │  RAG Agent    │
│ - Socratic    │   │ - Entity/Fact │     │ - Task/Plan   │   │ - Dense Vector│
│   Explainer   │   │   Detector    │     │   Extraction  │   │   Search      │
│ - Hint Engine │   │ - Candidate   │     │ - Deadline    │   │ - Grounded    │
│ - Mistake Ana.│   │   Memory Gen  │     │   Synthesis   │   │   Answering   │
└───────┬───────┘   └───────┬───────┘     └───────┬───────┘   └───────┬───────┘
        │                   │                     │                   │
        └───────────────────┴─────────────┬───────┴───────────────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │   Aggregated Output │
                               │  (Response + Cards) │
                               └─────────────────────┘
```

---

## 2. Specialized Agent Definitions

### 2.1 AI Orchestrator (`app/agents/orchestrator.py`)
- **Mission**: Ingest raw student interaction, retrieve active student context (profile, goals, recent mistakes), and dispatch sub-tasks in parallel to specialized agents.
- **Output Assembly**: Combines conversational markdown responses with structured action suggestions (e.g. Memory approval requests, Task addition proposals).

### 2.2 Learning AI Agent (`app/agents/learning_agent.py`)
- **Capabilities**:
  - **Concept Breakdown**: Deconstructs complex topics (e.g., Graph Algorithms, Organic Chemistry) into digestible steps.
  - **Socratic Doubts Solver**: Prompts the student with thought-provoking questions rather than just providing bare answers.
  - **Mistake Diagnostics**: Analyzes failed practice attempts to pinpoint misconceptions.

### 2.3 Memory Agent (`app/agents/memory_agent.py`)
- **Capabilities**:
  - Continuous analysis of student utterances for high-value durable facts.
  - Categorization into `Academic`, `Important Dates`, `Goals`, `Performance`, `Career`, `Sensitive`.
  - Generates transient "Candidate Memories" with confidence scores and explanation justifications.
  - **Strict Principle**: Never auto-commits to the database. Always outputs a candidate payload for frontend confirmation.

### 2.4 Personal Assistant Agent (`app/agents/personal_agent.py`)
- **Capabilities**:
  - Temporal & deadline detection from natural language.
  - Generates recommended task structures with calculated priorities.
  - Proposes contextual reminders and study time blocks based on available calendar slots.

### 2.5 Assessment Agent (`app/agents/assessment_agent.py`)
- **Capabilities**:
  - Generates multi-tier difficulty assessments (Easy -> Medium -> Hard -> Adaptive).
  - Evaluates freeform answers against standard rubrics.
  - Identifies specific conceptual gaps and updates student mastery vectors.

### 2.6 RAG Agent (`app/agents/rag_agent.py`)
- **Capabilities**:
  - Document chunking, vector embedding, and hybrid semantic retrieval.
  - Citation-backed answer generation ensuring answers are strictly grounded in uploaded course materials.

---

## 3. Structured Output Contract

To guarantee frontend render stability, all agent outputs conform to strict Pydantic schemas:

```python
class CandidateMemory(BaseModel):
    category: str
    title: str
    value: str
    confidence: float
    is_sensitive: bool = False

class ProposedTask(BaseModel):
    title: str
    due_date: Optional[str] = None
    priority: str = "MEDIUM"

class SynexoraAIResponse(BaseModel):
    content: str
    suggested_actions: List[str] = []
    proposed_memories: List[CandidateMemory] = []
    proposed_tasks: List[ProposedTask] = []
    sources: List[str] = []
```
