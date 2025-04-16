import os
import streamlit as st
import tempfile
import shutil
import time
from typing import Dict, Optional
from dotenv import load_dotenv
import pathlib

from transcription import AudioTranscriber
from meeting_analysis import MeetingAnalyzer
from analysis_mock import analysis_mock
from transcript_mock import transcript_mock

# Load environment variables from .env.local file
env_path = pathlib.Path('.') / '.env.local'
load_dotenv(dotenv_path=env_path)

# Check if API key exists
if not os.environ.get("OPENAI_API_KEY"):
    print("Warning: OPENAI_API_KEY not found in environment variables. Set it before using the app.")

# Create upload directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize the transcriber and analyzer
# Set max_chunk_size_mb to 24 MB (slightly under the 25MB API limit)
transcriber = AudioTranscriber(use_openai=True, max_chunk_size_mb=24)
analyzer = MeetingAnalyzer(model_id="gpt-4o")

# Configure Streamlit page
st.set_page_config(
    page_title="Meeting Analysis Agent",
    page_icon="🎙️",
    layout="wide"
)

# Load custom CSS
def load_css():
    with open("static/streamlit_styles.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

def save_uploaded_file(uploaded_file):
    """Save uploaded file temporarily and return the path"""
    temp_file_path = os.path.join(UPLOAD_DIR, f"{int(time.time())}_{uploaded_file.name}")
    try:
        # In Streamlit, we need to directly read from the uploaded_file object
        # instead of accessing the 'file' attribute
        with open(temp_file_path, "wb") as buffer:
            buffer.write(uploaded_file.getvalue())
        return temp_file_path
    except Exception as e:
        st.error(f"Error saving file: {e}")
        return None

def process_audio(audio_file_path):
    """Process audio file and return analysis results"""
    try:
        # Get file size in MB for logging
        file_size_mb = os.path.getsize(audio_file_path) / (1024 * 1024)
        
        # Create progress container
        progress_container = st.empty()
        progress_container.info(f"Processing audio file of size {file_size_mb:.2f} MB")
        
        # Create a progress bar
        progress_bar = st.progress(0)
        
        # Step 1: Transcribe the audio (25% of progress)
        progress_container.info("Step 1/2: Transcribing audio... This may take a few minutes for larger files.")
        # For quick development testing, use mock data
        if st.session_state.get('use_mock_data', False):
            transcript = transcript_mock
            # Simulate progress
            for i in range(25):
                time.sleep(0.05)
                progress_bar.progress(i)
        else:
            transcript = transcriber.transcribe(audio_file_path)
            progress_bar.progress(25)
        
        # Check if transcription was successful
        if not transcript or len(transcript.strip()) == 0:
            progress_container.empty()
            progress_bar.empty()
            st.error("Failed to transcribe audio. Please check audio quality and try again.")
            return None
            
        # Step 2: Analyze the transcript (75% of progress)
        progress_container.info("Step 2/2: Analyzing transcript...")
        # For quick development testing, use mock data
        if st.session_state.get('use_mock_data', False):
            analysis_results = analysis_mock
            # Simulate progress
            for i in range(25, 100):
                time.sleep(0.05)
                progress_bar.progress(i)
        else:
            analysis_results = analyzer.analyze_transcript(transcript)
            progress_bar.progress(100)
        
        # Clear progress indicators
        progress_container.empty()
        progress_bar.empty()
        
        # Return the full analysis with transcript included
        return {
            "transcript": transcript,
            "analysis": analysis_results
        }
    
    except Exception as e:
        error_msg = str(e)
        st.error(f"Error processing file: {error_msg}")
        return None
    
    finally:
        # Clean up the temporary file
        if os.path.exists(audio_file_path):
            os.remove(audio_file_path)

def display_results(results):
    """Display analysis results in tabs"""
    if not results:
        return
    
    st.success("Analysis completed successfully!")
    
    # Create a container with styling for results
    with st.container():
        st.markdown('<div class="results-container">', unsafe_allow_html=True)
        
        # Create tabs for results
        transcript_tab, insights_tab, actions_tab, bullets_tab = st.tabs([
            "📝 Transcript", "💡 Insights", "✅ Action Items", "🔍 Bullet Points"
        ])
        
        with transcript_tab:
            st.subheader("Meeting Transcript")
            st.markdown('<div class="transcript-box">', unsafe_allow_html=True)
            st.text_area("Full transcript", value=results["transcript"], height=400, disabled=True)
            st.markdown('</div>', unsafe_allow_html=True)
        
        with insights_tab:
            st.subheader("Key Insights")
            st.markdown(results["analysis"]["insights"])
        
        with actions_tab:
            st.subheader("Action Items")
            st.markdown(results["analysis"]["action_items"])
        
        with bullets_tab:
            st.subheader("Bullet Points")
            st.markdown(results["analysis"]["bullet_points"])
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Add download buttons for the results
    st.markdown("### Download Results")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.download_button(
            "📝 Transcript",
            results["transcript"],
            file_name="transcript.txt"
        )
    with col2:
        st.download_button(
            "💡 Insights",
            results["analysis"]["insights"],
            file_name="insights.md"
        )
    with col3:
        st.download_button(
            "✅ Action Items",
            results["analysis"]["action_items"],
            file_name="action_items.md"
        )
    with col4:
        st.download_button(
            "🔍 Bullet Points",
            results["analysis"]["bullet_points"],
            file_name="bullet_points.md"
        )

# Add text input and analysis options
def analyze_text_input():
    """Provide options to analyze text input directly"""
    st.markdown("## Analyze Text Directly")
    st.markdown("Paste a meeting transcript to analyze without audio")
    
    with st.container():
        st.markdown('<div class="card-container">', unsafe_allow_html=True)
        
        text_input = st.text_area("Meeting Transcript", height=200)
        
        if text_input and len(text_input.strip()) > 50:
            analysis_options = st.radio(
                "Choose Analysis Type",
                ["All", "Insights Only", "Action Items Only", "Bullet Points Only"],
                horizontal=True
            )
            
            analyze_button = st.button("Analyze Text", key="analyze_text_button")
            if analyze_button:
                with st.spinner("Analyzing transcript..."):
                    if analysis_options == "All":
                        if st.session_state.get('use_mock_data', False):
                            analysis_results = analysis_mock
                        else:
                            analysis_results = analyzer.analyze_transcript(text_input)
                        display_results({
                            "transcript": text_input,
                            "analysis": analysis_results
                        })
                    elif analysis_options == "Insights Only":
                        insights = analyzer.extract_insights(text_input)
                        st.markdown("### 💡 Insights")
                        st.markdown(insights)
                        st.download_button("Download Insights", insights, file_name="insights.md")
                    elif analysis_options == "Action Items Only":
                        action_items = analyzer.extract_action_items(text_input)
                        st.markdown("### ✅ Action Items")
                        st.markdown(action_items)
                        st.download_button("Download Action Items", action_items, file_name="action_items.md")
                    elif analysis_options == "Bullet Points Only":
                        bullet_points = analyzer.generate_bullet_points(text_input)
                        st.markdown("### 🔍 Bullet Points")
                        st.markdown(bullet_points)
                        st.download_button("Download Bullet Points", bullet_points, file_name="bullet_points.md")
        elif text_input:
            st.warning("Please enter at least 50 characters for meaningful analysis")
            
        st.markdown('</div>', unsafe_allow_html=True)

def main():
    """Main function for the Streamlit app"""
    
    # Load custom CSS
    try:
        load_css()
    except Exception as e:
        print(f"Could not load custom CSS: {e}")
    
    # Title and description with custom CSS class
    st.markdown('<h1 class="main-title">Meeting Analysis Agent</h1>', unsafe_allow_html=True)
    st.markdown("Upload a meeting audio file to analyze and extract insights, action items, and bullet points.")
    
    # Debug mode toggle in sidebar for using mock data (to speed up development)
    with st.sidebar:
        st.title("Settings")
        if st.checkbox("Developer Mode (Use Mock Data)", False):
            st.session_state['use_mock_data'] = True
            st.info("Using mock data for faster development")
        else:
            st.session_state['use_mock_data'] = False
        
        st.divider()
        st.markdown("### About")
        st.markdown("""
        This application analyzes meeting audio files to extract:
        - Key insights
        - Action items
        - Summary bullet points
        
        It uses OpenAI's Whisper for transcription and GPT models for analysis.
        """)
    
    # Main content in a card container
    with st.container():
        st.markdown('<div class="card-container">', unsafe_allow_html=True)
        
        # File uploader
        uploaded_file = st.file_uploader("Upload Audio File", type=["mp3", "wav", "m4a", "mp4", "ogg"])
        
        if uploaded_file is not None:
            # Display file info
            file_size_mb = uploaded_file.size / (1024 * 1024)
            st.write(f"File: **{uploaded_file.name}** ({file_size_mb:.2f} MB)")
            
            # Check file size and show warning if large
            if file_size_mb > 25:
                st.markdown(
                    f'<div class="warning-box">⚠️ Large file detected ({file_size_mb:.1f} MB)! '
                    f'Files larger than 25MB will be processed in chunks, which may take longer.</div>',
                    unsafe_allow_html=True
                )
                if file_size_mb > 100:
                    st.warning("This file is very large and may take several minutes to process.")
            
            # Button to start analysis
            analyze_col1, analyze_col2 = st.columns([1, 3])
            with analyze_col1:
                analyze_button = st.button("Analyze Meeting", type="primary")
            
            if analyze_button:
                # Save the uploaded file temporarily
                temp_file_path = save_uploaded_file(uploaded_file)
                if temp_file_path:
                    # Process the audio file
                    results = process_audio(temp_file_path)
                    
                    # Display results
                    if results:
                        display_results(results)
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Add separator
    st.divider()
    
    # Add text analysis option
    analyze_text_input()
    
    # Footer
    st.markdown('<div class="footer">Meeting Analysis Agent - Powered by OpenAI</div>', unsafe_allow_html=True)

# Run the app
if __name__ == "__main__":
    main() 