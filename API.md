# Synexora — API Specifications

> **Synexora — Your Intelligent Student Operating System**

---

## 1. Overview

Synexora provides two complementary API layers:
1. **Spring Boot Core REST API** (`http://localhost:8080/api/v1`)
2. **FastAPI AI & Multi-Agent API** (`http://localhost:8000/api/v1`)

All endpoints use standard JSON payloads and responses unless otherwise specified (e.g. Server-Sent Events for streaming AI responses).

---

## 2. Spring Boot Core REST Endpoints

### 2.1 Health Check
- **`GET /api/v1/health`**
  - **Response 200 OK**:
    ```json
    {
      "status": "UP",
      "service": "Synexora Core API",
      "version": "1.0.0",
      "timestamp": "2026-09-10T10:00:00Z"
    }
    ```

### 2.2 Authentication & Profile
- **`POST /api/v1/auth/register`**
  - **Request**: `{"email": "student@synexora.io", "password": "...", "fullName": "Alex Rivera"}`
  - **Response 201 Created**: `{"token": "JWT_TOKEN", "user": { ... }}`
- **`POST /api/v1/auth/login`**
  - **Request**: `{"email": "student@synexora.io", "password": "..."}`
  - **Response 200 OK**: `{"token": "JWT_TOKEN", "user": { ... }}`
- **`GET /api/v1/profile/me`**
  - **Headers**: `Authorization: Bearer <JWT>`
  - **Response 200 OK**: Profile object with mastery score, streak, preferences.

### 2.3 Productivity & Organization
- **`GET /api/v1/tasks`**: List student tasks with filters (`status`, `priority`).
- **`POST /api/v1/tasks`**: Create task (`title`, `dueDate`, `priority`).
- **`PUT /api/v1/tasks/{id}`**: Update task status or details.
- **`DELETE /api/v1/tasks/{id}`**: Delete task.
- **`GET /api/v1/notes`**: Retrieve student notes.
- **`POST /api/v1/notes`**: Save note (manual or AI-suggested).
- **`GET /api/v1/calendar/events`**: Get scheduled calendar events.
- **`POST /api/v1/calendar/events`**: Create study session or deadline event.

### 2.4 Controlled Memory Endpoints
- **`GET /api/v1/memories`**: List active memories by category.
- **`POST /api/v1/memories`**: Persist a user-confirmed memory item.
- **`PUT /api/v1/memories/{id}`**: Update/edit existing memory.
- **`DELETE /api/v1/memories/{id}`**: Delete memory item.

---

## 3. FastAPI AI & Multi-Agent Endpoints

### 3.1 Health Check
- **`GET /api/v1/health`**
  - **Response 200 OK**:
    ```json
    {
      "status": "healthy",
      "service": "Synexora AI Engine",
      "version": "1.0.0",
      "orchestrator_status": "ready"
    }
    ```

### 3.2 AI Orchestrator & Tutor Chat
- **`POST /api/v1/ai/chat`**
  - **Description**: Socratic teaching stream with candidate memory extraction and task suggestions.
  - **Request**:
    ```json
    {
      "session_id": "uuid",
      "message": "My DBMS internal score is 72 and my project is due on Friday.",
      "include_rag": true,
      "document_ids": []
    }
    ```
  - **Response (Streaming or Structured Event)**:
    ```json
    {
      "response_text": "Great job on the 72 in DBMS! Let's make sure you finish the project strongly for Friday. Would you like a breakdown of remaining milestones?",
      "proposed_memories": [
        {
          "category": "Academic Performance",
          "title": "DBMS Internal Score",
          "value": "72/100",
          "confidence": 0.95
        }
      ],
      "proposed_tasks": [
        {
          "title": "DBMS Project Submission",
          "due_date": "2026-09-12T23:59:59Z",
          "priority": "HIGH"
        }
      ]
    }
    ```

### 3.3 RAG Knowledge Base
- **`POST /api/v1/rag/upload`**: Upload study PDF/Docx, chunks, and creates dense vector embeddings.
- **`POST /api/v1/rag/query`**: Semantic query against uploaded lecture notes with grounded context citation.
- **`POST /api/v1/rag/flashcards`**: Generate revision flashcards from indexed document topics.

### 3.4 Practice & Adaptive Assessments
- **`POST /api/v1/assessments/generate`**: Generate topic assessment with adaptive difficulty.
- **`POST /api/v1/assessments/evaluate`**: Grade answers, compute accuracy, detect weaknesses, and suggest adaptive learning steps.
