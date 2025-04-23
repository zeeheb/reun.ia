'use client';

import { useState } from 'react';
import ApiKeyInput from '@/components/ApiKeyInput';
import AudioUploader from '@/components/AudioUploader';
import TranscriptInput from '@/components/TranscriptInput';
import AnalysisResults from '@/components/AnalysisResults';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';
import { apiService, AnalysisResponse } from '@/services/api';
import { useLanguage } from '@/services/languageContext';

export default function Home() {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'transcript'>('upload');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    apiService.setApiKey(key);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Clear previous results when a new file is selected
    setAnalysisResults(null);
  };

  const handleFileAnalysis = async () => {
    if (!apiKey) {
      setError('Please provide an API key first');
      return;
    }

    if (!selectedFile) {
      setError('Please select an audio file first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const results = await apiService.analyzeMeeting(selectedFile);
      setAnalysisResults(results);
    } catch (err: unknown) {
      console.error('Error analyzing file:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the file');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptAnalysis = async (transcript: string, type: 'insights' | 'actions' | 'bullets') => {
    if (!apiKey) {
      setError('Please provide an API key first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let results;
      
      switch (type) {
        case 'insights':
          results = await apiService.extractInsights(transcript);
          setAnalysisResults({
            transcript,
            analysis: {
              insights: results.insights,
              action_items: '',
              bullet_points: ''
            }
          });
          break;
        case 'actions':
          results = await apiService.extractActionItems(transcript);
          setAnalysisResults({
            transcript,
            analysis: {
              insights: '',
              action_items: results.action_items,
              bullet_points: ''
            }
          });
          break;
        case 'bullets':
          results = await apiService.generateBulletPoints(transcript);
          setAnalysisResults({
            transcript,
            analysis: {
              insights: '',
              action_items: '',
              bullet_points: results.bullet_points
            }
          });
          break;
      }
    } catch (err: unknown) {
      console.error('Error analyzing transcript:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the transcript');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <a
              href="https://github.com/yourusername/meeting-analysis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-3 sm:p-4 mb-6 overflow-hidden">
          <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
        </div>

        {/* Tabs for Upload/Input */}
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex flex-nowrap -mb-px">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'upload'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('uploadAudio')}
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'transcript'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('inputTranscript')}
              </button>
            </nav>
          </div>

          <div className="p-3 sm:p-4">
            {activeTab === 'upload' ? (
              <div>
                <AudioUploader onFileSelect={handleFileSelect} isLoading={loading} />
                {selectedFile && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleFileAnalysis}
                      disabled={loading || !selectedFile}
                      className={`px-3 sm:px-4 py-2 rounded-md shadow-sm text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        loading || !selectedFile
                          ? 'bg-indigo-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('processing')}
                        </span>
                      ) : (
                        t('analyzeRecording')
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <TranscriptInput onAnalyze={handleTranscriptAnalysis} isLoading={loading} />
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResults && !loading && (
          <div className="max-w-2xl mx-auto">
            <AnalysisResults results={analysisResults} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
