# Meeting Analysis API

An AI-powered API service that processes meeting audio files, transcribes the content, and generates insights, actions, and bullet points from the discussion.

## Features

- Audio transcription from uploaded files
- Extraction of key insights from meetings
- Identification of action items
- Generation of bullet point summaries
- RESTful API with authentication and rate limiting
- Support for large audio files (automatically splits files exceeding OpenAI's 25MB limit)
- JavaScript and TypeScript client libraries for easy integration

## API Documentation

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

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

3. Set up your environment variables:

Create a `.env.local` file in the project root with the following:

```
OPENAI_API_KEY=your_openai_api_key_here
API_KEY=your_api_key_for_authentication  # Optional: a random one will be generated if not provided
```

## Usage

### Starting the API server

Start the application:

```bash
uvicorn app:app --reload
```

The API will be available at:

- API endpoints: http://localhost:8000/api/v1/
- API documentation: http://localhost:8000/api/docs
- Example frontend: http://localhost:8000/static/example.html

### Using the API

All API requests require authentication using the `X-API-Key` header:

```
X-API-Key: your_api_key_here
```

#### Example: Analyze a meeting audio file

```bash
curl -X POST http://localhost:8000/api/v1/analyze-meeting \
  -H "X-API-Key: your_api_key_here" \
  -F "audio_file=@/path/to/meeting_recording.mp3"
```

#### Example: Extract insights from transcript

```bash
curl -X POST http://localhost:8000/api/v1/extract-insights \
  -H "X-API-Key: your_api_key_here" \
  -F "transcript=This is the meeting transcript text..."
```

## Client Libraries

### JavaScript

```javascript
// Initialize the client with your API key
const apiClient = new MeetingAPIClient("your_api_key_here");

// Analyze a meeting recording
const fileInput = document.getElementById("audio-file");
apiClient
  .analyzeMeeting(fileInput.files[0])
  .then((result) => {
    console.log("Transcript:", result.transcript);
    console.log("Insights:", result.analysis.insights);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### TypeScript

```typescript
import { MeetingAPIClient } from "./meeting-api-client";

// Initialize the client with your API key
const apiClient = new MeetingAPIClient("your_api_key_here");

// Extract action items from a transcript
const transcript = "Your meeting transcript text here...";
apiClient
  .extractActionItems(transcript)
  .then((result) => {
    console.log("Action Items:", result.action_items);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## Testing

You can test the application with a sample audio file:

```bash
python test_meeting_agent.py path/to/your/audio_file.mp3
```

This will process the file and display the transcript, insights, action items, and bullet points in the terminal.

## Deployment

This application is designed to be deployed on any platform that supports Python and FastAPI:

1. Set up your environment variables (especially `OPENAI_API_KEY` and `API_KEY`)
2. Install dependencies with `pip install -r requirements.txt`
3. Run with a production ASGI server:

```bash
gunicorn app:app -k uvicorn.workers.UvicornWorker -w 4 --bind 0.0.0.0:8000
```
