# Synexora — Controlled Memory Architecture

> **Synexora — Your Intelligent Student Operating System**  
> Core Philosophy: **"Synexora can identify what matters. The student decides what Synexora remembers."**

---

## 1. The Controlled Memory Paradigm

Traditional AI assistants either forget everything immediately or secretly record conversational context without transparent user control.

**Synexora introduces the Controlled Memory Protocol**:
1. **Intelligent Identification**: The AI Memory Agent actively parses dialogues for durable facts, performance metrics, schedule constraints, and academic struggles.
2. **Transparent Candidate Cards**: Identified facts are surfaced visually as interactive candidate cards in real-time.
3. **Explicit Consent & Editability**: Nothing is committed to the persistent database until the student clicks **Save** (or modifies the card with **Edit**).
4. **Full Sovereignty**: Students can inspect, categorize, export, or permanently delete any stored memory item at any time.

---

## 2. Extraction & Confirmation Flow

```text
Student: "I got a 72 on my DBMS mid-term, but I really want to aim for an 85+ on the finals."
   │
   ▼
[FastAPI Memory Agent]
   │
   ├── Extracted Entity 1:
   │   - Category: Academic Performance
   │   - Title: DBMS Mid-term Score
   │   - Value: 72/100
   │
   └── Extracted Entity 2:
       - Category: Goals
       - Title: DBMS Final Exam Target
       - Value: 85%+
   │
   ▼
[Frontend Action Card UI]
┌────────────────────────────────────────────────────────┐
│ 💡 Synexora noticed something useful                   │
│                                                        │
│ • DBMS Mid-term Score: 72/100                          │
│   [ Save to Memory ]   [ Edit ]   [ Ignore ]           │
│                                                        │
│ • Goal: DBMS Final Exam Target -> 85%+                 │
│   [ Save to Goals ]    [ Edit ]   [ Ignore ]           │
└────────────────────────────────────────────────────────┘
   │
   ▼ (Student clicks "Save to Memory")
[Spring Boot REST API] ──► Persists to PostgreSQL `memories` table
```

---

## 3. Supported Memory Categories

| Category | Typical Data Examples | Sensitivity Level |
|---|---|---|
| **Academic Performance** | Internal marks, GPA, test scores, mastery percentages | Standard |
| **Important Dates** | Exam dates, project deadlines, hackathon dates | Standard |
| **Goals & Aspirations** | Target grades, dream companies, study streaks | Standard |
| **Learning Style & Preferences** | "Prefers visual diagrams", "learns best with code snippets" | Standard |
| **Weaknesses & Gaps** | "Struggles with dynamic programming state transitions" | Standard |
| **Sensitive & Personal** | Health accommodations, personal scheduling constraints | High (Requires explicit re-authentication / encryption) |

---

## 4. Memory Integration in Prompt Context

When a student initiates a session, relevant confirmed memories are fetched and injected into the system prompt:
```text
[STUDENT CONTEXT]
- Confirmed Goals: Target 85%+ in DBMS Final
- Academic History: 72/100 in DBMS Mid-term
- Identified Weaknesses: SQL query optimization & normalization
[INSTRUCTION]
Tailor your explanations and practice problems to bridge the gap toward the 85%+ target.
```
