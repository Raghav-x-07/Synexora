from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.services.video_learning import video_learning_engine

router = APIRouter()

class VideoProcessRequest(BaseModel):
    videoUrl: str = Field(default="https://www.youtube.com/watch?v=vYp4LYbnnW8")
    transcriptText: str = Field(default="")
    subject: str = Field(default="Distributed Systems")

class CheckpointQuizRequest(BaseModel):
    checkpointId: str
    selectedOption: int
    checkpoint: Dict[str, Any]

@router.post("/process-video")
def process_video(req: VideoProcessRequest):
    try:
        lesson = video_learning_engine.process_video_transcript(
            video_url=req.videoUrl,
            transcript_text=req.transcriptText,
            subject=req.subject
        )
        return {"success": True, "lesson": lesson}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preloaded")
def get_preloaded():
    try:
        lessons = video_learning_engine.get_preloaded_lessons()
        return {"success": True, "lessons": lessons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-checkpoint")
def evaluate_checkpoint(req: CheckpointQuizRequest):
    try:
        correct_idx = req.checkpoint.get("correctIndex", 0)
        is_correct = req.selectedOption == correct_idx
        return {
            "success": True,
            "isCorrect": is_correct,
            "correctIndex": correct_idx,
            "explanation": req.checkpoint.get("explanation", "Review the video section for details.")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
