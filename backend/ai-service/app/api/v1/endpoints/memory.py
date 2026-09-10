from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.memory_agent import memory_agent

router = APIRouter(prefix="/memory", tags=["Controlled Memory Agent"])

class MemoryExtractRequest(BaseModel):
    text: str = Field(..., description="Student message, reflection, or note to analyze for candidate memories")
    source_context: Optional[str] = Field("AI Conversation", description="Origin of text (e.g. Chat, Diary, Practice)")

@router.post("/extract")
async def extract_candidate_memories(req: MemoryExtractRequest):
    """
    Analyzes student input and extracts transparent candidate memory objects
    with confidence scores and privacy rationales.
    """
    try:
        candidates = memory_agent.extract_memories(
            text=req.text,
            source_context=req.source_context or "AI Conversation"
        )
        return {
            "status": "success",
            "candidate_count": len(candidates),
            "candidates": candidates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
