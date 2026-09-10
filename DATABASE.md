# Synexora — Database & Data Architecture Specification

> **Synexora — Your Intelligent Student Operating System**

---

## 1. Overview & Strategy

Synexora employs a hybrid persistence model:
1. **Relational Database (PostgreSQL / H2 for dev)**: Managed by Spring Boot Data JPA. Stores relational entities, transactional records, user credentials, confirmed memories, tasks, notes, schedules, and assessment results.
2. **Vector Database (ChromaDB / FAISS / pgvector)**: Managed by FastAPI AI Service. Stores chunk embeddings, semantic document indexes, and context vectors for RAG.

---

## 2. Relational Schema (Spring Boot Data Model)

### 2.1 Entity Relationship Diagram (Conceptual)
```text
┌─────────────────┐       1..N      ┌─────────────────┐
│     User        │────────────────►│  StudentProfile │
└────────┬────────┘                 └─────────────────┘
         │
         ├─── 1..N ───► Tasks
         ├─── 1..N ───► Reminders
         ├─── 1..N ───► CalendarEvents
         ├─── 1..N ───► Notes
         ├─── 1..N ───► Memories (Controlled Confirmation)
         ├─── 1..N ───► Goals
         ├─── 1..N ───► Assessments & Submissions
         ├─── 1..N ───► LearningPaths
         └─── 1..N ───► DiaryEntries
```

---

## 3. Detailed Table Specifications

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Student email |
| `password_hash` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | Full name of the student |
| `role` | VARCHAR(50) | NOT NULL | `ROLE_STUDENT`, `ROLE_ADMIN` |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

### `student_profiles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Profile ID |
| `user_id` | UUID | FOREIGN KEY -> users(id) | Associated user |
| `academic_level` | VARCHAR(50) | NULLABLE | Grade / Year / Major |
| `learning_style` | VARCHAR(50) | DEFAULT 'VISUAL' | Preferred learning method |
| `mastery_score` | FLOAT | DEFAULT 0.0 | Overall academic mastery index |
| `study_streak_days`| INT | DEFAULT 0 | Daily study streak |
| `preferences` | JSONB / TEXT | NULLABLE | Custom configuration |

### `memories` (Controlled Memory Store)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Memory entry ID |
| `user_id` | UUID | FOREIGN KEY -> users(id) | Owner student |
| `category` | VARCHAR(50) | NOT NULL | `ACADEMIC`, `IMPORTANT_DATES`, `GOALS`, `PERFORMANCE`, `CAREER`, `SENSITIVE` |
| `title` | VARCHAR(255) | NOT NULL | Short label |
| `value` | TEXT | NOT NULL | Stored fact / context |
| `is_confirmed` | BOOLEAN | NOT NULL DEFAULT TRUE | Student confirmed flag |
| `confidence_score` | FLOAT | DEFAULT 1.0 | AI extraction confidence |
| `is_sensitive` | BOOLEAN | DEFAULT FALSE | Requires elevated auth |
| `created_at` | TIMESTAMP | NOT NULL | Date stored |

### `tasks`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Task ID |
| `user_id` | UUID | FOREIGN KEY -> users(id) | Owner student |
| `title` | VARCHAR(255) | NOT NULL | Task title |
| `description` | TEXT | NULLABLE | Details / Checklist |
| `status` | VARCHAR(50) | NOT NULL DEFAULT 'TODO'| `TODO`, `IN_PROGRESS`, `DONE` |
| `priority` | VARCHAR(50) | NOT NULL DEFAULT 'MEDIUM'| `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `due_date` | TIMESTAMP | NULLABLE | Task deadline |
| `subject_tag` | VARCHAR(100) | NULLABLE | Course code / subject |

### `notes`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Note ID |
| `user_id` | UUID | FOREIGN KEY -> users(id) | Owner student |
| `title` | VARCHAR(255) | NOT NULL | Note title |
| `content` | TEXT | NOT NULL | Markdown / rich text note |
| `is_ai_generated` | BOOLEAN | DEFAULT FALSE | Flag for AI synthesized notes |
| `source_document` | VARCHAR(255) | NULLABLE | Linked study document |
| `tags` | VARCHAR(255) | NULLABLE | Comma-separated tags |

### `assessments` & `assessment_results`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Assessment ID |
| `user_id` | UUID | FOREIGN KEY -> users(id) | Target student |
| `topic` | VARCHAR(255) | NOT NULL | Assessment topic |
| `difficulty` | VARCHAR(50) | NOT NULL | `EASY`, `MEDIUM`, `HARD`, `ADAPTIVE` |
| `questions` | JSONB / TEXT | NOT NULL | Serialized question bank & rubrics |
| `score_percentage`| FLOAT | NULLABLE | Final scored percentage |
| `weaknesses_identified` | JSONB / TEXT | NULLABLE | Detected conceptual gaps |
| `completed_at` | TIMESTAMP | NULLABLE | Completion timestamp |

---

## 4. Vector Database Collection Schemas

Managed by FastAPI ChromaDB / Vector Store:

### Collection: `synexora_documents`
- **Embedding Model**: `text-embedding-3-small` (1536 dim) or `bge-small-en-v1.5` (384 dim).
- **Metadata**:
  - `document_id`: UUID
  - `user_id`: UUID
  - `filename`: String
  - `chunk_index`: Integer
  - `page_number`: Integer
  - `topic_tag`: String
- **Payload Content**: Extracted textual passage chunk.
