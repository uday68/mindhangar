import React, { useState } from 'react';
import { useI18n } from '@/src/contexts/I18nContext';
import { SupportedLanguage, LANGUAGE_CONFIGS } from '@/src/types/localization';
import '@/src/styles/i18n.css';

interface LanguageSelectorProps {
  className?: string;
  showNativeNames?: boolean;
  compact?: boolean;
}

export function LanguageSelector({ 
  className = '', 
  showNativeNames = true, 
  compact = false 
}: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, getAllSupportedLanguages, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const supportedLanguages = getAllSupportedLanguages();

  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="language-option active flex items-center gap-2"
          aria-label={t('language.change')}
        >
          <span>{LANGUAGE_CONFIGS[currentLanguage].nativeName}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2 px-2">
                {t('language.select')}
              </div>
              {supportedLanguages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageChange(language)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                    language === currentLanguage ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{LANGUAGE_CONFIGS[language].name}</span>
                    {showNativeNames && (
                      <span className="text-xs opacity-75">
                        {LANGUAGE_CONFIGS[language].nativeName}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`language-selector ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t('language.select')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('onboarding.language.subtitle')}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {supportedLanguages.map((language) => {
          const config = LANGUAGE_CONFIGS[language];
          const isActive = language === currentLanguage;
          
          return (
            <button
              key={language}
              onClick={() => handleLanguageChange(language)}
              className={`language-option ${isActive ? 'active' : ''} text-center`}
              aria-pressed={isActive}
              aria-label={`${t('language.change')} ${config.name}`}
            >
              <div className="font-medium">{config.name}</div>
              {showNativeNames && (
                <div className="native-name">{config.nativeName}</div>
              )}
            </button>
          );
        })}
      </div>
      
      {currentLanguage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {t('language.current')}: {LANGUAGE_CONFIGS[currentLanguage].nativeName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;