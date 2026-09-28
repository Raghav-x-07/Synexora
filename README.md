# Synexora — AI-Powered Academic Operating System & Campus Intelligence Platform

**Synexora** is an enterprise-grade AI-powered academic operating system built on the **MERN Stack** (MongoDB, Express.js, React, Node.js, TypeScript, Tailwind CSS) alongside a dedicated **Python AI Media Pipeline** for multimodal educational video rendering, Socratic tutoring, and Document/Video RAG.

---

## 🌟 Platform Highlights & Multi-Role Architecture

Synexora features a role-based access control (RBAC) system tailored for 4 distinct user tiers:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 SYNEXORA PLATFORM                               │
├─────────────────┬────────────────────┬────────────────────┬─────────────────────┤
│   SUPER ADMIN   │  CAMPUS ADMIN      │  FACULTY TEACHER   │  STUDENT (CAMPUS)   │
├─────────────────┼────────────────────┼────────────────────┼─────────────────────┤
│ • Platform KPI  │ • Campus Portal    │ • Campus Portal    │ • Student Dashboard │
│ • Manage Inst.  │ • Single/Excel Reg │ • Single/Excel Reg │ • Classrooms (LMS)  │
│ • Quota Engine  │   (Teachers/Studs) │   (Students Only)  │ • Socratic AI Tutor │
│ • Global Audit  │ • Classroom Overs. │ • Classroom Mgmt   │ • AI Concept Video  │
│ • Notes & Cal.  │ • Telemetry / Prog │ • AI Video Builder │ • Documents / RAG   │
│ • Profile & Set │ • Notes & Calendar │ • Flowchart Studio │ • Memory Flashcards │
│                 │ • Profile & Set    │ • Assessments / Quiz│ • Task Kanban & Log│
│                 │                    │ • Grade Submissions│ • Timer & Pomodoro  │
│                 │                    │ • Progress Matrix  │ • AI Evaluations    │
└─────────────────┴────────────────────┴────────────────────┴─────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 🎓 Academic Classroom & LMS Engine (`/classroom`)
- **Class Stream & Rich AI Announcements**: Real-time class feed with support for rich text, teacher guidance blocks, code snippets, and attached resources.
- **Embedded AI Concept Video Lessons**: Native HTML5 responsive MP4 video streaming with byte-range seeking and direct download.
- **Interactive Process Flowcharts**: Structured sequential nodes with color-coded step badges (`PROCESS`, `DECISION`, `INPUT`, `OUTPUT`).
- **Coursework & Classwork Management**: Assignments, study materials, quizzes, and discussion questions with point weighting and due dates.
- **Student Submission & Grading**: Students turn in assignments; instructors review, grade, and provide actionable feedback.
- **Discussion Threads**: Threaded classroom doubt resolution and peer comments.
- **Instructor Controls**: Delete and moderate announcements, classwork items, and student roster enrollments.
- **Instant Join**: Students join via secure 6-character classroom code.

### 2. 📊 Campus Portal & Bulk Excel Onboarding (`/institution-portal`)
- **Excel Batch Student Enrollment**: Upload `.xlsx` spreadsheets containing `Name`, `Email`, and `Department/Course`. The engine automatically registers active student accounts, generates strong credentials, and exports a downloadable `.xlsx` credentials handover sheet.
- **Excel Batch Faculty Teacher Enrollment**: Campus Admins can bulk-enroll professors and department heads via Excel with auto-generated credentials.
- **Single Registration**: Quick-enroll individual students with auto-generated Student IDs.
- **Strict Role Boundaries**: Teachers are restricted to enrolling students; Institution Admins manage both faculty and students.
- **Live Campus Telemetry**: Real-time metrics for Total Students, Faculty Roster, Academic Classrooms, Departments, and Account Quotas.

### 3. 🎬 Multimodal AI Concept Video Generator (`/concept-video`)
- **Automated Video Pipeline**: Enter any academic topic (e.g. *Binary Search*, *Database Normalization*, *Photosynthesis*) to generate structured educational MP4 video lessons with voice narration and animated slides.
- **One-Click Share to Classroom**: Teachers can immediately post generated concept videos to their classroom streams or classwork materials.
- **Save to Knowledge Memory**: Store video summaries and scene breakdowns directly into the student's personal Memory Vault.

### 4. 💡 Learning AI & Diagram Studio (`/learning-ai`)
- **Socratic AI Tutor**: Deep conceptual breakdowns, real-world analogies, and interactive Q&A.
- **Process Flowchart Generator**: Converts complex algorithms and processes into step-by-step interactive visual workflows.
- **Direct Classroom Dispatch**: Instructors can publish interactive guides and flowchart diagrams to their classes with custom notes.

### 5. 📄 Documents & YouTube RAG Intelligence (`/documents`)
- **Contextual Document Chat**: Upload PDFs, notes, and study guides with retrieval-augmented generation (RAG).
- **YouTube Video Lecture Indexing**: Paste any educational YouTube URL to extract transcripts and chat with grounded AI context.
- **Audiobook & Summary Modes**: Synthesize key takeaways and practice questions.

### 6. 🧠 Memory Hub & Recall Vault (`/memory`)
- **Smart Flashcards**: Spaced-repetition study cards categorized by subject.
- **PDF Export Engine**: Download formatted study flashcards and lesson summaries using client-side `jsPDF`.
- **Attached Video Playback**: Review concept videos associated with memory cards.

### 7. ⏱️ Productivity & Academic Toolkit
- **Task Management (`/tasks`)**: Categorized deliverables with priority tags, course codes, and completion tracking.
- **Interactive Calendar (`/calendar`)**: Exam schedules, deadlines, and lecture timetable.
- **Rich Notebooks (`/notes`)**: Markdown-ready notebooks with tagging and quick search.
- **Focus Timer & Alarm (`/timer`)**: Pomodoro timer with ambient sounds and custom alarms.
- **AI Evaluation Hub (`/evaluation`)**: Automated practice assessments, test simulations, and answer breakdown.
- **Progress Telemetry (`/progress`)**: Departmental comparison, submission statistics, and GPA tracking.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | Tailwind CSS, Lucide Icons, Axios, React Router 6, jsPDF, XLSX |
| **Backend** | Node.js, Express.js | MongoDB / Mongoose, JWT Auth, Multer, XLSX, CORS, Range Streaming |
| **AI / Media** | Python 3 | `video_pipeline.py`, TTS audio synthesis, Pillow slide rendering, FFmpeg |
| **Database** | MongoDB | Schemas for Users, Institutions, Classrooms, Notes, Tasks, Memory, Events |

---

## 📁 Repository Structure

```
Synexora/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback configuration
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role validation
│   ├── models/
│   │   ├── User.js               # User schema (roles, department, module access)
│   │   ├── Institution.js        # Institution schema (quotas, departments)
│   │   ├── Classroom.js          # LMS schema (announcements, classwork, members)
│   │   ├── Note.js, Task.js      # Productivity schemas
│   │   ├── Event.js, Memory.js   # Calendar & flashcard schemas
│   │   └── Assessment.js         # Evaluation & quiz schemas
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── adminRoutes.js        # /api/admin (Super Admin platform controls)
│   │   ├── institutionRoutes.js  # /api/institutions (Campus Portal, Excel batch)
│   │   ├── classroomRoutes.js    # /api/classrooms (LMS stream, classwork, grading)
│   │   ├── conceptVideoRoutes.js # /api/concept-video (Python pipeline orchestration)
│   │   ├── aiRoutes.js           # /api/ai (Socratic chat, flowcharts, RAG)
│   │   ├── progressRoutes.js     # /api/progress (Analytics telemetry)
│   │   ├── noteRoutes.js, taskRoutes.js
│   │   └── eventRoutes.js, memoryRoutes.js, documentRoutes.js
│   ├── server.js                 # Express server & static media serving
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppLayout.tsx               # Role-tailored responsive sidebar navigation
│   │   │   ├── StructuredPostRenderer.tsx  # Rich AI classroom stream renderer & video player
│   │   │   ├── ShareToClassroomModal.tsx   # Modal for teachers to publish AI content
│   │   │   ├── ProtectedRoute.tsx          # Client route authentication guard
│   │   │   └── RoleProtectedRoute.tsx      # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.tsx             # Global authentication state & role helpers
│   │   ├── lib/
│   │   │   └── api.ts                      # Axios instance with interceptors & resolveMediaUrl
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx             # Modern landing page
│   │   │   ├── LoginPage.tsx, RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx           # Role-adaptive cockpit dashboard
│   │   │   ├── SuperAdminPage.tsx          # Super Admin control portal
│   │   │   ├── InstitutionPortalPage.tsx   # Campus Admin & Faculty educator portal
│   │   │   ├── ClassroomPage.tsx           # Academic LMS class feed, classwork & roster
│   │   │   ├── ConceptVideoPage.tsx        # AI concept video generation studio
│   │   │   ├── LearningAIPage.tsx          # Socratic tutor & flowchart builder
│   │   │   ├── DocumentsPage.tsx           # Documents & YouTube RAG
│   │   │   ├── ProgressPage.tsx            # Student & departmental progress telemetry
│   │   │   ├── MemoryPage.tsx              # Flashcards, PDF export & video recall
│   │   │   ├── NotesPage.tsx, TasksPage.tsx
│   │   │   ├── CalendarPage.tsx, TimerPage.tsx
│   │   │   └── ProfilePage.tsx, SettingsPage.tsx
│   │   ├── App.tsx                         # Client route configuration
│   │   └── index.css                       # Design tokens & styles
│   ├── vite.config.ts                      # Vite dev server & media streaming proxies
│   └── package.json
│
└── ai-service/
    ├── services/
    │   ├── video_pipeline.py     # Master orchestration script
    │   ├── lesson_generator.py   # AI structured educational curriculum
    │   ├── scene_generator.py    # Visual slide generation
    │   ├── narration.py          # Voice audio synthesis
    │   └── renderer.py           # FFmpeg video rendering
    └── generated/
        ├── audio/                # Voice narration files
        ├── scenes/               # Visual slide slides
        └── videos/               # Rendered MP4 videos
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18+ or v20+
- **Python**: v3.10+ (for AI video pipeline)
- **MongoDB**: Local MongoDB or MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```
*Backend server runs on `http://localhost:5000`*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server runs on `http://localhost:5173`*

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access / Primary Portal |
|---|---|---|---|
| **Super Admin** | `superadmin@synexora.com` | `admin123` | Platform Control (`/admin`, `/dashboard`) |
| **Campus Admin** | `admin@synexora.edu` | `admin123` | Campus Portal (`/institution-portal`) |
| **Faculty Educator** | `teacher@synexora.edu` | `teacher123` | Campus LMS & AI Studios (`/classroom`, `/concept-video`) |
| **Student** | `student@synexora.edu` | `student123` | Complete Learning Suite (`/dashboard`, `/classroom`) |

---

## 🔒 Key API Endpoints Reference

### Authentication & Profiles
- `POST /api/auth/register` — Register student account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get authenticated user details
- `PUT /api/auth/profile` — Update account profile settings

### Campus Management & Excel Batch (`/api/institutions`)
- `GET /api/institutions/my-institution` — Get campus details
- `GET /api/institutions/my-institution/analytics` — Campus metrics (Admin/Teacher)
- `GET /api/institutions/my-institution/students` — Retrieve student roster
- `POST /api/institutions/my-institution/students` — Single student enrollment
- `POST /api/institutions/my-institution/students/upload-excel` — Batch Excel student enrollment & `.xlsx` credential generation
- `GET /api/institutions/my-institution/students/sample-excel` — Download student Excel template
- `GET /api/institutions/my-institution/teachers` — Retrieve faculty roster
- `POST /api/institutions/my-institution/teachers` — Single faculty teacher enrollment (Admin only)
- `POST /api/institutions/my-institution/teachers/upload-excel` — Batch Excel teacher enrollment (Admin only)
- `GET /api/institutions/my-institution/teachers/sample-excel` — Download teacher Excel template

### Classroom & LMS (`/api/classrooms`)
- `GET /api/classrooms` — List enrolled/teaching classrooms
- `POST /api/classrooms` — Create classroom (Teachers/Admins)
- `GET /api/classrooms/:id` — Get classroom stream, classwork & roster
- `POST /api/classrooms/join` — Join classroom with 6-digit code
- `POST /api/classrooms/:id/announcements` — Post rich announcement / AI lesson
- `DELETE /api/classrooms/:id/announcements/:announcementId` — Delete announcement
- `POST /api/classrooms/:id/announcements/:announcementId/comments` — Add comment
- `POST /api/classrooms/:id/classwork` — Post assignment / study material
- `DELETE /api/classrooms/:id/classwork/:classworkId` — Delete classwork item
- `POST /api/classrooms/:id/classwork/:classworkId/submissions` — Turn in work

### AI Video & Learning Intelligence
- `POST /api/concept-video/generate` — Trigger Python multimodal video generator
- `GET /generated-videos/:filename` — Stream MP4 concept video
- `POST /api/ai/socratic` — Socratic dialogue query
- `POST /api/ai/flowchart` — Process flowchart builder
- `POST /api/documents/upload` — Upload PDF/document for RAG
- `POST /api/documents/youtube-transcript` — Index YouTube lecture
- `POST /api/documents/rag-query` — Grounded contextual Q&A

---

## 🧪 Testing

Run test suites from the root or backend directory:
```bash
# Test backend authentication
node backend/test-auth.js

# Test classroom and video streaming
node backend/scratch/test_classroom_video.js
```

---

## 📜 License
Distributed under the MIT License. Developed for the Synexora Academic Ecosystem.
