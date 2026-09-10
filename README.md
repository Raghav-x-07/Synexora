# Synexora — Your Intelligent Student Operating System

> **Teach. Remember. Plan. Adapt.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org/)
[![Backend: Spring Boot](https://img.shields.io/badge/API-Spring%20Boot%203-green)](https://spring.io/projects/spring-boot)
[![AI Engine: FastAPI](https://img.shields.io/badge/AI%20Engine-FastAPI-teal)](https://fastapi.tiangolo.com/)

---

## 🌟 What is Synexora?

**Synexora** is an AI-powered Student Operating System that combines personalized learning, AI tutoring, RAG-based study assistance, intelligent memory, productivity management, scheduling, assessments, analytics, and adaptive learning into one unified platform.

Synexora goes far beyond a generic chatbot. It understands the student as a continuously evolving learner:
```text
                         SYNEXORA
                            │
                         Student
                            │
                            ▼
                   ┌─────────────────┐
                   │ AI ORCHESTRATOR │
                   └────────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     Learning AI       Personal AI       Memory Agent
          │                 │                 │
          ▼                 ▼                 ▼
         RAG             Planning          Controlled
          │              Calendar            Memory
          │              Tasks
          │              Reminders
          │
          ▼
    Assessment Agent
          │
          ▼
   Adaptive Learning
          │
          ▼
   Student Profile
```

---

## 🚀 Core Product Philosophy

> **ONE STUDENT → ONE INTELLIGENT SYSTEM → MULTIPLE SPECIALIZED AI CAPABILITIES**

1. **Teach**: Personalized Socratic explanations, step-by-step doubt resolution, and intelligent practice generation.
2. **Remember**: Controlled memory where Synexora detects meaningful context (grades, goals, weak topics) and asks student permission before saving.
3. **Plan**: Context-aware scheduling that links academic deadlines, weaknesses, and available study hours.
4. **Adapt**: Dynamic learning paths that continuously evolve based on assessment feedback and study reflections.

---

## 📁 Repository Structure

```text
Synexora/
├── front end/               # Next.js 14, React, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/             # App Router pages & layouts
│   │   ├── components/      # UI component library & design system
│   │   ├── lib/             # API clients & utilities
│   │   └── types/           # TypeScript definitions
│   ├── package.json
│   └── README.md
│
├── backed/                  # Backend services orchestrator
│   ├── spring-api/          # Spring Boot 3 API (Auth, DB, Business Logic)
│   │   ├── src/main/java/com/synexora/api/
│   │   ├── pom.xml
│   │   └── README.md
│   │
│   ├── ai-service/          # FastAPI AI Engine (Agents, RAG, Embeddings, LLMs)
│   │   ├── app/
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── package.json         # Unified startup script runner
│   └── README.md
│
├── ARCHITECTURE.md          # System & Microservices Blueprint
├── DATABASE.md              # Database Schema & Entity Relationships
├── API.md                   # REST & AI Service API Contract
├── AI_ARCHITECTURE.md       # Multi-Agent Coordination & LLM Pipeline
├── RAG_ARCHITECTURE.md      # Retrieval-Augmented Generation Specs
├── MEMORY_ARCHITECTURE.md   # Controlled Memory & Privacy Protocol
├── SECURITY.md              # Security, Auth, RBAC & Protection Policies
├── DEVELOPMENT.md           # Local Setup & Contribution Guide
├── ROADMAP.md               # 14-Phase Product Delivery Plan
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** >= 18.x
- **Python** >= 3.10
- **Java JDK** >= 17 (optional for AI-only mode; required for Spring Boot API)

### 2. Launch Frontend
```bash
cd "front end"
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Synexora interface.

### 3. Launch Backend Services
```bash
cd backed
npm install
npm run dev
```
Or start services independently:
```bash
# Launch Spring Boot API on port 8080
npm run dev:api

# Launch FastAPI AI Service on port 8000
npm run dev:ai
```

---

## 🗺️ Architectural Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [Database Schema](DATABASE.md)
- [API Specifications](API.md)
- [AI & Agent Architecture](AI_ARCHITECTURE.md)
- [RAG Architecture](RAG_ARCHITECTURE.md)
- [Controlled Memory Architecture](MEMORY_ARCHITECTURE.md)
- [Security & Privacy](SECURITY.md)
- [Development Guide](DEVELOPMENT.md)
- [Phase Roadmap](ROADMAP.md)

---

## 📄 License
Synexora is open-source software licensed under the MIT license.
