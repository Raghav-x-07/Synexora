# Synexora AI & Multi-Agent Service

> **Synexora — Your Intelligent Student Operating System**

## Overview
The Synexora AI Service is a high-performance Python FastAPI engine housing the AI Orchestrator and specialized multi-agent sub-engines:
- **AI Orchestrator**: Coordinates multi-agent routing.
- **Learning AI Agent**: Socratic teaching, doubt solving, and step-by-step guidance.
- **Controlled Memory Agent**: Detects high-value facts and formulates candidate memory cards.
- **Personal Assistant Agent**: Extracts tasks, deadlines, and smart study plans.
- **RAG Agent**: Grounded semantic retrieval over student-uploaded course materials.
- **Assessment Agent**: Generates adaptive quizzes and evaluates conceptual mastery.

## Quick Start

### 1. Setup Virtual Environment & Dependencies
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run AI Service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Or via the parent runner:
```bash
cd ..
npm run dev:ai
```
API Documentation available at: [http://localhost:8000/docs](http://localhost:8000/docs)
