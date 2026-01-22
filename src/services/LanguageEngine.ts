import { 
  SupportedLanguage, 
  SupportedScript, 
  TranslationResult, 
  VoiceProcessingResult,
  LANGUAGE_CONFIGS,
  LanguageConfig 
} from '@/src/types/localization';

/**
 * Language Engine interface for multi-language support and processing
 * Handles translation, script conversion, and voice processing for Indian languages
 */
export interface LanguageEngine {
  translateText(text: string, targetLanguage: SupportedLanguage, sourceLanguage?: SupportedLanguage): Promise<TranslationResult>;
  detectLanguage(text: string): Promise<SupportedLanguage>;
  convertScript(text: string, targetScript: SupportedScript): Promise<string>;
  processVoiceInput(audio: Blob, language: SupportedLanguage): Promise<VoiceProcessingResult>;
  generateVoiceOutput(text: string, language: SupportedLanguage, accent?: string): Promise<Blob>;
  isLanguageSupported(language: string): boolean;
  getLanguageConfig(language: SupportedLanguage): LanguageConfig;
  getSupportedLanguages(): SupportedLanguage[];
  initializeTranslationService(): Promise<void>;
  clearTranslationCache(): void;
}

/**
 * Implementation of Language Engine using web APIs and translation services
 */
export class WebLanguageEngine implements LanguageEngine {
  private translationCache = new Map<string, TranslationResult>();
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis;
  private translationServiceInitialized = false;
  private readonly maxCacheSize = 1000;

  constructor() {
    this.initializeSpeechServices();
  }

  private initializeSpeechServices(): void {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
    }

    this.speechSynthesis = window.speechSynthesis;
  }

  async initializeTranslationService(): Promise<void> {
    try {
      // In production, this would initialize Google Translate API or similar service
      // For now, we'll simulate initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      this.translationServiceInitialized = true;
      console.log('Translation service initialized');
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      throw new Error('Translation service initialization failed');
    }
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(LANGUAGE_CONFIGS) as SupportedLanguage[];
  }

  clearTranslationCache(): void {
    this.translationCache.clear();
  }

  async translateText(text: string, targetLanguage: SupportedLanguage, sourceLanguage?: SupportedLanguage): Promise<TranslationResult> {
    if (!text.trim()) {
      return {
        translatedText: '',
        confidence: 1.0,
        detectedLanguage: sourceLanguage || 'en',
        alternatives: []
      };
    }

    const cacheKey = `${text}-${sourceLanguage || 'auto'}-${targetLanguage}`;
    
    // Check cache first
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    try {
      // Detect source language if not provided
      const detectedLanguage = sourceLanguage || await this.detectLanguage(text);
      
      // If source and target are the same, return original text
      if (detectedLanguage === targetLanguage) {
        const result: TranslationResult = {
          translatedText: text,
          confidence: 1.0,
          detectedLanguage,
          alternatives: []
        };
        this.cacheTranslation(cacheKey, result);
        return result;
      }

      // Attempt translation using available services
      const result = await this.performTranslation(text, detectedLanguage, targetLanguage);
      
      // Cache the result
      this.cacheTranslation(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      // Fallback to original text with low confidence
      return {
        translatedText: text,
        confidence: 0,
        detectedLanguage: sourceLanguage || 'en',
        alternatives: []
      };
    }
  }

  private cacheTranslation(key: string, result: TranslationResult): void {
    // Implement LRU cache behavior
    if (this.translationCache.size >= this.maxCacheSize) {
      const firstKey = this.translationCache.keys().next().value;
      this.translationCache.delete(firstKey);
    }
    this.translationCache.set(key, result);
  }

  private async performTranslation(text: string, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage): Promise<TranslationResult> {
    // In production, this would use Google Translate API or similar
    // For now, we'll use enhanced mock translation with better coverage
    
    if (!this.translationServiceInitialized) {
      await this.initializeTranslationService();
    }

    return await this.enhancedMockTranslate(text, sourceLanguage, targetLanguage);
  }

  async detectLanguage(text: string): Promise<SupportedLanguage> {
    if (!text.trim()) {
      return 'en';
    }

    // Enhanced language detection using multiple approaches
    
    // 1. Script-based detection (most reliable for Indian languages)
    const scriptBasedLanguage = this.detectByScript(text);
    if (scriptBasedLanguage !== 'en') {
      return scriptBasedLanguage;
    }

    // 2. Character frequency analysis for Roman script text
    const frequencyBasedLanguage = this.detectByCharacterFrequency(text);
    if (frequencyBasedLanguage !== 'en') {
      return frequencyBasedLanguage;
    }

    // 3. Common word detection
    const wordBasedLanguage = this.detectByCommonWords(text);
    if (wordBasedLanguage !== 'en') {
      return wordBasedLanguage;
    }

    // Default to English if no clear detection
    return 'en';
  }

  private detectByScript(text: string): SupportedLanguage {
    // Check for Devanagari script (Hindi/Marathi)
    if (/[\u0900-\u097F]/.test(text)) {
      // Distinguish between Hindi and Marathi based on specific characters
      if (/[\u0972\u0973\u0974\u0975]/.test(text)) {
        return 'mr'; // Marathi-specific characters
      }
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
    
    return 'en'; // No Indian script detected
  }

  private detectByCharacterFrequency(text: string): SupportedLanguage {
    // Simple character frequency analysis for romanized Indian languages
    const lowerText = text.toLowerCase();
    
    // Hindi/Marathi indicators in Roman script
    if (/\b(hai|hain|ka|ki|ke|ko|se|me|par|aur|ya|jo|kya|kaise|kahan)\b/.test(lowerText)) {
      return 'hi';
    }
    
    // Tamil indicators in Roman script
    if (/\b(enna|eppo|enge|eppadi|naan|neenga|avar|ivan|ithu)\b/.test(lowerText)) {
      return 'ta';
    }
    
    // Telugu indicators in Roman script
    if (/\b(enti|eppudu|ekkada|ela|nenu|meeru|atanu|idi|adi)\b/.test(lowerText)) {
      return 'te';
    }
    
    return 'en';
  }

  private detectByCommonWords(text: string): SupportedLanguage {
    const commonWords = {
      hi: ['और', 'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'है', 'हैं', 'था', 'थी', 'थे'],
      ta: ['மற்றும்', 'இன்', 'ஆக', 'இல்', 'உள்ள', 'என்று', 'அது', 'இது', 'அவர்', 'நான்'],
      te: ['మరియు', 'యొక్క', 'లో', 'కు', 'నుండి', 'తో', 'అది', 'ఇది', 'అతను', 'నేను'],
      bn: ['এবং', 'এর', 'তে', 'কে', 'থেকে', 'সাথে', 'এটি', 'সেটি', 'তিনি', 'আমি'],
      mr: ['आणि', 'चा', 'ची', 'चे', 'ला', 'मध्ये', 'वर', 'आहे', 'होता', 'होती'],
      gu: ['અને', 'ના', 'નો', 'ની', 'ને', 'માં', 'પર', 'છે', 'હતો', 'હતી'],
      kn: ['ಮತ್ತು', 'ಇನ್', 'ಆಗ', 'ಇಲ್', 'ಉಳ್ಳ', 'ಎಂದು', 'ಅದು', 'ಇದು', 'ಅವರು', 'ನಾನು']
    };

    for (const [lang, words] of Object.entries(commonWords)) {
      const matchCount = words.filter(word => text.includes(word)).length;
      if (matchCount >= 2) { // Require at least 2 common words
        return lang as SupportedLanguage;
      }
    }

    return 'en';
  }

  async convertScript(text: string, targetScript: SupportedScript): Promise<string> {
    if (!text.trim()) {
      return text;
    }

    try {
      // Detect current script
      const currentScript = this.detectCurrentScript(text);
      
      if (currentScript === targetScript) {
        return text; // No conversion needed
      }

      if (targetScript === 'roman') {
        // Convert from Indian scripts to Roman
        return this.transliterateToRoman(text, currentScript);
      } else {
        // Convert from Roman to Indian scripts
        return this.transliterateFromRoman(text, targetScript);
      }
    } catch (error) {
      console.error('Script conversion failed:', error);
      return text; // Fallback to original text
    }
  }

  private detectCurrentScript(text: string): SupportedScript {
    if (/[\u0900-\u097F]/.test(text)) return 'devanagari';
    if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
    if (/[\u0980-\u09FF]/.test(text)) return 'bengali';
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gujarati';
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';
    return 'roman';
  }

  async processVoiceInput(audio: Blob, language: SupportedLanguage): Promise<VoiceProcessingResult> {
    if (!this.speechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      const recognition = this.speechRecognition!;
      recognition.lang = this.getLanguageCode(language);
      recognition.maxAlternatives = 3;
      
      // Set timeout for voice recognition
      const timeout = setTimeout(() => {
        recognition.stop();
        reject(new Error('Voice recognition timeout'));
      }, 10000); // 10 second timeout
      
      recognition.onresult = (event) => {
        clearTimeout(timeout);
        const result = event.results[0];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0.8;
        
        // Get alternatives if available
        const alternatives: string[] = [];
        for (let i = 1; i < result.length && i < 3; i++) {
          alternatives.push(result[i].transcript);
        }
        
        resolve({
          text: transcript,
          confidence: confidence,
          language: language,
          accent: 'indian',
          alternatives
        });
      };
      
      recognition.onerror = (event) => {
        clearTimeout(timeout);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.onend = () => {
        clearTimeout(timeout);
      };
      
      try {
        recognition.start();
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async generateVoiceOutput(text: string, language: SupportedLanguage, accent?: string): Promise<Blob> {
    if (!text.trim()) {
      throw new Error('No text provided for voice generation');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getLanguageCode(language);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to find an appropriate voice
      const voice = this.selectBestVoice(language, accent);
      if (voice) {
        utterance.voice = voice;
      }
      
      // Create a MediaRecorder to capture the speech synthesis
      // Note: This is a simplified approach. In production, you'd use a proper TTS service
      const chunks: BlobPart[] = [];
      
      utterance.onstart = () => {
        // In a real implementation, we'd start recording here
      };
      
      utterance.onend = () => {
        // Create a mock audio blob for now
        // In production, this would be the actual recorded audio
        const mockAudioData = new ArrayBuffer(1024);
        const mockBlob = new Blob([mockAudioData], { type: 'audio/wav' });
        resolve(mockBlob);
      };
      
      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error || 'Unknown error'}`));
      };
      
      // Check if speech synthesis is available
      if (!this.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      this.speechSynthesis.speak(utterance);
    });
  }

  private selectBestVoice(language: SupportedLanguage, accent?: string): SpeechSynthesisVoice | null {
    const voices = this.speechSynthesis.getVoices();
    
    // First, try to find a voice with Indian accent
    if (accent === 'indian' || !accent) {
      const indianVoice = voices.find(voice => 
        voice.lang.startsWith(language) && 
        (voice.name.toLowerCase().includes('indian') || 
         voice.name.toLowerCase().includes('india') ||
         voice.lang.includes('-IN'))
      );
      if (indianVoice) return indianVoice;
    }
    
    // Fallback to any voice for the language
    const languageVoice = voices.find(voice => voice.lang.startsWith(language));
    if (languageVoice) return languageVoice;
    
    // Final fallback to English
    return voices.find(voice => voice.lang.startsWith('en')) || null;
  }

  isLanguageSupported(language: string): boolean {
    return Object.keys(LANGUAGE_CONFIGS).includes(language as SupportedLanguage);
  }

  getLanguageConfig(language: SupportedLanguage): LanguageConfig {
    return LANGUAGE_CONFIGS[language];
  }

  // Private helper methods

  private async enhancedMockTranslate(text: string, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage): Promise<TranslationResult> {
    // Enhanced mock translation with better coverage for Indian languages
    // In production, this would call Google Translate API or similar service
    
    const mockTranslations: Record<string, Record<SupportedLanguage, string>> = {
      // Basic greetings
      'Hello': {
        hi: 'नमस्ते', ta: 'வணக்கம்', te: 'నమస్కారం', bn: 'নমস্কার',
        mr: 'नमस्कार', gu: 'નમસ્તે', kn: 'ನಮಸ್ಕಾರ', en: 'Hello'
      },
      'Welcome': {
        hi: 'स्वागत है', ta: 'வரவேற்கிறோம்', te: 'స్వాగతం', bn: 'স্বাগতম',
        mr: 'स्वागत', gu: 'સ્વાગત', kn: 'ಸ್ವಾಗತ', en: 'Welcome'
      },
      'Thank you': {
        hi: 'धन्यवाद', ta: 'நன்றி', te: 'ధన్యవాదాలు', bn: 'ধন্যবাদ',
        mr: 'धन्यवाद', gu: 'આભાર', kn: 'ಧನ್ಯವಾದಗಳು', en: 'Thank you'
      },
      
      // Educational terms
      'Study': {
        hi: 'अध्ययन', ta: 'படிப்பு', te: 'అధ్యయనం', bn: 'অধ্যয়ন',
        mr: 'अभ्यास', gu: 'અભ્યાસ', kn: 'ಅಧ್ಯಯನ', en: 'Study'
      },
      'Learn': {
        hi: 'सीखना', ta: 'கற்றுக்கொள்', te: 'నేర్చుకోవడం', bn: 'শেখা',
        mr: 'शिकणे', gu: 'શીખવું', kn: 'ಕಲಿಯುವುದು', en: 'Learn'
      },
      'Education': {
        hi: 'शिक्षा', ta: 'கல்வி', te: 'విద్య', bn: 'শিক্ষা',
        mr: 'शिक्षण', gu: 'શિક્ષણ', kn: 'ಶಿಕ್ಷಣ', en: 'Education'
      },
      'Student': {
        hi: 'छात्र', ta: 'மாணவர்', te: 'విద్యార్థి', bn: 'ছাত্র',
        mr: 'विद्यार्थी', gu: 'વિદ્યાર્થી', kn: 'ವಿದ್ಯಾರ್ಥಿ', en: 'Student'
      },
      'Teacher': {
        hi: 'शिक्षक', ta: 'ஆசிரியர்', te: 'ఉపాధ్యాయుడు', bn: 'শিক্ষক',
        mr: 'शिक्षक', gu: 'શિક્ષક', kn: 'ಶಿಕ್ಷಕ', en: 'Teacher'
      },
      
      // Common UI elements
      'Save': {
        hi: 'सहेजें', ta: 'சேமி', te: 'సేవ్ చేయండి', bn: 'সংরক্ষণ',
        mr: 'जतन करा', gu: 'સેવ કરો', kn: 'ಉಳಿಸಿ', en: 'Save'
      },
      'Cancel': {
        hi: 'रद्द करें', ta: 'ரத்து செய்', te: 'రద్దు చేయండి', bn: 'বাতিল',
        mr: 'रद्द करा', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ', en: 'Cancel'
      },
      'Submit': {
        hi: 'जमा करें', ta: 'சமர்ப்பிக்கவும்', te: 'సమర్పించండి', bn: 'জমা দিন',
        mr: 'सबमिट करा', gu: 'સબમિટ કરો', kn: 'ಸಲ್ಲಿಸಿ', en: 'Submit'
      },
      'Next': {
        hi: 'अगला', ta: 'அடுத்து', te: 'తదుపరి', bn: 'পরবর্তী',
        mr: 'पुढे', gu: 'આગળ', kn: 'ಮುಂದೆ', en: 'Next'
      },
      'Previous': {
        hi: 'पिछला', ta: 'முந்தைய', te: 'మునుపటి', bn: 'পূর্ববর্তী',
        mr: 'मागील', gu: 'પહેલાં', kn: 'ಹಿಂದಿನ', en: 'Previous'
      }
    };

    // Try exact match first
    const exactTranslation = mockTranslations[text]?.[targetLanguage];
    if (exactTranslation) {
      return {
        translatedText: exactTranslation,
        confidence: 0.95,
        detectedLanguage: sourceLanguage,
        alternatives: []
      };
    }

    // Try case-insensitive match
    const lowerText = text.toLowerCase();
    for (const [key, translations] of Object.entries(mockTranslations)) {
      if (key.toLowerCase() === lowerText) {
        return {
          translatedText: translations[targetLanguage] || text,
          confidence: 0.90,
          detectedLanguage: sourceLanguage,
          alternatives: []
        };
      }
    }

    // For longer text, try to translate word by word
    if (text.includes(' ')) {
      const words = text.split(' ');
      const translatedWords = await Promise.all(
        words.map(async word => {
          const wordResult = await this.enhancedMockTranslate(word, sourceLanguage, targetLanguage);
          return wordResult.translatedText;
        })
      );
      
      return {
        translatedText: translatedWords.join(' '),
        confidence: 0.70,
        detectedLanguage: sourceLanguage,
        alternatives: []
      };
    }

    // Fallback: return original text with low confidence
    return {
      translatedText: text,
      confidence: 0.10,
      detectedLanguage: sourceLanguage,
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

  private transliterateToRoman(text: string, sourceScript: SupportedScript): string {
    // Enhanced transliteration to Roman script
    // This is a simplified version - production would use proper transliteration libraries
    
    switch (sourceScript) {
      case 'devanagari':
        return this.devanagariToRoman(text);
      case 'tamil':
        return this.tamilToRoman(text);
      case 'telugu':
        return this.teluguToRoman(text);
      case 'bengali':
        return this.bengaliToRoman(text);
      case 'gujarati':
        return this.gujaratiToRoman(text);
      case 'kannada':
        return this.kannadaToRoman(text);
      default:
        return text;
    }
  }

  private devanagariToRoman(text: string): string {
    const devanagariToRoman: Record<string, string> = {
      // Vowels
      'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu',
      'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
      
      // Consonants
      'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
      'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
      'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
      'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
      'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
      'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
      'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
      
      // Matras (vowel signs)
      'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu',
      'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
      
      // Special characters
      '्': '', // Halant (virama)
      'ं': 'n', // Anusvara
      'ः': 'h', // Visarga
      '।': '.', // Danda
      '॥': '..', // Double danda
    };

    let result = text;
    for (const [devanagari, roman] of Object.entries(devanagariToRoman)) {
      result = result.replace(new RegExp(devanagari, 'g'), roman);
    }
    
    return result;
  }

  private tamilToRoman(text: string): string {
    // Basic Tamil to Roman transliteration
    const tamilToRoman: Record<string, string> = {
      'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ii', 'உ': 'u', 'ஊ': 'uu',
      'எ': 'e', 'ஏ': 'ee', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oo', 'ஔ': 'au',
      'க': 'ka', 'ங': 'nga', 'ச': 'cha', 'ஞ': 'nya', 'ட': 'ta', 'ண': 'na',
      'த': 'tha', 'ந': 'na', 'ப': 'pa', 'ம': 'ma', 'ய': 'ya', 'ர': 'ra',
      'ல': 'la', 'வ': 'va', 'ழ': 'zha', 'ள': 'la', 'ற': 'ra', 'ன': 'na'
    };

    let result = text;
    for (const [tamil, roman] of Object.entries(tamilToRoman)) {
      result = result.replace(new RegExp(tamil, 'g'), roman);
    }
    
    return result;
  }

  private teluguToRoman(text: string): string {
    // Basic Telugu to Roman transliteration
    const teluguToRoman: Record<string, string> = {
      'అ': 'a', 'ఆ': 'aa', 'ఇ': 'i', 'ఈ': 'ii', 'ఉ': 'u', 'ఊ': 'uu',
      'ఎ': 'e', 'ఏ': 'ee', 'ఐ': 'ai', 'ఒ': 'o', 'ఓ': 'oo', 'ఔ': 'au',
      'క': 'ka', 'ఖ': 'kha', 'గ': 'ga', 'ఘ': 'gha', 'ఙ': 'nga',
      'చ': 'cha', 'ఛ': 'chha', 'జ': 'ja', 'ఝ': 'jha', 'ఞ': 'nya',
      'ట': 'ta', 'ఠ': 'tha', 'డ': 'da', 'ఢ': 'dha', 'ణ': 'na',
      'త': 'tha', 'థ': 'tha', 'ద': 'da', 'ధ': 'dha', 'న': 'na',
      'ప': 'pa', 'ఫ': 'pha', 'బ': 'ba', 'భ': 'bha', 'మ': 'ma',
      'య': 'ya', 'ర': 'ra', 'ల': 'la', 'వ': 'va',
      'శ': 'sha', 'ష': 'sha', 'స': 'sa', 'హ': 'ha'
    };

    let result = text;
    for (const [telugu, roman] of Object.entries(teluguToRoman)) {
      result = result.replace(new RegExp(telugu, 'g'), roman);
    }
    
    return result;
  }

  private bengaliToRoman(text: string): string {
    // Basic Bengali to Roman transliteration
    const bengaliToRoman: Record<string, string> = {
      'অ': 'a', 'আ': 'aa', 'ই': 'i', 'ঈ': 'ii', 'উ': 'u', 'ঊ': 'uu',
      'এ': 'e', 'ঐ': 'ai', 'ও': 'o', 'ঔ': 'au',
      'ক': 'ka', 'খ': 'kha', 'গ': 'ga', 'ঘ': 'gha', 'ঙ': 'nga',
      'চ': 'cha', 'ছ': 'chha', 'জ': 'ja', 'ঝ': 'jha', 'ঞ': 'nya',
      'ট': 'ta', 'ঠ': 'tha', 'ড': 'da', 'ঢ': 'dha', 'ণ': 'na',
      'ত': 'ta', 'থ': 'tha', 'দ': 'da', 'ধ': 'dha', 'ন': 'na',
      'প': 'pa', 'ফ': 'pha', 'ব': 'ba', 'ভ': 'bha', 'ম': 'ma',
      'য': 'ya', 'র': 'ra', 'ল': 'la', 'শ': 'sha', 'ষ': 'sha', 'স': 'sa', 'হ': 'ha'
    };

    let result = text;
    for (const [bengali, roman] of Object.entries(bengaliToRoman)) {
      result = result.replace(new RegExp(bengali, 'g'), roman);
    }
    
    return result;
  }

  private gujaratiToRoman(text: string): string {
    // Basic Gujarati to Roman transliteration
    const gujaratiToRoman: Record<string, string> = {
      'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ii', 'ઉ': 'u', 'ઊ': 'uu',
      'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au',
      'ક': 'ka', 'ખ': 'kha', 'ગ': 'ga', 'ઘ': 'gha', 'ઙ': 'nga',
      'ચ': 'cha', 'છ': 'chha', 'જ': 'ja', 'ઝ': 'jha', 'ઞ': 'nya',
      'ટ': 'ta', 'ઠ': 'tha', 'ડ': 'da', 'ઢ': 'dha', 'ણ': 'na',
      'ત': 'ta', 'થ': 'tha', 'દ': 'da', 'ધ': 'dha', 'ન': 'na',
      'પ': 'pa', 'ફ': 'pha', 'બ': 'ba', 'ભ': 'bha', 'મ': 'ma',
      'ય': 'ya', 'ર': 'ra', 'લ': 'la', 'વ': 'va',
      'શ': 'sha', 'ષ': 'sha', 'સ': 'sa', 'હ': 'ha'
    };

    let result = text;
    for (const [gujarati, roman] of Object.entries(gujaratiToRoman)) {
      result = result.replace(new RegExp(gujarati, 'g'), roman);
    }
    
    return result;
  }

  private kannadaToRoman(text: string): string {
    // Basic Kannada to Roman transliteration
    const kannadaToRoman: Record<string, string> = {
      'ಅ': 'a', 'ಆ': 'aa', 'ಇ': 'i', 'ಈ': 'ii', 'ಉ': 'u', 'ಊ': 'uu',
      'ಎ': 'e', 'ಏ': 'ee', 'ಐ': 'ai', 'ಒ': 'o', 'ಓ': 'oo', 'ಔ': 'au',
      'ಕ': 'ka', 'ಖ': 'kha', 'ಗ': 'ga', 'ಘ': 'gha', 'ಙ': 'nga',
      'ಚ': 'cha', 'ಛ': 'chha', 'ಜ': 'ja', 'ಝ': 'jha', 'ಞ': 'nya',
      'ಟ': 'ta', 'ಠ': 'tha', 'ಡ': 'da', 'ಢ': 'dha', 'ಣ': 'na',
      'ತ': 'ta', 'ಥ': 'tha', 'ದ': 'da', 'ಧ': 'dha', 'ನ': 'na',
      'ಪ': 'pa', 'ಫ': 'pha', 'ಬ': 'ba', 'ಭ': 'bha', 'ಮ': 'ma',
      'ಯ': 'ya', 'ರ': 'ra', 'ಲ': 'la', 'ವ': 'va',
      'ಶ': 'sha', 'ಷ': 'sha', 'ಸ': 'sa', 'ಹ': 'ha'
    };

    let result = text;
    for (const [kannada, roman] of Object.entries(kannadaToRoman)) {
      result = result.replace(new RegExp(kannada, 'g'), roman);
    }
    
    return result;
  }

  private transliterateFromRoman(text: string, targetScript: SupportedScript): string {
    // Enhanced transliteration from Roman to target script
    // This is a simplified version - production would use proper transliteration libraries
    
    switch (targetScript) {
      case 'devanagari':
        return this.romanToDevanagari(text);
      case 'tamil':
        return this.romanToTamil(text);
      case 'telugu':
        return this.romanToTelugu(text);
      case 'bengali':
        return this.romanToBengali(text);
      case 'gujarati':
        return this.romanToGujarati(text);
      case 'kannada':
        return this.romanToKannada(text);
      default:
        return text;
    }
  }

  private romanToDevanagari(text: string): string {
    const romanToDevanagari: Record<string, string> = {
      // Longer sequences first to avoid partial matches
      'kha': 'ख', 'gha': 'घ', 'nga': 'ङ', 'cha': 'च', 'chha': 'छ',
      'jha': 'झ', 'nya': 'ञ', 'tha': 'थ', 'dha': 'ध', 'pha': 'फ',
      'bha': 'भ', 'sha': 'श', 'aa': 'आ', 'ii': 'ई', 'uu': 'ऊ',
      'ai': 'ऐ', 'au': 'औ',
      
      // Single characters
      'ka': 'क', 'ga': 'ग', 'ja': 'ज', 'ta': 'त', 'da': 'द',
      'pa': 'प', 'ba': 'ब', 'ma': 'म', 'ya': 'य', 'ra': 'र',
      'la': 'ल', 'va': 'व', 'sa': 'स', 'ha': 'ह',
      'a': 'अ', 'i': 'इ', 'u': 'उ', 'e': 'ए', 'o': 'ओ'
    };

    let result = text.toLowerCase();
    
    // Sort by length (longest first) to handle compound characters
    const sortedKeys = Object.keys(romanToDevanagari).sort((a, b) => b.length - a.length);
    
    for (const roman of sortedKeys) {
      const devanagari = romanToDevanagari[roman];
      result = result.replace(new RegExp(roman, 'g'), devanagari);
    }
    
    return result;
  }

  private romanToTamil(text: string): string {
    const romanToTamil: Record<string, string> = {
      'aa': 'ஆ', 'ii': 'ஈ', 'uu': 'ஊ', 'ee': 'ஏ', 'ai': 'ஐ',
      'oo': 'ஓ', 'au': 'ஔ', 'nga': 'ங', 'cha': 'ச', 'nya': 'ஞ',
      'zha': 'ழ',
      'ka': 'க', 'ta': 'ட', 'tha': 'த', 'pa': 'ப', 'ma': 'ம',
      'ya': 'ய', 'ra': 'ர', 'la': 'ல', 'va': 'வ', 'na': 'ந',
      'a': 'அ', 'i': 'இ', 'u': 'உ', 'e': 'எ', 'o': 'ஒ'
    };

    let result = text.toLowerCase();
    const sortedKeys = Object.keys(romanToTamil).sort((a, b) => b.length - a.length);
    
    for (const roman of sortedKeys) {
      const tamil = romanToTamil[roman];
      result = result.replace(new RegExp(roman, 'g'), tamil);
    }
    
    return result;
  }

  private romanToTelugu(text: string): string {
    const romanToTelugu: Record<string, string> = {
      'kha': 'ఖ', 'gha': 'ఘ', 'nga': 'ఙ', 'cha': 'చ', 'chha': 'ఛ',
      'jha': 'ఝ', 'nya': 'ఞ', 'tha': 'థ', 'dha': 'ధ', 'pha': 'ఫ',
      'bha': 'భ', 'sha': 'శ', 'aa': 'ఆ', 'ii': 'ఈ', 'uu': 'ఊ',
      'ee': 'ఏ', 'ai': 'ఐ', 'oo': 'ఓ', 'au': 'ఔ',
      'ka': 'క', 'ga': 'గ', 'ja': 'జ', 'ta': 'త', 'da': 'ద',
      'pa': 'ప', 'ba': 'బ', 'ma': 'మ', 'ya': 'య', 'ra': 'ర',
      'la': 'ల', 'va': 'వ', 'sa': 'స', 'ha': 'హ', 'na': 'న',
      'a': 'అ', 'i': 'ఇ', 'u': 'ఉ', 'e': 'ఎ', 'o': 'ఒ'
    };

    let result = text.toLowerCase();
    const sortedKeys = Object.keys(romanToTelugu).sort((a, b) => b.length - a.length);
    
    for (const roman of sortedKeys) {
      const telugu = romanToTelugu[roman];
      result = result.replace(new RegExp(roman, 'g'), telugu);
    }
    
    return result;
  }

  private romanToBengali(text: string): string {
    const romanToBengali: Record<string, string> = {
      'kha': 'খ', 'gha': 'ঘ', 'nga': 'ঙ', 'cha': 'চ', 'chha': 'ছ',
      'jha': 'ঝ', 'nya': 'ঞ', 'tha': 'থ', 'dha': 'ধ', 'pha': 'ফ',
      'bha': 'ভ', 'sha': 'শ', 'aa': 'আ', 'ii': 'ঈ', 'uu': 'ঊ',
      'ai': 'ঐ', 'au': 'ঔ',
      'ka': 'ক', 'ga': 'গ', 'ja': 'জ', 'ta': 'ত', 'da': 'দ',
      'pa': 'প', 'ba': 'ব', 'ma': 'ম', 'ya': 'য', 'ra': 'র',
      'la': 'ল', 'sa': 'স', 'ha': 'হ', 'na': 'ন',
      'a': 'অ', 'i': 'ই', 'u': 'উ', 'e': 'এ', 'o': 'ও'
    };

    let result = text.toLowerCase();
    const sortedKeys = Object.keys(romanToBengali).sort((a, b) => b.length - a.length);
    
    for (const roman of sortedKeys) {
      const bengali = romanToBengali[roman];
      result = result.replace(new RegExp(roman, 'g'), bengali);
    }
    
    return result;
  }

  private romanToGujarati(text: string): string {
    const romanToGujarati: Record<string, string> = {
      'kha': 'ખ', 'gha': 'ઘ', 'nga': 'ઙ', 'cha': 'ચ', 'chha': 'છ',
      'jha': 'ઝ', 'nya': 'ઞ', 'tha': 'થ', 'dha': 'ધ', 'pha': 'ફ',
      'bha': 'ભ', 'sha': 'શ', 'aa': 'આ', 'ii': 'ઈ', 'uu': 'ઊ',
      'ai': 'ઐ', 'au': 'ઔ',
      'ka': 'ક', 'ga': 'ગ', 'ja': 'જ', 'ta': 'ત', 'da': 'દ',
      'pa': 'પ', 'ba': 'બ', 'ma': 'મ', 'ya': 'ય', 'ra': 'ર',
      'la': 'લ', 'va': 'વ', 'sa': 'સ', 'ha': 'હ', 'na': 'ન',
      'a': 'અ', 'i': 'ઇ', 'u': 'ઉ', 'e': 'એ', 'o': 'ઓ'
    };

    let result = text.toLowerCase();
    const sortedKeys = Object.keys(romanToGujarati).sort((a, b) => b.length - a.length);
    
    for (const roman of sortedKeys) {
      const gujarati = romanToGujarati[roman];
      result = result.replace(new RegExp(roman, 'g'), gujarati);
    }
    
    return result;
  }

  private romanToKannada(text: string): string {
    const romanToKannada: Record<string, string> = {
      'kha': 'ಖ', 'gha': 'ಘ', 'nga': 'ಙ', 'cha': 'ಚ', 'chha': 'ಛ',
      'jha': 'ಝ', 'nya': 'ಞ', 'tha': 'ಥ', 'dha': 'ಧ', 'pha': 'ಫ',
      'bha': 'ಭ', 'sha': 'ಶ', 'aa': 'ಆ', 'ii': 'ಈ', 'uu': 'ಊ',
      'ee': 'ಏ', 'ai': 'ಐ', 'oo': 'ಓ', 'au': 'ಔ',
      'ka': 'ಕ', 'ga': 'ಗ', 'ja': 'ಜ', 'ta': 'ತ', 'da': 'ದ',
      'pa': 'ಪ', 'ba': 'ಬ', 'ma': 'ಮ', 'ya': 'ಯ', 'ra': 'ರ',
      'la': 'ಲ', 'va': 'ವ', 'sa': 'ಸ', 'ha': 'ಹ', 'na': 'ನ',
      'a': 'ಅ', 'i': 'ಇ', 'u': 'ಉ', 'e': 'ಎ', 'o': 'ಒ'
    };

    let result = text.toLowerCase();
    const sortedKeys = Object.keys(romanToKannada).sort((a, b) => b.length - a.length);
    
    for (const roman of sortedKeys) {
      const kannada = romanToKannada[roman];
      result = result.replace(new RegExp(roman, 'g'), kannada);
    }
    
    return result;
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