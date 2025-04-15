# Meeting Analysis Agent

An AI agent that processes meeting audio files, transcribes the content, and generates insights, actions, and bullet points from the discussion.

## Features

- Audio transcription from uploaded files
- Extraction of key insights from meetings
- Identification of action items
- Generation of bullet point summaries
- Support for large audio files (automatically splits files exceeding OpenAI's 25MB limit)

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up your OpenAI API key:

```bash
export OPENAI_API_KEY=your_api_key_here
```

## Usage

1. Start the application:

```bash
uvicorn app:app --reload
```

2. Open your browser and go to http://localhost:8000

3. Upload a meeting audio file and get the analysis

## Handling Large Files

The application can process large audio files that exceed OpenAI's 25MB limit by:

1. Automatically detecting large files
2. Splitting them into smaller chunks
3. Transcribing each chunk separately
4. Combining the transcripts for analysis

For extremely large files (100MB+), the processing time may be significant. The UI provides feedback about file size and shows a progress indicator for large files.

## Testing

You can test the application with a sample audio file:

```bash
python test_meeting_agent.py path/to/your/audio_file.mp3
```

This will process the file and display the transcript, insights, action items, and bullet points in the terminal.
