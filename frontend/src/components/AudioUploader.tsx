'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '@/services/languageContext';

type AudioUploaderProps = {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
};

export default function AudioUploader({ onFileSelect, isLoading }: AudioUploaderProps) {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Please select an audio or video file.');
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  // Format file size to KB, MB
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white shadow rounded-lg p-3 sm:p-4 mb-6">
      <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">{t('uploadAudio')}</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <svg 
          className={`w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-3 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" 
          />
        </svg>
        
        <input
          ref={inputRef}
          id="audio-file-upload"
          type="file"
          accept="audio/*,video/*"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />
        
        <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-center text-gray-500">
          <span className="font-semibold">{t('dropAudioFile')}</span> {t('or')} {t('browseFiles')}
        </p>
        <p className="text-xs text-center text-gray-500">{t('audioFormat')}</p>
      </div>

      {selectedFile && (
        <div className="mt-3 sm:mt-4 bg-gray-50 p-2 sm:p-3 rounded-md overflow-hidden">
          <div className="flex items-center">
            <svg 
              className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 mr-2 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
              />
            </svg>
            <div className="ml-2 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {isLoading && (
              <div className="animate-pulse flex space-x-1 flex-shrink-0">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-500 rounded-full"></div>
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-500 rounded-full"></div>
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-500 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 