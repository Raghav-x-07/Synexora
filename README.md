# Synexora — Your Intelligent Student Operating System

> **Teach. Remember. Plan. Adapt.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org/)
[![Backend: Express](https://img.shields.io/badge/API-Express.js%20%2F%20Node.js-green)](https://expressjs.com/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB%20%26%20Mongoose-brightgreen)](https://www.mongodb.com/)
[![AI Engine: FastAPI](https://img.shields.io/badge/AI%20Engine-FastAPI-teal)](https://fastapi.tiangolo.com/)

---

## 🌟 What is Synexora?

**Synexora** is an intelligent Student Operating System built with a **Next.js 14** frontend, an **Express.js / Node.js** REST API with **MongoDB / Mongoose** persistence, and a separate **FastAPI** service for AI / LLM capabilities.

It provides a unified student dashboard for managing tasks, notes, goals, calendar schedules, and AI-assisted learning.

```text
+-------------------------------------------------------------+
|                      Next.js Frontend                       |
|               (React 19 / TypeScript / Tailwind)            |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Express.js Backend                      |
|                   (REST API / JWT Auth)                     |
+--------------------+-------------------+--------------------+
                     |                   |
                     v                   v
+-----------------------------+ +-----------------------------+
|      MongoDB / Mongoose     | |      FastAPI AI Service     |
|   (Users, Tasks, Notes,     | |      (Python / Uvicorn /    |
|    Goals, Memories, etc.)   | |       LLM Integrations)     |
+-----------------------------+ +-----------------------------+
```

---

## 🚀 Development Principle: Vertical Slices

Synexora is structured so that every feature follows a clean, complete vertical flow:

$$\text{Frontend UI} \longrightarrow \text{API Client} \longrightarrow \text{Express Route / Controller} \longrightarrow \text{MongoDB Model}$$

No hidden mock data or silent fake stores are used in the core application flow. When the database is empty, the UI renders clean empty states.

---

## 📁 Repository Structure

```text
Synexora/
├── frontend/                # Next.js 14, React 19, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/             # App Router pages (Dashboard, Tasks, Notes, Goals, etc.)
│   │   ├── components/      # UI components & dark teal design system
│   │   ├── context/         # AuthContext & state providers
│   │   └── lib/             # API client (apiClient.ts)
│   └── package.json
│
├── backend/                 # Backend services orchestrator
│   ├── server/              # Express.js REST API & Mongoose models (Port 8080)
│   │   ├── config/          # MongoDB connection (db.js)
│   │   ├── middleware/      # JWT authentication (auth.js)
│   │   ├── models/          # Mongoose models (User, Task, Note, Goal, Memory, etc.)
│   │   ├── routes/          # Express API route handlers
│   │   └── server.js        # Server entry point
│   │
│   ├── ai-service/          # FastAPI Python AI Service (Port 8000)
│   │   ├── app/             # FastAPI routers & endpoints
│   │   ├── venv/            # Python virtual environment
│   │   └── requirements.txt
│   │
│   ├── scripts/             # Startup scripts (run-ai.js)
│   └── package.json
│
├── .env.example             # Root environment configuration template
├── PROJECT_STATUS.md        # Comprehensive implementation status
├── ARCHITECTURE.md          # Architecture blueprint
├── DATABASE.md              # MongoDB collection schemas
├── API.md                   # REST & AI Service API reference
├── DEVELOPMENT.md           # Local setup and workflow guide
└── ROADMAP.md               # Sequential feature roadmap
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** >= 18.x
- **Python** >= 3.10
- **MongoDB** (Local instance on `mongodb://localhost:27017/synexora` or MongoDB Atlas URI)

### 2. Configure Environment Variables
Copy `.env.example` to respective directories:
- `backend/server/.env`
- `backend/ai-service/.env` (optional)
- `frontend/.env.local` (optional, defaults to `http://localhost:8080/api/v1`)

### 3. Setup Python Virtual Environment for AI Service
```bash
cd backend/ai-service
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt   # Windows
# or: source venv/bin/activate && pip install -r requirements.txt # macOS/Linux
```

### 4. Start the Application

You can start the full stack using npm scripts from the `backend/` directory or individually:

```bash
# Terminal 1: Backend Express Server
cd backend/server
npm run dev

# Terminal 2: AI Service (FastAPI)
cd backend/ai-service
.\venv\Scripts\uvicorn app.main:app --port 8000 --reload

# Terminal 3: Frontend Next.js
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🗺️ Documentation

- [Project Status](PROJECT_STATUS.md) — What works, what's cleaned, and recommended next steps
- [Architecture Blueprint](ARCHITECTURE.md) — Architectural overview & request flows
- [Database Schema](DATABASE.md) — Mongoose models & indexes
- [API Reference](API.md) — Endpoints, request/response formats
- [Development Guide](DEVELOPMENT.md) — Step-by-step setup and conventions
- [Sequential Roadmap](ROADMAP.md) — Feature-by-feature implementation plan

---

## 📄 License
Synexora is open-source software licensed under the MIT license.

