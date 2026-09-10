# Synexora Backend Services (MERN Stack & AI Engine)

> **Synexora — Your Intelligent Student Operating System**  
> Core Philosophy: **Teach. Remember. Plan. Adapt.**

## Overview
The `backend/` directory houses the core MERN stack backend and the Python AI agent engine of Synexora:
1. **`server/` (MERN Core)**: Express.js & MongoDB (Mongoose) Core REST API handling authentication (JWT), student profiles, tasks, notes, calendar events, goals, analytics, and controlled memories.
2. **`ai-service/`**: FastAPI Multi-Agent Engine coordinating the Learning AI, Controlled Memory Agent, Personal AI, RAG Knowledge Base, and Assessment Engine.

---

## ⚡ Unified Startup Commands

From inside `backend/`:

```bash
# 1. Install orchestrator dependencies
npm install

# 2. Run BOTH Express MERN API and FastAPI AI Service concurrently
npm run dev
```

### Launch Services Independently:
```bash
# Launch ONLY the Express MERN Core API (Port 8080)
npm run dev:api

# Launch ONLY the FastAPI AI Service (Port 8000)
npm run dev:ai
```

---

## 📁 Subdirectory Layout
```text
backend/
├── server/                  # MERN Stack Core REST API (Node.js / Express / Mongoose)
│   ├── config/              # MongoDB connection & fallback config
│   ├── middleware/          # JWT authentication middleware
│   ├── models/              # Mongoose data schemas (User, Task, Note, Memory, etc.)
│   ├── routes/              # Express API route handlers
│   ├── utils/               # Seed data & in-memory simulation store
│   ├── package.json
│   └── server.js            # Express application entry point (Port 8080)
│
├── ai-service/              # FastAPI Python Multi-Agent Service (Port 8000)
│   ├── app/
│   ├── requirements.txt
│   └── README.md
│
├── scripts/                 # Cross-platform runner utilities
├── package.json             # Root runner orchestrator
└── README.md
```
