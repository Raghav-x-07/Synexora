from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.socratic_tutor import tutor_engine

router = APIRouter(prefix="/tutor", tags=["Socratic AI Tutor"])

class TutorChatRequest(BaseModel):
    message: str = Field(..., description="Student prompt, doubt, or reply")
    subject: Optional[str] = Field(None, description="Current subject or topic")
    mastery_level: Optional[str] = Field("INTERMEDIATE", description="BEGINNER, INTERMEDIATE, ADVANCED")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation turns")

class CodeTraceRequest(BaseModel):
    code_snippet: str = Field(..., description="Code snippet to trace line-by-line")
    language: Optional[str] = Field("javascript", description="Programming language")

class ExplainRequest(BaseModel):
    topic: str = Field(..., description="Topic or concept to explain Socratically")
    depth: Optional[str] = Field("conceptual", description="conceptual, visual_analogy, mathematical, code_example")

@router.post("/chat")
async def socratic_chat(req: TutorChatRequest):
    """
    Primary Socratic dialogue endpoint.
    Returns Socratic guidance, progressive hints, drill questions,
    and automatically extracts Candidate Action Cards (memories/tasks).
    """
    try:
        response = tutor_engine.generate_socratic_response(
            message=req.message,
            conversation_history=req.conversation_history,
            mastery_level=req.mastery_level or "INTERMEDIATE",
            subject=req.subject
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code-trace")
async def code_trace(req: CodeTraceRequest):
    """
    Generates step-by-step visual code trace with execution invariants,
    call stack changes, and variable inspection states.
    """
    try:
        trace = tutor_engine.generate_code_trace(
            code_snippet=req.code_snippet,
            language=req.language or "javascript"
        )
        return trace
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
async def socratic_explain(req: ExplainRequest):
    """
    Provides multi-layered concept breakdowns using visual analogies,
    fundamental principles, and self-testing check questions.
    """
    return {
        "topic": req.topic,
        "analogy": f"Think of {req.topic} as a self-balancing library catalog where every section knows its immediate predecessor and successor.",
        "core_invariants": [
            f"Every operation on {req.topic} preserves system consistency.",
            f"Edge cases must be guarded against empty or single-element inputs."
        ],
        "reflection_question": f"If you had to explain the core purpose of {req.topic} to a 10-year-old in one sentence, what comparison would you use?"
    }
