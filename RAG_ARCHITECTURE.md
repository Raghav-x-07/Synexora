# Synexora — RAG (Retrieval-Augmented Generation) Architecture

> **Synexora — Your Intelligent Student Operating System**

---

## 1. Pipeline Overview

The Synexora RAG engine enables students to upload lecture slides, PDF textbooks, research papers, and handwritten notes, converting them into structured, searchable academic knowledge vectors.

```text
┌─────────────────┐
│ Student Document│ (PDF / Docx / TXT / Markdown)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload & Extract│ (PyPDF / pdfplumber / python-docx)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Text Cleaning & │
│ Header Stripping│ (Noise removal, OCR fix)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Semantic Chunker│ (Recursive Character / Markdown Splitter with 500-1000 tokens & 15% overlap)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dense Embedding │ (OpenAI text-embedding-3-small or FastEmbed / BGE)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vector Database │ (ChromaDB Collection partitioned by student user_id)
└────────┬────────┘
         │
 ┌───────┴────────────────────────────────────────┐
 │ RAG Retrieval & Grounded Answering Workflow    │
 ▼                                                ▼
[Student Query] ──► [Hybrid Semantic Retrieval] ──► [Context Reranker]
                                                             │
                                                             ▼
                                                    [Prompt Assembly]
                                                             │
                                                             ▼
                                                    [LLM Grounded Answer + Citations]
```

---

## 2. Key Technical Specifications

### 2.1 Ingestion & Chunking
- **Chunk Size**: 800 tokens target.
- **Overlap**: 120 tokens to maintain semantic continuity across section breaks.
- **Metadata Enriched**: Each chunk retains `document_id`, `filename`, `page_number`, `header_path`, `upload_timestamp`.

### 2.2 Vector Storage & Partitioning
- **Engine**: ChromaDB / pgvector.
- **Tenant Isolation**: Every vector payload is keyed with `user_id` to strictly prevent cross-student context leakage.

### 2.3 Grounded Generation
- Prompts enforce strict grounding: if the uploaded document does not contain the answer, the AI explicitly states it and falls back to general tutoring mode with appropriate disclaimers.
- Outputs include interactive inline citations linking back to document page and chunk offsets.

---

## 3. Supported Student Features
1. **Document Chat**: Ask targeted questions across multi-chapter lecture materials.
2. **Executive Summarization**: Generate high-yield key takeaways and formula cheat sheets.
3. **Flashcard Synthesis**: Automatically produce spaced-repetition Q&A flashcards from document sections.
4. **Mock Exam Generation**: Convert uploaded syllabus chapters into diagnostic quizzes.
