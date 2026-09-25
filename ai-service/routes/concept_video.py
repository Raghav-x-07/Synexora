"""
FastAPI route for concept video generator.
Provides REST API endpoint POST /api/concept-video/generate.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.video_pipeline import generate_concept_video

router = APIRouter(prefix="/api/concept-video", tags=["Concept Video"])


class ConceptVideoRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = "beginner"


class ConceptVideoResponse(BaseModel):
    success: bool
    topic: str
    difficulty: str
    videoUrl: str
    explanation: str
    lesson: Dict[str, Any]
    duration_seconds: Optional[int] = 40
    scenes_count: Optional[int] = 4
    generation_time_seconds: Optional[float] = 0.0


@router.post("/generate", response_model=ConceptVideoResponse)
async def generate_video_endpoint(req: ConceptVideoRequest):
    if not req.topic or not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required.")

    try:
        result = generate_concept_video(req.topic.strip(), req.difficulty or "beginner")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
