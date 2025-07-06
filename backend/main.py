from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, audio, data
from models.database import engine, Base
from config.config import UPLOAD_DIR

# Initialize FastAPI app
app = FastAPI()

# Serve uploaded audio files as static files
app.mount("/uploaded_audios", StaticFiles(directory=UPLOAD_DIR), name="uploaded_audios")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(audio.router, prefix="/audio", tags=["audio"])
app.include_router(data.router, prefix="/data", tags=["data"])

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Dial 112 AI Analyzer API"}
