import React from 'react';
import { useLanguage, Language } from '@/services/languageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="relative">
      <select
        value={language}
        onChange={handleLanguageChange}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1 text-sm text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400"
        aria-label="Select language"
      >
        <option value="en">🇺🇸 EN</option>
        <option value="pt-br">🇧🇷 PT-BR</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector; 