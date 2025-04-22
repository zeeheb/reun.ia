from analysis_mock import analysis_mock
from transcript_mock import transcript_mock
import os
import tempfile
import shutil
import time
import secrets
from typing import Dict, Optional, List, Union
from pydantic import BaseModel, Field
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends, Header, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from starlette.status import HTTP_403_FORBIDDEN, HTTP_429_TOO_MANY_REQUESTS
import uvicorn
from dotenv import load_dotenv
import pathlib

from transcription import AudioTranscriber
from meeting_analysis import MeetingAnalyzer

# Load environment variables from .env.local file
env_path = pathlib.Path('.') / '.env.local'
load_dotenv(dotenv_path=env_path)

# Check if API key exists
if not os.environ.get("OPENAI_API_KEY"):
    print("Warning: OPENAI_API_KEY not found in environment variables. Set it before using the app.")

# Create upload directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create static directory if it doesn't exist
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

# API Authentication
API_KEY_NAME = "X-API-Key"
API_KEY = os.environ.get("API_KEY", secrets.token_urlsafe(32))  # Generate random API key if not provided
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

print(f"API Key for development: {API_KEY}")

# Rate limiting configuration
RATE_LIMIT_DURATION = 3600  # 1 hour in seconds
RATE_LIMIT_REQUESTS = 100   # Number of requests allowed per duration
# Dictionary to store request counts: {ip_address: (count, timestamp)}
request_tracker = {}

# Response Models
class ErrorResponse(BaseModel):
    detail: str
    code: int = Field(..., description="HTTP status code")
    
class AnalysisResponse(BaseModel):
    transcript: str = Field(..., description="The transcript of the meeting audio")
    analysis: Dict = Field(..., description="Analysis results including insights, action items, and bullet points")

class InsightsResponse(BaseModel):
    insights: str = Field(..., description="Key insights extracted from the meeting transcript")

class ActionItemsResponse(BaseModel):
    action_items: str = Field(..., description="Action items extracted from the meeting transcript")

class BulletPointsResponse(BaseModel):
    bullet_points: str = Field(..., description="Bullet point summary of the meeting")

# Initialize FastAPI app
app = FastAPI(
    title="Meeting Analysis API",
    description="API for processing meeting recordings and extracting insights, actions, and summaries",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify the domains you want to allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Initialize the transcriber and analyzer
# Set max_chunk_size_mb to 24 MB (slightly under the 25MB API limit)
transcriber = AudioTranscriber(use_openai=True, max_chunk_size_mb=24)
analyzer = MeetingAnalyzer(model_id="gpt-4o")

# API Key validation dependency
async def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key == API_KEY:
        return api_key
    raise HTTPException(
        status_code=HTTP_403_FORBIDDEN, 
        detail="Invalid API key",
    )

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Skip rate limiting for documentation
    if request.url.path in ["/api/docs", "/api/redoc", "/api/openapi.json", "/static"]:
        return await call_next(request)
        
    # Get client IP
    client_ip = request.client.host
    
    # Check if client has exceeded rate limit
    current_time = time.time()
    if client_ip in request_tracker:
        count, timestamp = request_tracker[client_ip]
        
        # Reset count if duration has passed
        if current_time - timestamp > RATE_LIMIT_DURATION:
            request_tracker[client_ip] = (1, current_time)
        # Increment count if within duration
        elif count < RATE_LIMIT_REQUESTS:
            request_tracker[client_ip] = (count + 1, timestamp)
        # Return 429 if rate limit exceeded
        else:
            return JSONResponse(
                status_code=HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded", "code": 429},
            )
    else:
        # First request from this client
        request_tracker[client_ip] = (1, current_time)
        
    return await call_next(request)

# API Routes
@app.post("/api/v1/analyze-meeting", response_model=AnalysisResponse)
async def analyze_meeting(
    audio_file: UploadFile = File(...),
    api_key: str = Depends(get_api_key)
):
    """
    Process an uploaded meeting audio file and return analysis.
    
    Args:
        audio_file: The uploaded audio file of the meeting
        
    Returns:
        Dict containing analysis results (insights, action items, bullet points)
    """
    # Validate file type
    if not audio_file.content_type.startswith(("audio/", "video/")):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Save uploaded file temporarily
    temp_file_path = os.path.join(UPLOAD_DIR, f"{int(time.time())}_{audio_file.filename}")
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        
        # Get file size in MB for logging
        file_size_mb = os.path.getsize(temp_file_path) / (1024 * 1024)
        print(f"Processing audio file: {audio_file.filename} ({file_size_mb:.2f} MB)")
        
        # Check if file exceeds maximum allowed size (we'll still try to process it with chunking)
        if file_size_mb > 100:  # Set a reasonable upper limit
            print(f"Warning: File size ({file_size_mb:.2f} MB) is very large and may take a long time to process")
        
        # Step 1: Transcribe the audio
        print("Starting transcription...")
        transcript = transcriber.transcribe(temp_file_path) # uncomment for production
        # transcript = transcript_mock # For development testing
        
        # Check if transcription was successful
        if not transcript or len(transcript.strip()) == 0:
            print("Warning: Empty transcript generated")
            return JSONResponse(
                status_code=422,
                content={
                    "transcript": "Não foi possível transcrever o áudio. Por favor, verifique a qualidade do áudio e tente novamente.",
                    "analysis": {
                        "insights": "Não foi possível gerar insights sem transcrição.",
                        "action_items": "Não foi possível identificar itens de ação sem transcrição.",
                        "bullet_points": "Não foi possível gerar pontos de resumo sem transcrição."
                    }
                }
            )
            
        print(f"Transcription complete: {len(transcript)} characters")
        
        # Step 2: Analyze the transcript
        print("Starting analysis...")
        analysis_results = analyzer.analyze_transcript(transcript) # uncomment for production
        # analysis_results = analysis_mock # For development testing
        print("Analysis complete")
        
        # Return the full analysis with transcript included
        return {
            "transcript": transcript,
            "analysis": analysis_results
        }
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error processing file: {error_msg}")
        
        # Provide more helpful error message for common errors
        if "413: Maximum content size limit" in error_msg:
            error_msg = "The audio file is too large for the transcription service. Consider using a smaller file."
        
        raise HTTPException(status_code=500, detail=error_msg)
    
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/api/v1/extract-insights", response_model=InsightsResponse)
async def extract_insights(
    transcript: str = Form(...),
    api_key: str = Depends(get_api_key)
):
    """
    Extract insights from a meeting transcript.
    
    Args:
        transcript: The text transcript of the meeting
        
    Returns:
        Dict containing insights
    """
    try:
        if not transcript or len(transcript.strip()) < 50:
            return {"insights": "A transcrição é muito curta para análise."}
            
        insights = analyzer.extract_insights(transcript)
        return {"insights": insights}
    except Exception as e:
        print(f"Error extracting insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting insights: {str(e)}")

@app.post("/api/v1/extract-action-items", response_model=ActionItemsResponse)
async def extract_action_items(
    transcript: str = Form(...),
    api_key: str = Depends(get_api_key)
):
    """
    Extract action items from a meeting transcript.
    
    Args:
        transcript: The text transcript of the meeting
        
    Returns:
        Dict containing action items
    """
    try:
        if not transcript or len(transcript.strip()) < 50:
            return {"action_items": "A transcrição é muito curta para análise."}
            
        action_items = analyzer.extract_action_items(transcript)
        return {"action_items": action_items}
    except Exception as e:
        print(f"Error extracting action items: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting action items: {str(e)}")

@app.post("/api/v1/generate-bullet-points", response_model=BulletPointsResponse)
async def generate_bullet_points(
    transcript: str = Form(...),
    api_key: str = Depends(get_api_key)
):
    """
    Generate bullet points from a meeting transcript.
    
    Args:
        transcript: The text transcript of the meeting
        
    Returns:
        Dict containing bullet points
    """
    try:
        if not transcript or len(transcript.strip()) < 50:
            return {"bullet_points": "A transcrição é muito curta para análise."}
            
        bullet_points = analyzer.generate_bullet_points(transcript)
        return {"bullet_points": bullet_points}
    except Exception as e:
        print(f"Error generating bullet points: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating bullet points: {str(e)}")

@app.get("/api/v1/health")
async def health_check():
    """
    Check if the API is up and running.
    
    Returns:
        Dict containing status information
    """
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": time.time()
    }

@app.get("/swagger")
async def swagger_ui():
    """Redirect to Swagger UI HTML page"""
    return RedirectResponse(url="/static/swagger-ui.html")

@app.get("/")
async def root():
    """Redirect to API documentation"""
    return RedirectResponse(url="/api/docs")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 