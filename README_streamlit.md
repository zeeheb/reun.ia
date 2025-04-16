# Meeting Analysis Agent - Streamlit Interface

This is a Streamlit version of the Meeting Analysis Agent application that processes meeting recordings and extracts insights, action items, and summaries.

## Features

- Upload audio/video files of meetings for transcription and analysis
- Process meeting transcripts to extract key insights
- Identify action items from meetings
- Generate bullet point summaries of meeting discussions
- Streamlit UI with intuitive interface for all these features

## Installation

1. Make sure you have Python 3.7+ installed
2. Clone this repository
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

4. Set up your OpenAI API key:
   - Create a `.env.local` file in the root directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

## Running the application

Run the Streamlit app with:

```bash
streamlit run streamlit_app.py
```

The application will be available at http://localhost:8501

## Usage

1. Upload an audio file (mp3, wav, m4a, mp4, ogg formats supported)
2. Click "Analyze Meeting" to process the audio
3. View the results in the tabbed interface:
   - Transcript: Full text of the meeting
   - Insights: Key points and insights from the discussion
   - Action Items: Tasks and follow-ups identified
   - Bullet Points: Concise summary of the meeting
4. Download any of the results as text files

Alternatively, you can paste a transcript directly in the "Analyze Text Directly" section and choose the type of analysis you want to perform.

## Developer Mode

For testing and development, enable "Developer Mode" in the sidebar to use mock data instead of making actual API calls.

## Notes

- Large audio files (>25MB) will be automatically split and processed in chunks
- The processing time depends on the length of the audio and the API response time
- All audio files are temporarily stored and deleted after processing
