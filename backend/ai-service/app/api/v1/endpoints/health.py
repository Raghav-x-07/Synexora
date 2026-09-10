from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Synexora AI Multi-Agent Engine",
        "version": "1.0.0",
        "orchestrator_status": "ready",
        "active_agents": [
            "Learning Agent",
            "Memory Agent (Controlled)",
            "Personal Assistant Agent",
            "Assessment Agent",
            "RAG Agent"
        ],
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
