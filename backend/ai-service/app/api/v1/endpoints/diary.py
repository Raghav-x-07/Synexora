from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.services.diary_analytics import diary_analytics_engine

router = APIRouter()

class ReflectionAnalyzeRequest(BaseModel):
    reflectionText: str
    studyHours: float = Field(default=2.0)
    subject: Optional[str] = Field(default="Computer Science")
    mood: Optional[str] = Field(default="Focused")

class WeeklySynthesisRequest(BaseModel):
    diaryEntries: List[Dict[str, Any]] = Field(default_factory=list)
    practiceAttempts: List[Dict[str, Any]] = Field(default_factory=list)
    assessments: List[Dict[str, Any]] = Field(default_factory=list)
    studyHoursTotal: float = Field(default=14.5)

@router.post("/analyze")
def analyze_reflection(req: ReflectionAnalyzeRequest):
    try:
        analysis = diary_analytics_engine.analyze_reflection(
            reflection_text=req.reflectionText,
            study_hours=req.studyHours,
            subject=req.subject,
            mood=req.mood
        )
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/weekly-synthesis")
def synthesize_weekly(req: WeeklySynthesisRequest):
    try:
        synthesis = diary_analytics_engine.synthesize_weekly_analytics(
            diary_entries=req.diaryEntries,
            practice_attempts=req.practiceAttempts,
            assessments=req.assessments,
            study_hours_total=req.studyHoursTotal
        )
        return {"success": True, "synthesis": synthesis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
