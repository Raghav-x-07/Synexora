from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.services.practice_engine import practice_engine

router = APIRouter()

class ProblemGenerateRequest(BaseModel):
    subject: str = Field(default="Computer Science")
    topic: Optional[str] = Field(default=None)
    difficulty: str = Field(default="Medium")
    formatType: str = Field(default="mcq")

class HintRequest(BaseModel):
    problem: Dict[str, Any]
    hintLevel: int = Field(default=1, ge=1, le=3)

class EvaluateRequest(BaseModel):
    problem: Dict[str, Any]
    userAnswer: Any
    userNotes: Optional[str] = None

class AssessmentGenerateRequest(BaseModel):
    subject: str = Field(default="Computer Science")
    topics: List[str] = Field(default_factory=list)
    questionCount: int = Field(default=5, ge=1, le=20)
    difficulty: str = Field(default="Medium")
    durationMinutes: int = Field(default=20, ge=5, le=180)

@router.post("/generate-problem")
def generate_problem(req: ProblemGenerateRequest):
    try:
        problem = practice_engine.generate_problem(
            subject=req.subject,
            topic=req.topic,
            difficulty=req.difficulty,
            format_type=req.formatType
        )
        return {"success": True, "problem": problem}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hint")
def get_progressive_hint(req: HintRequest):
    try:
        hint_data = practice_engine.generate_progressive_hint(
            problem=req.problem,
            hint_level=req.hintLevel
        )
        return {"success": True, "hint": hint_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
def evaluate_submission(req: EvaluateRequest):
    try:
        result = practice_engine.evaluate_submission(
            problem=req.problem,
            user_answer=req.userAnswer,
            user_notes=req.userNotes
        )
        return {"success": True, "evaluation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-assessment")
def generate_assessment(req: AssessmentGenerateRequest):
    try:
        assessment = practice_engine.generate_assessment(
            subject=req.subject,
            topics=req.topics,
            question_count=req.questionCount,
            difficulty=req.difficulty,
            duration_minutes=req.durationMinutes
        )
        return {"success": True, "assessment": assessment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
