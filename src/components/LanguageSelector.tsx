import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../contexts/I18nContext';
import { SupportedLanguage } from '../types/localization';
import { Icons } from './Icons';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  compact = false, 
  className = '' 
}) => {
  const { currentLanguage, setLanguage, getAllSupportedLanguages, getLanguageNativeName } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const supportedLanguages = getAllSupportedLanguages();

  // Language display names with flags
  const languageInfo: Record<SupportedLanguage, { flag: string; name: string; nativeName: string }> = {
    en: { flag: '🇬🇧', name: 'English', nativeName: 'English' },
    hi: { flag: '🇮🇳', name: 'Hindi', nativeName: 'हिन्दी' },
    ta: { flag: '🇮🇳', name: 'Tamil', nativeName: 'தமிழ்' },
    te: { flag: '🇮🇳', name: 'Telugu', nativeName: 'తెలుగు' },
    bn: { flag: '🇮🇳', name: 'Bengali', nativeName: 'বাংলা' },
    mr: { flag: '🇮🇳', name: 'Marathi', nativeName: 'मराठी' },
    gu: { flag: '🇮🇳', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    kn: { flag: '🇮🇳', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const currentLangInfo = languageInfo[currentLanguage];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 transition-colors rounded-lg ${
          compact 
            ? 'px-2 py-1 hover:bg-gray-100' 
            : 'px-3 py-2 hover:bg-gray-100'
        }`}
        aria-label={`Current language: ${currentLangInfo.nativeName}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg" aria-hidden="true">{currentLangInfo.flag}</span>
        {!compact && (
          <span className="text-sm font-medium text-gray-700">{currentLangInfo.nativeName}</span>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icons.ChevronDown size={16} className="text-gray-400" aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[90]" 
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100]"
              role="menu"
              aria-label="Language selection menu"
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase">Select Language</p>
              </div>
              
              {supportedLanguages.map((lang) => {
                const info = languageInfo[lang];
                const isSelected = lang === currentLanguage;
                
                return (
                  <motion.button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${
                      isSelected 
                        ? 'bg-teal-50 text-teal-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    role="menuitem"
                    aria-label={`Switch to ${info.nativeName}`}
                    aria-current={isSelected ? 'true' : undefined}
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-xl" aria-hidden="true">{info.flag}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{info.nativeName}</p>
                      <p className="text-xs text-gray-500">{info.name}</p>
                    </div>
                    {isSelected && (
                      <Icons.Check size={16} className="text-teal-600" aria-hidden="true" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
