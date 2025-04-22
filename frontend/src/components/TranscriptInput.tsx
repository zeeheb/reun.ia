'use client';

import { useState } from 'react';

type TranscriptInputProps = {
  onAnalyze: (transcript: string, type: 'insights' | 'actions' | 'bullets') => void;
  isLoading: boolean;
};

export default function TranscriptInput({ onAnalyze, isLoading }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<'insights' | 'actions' | 'bullets'>('insights');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim().length >= 50) {
      onAnalyze(transcript, analysisType);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-3 sm:p-4 mb-6">
      <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Analyze Transcript</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 sm:mb-4">
          <label htmlFor="transcript" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Meeting Transcript
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            rows={6}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
            disabled={isLoading}
          />
          {transcript.length > 0 && transcript.length < 50 && (
            <p className="mt-1 text-xs text-red-500">
              Transcript must be at least 50 characters. Current length: {transcript.length}
            </p>
          )}
        </div>
        
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Analysis Type
          </label>
          <div className="flex flex-wrap space-x-2 sm:space-x-4">
            <label className="inline-flex items-center mb-1">
              <input
                type="radio"
                name="analysisType"
                value="insights"
                checked={analysisType === 'insights'}
                onChange={() => setAnalysisType('insights')}
                className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-700">Insights</span>
            </label>
            <label className="inline-flex items-center mb-1">
              <input
                type="radio"
                name="analysisType"
                value="actions"
                checked={analysisType === 'actions'}
                onChange={() => setAnalysisType('actions')}
                className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-700">Action Items</span>
            </label>
            <label className="inline-flex items-center mb-1">
              <input
                type="radio"
                name="analysisType"
                value="bullets"
                checked={analysisType === 'bullets'}
                onChange={() => setAnalysisType('bullets')}
                className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-700">Bullet Points</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || transcript.trim().length < 50}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading || transcript.trim().length < 50
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Analyze ${
                analysisType === 'insights'
                  ? 'Insights'
                  : analysisType === 'actions'
                  ? 'Action Items'
                  : 'Bullet Points'
              }`
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 