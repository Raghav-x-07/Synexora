# Synexora — Database & Data Architecture Specification (MERN Stack)

> **Synexora — Your Intelligent Student Operating System**

---

## 1. Overview & Strategy

Synexora employs the **MERN Stack** persistence model:
1. **Document Database (MongoDB & Mongoose)**: Managed by Node.js/Express.js backend (`backend/server/`). Stores document models, user authentication, student profiles, confirmed memories, tasks, notes, schedules, goals, and assessment results.
2. **Vector Database (ChromaDB / FAISS / Qdrant)**: Managed by the FastAPI AI Service (`backend/ai-service/`). Stores chunk embeddings, semantic document indexes, and context vectors for RAG.

---

## 2. Document Schema Relationships (Mongoose Models)

```text
┌─────────────────┐       1..1      ┌─────────────────┐
│     User        │────────────────►│  StudentProfile │
└────────┬────────┘                 └─────────────────┘
         │
         ├─── 1..N ───► Tasks
         ├─── 1..N ───► CalendarEvents
         ├─── 1..N ───► Notes
         ├─── 1..N ───► Memories (Controlled Transparency)
         ├─── 1..N ───► Goals
         └─── 1..N ───► AssessmentSubmissions
```

---

## 3. Detailed MongoDB Collection & Schema Specifications

### `users` Collection (`models/User.js`)
| Field | Type | Options | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique user identifier |
| `fullName` | String | required, trim | Full name of the student |
| `email` | String | required, unique, lowercase | Student email address |
| `password` | String | required, bcrypt hash | Securely hashed password |
| `role` | String | enum: ['ROLE_STUDENT', 'ROLE_ADMIN'], default: 'ROLE_STUDENT' | Role-based authorization |
| `profile` | ObjectId | ref: 'StudentProfile' | Reference to linked profile |
| `createdAt` | Date | default: now | Timestamp |
| `updatedAt` | Date | default: now | Timestamp |

### `studentprofiles` Collection (`models/StudentProfile.js`)
| Field | Type | Options | Description |
|---|---|---|---|
| `user` | ObjectId | ref: 'User', required, unique | Parent student reference |
| `major` | String | default: 'Computer Science' | Field of study / major |
| `academicYear` | String | default: 'Year 1' | Year / grade level |
| `learningStyle` | String | enum: ['VISUAL', 'AUDITORY', 'READING', 'KINESTHETIC', 'SOCRATIC'], default: 'SOCRATIC' | Learning preference |
| `gpa` | Number | default: 3.8 | Student grade point average |
| `masteryScore` | Number | default: 75.0 | Overall knowledge mastery index |
| `studyStreakDays`| Number | default: 1 | Consecutive study days |
| `preferences` | Object | mixed | UI and AI personalization settings |

### `memories` Collection (`models/Memory.js`)
| Field | Type | Options | Description |
|---|---|---|---|
| `user` | ObjectId | ref: 'User', required | Owner student |
| `category` | String | enum: ['ACADEMIC', 'IMPORTANT_DATES', 'GOALS', 'PERFORMANCE', 'CAREER', 'SENSITIVE', 'PREFERENCE'], required | Memory domain |
| `title` | String | required | Short identifier |
| `value` | String | required | Extracted contextual fact |
| `isConfirmed` | Boolean | default: true | Student confirmation status |
| `confidenceScore` | Number | default: 1.0 | AI extraction certainty (0.0 - 1.0) |
| `isSensitive` | Boolean | default: false | Requires elevated viewing consent |
| `source` | String | default: 'AI Conversation' | Origin of the memory item |
| `createdAt` | Date | default: now | Extraction timestamp |

### `tasks` Collection (`models/Task.js`)
| Field | Type | Options | Description |
|---|---|---|---|
| `user` | ObjectId | ref: 'User', required | Owner student |
| `title` | String | required, trim | Task title |
| `description` | String | optional | Notes / subtasks |
| `status` | String | enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' | Task status |
| `priority` | String | enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' | Urgency priority |
| `dueDate` | Date | optional | Target completion deadline |
| `subjectTag` | String | default: 'General' | Course / Subject tag |

### `notes` Collection (`models/Note.js`)
| Field | Type | Options | Description |
|---|---|---|---|
| `user` | ObjectId | ref: 'User', required | Owner student |
| `title` | String | required | Note heading |
| `content` | String | required | Note text / Markdown content |
| `isAiGenerated`| Boolean | default: false | Generated via AI summarizer |
| `sourceDocument`| String | optional | Linked source PDF or lecture |
| `tags` | [String] | default: [] | Categorical tags |

### `calendarevents` Collection (`models/CalendarEvent.js`)
| Field | Type | Options | Description |
|---|---|---|---|
| `user` | ObjectId | ref: 'User', required | Owner student |
| `title` | String | required | Event / lecture / exam title |
| `startTime` | Date | required | Start time |
| `endTime` | Date | required | End time |
| `category` | String | enum: ['EXAM', 'LECTURE', 'STUDY_SESSION', 'ASSIGNMENT', 'PERSONAL'], default: 'STUDY_SESSION' | Event type |
| `location` | String | optional | Campus room or online link |

### `goals` Collection (`models/Goal.js`)
| Field | Type | Options | Description |
|---|---|---|---|
| `user` | ObjectId | ref: 'User', required | Owner student |
| `title` | String | required | Goal statement |
| `category` | String | default: 'ACADEMIC' | Goal domain |
| `targetDate` | Date | optional | Target milestone deadline |
| `progressPercentage` | Number | default: 0 | Progress (0 - 100) |
| `isCompleted`| Boolean | default: false | Goal status |

---

## 4. Vector Database Collection Schemas

Managed by the FastAPI AI Service (`backend/ai-service/`):

### Collection: `synexora_documents`
- **Embedding Model**: `text-embedding-3-small` (1536 dim) or `bge-small-en-v1.5` (384 dim).
- **Metadata**:
  - `document_id`: String / UUID
  - `user_id`: String
  - `filename`: String
  - `chunk_index`: Number
  - `page_number`: Number
  - `topic_tag`: String
- **Payload Content**: Extracted textual passage chunk.
