# Synexora — System Architecture Blueprint

> **Synexora — Your Intelligent Student Operating System**  
> Core Philosophy: **Teach. Remember. Plan. Adapt.**

---

## 1. Executive Architectural Overview

Synexora is architected as a modular, event-aware, decoupled intelligence platform that bridges a high-performance interactive web interface with an enterprise business backend and an autonomous AI multi-agent orchestration cluster.

```
┌────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                                │
│   Synexora Next.js 14 App Router + Tailwind CSS + TypeScript            │
│   (Port 3000)                                                          │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ HTTPS / JSON                    │ Stream / SSE / WS
                   ▼                                 ▼
┌──────────────────────────────────────┐   ┌─────────────────────────────┐
│          SPRING BOOT API             │   │      FASTAPI AI ENGINE      │
│   Primary REST, Auth, Business Data  │◄─►│   Multi-Agent & RAG Hub     │
│   (Port 8080)                        │   │   (Port 8000)               │
└──────────────────┬───────────────────┘   └──────────────┬──────────────┘
                   │                                      │
                   ▼                                      ▼
┌──────────────────────────────────────┐   ┌─────────────────────────────┐
│          POSTGRESQL / H2             │   │      VECTOR DB (CHROMA)     │
│   User profiles, tasks, notes,       │   │   Chunk embeddings, RAG     │
│   memories, schedules, assessments   │   │   document indexes          │
└──────────────────────────────────────┘   └─────────────────────────────┘
```

---

## 2. Layered Responsibilities

### 2.1 Frontend (`front end/`)
- **Technology**: Next.js 14 (App Router), React 18/19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion.
- **Role**: Delivers an ultra-responsive, dark-luxury glassmorphism dashboard and dedicated module interfaces.
- **Key Modules**:
  - `Dashboard`: Consolidated student metrics, agenda, AI suggestions, and active learning paths.
  - `AI Tutor`: Interactive Socratic dialogue, code explanation, doubt breakdown.
  - `Personal AI & Planner`: Contextual calendar, deadline planner, study schedule generator.
  - `RAG Knowledge Base`: Multi-format document upload, chunk viewer, grounded study engine.
  - `Controlled Memory Hub`: Interactive memory cards with *Save / Edit / Ignore* confirmation controls.
  - `Intelligent Notes`: Manual & AI-synthesized note taking with bidirectional linking.
  - `Practice & Assessments`: Adaptive quizzes, weakness detection, mistake analysis.
  - `AI Diary & Analytics`: Daily student reflections, performance trends, sentiment & consistency metrics.

### 2.2 Core Business Backend (`backed/spring-api/`)
- **Technology**: Java 17+, Spring Boot 3.x, Spring Security 6, Spring Data JPA, PostgreSQL / H2, JWT.
- **Role**: Single source of truth for student identity, persistent state, permissions, and business logic.
- **Key Responsibilities**:
  - User Authentication, JWT issuance, and RBAC authorization.
  - CRUD operations for Tasks, Reminders, Notes, Calendar Events, Goals, and Diaries.
  - Persistence of confirmed Memories and Student Profiles.
  - Audit logging, rate limiting, and secure communication gateway with the AI Engine.

### 2.3 AI & Intelligence Backend (`backed/ai-service/`)
- **Technology**: Python 3.10+, FastAPI, LangChain / LlamaIndex / LangGraph, Pydantic v2, ChromaDB / FAISS, OpenAI / Gemini / Anthropic SDKs.
- **Role**: Coordinates autonomous AI agents, semantic retrieval, embeddings, and prompt orchestration.
- **Key Responsibilities**:
  - **AI Orchestrator**: Intent routing across sub-agents.
  - **Learning Agent**: Step-by-step Socratic teaching & explanation engine.
  - **Memory Agent**: Non-intrusive extraction of facts with candidate memory payload generation.
  - **Personal Assistant Agent**: Schedule optimization, task extraction, and deadline impact assessment.
  - **Assessment Agent**: Dynamic question synthesis and diagnostic evaluations.
  - **RAG Agent**: Document ingestion, semantic chunking, dense vector indexing, and grounded generation.

---

## 3. Communication Protocols

| Route | Origin | Destination | Protocol | Purpose |
|---|---|---|---|---|
| `/api/v1/auth/*` | Frontend | Spring Boot | HTTPS REST | Authentication & Token Management |
| `/api/v1/app/*` | Frontend | Spring Boot | HTTPS REST | Student CRUD (Tasks, Notes, Calendar) |
| `/api/v1/ai/chat` | Frontend | FastAPI | SSE / WebSocket | Streaming AI Tutor conversations |
| `/api/v1/ai/rag/*` | Frontend | FastAPI | HTTPS Multipart | Document upload, indexing & retrieval |
| `/internal/v1/*` | Spring Boot | FastAPI | HTTP REST / HMAC | Server-to-server agent triggers |
| `/internal/v1/memories` | FastAPI | Spring Boot | HTTP REST / HMAC | Forwarding approved memory payloads |

---

## 4. End-to-End Execution Flow

```text
Student Action (e.g. "I scored 72 in DBMS and need to submit the project on Friday")
   │
   ▼
[Next.js Client] ─── (Sends prompt) ───► [FastAPI AI Orchestrator]
                                                   │
                ┌──────────────────────────────────┴──────────────────────────────────┐
                ▼                                                                     ▼
        [Memory Agent]                                                        [Personal Agent]
  - Identifies: Score 72 (DBMS)                                         - Identifies: Task (DBMS Project)
  - Proposes: Candidate Memory Card                                     - Proposes: Task + Calendar Deadline
                │                                                                     │
                └──────────────────────────────────┬──────────────────────────────────┘
                                                   │
                                                   ▼
                                         [Structured AI Output]
                                                   │
                                                   ▼
                                [Next.js Renders Actionable Cards]
                    ┌────────────────────────────────────────────────────────┐
                    │ 💡 Synexora noticed something useful                   │
                    │ DBMS Internal Score: 72/100  [ Save ] [ Edit ] [ Skip ]│
                    │ Task: Submit DBMS Project    [ Add to Tasks & Cal ]    │
                    └────────────────────────────────────────────────────────┘
                                                   │
                            (Student Clicks "Save" & "Add")
                                                   │
                                                   ▼
                                 [Spring Boot API Persists to DB]
```
