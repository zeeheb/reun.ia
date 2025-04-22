/**
 * Meeting Analysis API Client
 * JavaScript client library for the Meeting Analysis API
 * @version 1.0.0
 */

class MeetingAPIClient {
  /**
   * Create a new API client instance
   * @param {string} baseUrl - Base URL of the API (default: current host)
   * @param {string} apiKey - API key for authentication
   */
  constructor(apiKey, baseUrl = '') {
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
   * @returns {Object} Headers object
   */
  _getHeaders() {
    return {
      'X-API-Key': this.apiKey
    };
  }

  /**
   * Handle API errors
   * @param {Response} response - Fetch API response object
   * @returns {Promise} Promise that resolves with the response or rejects with an error
   */
  async _handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      // Format error message
      const error = new Error(data.detail || 'API request failed');
      error.statusCode = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  }

  /**
   * Analyze a meeting audio file 
   * @param {File} audioFile - The audio file to analyze
   * @returns {Promise<Object>} Promise that resolves with analysis results
   */
  async analyzeMeeting(audioFile) {
    // Validate file is provided
    if (!audioFile || !(audioFile instanceof File)) {
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
    
    return this._handleResponse(response);
  }

  /**
   * Extract insights from a meeting transcript
   * @param {string} transcript - The meeting transcript text
   * @returns {Promise<Object>} Promise that resolves with insights
   */
  async extractInsights(transcript) {
    // Validate transcript
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
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
    
    return this._handleResponse(response);
  }

  /**
   * Extract action items from a meeting transcript
   * @param {string} transcript - The meeting transcript text
   * @returns {Promise<Object>} Promise that resolves with action items
   */
  async extractActionItems(transcript) {
    // Validate transcript
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
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
    
    return this._handleResponse(response);
  }

  /**
   * Generate bullet points from a meeting transcript
   * @param {string} transcript - The meeting transcript text
   * @returns {Promise<Object>} Promise that resolves with bullet points
   */
  async generateBulletPoints(transcript) {
    // Validate transcript
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
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
    
    return this._handleResponse(response);
  }

  /**
   * Check API health status
   * @returns {Promise<Object>} Promise that resolves with health status
   */
  async checkHealth() {
    const response = await fetch(`${this.baseUrl}/api/${this.apiVersion}/health`, {
      method: 'GET',
      headers: this._getHeaders()
    });
    
    return this._handleResponse(response);
  }
}

// If running in Node.js environment, export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MeetingAPIClient;
} 