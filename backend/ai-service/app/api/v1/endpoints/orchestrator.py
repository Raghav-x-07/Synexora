from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.services.agent_orchestrator import agent_orchestrator

router = APIRouter()

class DispatchRequest(BaseModel):
    query: str
    studentContext: Optional[Dict[str, Any]] = None
    activeMemories: Optional[List[Dict[str, Any]]] = None
    activeTasks: Optional[List[Dict[str, Any]]] = None
    activeCourse: Optional[str] = "Distributed Systems"

@router.post("/dispatch")
def dispatch_multi_agent(req: DispatchRequest):
    try:
        result = agent_orchestrator.orchestrate(
            query=req.query,
            student_context=req.studentContext,
            active_memories=req.activeMemories,
            active_tasks=req.activeTasks,
            active_course=req.activeCourse
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents")
def get_agents():
    try:
        agents = agent_orchestrator.get_registered_agents()
        return {"success": True, "agents": agents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
