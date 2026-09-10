# Synexora — Security & Privacy Architecture

> **Synexora — Your Intelligent Student Operating System**

---

## 1. Security Philosophy & Principles

Synexora manages sensitive academic records, daily schedules, student performance scores, and private study notes. Security and privacy are foundational pillars.

1. **Zero Unconfirmed Memory Ingestion**: No conversational utterance is permanently recorded without explicit confirmation.
2. **Strict Multi-Tenancy**: Data separation enforced at both database (row-level filtering via authenticated `user_id`) and vector store (partitioned collections/namespaces).
3. **No Secret Leakage**: API keys, database credentials, and LLM access tokens remain strictly on backend servers; never exposed to the client.

---

## 2. Authentication & Authorization

- **Stateless JWT (JSON Web Tokens)**: Issued by Spring Boot upon verified credentials (BCrypt password hashing).
- **Short-lived Access Tokens**: 60-minute lifetime accompanied by secure HTTP-only Refresh Tokens.
- **Role-Based Access Control (RBAC)**:
  - `ROLE_STUDENT`: Standard student capabilities (chat, tasks, notes, memories).
  - `ROLE_ADMIN`: Administrative metrics and system health monitoring.

---

## 3. Network & API Protection

- **CORS Configuration**: Explicit origin whitelist (e.g. `http://localhost:3000` for development).
- **Input Validation**:
  - Frontend: Zod schemas for all forms.
  - Spring Boot: `jakarta.validation` (`@Valid`, `@NotNull`, `@Size`).
  - FastAPI: Pydantic v2 schemas for all payloads.
- **File Upload Security**:
  - File extension & MIME type validation (PDF, DOCX, TXT, MD only).
  - Maximum upload size enforcement (15MB per file).
  - Sanitization of filenames to prevent path traversal.

---

## 4. Environment Variables & Secret Management

- `.env.example` templates provided in both frontend and backend directories.
- Real `.env` files are ignored via root `.gitignore`.
- Production deployment leverages secret managers (e.g., AWS Secrets Manager, Vault, or secure container environment variables).
