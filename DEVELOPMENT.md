# Synexora — Local Development & Contribution Guide (MERN Stack)

> **Synexora — Your Intelligent Student Operating System**

---

## 1. Prerequisites

Ensure your development environment contains:
- **Node.js**: v18.x or v20+ (`node -v`)
- **npm**: v9+ or v10+ (`npm -v`)
- **Python**: v3.10, v3.11, v3.12, or v3.13 (`python --version`)
- **MongoDB** (Optional): v6+ or MongoDB Atlas (Synexora automatically runs an in-memory simulation store if a local MongoDB daemon is not running)

---

## 2. Directory Structure Conventions

The repository follows a clean, modular layout:
```text
Synexora/
├── frontend/                # Next.js 14 / React frontend workspace
├── backend/                 # Backend services orchestrator
│   ├── server/              # Express.js & MongoDB (Mongoose) Core REST API (Port 8080)
│   ├── ai-service/          # FastAPI Multi-Agent AI Engine (Port 8000)
│   ├── scripts/             # Unified cross-platform startup scripts
│   └── package.json         # Backend task runner
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

---

## 3. Launching Services

### 3.1 Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev
```
Runs the Next.js workspace at [http://localhost:3000](http://localhost:3000).

### 3.2 Backend Services (`backend/`)
```bash
cd backend
npm install
npm run dev
```
Spawns both the **Express MERN API** (Port 8080) and **FastAPI AI Service** (Port 8000) concurrently.

To run backend services independently:
```bash
# In backend/
npm run dev:api   # Launches Express.js / Mongoose Core API on Port 8080
npm run dev:ai    # Launches FastAPI AI Engine on Port 8000
```

---

## 4. Environment Setup

### Frontend
```bash
cd frontend
cp .env.example .env.local
```

### Express MERN Server
```bash
cd backend/server
# Optional: MONGODB_URI=mongodb://127.0.0.1:27017/synexoradb
# Optional: JWT_SECRET=your_jwt_secret
```

### AI Service
```bash
cd backend/ai-service
cp .env.example .env
```
Provide your API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) in `.env`.
