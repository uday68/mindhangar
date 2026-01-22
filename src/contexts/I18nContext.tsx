import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { SupportedLanguage, LANGUAGE_CONFIGS } from '@/src/types/localization';
import I18nManager from '@/src/i18n';

// Import all message files
import enMessages from '@/src/i18n/messages/en.json';
import hiMessages from '@/src/i18n/messages/hi.json';
import taMessages from '@/src/i18n/messages/ta.json';
import teMessages from '@/src/i18n/messages/te.json';
import bnMessages from '@/src/i18n/messages/bn.json';
import mrMessages from '@/src/i18n/messages/mr.json';
import guMessages from '@/src/i18n/messages/gu.json';
import knMessages from '@/src/i18n/messages/kn.json';

const messages = {
  en: enMessages,
  hi: hiMessages,
  ta: taMessages,
  te: teMessages,
  bn: bnMessages,
  mr: mrMessages,
  gu: guMessages,
  kn: knMessages
};

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (id: string, values?: Record<string, any>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (value: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number) => string;
  getLanguageConfig: (language?: SupportedLanguage) => typeof LANGUAGE_CONFIGS[SupportedLanguage];
  getAllSupportedLanguages: () => SupportedLanguage[];
  getLanguageNativeName: (language: SupportedLanguage) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: SupportedLanguage;
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    initialLanguage || I18nManager.getCurrentLanguage()
  );

  const setLanguage = (language: SupportedLanguage) => {
    I18nManager.setLanguage(language);
    setCurrentLanguage(language);
    
    // Save to localStorage for persistence
    localStorage.setItem('preferred-language', language);
    
    // Update document attributes
    document.documentElement.lang = language;
    document.documentElement.dir = LANGUAGE_CONFIGS[language].rtl ? 'rtl' : 'ltr';
  };

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as SupportedLanguage;
    if (savedLanguage && I18nManager.isLanguageSupported(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Listen for language change events
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const contextValue: I18nContextType = {
    currentLanguage,
    setLanguage,
    t: I18nManager.getMessage,
    formatNumber: I18nManager.formatNumber,
    formatDate: I18nManager.formatDate,
    formatTime: I18nManager.formatTime,
    formatCurrency: I18nManager.formatCurrency,
    getLanguageConfig: I18nManager.getLanguageConfig,
    getAllSupportedLanguages: I18nManager.getAllSupportedLanguages,
    getLanguageNativeName: I18nManager.getLanguageNativeName,
    isRTL: LANGUAGE_CONFIGS[currentLanguage].rtl
  };

  return (
    <I18nContext.Provider value={contextValue}>
      <IntlProvider
        locale={currentLanguage}
        messages={messages[currentLanguage]}
        defaultLocale="en"
        onError={(error) => {
          // Log translation errors but don't break the app
          console.warn('Translation error:', error);
        }}
      >
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Higher-order component for class components
export function withI18n<P extends object>(Component: React.ComponentType<P & I18nContextType>) {
  return function WithI18nComponent(props: P) {
    const i18nProps = useI18n();
    return <Component {...props} {...i18nProps} />;
  };
}

export default I18nContext;