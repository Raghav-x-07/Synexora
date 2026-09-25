"""
Synexora AI Concept Video Service.
FastAPI microservice for generating educational concept videos.
"""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.concept_video import router as video_router

app = FastAPI(
    title="Synexora AI Concept Video Service",
    version="1.0.0",
    description="Educational AI lesson and concept video generation microservice"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(video_router)

# Mount Static Generated Videos Directory
GENERATED_DIR = os.path.join(os.path.dirname(__file__), "generated")
VIDEOS_DIR = os.path.join(GENERATED_DIR, "videos")
os.makedirs(VIDEOS_DIR, exist_ok=True)
app.mount("/generated-videos", StaticFiles(directory=VIDEOS_DIR), name="generated-videos")


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "Synexora AI Concept Video Generator",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    print(f"🚀 Synexora AI Service running on http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
