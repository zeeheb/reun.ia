'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/services/languageContext';

type ApiKeyInputProps = {
  onApiKeyChange: (apiKey: string) => void;
};

export default function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('meetingAnalysisApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
      setIsSaved(true);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('meetingAnalysisApiKey', apiKey);
      onApiKeyChange(apiKey);
      setIsSaved(true);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('meetingAnalysisApiKey');
    setApiKey('');
    onApiKeyChange('');
    setIsSaved(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-3 sm:p-4 mb-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="apiKey" className="text-xs sm:text-sm font-medium text-gray-700">
            API Key
          </label>
          {isSaved && (
            <span className="text-xs text-green-600 font-medium">✓ Saved</span>
          )}
        </div>
        <div className="flex flex-wrap sm:flex-nowrap space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('apiKeyPlaceholder')}
            className="w-full sm:flex-grow px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
          />
          {isSaved ? (
            <button
              onClick={handleClearApiKey}
              className="px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear
            </button>
          ) : (
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim()}
              className={`px-3 py-1.5 sm:py-2 rounded-md shadow-sm text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                apiKey.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-indigo-400 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 break-words">
          Your API key is stored locally in your browser and never sent to our servers.
        </p>
      </div>
    </div>
  );
} 