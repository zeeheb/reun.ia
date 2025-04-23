'use client';

import { useState } from 'react';
import AudioUploader from '@/components/AudioUploader';
import TranscriptInput from '@/components/TranscriptInput';
import AnalysisResults from '@/components/AnalysisResults';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';
import Sidebar from '@/components/Sidebar';
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        onApiKeyChange={handleApiKeyChange} 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <Logo />
              
            </div>
            <LanguageSelector />
          </div>
        </header>

        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Tabs for Upload/Input */}
          <div className="bg-white shadow rounded-lg mb-6 overflow-hidden max-w-4xl mx-auto w-full">
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
            <div className="max-w-4xl mx-auto">
              <AnalysisResults results={analysisResults} />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 max-w-4xl mx-auto">
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
        </main>
      </div>
    </div>
  );
}
