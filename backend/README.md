# Synexora Backend Services

> **Synexora — Your Intelligent Student Operating System**  
> Core Philosophy: **Teach. Remember. Plan. Adapt.**

## Overview
The `backed/` directory houses the two foundational microservices of Synexora:
1. **`spring-api/`**: Spring Boot 3 Core REST API handling authentication, relational data persistence (PostgreSQL/H2), student profiles, tasks, notes, calendar events, and confirmed memories.
2. **`ai-service/`**: FastAPI Multi-Agent Engine coordinating the Learning AI, Controlled Memory Agent, Personal AI, RAG Knowledge Base, and Assessment Engine.

---

## ⚡ Unified Startup Commands

From inside `backed/`:

```bash
# 1. Install orchestrator dependencies
npm install

# 2. Run BOTH Spring Boot API and FastAPI AI Service concurrently
npm run dev
```

### Launch Services Independently:
```bash
# Launch ONLY the Spring Boot Core API (Port 8080)
npm run dev:api

# Launch ONLY the FastAPI AI Service (Port 8000)
npm run dev:ai
```

---

## 📁 Subdirectory Layout
```text
backed/
├── spring-api/              # Spring Boot 3 Java API
│   ├── src/main/java/com/synexora/api/
│   ├── pom.xml
│   └── README.md
│
├── ai-service/              # FastAPI Python Multi-Agent Service
│   ├── app/
│   ├── requirements.txt
│   └── README.md
│
├── scripts/                 # Cross-platform runner utilities
├── package.json             # Root runner orchestrator
└── README.md
```
