from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.services.adaptive_scheduler import adaptive_scheduler

router = APIRouter()

class LearningPathRequest(BaseModel):
    subject: str = Field(default="Database Management Systems")
    goal: str = Field(default="Score 90%+ on Midterm")
    targetDate: Optional[str] = Field(default=None)
    weakAreas: Optional[List[str]] = Field(default=None)
    weeklyHours: int = Field(default=10, ge=1, le=50)

class ScheduleOptimizeRequest(BaseModel):
    calendarEvents: List[Dict[str, Any]] = Field(default_factory=list)
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    weeklyStudyGoalHours: int = Field(default=12)

class SmartRemindersRequest(BaseModel):
    upcomingEvents: List[Dict[str, Any]] = Field(default_factory=list)
    weakTopics: List[Dict[str, Any]] = Field(default_factory=list)

@router.post("/learning-path")
def generate_learning_path(req: LearningPathRequest):
    try:
        path = adaptive_scheduler.generate_learning_path(
            subject=req.subject,
            goal=req.goal,
            target_date=req.targetDate,
            weak_areas=req.weakAreas,
            weekly_hours=req.weeklyHours
        )
        return {"success": True, "learningPath": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize-schedule")
def optimize_schedule(req: ScheduleOptimizeRequest):
    try:
        blocks = adaptive_scheduler.optimize_study_schedule(
            calendar_events=req.calendarEvents,
            tasks=req.tasks,
            weekly_study_goal_hours=req.weeklyStudyGoalHours
        )
        return {"success": True, "recommendedBlocks": blocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/smart-reminders")
def get_smart_reminders(req: SmartRemindersRequest):
    try:
        reminders = adaptive_scheduler.generate_smart_reminders(
            upcoming_events=req.upcomingEvents,
            weak_topics=req.weakTopics
        )
        return {"success": True, "reminders": reminders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
