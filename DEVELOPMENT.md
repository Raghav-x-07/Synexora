# Synexora — Local Development & Contribution Guide

> **Synexora — Your Intelligent Student Operating System**

---

## 1. Prerequisites

Ensure your development environment contains:
- **Node.js**: v18.x or v20+ (`node -v`)
- **npm**: v9+ or v10+ (`npm -v`)
- **Python**: v3.10, v3.11, v3.12, or v3.13 (`python --version`)
- **Java JDK**: 17+ (for Spring Boot native build / execution)

---

## 2. Directory Structure Conventions

The repository follows a strict directory layout:
```text
Synexora/
├── front end/               # Next.js frontend application
├── backed/                  # Backend services orchestrator
│   ├── spring-api/          # Spring Boot 3 Core REST API
│   ├── ai-service/          # FastAPI Multi-Agent AI Engine
│   └── package.json         # Unified task runner
├── README.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── AI_ARCHITECTURE.md
├── RAG_ARCHITECTURE.md
├── MEMORY_ARCHITECTURE.md
├── SECURITY.md
├── DEVELOPMENT.md
└── ROADMAP.md
```

> ⚠️ **Important**: Do not rename `front end/` or `backed/`.

---

## 3. Launching Services

### 3.1 Frontend (`front end/`)
```bash
cd "front end"
npm install
npm run dev
```
Runs the Next.js development server at [http://localhost:3000](http://localhost:3000).

### 3.2 Backend Services (`backed/`)
```bash
cd backed
npm install
npm run dev
```
Spawns both the Spring Boot API (Port 8080) and FastAPI AI Service (Port 8000) concurrently.

To run backend services independently:
```bash
# In backed/
npm run dev:api   # Launches Spring Boot API
npm run dev:ai    # Launches FastAPI AI Engine
```

---

## 4. Environment Setup

Copy example environment files to create local `.env` files:

### Frontend
```bash
cd "front end"
cp .env.example .env.local
```

### AI Service
```bash
cd backed/ai-service
cp .env.example .env
```
Provide your API keys (e.g. `GEMINI_API_KEY`, `OPENAI_API_KEY`) in `.env`.
