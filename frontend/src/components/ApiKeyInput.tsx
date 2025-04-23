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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
          API Key
        </label>
        {isSaved && (
          <span className="text-xs text-green-600 font-medium">✓ {t('saved')}</span>
        )}
      </div>
      <input
        id="apiKey"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder={t('apiKeyPlaceholder')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      />
      <div className="flex justify-end space-x-2">
        {isSaved ? (
          <button
            onClick={handleClearApiKey}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('clear')}
          </button>
        ) : (
          <button
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim()}
            className={`px-3 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              apiKey.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-indigo-400 cursor-not-allowed'
            }`}
          >
            {t('save')}
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {t('apiKeyPrivacyNote')}
      </p>
    </div>
  );
} 