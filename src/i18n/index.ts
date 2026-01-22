import { createIntl, createIntlCache } from '@formatjs/intl';
import { SupportedLanguage, LANGUAGE_CONFIGS } from '@/src/types/localization';

// Import message files
import enMessages from './messages/en.json';
import hiMessages from './messages/hi.json';
import taMessages from './messages/ta.json';
import teMessages from './messages/te.json';
import bnMessages from './messages/bn.json';
import mrMessages from './messages/mr.json';
import guMessages from './messages/gu.json';
import knMessages from './messages/kn.json';

// Message collections
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

// Create intl cache for performance
const cache = createIntlCache();

// Create intl instances for each language
const intlInstances: Record<SupportedLanguage, ReturnType<typeof createIntl>> = {} as any;

// Initialize intl instances
for (const language of Object.keys(messages) as SupportedLanguage[]) {
  intlInstances[language] = createIntl({
    locale: language,
    messages: messages[language]
  }, cache);
}

// Current language state
let currentLanguage: SupportedLanguage = 'en';

// Internationalization manager
export class I18nManager {
  static getCurrentLanguage(): SupportedLanguage {
    return currentLanguage;
  }

  static setLanguage(language: SupportedLanguage) {
    if (this.isLanguageSupported(language)) {
      currentLanguage = language;
      // Update document language and direction
      document.documentElement.lang = language;
      document.documentElement.dir = LANGUAGE_CONFIGS[language].rtl ? 'rtl' : 'ltr';
      
      // Load appropriate fonts
      this.loadLanguageFonts(language);
      
      // Trigger language change event
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    }
  }

  static isLanguageSupported(language: string): language is SupportedLanguage {
    return language in messages;
  }

  static getMessage(id: string, values?: Record<string, any>): string {
    const intl = intlInstances[currentLanguage];
    try {
      return intl.formatMessage({ id }, values);
    } catch (error) {
      console.warn(`Missing translation for key: ${id} in language: ${currentLanguage}`);
      // Fallback to English
      if (currentLanguage !== 'en') {
        try {
          return intlInstances.en.formatMessage({ id }, values);
        } catch (fallbackError) {
          return id; // Return the key itself as last resort
        }
      }
      return id;
    }
  }

  static formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const intl = intlInstances[currentLanguage];
    return intl.formatNumber(value, options);
  }

  static formatDate(value: Date, options?: Intl.DateTimeFormatOptions): string {
    const intl = intlInstances[currentLanguage];
    return intl.formatDate(value, options);
  }

  static formatTime(value: Date, options?: Intl.DateTimeFormatOptions): string {
    const intl = intlInstances[currentLanguage];
    return intl.formatTime(value, options);
  }

  static formatCurrency(value: number): string {
    const intl = intlInstances[currentLanguage];
    return intl.formatNumber(value, {
      style: 'currency',
      currency: 'INR',
      currencyDisplay: 'symbol'
    });
  }

  static getLanguageConfig(language?: SupportedLanguage) {
    return LANGUAGE_CONFIGS[language || currentLanguage];
  }

  static getAllSupportedLanguages() {
    return Object.keys(messages) as SupportedLanguage[];
  }

  static getLanguageNativeName(language: SupportedLanguage): string {
    return LANGUAGE_CONFIGS[language].nativeName;
  }

  private static loadLanguageFonts(language: SupportedLanguage) {
    const config = LANGUAGE_CONFIGS[language];
    
    // Remove existing language-specific font links
    const existingLinks = document.querySelectorAll('link[data-language-font]');
    existingLinks.forEach(link => link.remove());

    // Add Google Fonts link for the language
    if (config.fontFamily.includes('Noto Sans')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = this.getGoogleFontsUrl(language);
      link.setAttribute('data-language-font', language);
      document.head.appendChild(link);
    }

    // Update CSS custom property for font family
    document.documentElement.style.setProperty('--language-font', config.fontFamily);
  }

  private static getGoogleFontsUrl(language: SupportedLanguage): string {
    const fontMap: Record<SupportedLanguage, string> = {
      hi: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap',
      ta: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap',
      te: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@300;400;500;600;700&display=swap',
      bn: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap',
      mr: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap',
      gu: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@300;400;500;600;700&display=swap',
      kn: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@300;400;500;600;700&display=swap',
      en: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    };

    return fontMap[language];
  }
}

// React hook for using i18n in components
export function useI18n() {
  return {
    t: I18nManager.getMessage,
    formatNumber: I18nManager.formatNumber,
    formatDate: I18nManager.formatDate,
    formatTime: I18nManager.formatTime,
    formatCurrency: I18nManager.formatCurrency,
    currentLanguage: I18nManager.getCurrentLanguage(),
    setLanguage: I18nManager.setLanguage,
    getLanguageConfig: I18nManager.getLanguageConfig,
    getAllSupportedLanguages: I18nManager.getAllSupportedLanguages,
    getLanguageNativeName: I18nManager.getLanguageNativeName
  };
}

// Initialize with browser language or default to English
const browserLanguage = navigator.language.split('-')[0] as SupportedLanguage;
I18nManager.setLanguage(I18nManager.isLanguageSupported(browserLanguage) ? browserLanguage : 'en');

export default I18nManager;