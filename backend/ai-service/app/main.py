from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import health, tutor, memory, rag, practice, adaptive, diary, orchestrator, media

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Synexora AI Engine — Multi-Agent Orchestrator, Socratic Tutor, RAG, Controlled Memory, Practice, Scheduling & Video Learning"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(tutor.router, prefix=settings.API_V1_STR)
app.include_router(memory.router, prefix=settings.API_V1_STR)
app.include_router(rag.router, prefix=settings.API_V1_STR)
app.include_router(practice.router, prefix=f"{settings.API_V1_STR}/practice", tags=["practice"])
app.include_router(adaptive.router, prefix=f"{settings.API_V1_STR}/adaptive", tags=["adaptive"])
app.include_router(diary.router, prefix=f"{settings.API_V1_STR}/diary", tags=["diary"])
app.include_router(orchestrator.router, prefix=f"{settings.API_V1_STR}/orchestrator", tags=["orchestrator"])
app.include_router(media.router, prefix=f"{settings.API_V1_STR}/media", tags=["media"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Synexora AI Intelligence Service",
        "philosophy": "Teach. Remember. Plan. Adapt.",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
