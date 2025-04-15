from transcript_mock import transcript_mock
import os
import tempfile
import shutil
import time
from typing import Dict, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from transcription import AudioTranscriber
from meeting_analysis import MeetingAnalyzer

# Check if API key exists
if not os.environ.get("OPENAI_API_KEY"):
    print("Warning: OPENAI_API_KEY not found in environment variables. Set it before using the app.")

# Create upload directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create static directory if it doesn't exist
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="Meeting Analysis Agent",
    description="An AI agent that processes meeting recordings and extracts insights, actions, and summaries.",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.post("/analyze-meeting/", response_model=Dict)
async def analyze_meeting(audio_file: UploadFile = File(...)):
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
        # transcript = transcriber.transcribe(temp_file_path) // for now, we'll use a mock transcript
        transcript = transcript_mock
        
        
        # Check if transcription was successful
        if not transcript or len(transcript.strip()) == 0:
            print("Warning: Empty transcript generated")
            return {
                "transcript": "Não foi possível transcrever o áudio. Por favor, verifique a qualidade do áudio e tente novamente.",
                "analysis": {
                    "insights": "Não foi possível gerar insights sem transcrição.",
                    "action_items": "Não foi possível identificar itens de ação sem transcrição.",
                    "bullet_points": "Não foi possível gerar pontos de resumo sem transcrição."
                }
            }
            
        print(f"Transcription complete: {len(transcript)} characters")
        
        # Step 2: Analyze the transcript
        print("Starting analysis...")
        analysis_results = analyzer.analyze_transcript(transcript)
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
            error_msg = "The audio file is too large for the transcription service. The file will be automatically split into smaller chunks for processing."
        
        # If the error is related to the Agno agent
        if "Agent" in error_msg:
            return {
                "transcript": "O áudio foi transcrito, mas ocorreu um erro durante a análise.",
                "analysis": {
                    "insights": "Erro durante análise. Por favor, tente novamente mais tarde.",
                    "action_items": "Erro durante análise. Por favor, tente novamente mais tarde.",
                    "bullet_points": "Erro durante análise. Por favor, tente novamente mais tarde."
                }
            }
            
        raise HTTPException(status_code=500, detail=f"Error processing file: {error_msg}")
    
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/extract-insights/", response_model=Dict)
async def extract_insights(transcript: str = Form(...)):
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
        return {"insights": "Ocorreu um erro ao analisar os insights da reunião."}

@app.post("/extract-action-items/", response_model=Dict)
async def extract_action_items(transcript: str = Form(...)):
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
        return {"action_items": "Ocorreu um erro ao analisar os itens de ação da reunião."}

@app.post("/generate-bullet-points/", response_model=Dict)
async def generate_bullet_points(transcript: str = Form(...)):
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
        return {"bullet_points": "Ocorreu um erro ao gerar o resumo da reunião."}

@app.get("/")
async def root():
    """Redirect to static index.html"""
    return RedirectResponse(url="/static/index.html")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 