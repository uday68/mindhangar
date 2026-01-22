import { 
  SupportedLanguage, 
  SupportedScript, 
  TranslationResult, 
  VoiceProcessingResult,
  LANGUAGE_CONFIGS 
} from '@/src/types/localization';

/**
 * Language Engine interface for multi-language support and processing
 * Handles translation, script conversion, and voice processing for Indian languages
 */
export interface LanguageEngine {
  translateText(text: string, targetLanguage: SupportedLanguage): Promise<TranslationResult>;
  detectLanguage(text: string): Promise<SupportedLanguage>;
  convertScript(text: string, targetScript: SupportedScript): Promise<string>;
  processVoiceInput(audio: Blob, language: SupportedLanguage): Promise<VoiceProcessingResult>;
  generateVoiceOutput(text: string, language: SupportedLanguage, accent?: string): Promise<Blob>;
  isLanguageSupported(language: string): boolean;
  getLanguageConfig(language: SupportedLanguage): typeof LANGUAGE_CONFIGS[SupportedLanguage];
}

/**
 * Implementation of Language Engine using web APIs and translation services
 */
export class WebLanguageEngine implements LanguageEngine {
  private translationCache = new Map<string, TranslationResult>();
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis;

  constructor() {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
    }

    this.speechSynthesis = window.speechSynthesis;
  }

  async translateText(text: string, targetLanguage: SupportedLanguage): Promise<TranslationResult> {
    const cacheKey = `${text}-${targetLanguage}`;
    
    // Check cache first
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    try {
      // For now, we'll use a mock translation service
      // In production, this would integrate with Google Translate API or similar
      const result = await this.mockTranslate(text, targetLanguage);
      
      // Cache the result
      this.translationCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      return {
        translatedText: text, // Fallback to original text
        confidence: 0,
        alternatives: []
      };
    }
  }

  async detectLanguage(text: string): Promise<SupportedLanguage> {
    // Simple language detection based on script patterns
    // In production, this would use a proper language detection service
    
    // Check for Devanagari script (Hindi/Marathi)
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi'; // Default to Hindi for Devanagari
    }
    
    // Check for Tamil script
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return 'ta';
    }
    
    // Check for Telugu script
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return 'te';
    }
    
    // Check for Bengali script
    if (/[\u0980-\u09FF]/.test(text)) {
      return 'bn';
    }
    
    // Check for Gujarati script
    if (/[\u0A80-\u0AFF]/.test(text)) {
      return 'gu';
    }
    
    // Check for Kannada script
    if (/[\u0C80-\u0CFF]/.test(text)) {
      return 'kn';
    }
    
    // Default to English if no Indian script detected
    return 'en';
  }

  async convertScript(text: string, targetScript: SupportedScript): Promise<string> {
    // Script conversion logic would go here
    // For now, return the original text as this requires complex transliteration
    // In production, this would use services like Google Transliteration API
    
    if (targetScript === 'roman') {
      // Convert from Indian scripts to Roman
      return this.transliterateToRoman(text);
    } else {
      // Convert from Roman to Indian scripts
      return this.transliterateFromRoman(text, targetScript);
    }
  }

  async processVoiceInput(audio: Blob, language: SupportedLanguage): Promise<VoiceProcessingResult> {
    if (!this.speechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      const recognition = this.speechRecognition!;
      recognition.lang = this.getLanguageCode(language);
      
      recognition.onresult = (event) => {
        const result = event.results[0];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        resolve({
          text: transcript,
          confidence: confidence,
          language: language,
          accent: 'indian'
        });
      };
      
      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.start();
    });
  }

  async generateVoiceOutput(text: string, language: SupportedLanguage, accent?: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getLanguageCode(language);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      
      // Try to find an Indian accent voice if available
      const voices = this.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language) && 
        (voice.name.includes('Indian') || voice.name.includes('India'))
      ) || voices.find(voice => voice.lang.startsWith(language));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // For now, we'll return a mock blob since we can't easily capture speech synthesis output
      // In production, this would use a proper TTS service that returns audio data
      utterance.onend = () => {
        const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
        resolve(mockAudioBlob);
      };
      
      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      this.speechSynthesis.speak(utterance);
    });
  }

  isLanguageSupported(language: string): boolean {
    return Object.keys(LANGUAGE_CONFIGS).includes(language as SupportedLanguage);
  }

  getLanguageConfig(language: SupportedLanguage) {
    return LANGUAGE_CONFIGS[language];
  }

  // Private helper methods

  private async mockTranslate(text: string, targetLanguage: SupportedLanguage): Promise<TranslationResult> {
    // Mock translation for development
    // In production, this would call a real translation API
    
    const mockTranslations: Record<string, Record<SupportedLanguage, string>> = {
      'Hello': {
        hi: 'नमस्ते',
        ta: 'வணக்கம்',
        te: 'నమస్కారం',
        bn: 'নমস্কার',
        mr: 'नमस्कार',
        gu: 'નમસ્તે',
        kn: 'ನಮಸ್ಕಾರ',
        en: 'Hello'
      },
      'Welcome': {
        hi: 'स्वागत है',
        ta: 'வரவேற்கிறோம்',
        te: 'స్వాగతం',
        bn: 'স্বাগতম',
        mr: 'स्वागत',
        gu: 'સ્વાગત',
        kn: 'ಸ್ವಾಗತ',
        en: 'Welcome'
      },
      'Study': {
        hi: 'अध्ययन',
        ta: 'படிப்பு',
        te: 'అధ్యయనం',
        bn: 'অধ্যয়ন',
        mr: 'अभ्यास',
        gu: 'અભ્યાસ',
        kn: 'ಅಧ್ಯಯನ',
        en: 'Study'
      }
    };

    const translation = mockTranslations[text]?.[targetLanguage] || text;
    
    return {
      translatedText: translation,
      confidence: 0.95,
      detectedLanguage: 'en',
      alternatives: []
    };
  }

  private getLanguageCode(language: SupportedLanguage): string {
    const languageCodes: Record<SupportedLanguage, string> = {
      hi: 'hi-IN',
      en: 'en-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN'
    };
    
    return languageCodes[language] || 'en-IN';
  }

  private transliterateToRoman(text: string): string {
    // Basic transliteration to Roman script
    // This is a simplified version - production would use proper transliteration libraries
    
    const devanagariToRoman: Record<string, string> = {
      'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu',
      'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
      'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
      'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
      'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
      'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
      'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
      'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
      'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha'
    };

    let result = text;
    for (const [devanagari, roman] of Object.entries(devanagariToRoman)) {
      result = result.replace(new RegExp(devanagari, 'g'), roman);
    }
    
    return result;
  }

  private transliterateFromRoman(text: string, targetScript: SupportedScript): string {
    // Basic transliteration from Roman to target script
    // This is a simplified version - production would use proper transliteration libraries
    
    if (targetScript === 'devanagari') {
      const romanToDevanagari: Record<string, string> = {
        'ka': 'क', 'kha': 'ख', 'ga': 'ग', 'gha': 'घ',
        'cha': 'च', 'chha': 'छ', 'ja': 'ज', 'jha': 'झ',
        'ta': 'त', 'tha': 'थ', 'da': 'द', 'dha': 'ध',
        'pa': 'प', 'pha': 'फ', 'ba': 'ब', 'bha': 'भ',
        'ma': 'म', 'ya': 'य', 'ra': 'र', 'la': 'ल',
        'va': 'व', 'sha': 'श', 'sa': 'स', 'ha': 'ह',
        'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ii': 'ई',
        'u': 'उ', 'uu': 'ऊ', 'e': 'ए', 'o': 'ओ'
      };

      let result = text.toLowerCase();
      for (const [roman, devanagari] of Object.entries(romanToDevanagari)) {
        result = result.replace(new RegExp(roman, 'g'), devanagari);
      }
      
      return result;
    }
    
    // For other scripts, return original text for now
    return text;
  }
}

// Singleton instance
export const languageEngine = new WebLanguageEngine();

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}