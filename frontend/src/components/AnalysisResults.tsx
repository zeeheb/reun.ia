'use client';

import { useState } from 'react';
import { AnalysisResponse } from '@/services/api';

type AnalysisResultsProps = {
  results: AnalysisResponse;
};

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'transcript' | 'insights' | 'actions' | 'bullets'>('insights');

  // Format text with proper line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className={line.trim().length === 0 ? 'h-4' : 'mb-2'}>
        {line}
      </p>
    ));
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex flex-nowrap -mb-px">
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'insights'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'actions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Action Items
          </button>
          <button
            onClick={() => setActiveTab('bullets')}
            className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'bullets'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'transcript'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transcript
          </button>
        </nav>
      </div>

      <div className="p-3 sm:p-6">
        <div className={activeTab === 'insights' ? 'block' : 'hidden'}>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Key Insights</h3>
          <div className="text-gray-700 text-xs sm:text-sm whitespace-pre-line break-words">
            {formatText(results.analysis.insights)}
          </div>
        </div>

        <div className={activeTab === 'actions' ? 'block' : 'hidden'}>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Action Items</h3>
          <div className="text-gray-700 text-xs sm:text-sm whitespace-pre-line break-words">
            {formatText(results.analysis.action_items)}
          </div>
        </div>

        <div className={activeTab === 'bullets' ? 'block' : 'hidden'}>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Meeting Summary</h3>
          <div className="text-gray-700 text-xs sm:text-sm whitespace-pre-line break-words">
            {formatText(results.analysis.bullet_points)}
          </div>
        </div>

        <div className={activeTab === 'transcript' ? 'block' : 'hidden'}>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Transcript</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(results.transcript);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <svg 
                className="h-3 w-3 sm:h-4 sm:w-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                />
              </svg>
              Copy
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-md p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto">
            <div className="text-gray-700 text-xs sm:text-sm whitespace-pre-line break-words">
              {formatText(results.transcript)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 