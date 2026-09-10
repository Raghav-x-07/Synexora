# Synexora — Product Roadmap & Phase Execution Plan

> **Synexora — Your Intelligent Student Operating System**  
> Core Philosophy: **Teach. Remember. Plan. Adapt.**

---

## Development Phases

### ✅ PHASE 0: Architecture + Repository Foundation (CURRENT)
- Set up directory foundation (`front end/`, `backed/`, `spring-api/`, `ai-service/`).
- Create root architecture documentation: `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `AI_ARCHITECTURE.md`, `RAG_ARCHITECTURE.md`, `MEMORY_ARCHITECTURE.md`, `SECURITY.md`, `DEVELOPMENT.md`, `ROADMAP.md`.
- Establish runnable frontend Next.js base, Spring Boot API scaffold, and FastAPI AI service scaffold.
- Provide zero-friction npm commands: `cd "front end" && npm run dev` and `cd backed && npm run dev`.

---

### ⏳ PHASE 1: Frontend Foundation + Synexora UI Design System
- Comprehensive modern design tokens in `index.css` / Tailwind: Dark luxury aesthetic, glassmorphism, glowing accents, modern typography.
- Core shell layout: Sidebar navigation (Dashboard, AI Tutor, Personal AI, RAG Knowledge Base, Memories, Notes, Tasks, Calendar, Practice, Assessments, Progress, Diary, Analytics, Profile, Settings).
- Synexora branding: Hero identity, status indicators, quick stats overview.
- Reusable component architecture: Buttons, Modals, Action Cards (Candidate Memory Card, Task Suggestion Card), Badges, Metric Tiles.

---

### ⏳ PHASE 2: Spring Boot + Database + Authentication
- Spring Boot 3 + Spring Security 6 + JWT.
- User registration, login, token refresh, and role-based authorization.
- JPA Entities & Repositories: User, Profile, Task, Note, Memory, CalendarEvent, Assessment.
- Database migrations and seed data for local development.

---

### ⏳ PHASE 3: Dashboard + Tasks + Reminders + Calendar + Notes + Goals
- Full CRUD API & UI integration for student productivity modules.
- Dynamic calendar view with deadline visualization.
- Contextual notes editor with AI suggestion placeholders.
- Goal tracking and active task kanban/list views.

---

### ⏳ PHASE 4: Learning AI
- Socratic AI Tutor interactive chat interface with streaming responses.
- Step-by-step concept explainer, doubt solver, and hint generation.
- Real-time LaTeX math rendering and syntax-highlighted code execution blocks.

---

### ⏳ PHASE 5: RAG (Retrieval-Augmented Generation)
- Document upload pipeline (PDFs, lecture notes, textbook chapters).
- Semantic chunking and vector storage with ChromaDB.
- Grounded document Q&A with verifiable page/chunk citations.
- Automatic flashcard and revision sheet synthesis from uploaded materials.

---

### ⏳ PHASE 6: Memory Agent + Controlled Memory Protocol
- Memory Agent entity extraction in conversational streams.
- Interactive candidate memory notification cards (*Save*, *Edit*, *Ignore*).
- Full Memory Management Hub: Search, categorize, modify, or delete memories.
- Contextual memory injection into future AI interactions.

---

### ⏳ PHASE 7: Practice Engine + Assessments + Progress
- Dynamic multi-level question generation (Easy -> Medium -> Hard).
- Automated answer evaluation with instant rubric-based grading.
- Weakness detection and mastery radar chart tracking.

---

### ⏳ PHASE 8: Adaptive Learning + Intelligent Scheduling
- Personalized learning path generation adapted to student goals, deadlines, and weak areas.
- Intelligent scheduler calculating optimal study slots around actual calendar commitments.
- Context-rich smart reminders (e.g. reminding about pending Graph practice before the DSA assessment).

---

### ⏳ PHASE 9: AI Diary + Academic Analytics
- Daily study reflection logger with sentiment & focus tracking.
- Weekly automated synthesis: Strongest subjects, study consistency, study hour breakdown, actionable growth tips.

---

### ⏳ PHASE 10: Advanced Agent Orchestration
- Autonomous cross-agent collaboration (Orchestrator coordinating Learning, Memory, Personal, and Assessment agents).
- Multi-turn planning and proactive intervention engine.

---

### ⏳ PHASE 11: Video & Media Learning
- Video transcript ingestion, timestamped note taking, and video quiz generation.

---

### ⏳ PHASE 12: Security Hardening, Testing & Performance Optimization
- End-to-end integration tests, rate limiting, token rotation, and bundle optimization.

---

### ⏳ PHASE 13: Final Hackathon Demo Polish
- Live demo workflows, sample student profiles, pre-loaded academic data, and showcase presentation readiness.
