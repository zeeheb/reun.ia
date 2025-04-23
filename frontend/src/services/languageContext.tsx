'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define language type and available languages
export type Language = 'en' | 'pt-br';

// Create translations object
export const translations = {
  'en': {
    
    uploadAudio: 'Upload Audio',
    inputTranscript: 'Input Transcript',
    analyzeRecording: 'Analyze Recording',
    processing: 'Processing...',
    apiKeyPlaceholder: 'Enter your API key',
    insights: 'Insights',
    actionItems: 'Action Items',
    bulletPoints: 'Bullet Points',
    dropAudioFile: 'Drop your audio file here',
    or: 'or',
    browseFiles: 'Browse Files',
    audioFormat: 'Supported formats: MP3, WAV, M4A, OGG',
    transcriptInstructions: 'Paste your meeting transcript below',
    extractInsights: 'Extract Insights',
    extractActionItems: 'Extract Action Items',
    generateBulletPoints: 'Generate Bullet Points',
    // New translations for sidebar
    settings: 'Settings',
    saved: 'Saved',
    save: 'Save',
    clear: 'Clear',
    apiKeyPrivacyNote: 'Your API key is stored locally in your browser and never sent to our servers.',
    toggleSettings: 'Toggle Settings'
  },
  'pt-br': {
    header: 'Análise de Reunião',
    uploadAudio: 'Enviar Áudio',
    inputTranscript: 'Inserir Transcrição',
    analyzeRecording: 'Analisar Gravação',
    processing: 'Processando...',
    apiKeyPlaceholder: 'Digite sua chave de API',
    insights: 'Insights',
    actionItems: 'Itens de Ação',
    bulletPoints: 'Pontos-chave',
    dropAudioFile: 'Arraste seu arquivo de áudio aqui',
    or: 'ou',
    browseFiles: 'Procurar Arquivos',
    audioFormat: 'Formatos suportados: MP3, WAV, M4A, OGG',
    transcriptInstructions: 'Cole a transcrição da sua reunião abaixo',
    extractInsights: 'Extrair Insights',
    extractActionItems: 'Extrair Itens de Ação',
    generateBulletPoints: 'Gerar Pontos-chave',
    // New translations for sidebar
    settings: 'Configurações',
    saved: 'Salvo',
    save: 'Salvar',
    clear: 'Limpar',
    apiKeyPrivacyNote: 'Sua chave de API é armazenada localmente no seu navegador e nunca é enviada para nossos servidores.',
    toggleSettings: 'Alternar Configurações'
  }
};

// Create context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
});

// Create provider component
export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Translation function
  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create hook for using language context
export const useLanguage = () => useContext(LanguageContext); 