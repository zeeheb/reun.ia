"""
Test script for the Meeting Analysis Agent.
This script demonstrates how to use the agent programmatically.
"""

import os
import sys
from transcription import AudioTranscriber
from meeting_analysis import MeetingAnalyzer

def test_meeting_agent(audio_file_path):
    """
    Test the meeting agent with an audio file.
    
    Args:
        audio_file_path: Path to the audio file
    """
    # Check if OpenAI API key is set
    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not found in environment variables.")
        print("Please set it before running the test:")
        print("  export OPENAI_API_KEY=your_api_key_here")
        sys.exit(1)
    
    # Check if the file exists
    if not os.path.isfile(audio_file_path):
        print(f"Error: File not found: {audio_file_path}")
        sys.exit(1)
    
    # Get file size in MB
    file_size_mb = os.path.getsize(audio_file_path) / (1024 * 1024)
    print(f"Testing Meeting Analysis Agent with file: {audio_file_path} ({file_size_mb:.2f} MB)")
    
    # Warn about large files
    if file_size_mb > 25:
        print(f"Warning: Large file detected ({file_size_mb:.2f} MB). This will be processed in chunks and may take longer.")
    
    # Initialize components
    # Use the chunk handling functionality for large files
    transcriber = AudioTranscriber(use_openai=True, max_chunk_size_mb=24)
    analyzer = MeetingAnalyzer(model_id="gpt-4o")
    
    # Step 1: Transcribe the audio
    print("\n1. Transcribing audio...")
    try:
        transcript = transcriber.transcribe(audio_file_path)
        print(f"Transcription complete - {len(transcript)} characters")
        print("\nTranscript preview:")
        print("-------------------")
        print(transcript[:500] + "..." if len(transcript) > 500 else transcript)
        print("-------------------")
    except Exception as e:
        print(f"Error during transcription: {e}")
        sys.exit(1)
    
    # Step 2: Extract insights
    print("\n2. Extracting insights...")
    try:
        insights = analyzer.extract_insights(transcript)
        print("\nInsights:")
        print("-------------------")
        print(insights)
        print("-------------------")
    except Exception as e:
        print(f"Error extracting insights: {e}")
    
    # Step 3: Extract action items
    print("\n3. Extracting action items...")
    try:
        action_items = analyzer.extract_action_items(transcript)
        print("\nAction Items:")
        print("-------------------")
        print(action_items)
        print("-------------------")
    except Exception as e:
        print(f"Error extracting action items: {e}")
    
    # Step 4: Generate bullet points
    print("\n4. Generating bullet points...")
    try:
        bullet_points = analyzer.generate_bullet_points(transcript)
        print("\nBullet Points:")
        print("-------------------")
        print(bullet_points)
        print("-------------------")
    except Exception as e:
        print(f"Error generating bullet points: {e}")
    
    print("\nTest complete!")

if __name__ == "__main__":
    # Check if an audio file path was provided
    if len(sys.argv) < 2:
        print("Usage: python test_meeting_agent.py <path_to_audio_file>")
        sys.exit(1)
    
    # Get the audio file path from command line arguments
    audio_file_path = sys.argv[1]
    
    # Run the test
    test_meeting_agent(audio_file_path) 