'use client';

import ApiKeyInput from './ApiKeyInput';
import { useLanguage } from '@/services/languageContext';

type SidebarProps = {
  onApiKeyChange: (apiKey: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ onApiKeyChange, isOpen, toggleSidebar }: SidebarProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20" 
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle button for collapsed sidebar */}
      <button
        type="button"
        className={`fixed left-0 top-20 z-30 p-2 rounded-r-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-64' : 'translate-x-0'
        }`}
        onClick={toggleSidebar}
        aria-label={t('toggleSettings')}
        title={t('toggleSettings')}
      >
        {isOpen ? (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="h-16 flex items-center px-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">{t('settings')}</h2>
            <button 
              className="ml-auto p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-6">
              <ApiKeyInput onApiKeyChange={onApiKeyChange} />
            </div>
          </div>
          
        
        </div>
      </div>
    </>
  );
} 