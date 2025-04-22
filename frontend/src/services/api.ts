// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Types
export interface AnalysisResult {
  insights: string;
  action_items: string;
  bullet_points: string;
}

export interface AnalysisResponse {
  transcript: string;
  analysis: AnalysisResult;
}

export interface InsightsResponse {
  insights: string;
}

export interface ActionItemsResponse {
  action_items: string;
}

export interface BulletPointsResponse {
  bullet_points: string;
}

export interface ApiError {
  detail: string;
  code?: number;
}

// API service class
class ApiService {
  private apiKey: string = '';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'X-API-Key': this.apiKey,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        message: data.detail || 'An error occurred',
        status: response.status,
        data
      };
    }
    
    return data as T;
  }

  async analyzeMeeting(audioFile: File): Promise<AnalysisResponse> {
    // Validate file is provided
    if (!audioFile) {
      throw new Error('Valid audio file is required');
    }
    
    // Check if file is audio or video
    if (!audioFile.type.startsWith('audio/') && !audioFile.type.startsWith('video/')) {
      throw new Error('File must be an audio or video file');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/analyze-meeting`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData
    });
    
    return this.handleResponse<AnalysisResponse>(response);
  }

  async extractInsights(transcript: string): Promise<InsightsResponse> {
    // Validate transcript
    if (!transcript || transcript.trim().length < 50) {
      throw new Error('Valid transcript with at least 50 characters is required');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('transcript', transcript);
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/extract-insights`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData
    });
    
    return this.handleResponse<InsightsResponse>(response);
  }

  async extractActionItems(transcript: string): Promise<ActionItemsResponse> {
    // Validate transcript
    if (!transcript || transcript.trim().length < 50) {
      throw new Error('Valid transcript with at least 50 characters is required');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('transcript', transcript);
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/extract-action-items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData
    });
    
    return this.handleResponse<ActionItemsResponse>(response);
  }

  async generateBulletPoints(transcript: string): Promise<BulletPointsResponse> {
    // Validate transcript
    if (!transcript || transcript.trim().length < 50) {
      throw new Error('Valid transcript with at least 50 characters is required');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('transcript', transcript);
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/generate-bullet-points`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData
    });
    
    return this.handleResponse<BulletPointsResponse>(response);
  }

  async checkHealth(): Promise<{status: string; version: string; timestamp: number}> {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    return this.handleResponse<{status: string; version: string; timestamp: number}>(response);
  }
}

// Export a singleton instance
export const apiService = new ApiService(); 