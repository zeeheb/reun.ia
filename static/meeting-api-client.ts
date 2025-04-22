/**
 * Meeting Analysis API Client
 * TypeScript client library for the Meeting Analysis API
 * @version 1.0.0
 */

// Response types
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

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: number;
}

export interface ApiErrorData {
  detail: string;
  code?: number;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  data: ApiErrorData;

  constructor(message: string, statusCode: number, data: ApiErrorData) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class MeetingAPIClient {
  private baseUrl: string;
  private apiKey: string;
  private apiVersion: string;

  /**
   * Create a new API client instance
   * @param apiKey - API key for authentication
   * @param baseUrl - Base URL of the API (default: current host)
   */
  constructor(apiKey: string, baseUrl: string = '') {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    // Set base URL, defaulting to the current host if not provided
    this.baseUrl = baseUrl || `${window.location.protocol}//${window.location.host}`;
    this.apiKey = apiKey;
    this.apiVersion = 'v1';
  }

  /**
   * Helper method to create headers with API key
   */
  private _getHeaders(): Record<string, string> {
    return {
      'X-API-Key': this.apiKey
    };
  }

  /**
   * Handle API errors
   * @param response - Fetch API response object
   */
  private async _handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      // Format error message
      throw new ApiError(
        data.detail || 'API request failed', 
        response.status, 
        data as ApiErrorData
      );
    }
    
    return data as T;
  }

  /**
   * Analyze a meeting audio file 
   * @param audioFile - The audio file to analyze
   * @returns Promise that resolves with analysis results
   */
  public async analyzeMeeting(audioFile: File): Promise<AnalysisResponse> {
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
    const response = await fetch(`${this.baseUrl}/api/${this.apiVersion}/analyze-meeting`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: formData
    });
    
    return this._handleResponse<AnalysisResponse>(response);
  }

  /**
   * Extract insights from a meeting transcript
   * @param transcript - The meeting transcript text
   * @returns Promise that resolves with insights
   */
  public async extractInsights(transcript: string): Promise<InsightsResponse> {
    // Validate transcript
    if (!transcript || transcript.trim().length < 50) {
      throw new Error('Valid transcript with at least 50 characters is required');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('transcript', transcript);
    
    // Make API request
    const response = await fetch(`${this.baseUrl}/api/${this.apiVersion}/extract-insights`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: formData
    });
    
    return this._handleResponse<InsightsResponse>(response);
  }

  /**
   * Extract action items from a meeting transcript
   * @param transcript - The meeting transcript text
   * @returns Promise that resolves with action items
   */
  public async extractActionItems(transcript: string): Promise<ActionItemsResponse> {
    // Validate transcript
    if (!transcript || transcript.trim().length < 50) {
      throw new Error('Valid transcript with at least 50 characters is required');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('transcript', transcript);
    
    // Make API request
    const response = await fetch(`${this.baseUrl}/api/${this.apiVersion}/extract-action-items`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: formData
    });
    
    return this._handleResponse<ActionItemsResponse>(response);
  }

  /**
   * Generate bullet points from a meeting transcript
   * @param transcript - The meeting transcript text
   * @returns Promise that resolves with bullet points
   */
  public async generateBulletPoints(transcript: string): Promise<BulletPointsResponse> {
    // Validate transcript
    if (!transcript || transcript.trim().length < 50) {
      throw new Error('Valid transcript with at least 50 characters is required');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('transcript', transcript);
    
    // Make API request
    const response = await fetch(`${this.baseUrl}/api/${this.apiVersion}/generate-bullet-points`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: formData
    });
    
    return this._handleResponse<BulletPointsResponse>(response);
  }

  /**
   * Check API health status
   * @returns Promise that resolves with health status
   */
  public async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/${this.apiVersion}/health`, {
      method: 'GET',
      headers: this._getHeaders()
    });
    
    return this._handleResponse<HealthResponse>(response);
  }
} 