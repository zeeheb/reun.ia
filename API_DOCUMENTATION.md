# Meeting Analysis API Documentation

## Overview

The Meeting Analysis API provides a powerful set of endpoints to analyze meeting audio recordings and transcripts. The API can extract key insights, action items, and generate bullet-point summaries from meeting content.

## Authentication

All API requests require authentication using an API key. You must include your API key in the `X-API-Key` header of all requests:

```
X-API-Key: your_api_key_here
```

## Base URL

All API endpoints are relative to the base URL:

```
https://your-api-domain.com/api/v1
```

## Rate Limiting

The API employs rate limiting to ensure fair usage. Each client is limited to **100 requests per hour** based on IP address. If you exceed this limit, the API will return a 429 Too Many Requests response.

## Endpoints

### Analyze Meeting

Analyzes an audio recording of a meeting to extract transcript and insights.

- **URL**: `/analyze-meeting`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `audio_file`: The audio file of the meeting (MP3, WAV, MP4, etc.)
- **Response Format**: JSON
  - `transcript`: The text transcript of the meeting
  - `analysis`: An object containing:
    - `insights`: Key insights extracted from the meeting
    - `action_items`: Action items identified in the meeting
    - `bullet_points`: A summarized list of discussion points

**Example Response:**

```json
{
  "transcript": "Meeting transcript text here...",
  "analysis": {
    "insights": "• Key insight 1\n• Key insight 2\n• Key insight 3",
    "action_items": "1. John will prepare the Q2.2023 report by next Friday\n2. Maria will contact the client for feedback",
    "bullet_points": "• Discussed Q2 results\n• Planned marketing campaign\n• Reviewed client feedback"
  }
}
```

### Extract Insights

Extracts key insights from a meeting transcript.

- **URL**: `/extract-insights`
- **Method**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Body**:
  - `transcript`: The meeting transcript text
- **Response Format**: JSON
  - `insights`: Key insights extracted from the transcript

### Extract Action Items

Extracts action items and tasks from a meeting transcript.

- **URL**: `/extract-action-items`
- **Method**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Body**:
  - `transcript`: The meeting transcript text
- **Response Format**: JSON
  - `action_items`: Action items extracted from the transcript

### Generate Bullet Points

Generates a bullet-point summary of the meeting discussion.

- **URL**: `/generate-bullet-points`
- **Method**: `POST`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Body**:
  - `transcript`: The meeting transcript text
- **Response Format**: JSON
  - `bullet_points`: Bullet-point summary of the discussion

### Health Check

Checks if the API is operational.

- **URL**: `/health`
- **Method**: `GET`
- **Response Format**: JSON
  - `status`: Service status ("ok" if operational)
  - `version`: Current API version
  - `timestamp`: Current server timestamp

## Client Libraries

To simplify integration with the API, we provide client libraries for JavaScript and TypeScript.

### JavaScript Client

#### Installation

You can include the JavaScript client directly in your HTML:

```html
<script src="https://your-api-domain.com/static/meeting-api-client.js"></script>
```

Or use it with npm:

```bash
npm install meeting-analysis-api-client
```

#### Usage

```javascript
// Initialize the client with your API key
const apiClient = new MeetingAPIClient("your_api_key_here");

// Analyze a meeting recording
const fileInput = document.getElementById("audio-file");
const file = fileInput.files[0];

apiClient
  .analyzeMeeting(file)
  .then((result) => {
    console.log("Transcript:", result.transcript);
    console.log("Insights:", result.analysis.insights);
    console.log("Action Items:", result.analysis.action_items);
    console.log("Summary:", result.analysis.bullet_points);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });

// Extract insights from a transcript
const transcript = "Your meeting transcript text here...";
apiClient
  .extractInsights(transcript)
  .then((result) => {
    console.log("Insights:", result.insights);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### TypeScript Client

#### Installation

```bash
npm install meeting-analysis-api-client
```

#### Usage

```typescript
import { MeetingAPIClient } from "meeting-analysis-api-client";

// Initialize the client with your API key
const apiClient = new MeetingAPIClient("your_api_key_here");

// Analyze a meeting recording
const fileInput = document.getElementById("audio-file") as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  apiClient
    .analyzeMeeting(file)
    .then((result) => {
      console.log("Transcript:", result.transcript);
      console.log("Insights:", result.analysis.insights);
      console.log("Action Items:", result.analysis.action_items);
      console.log("Summary:", result.analysis.bullet_points);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

// Extract insights from a transcript
const transcript = "Your meeting transcript text here...";
apiClient
  .extractInsights(transcript)
  .then((result) => {
    console.log("Insights:", result.insights);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests.

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid request (missing parameters, invalid file type)
- `401 Unauthorized`: Missing API key
- `403 Forbidden`: Invalid API key
- `422 Unprocessable Entity`: Request was valid but could not be processed (e.g., transcript generation failed)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

Error responses include a JSON object with an error message:

```json
{
  "detail": "Error message describing the issue",
  "code": 400
}
```
