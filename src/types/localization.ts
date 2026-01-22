// Core types for localization and multi-language support

export type SupportedLanguage = 
  | 'hi'    // Hindi
  | 'en'    // English
  | 'ta'    // Tamil
  | 'te'    // Telugu
  | 'bn'    // Bengali
  | 'mr'    // Marathi
  | 'gu'    // Gujarati
  | 'kn';   // Kannada

export type SupportedScript = 
  | 'devanagari'  // Hindi, Marathi
  | 'tamil'       // Tamil
  | 'telugu'      // Telugu
  | 'bengali'     // Bengali
  | 'gujarati'    // Gujarati
  | 'kannada'     // Kannada
  | 'roman';      // English

export type IndianRegion = 
  | 'north'       // Hindi belt
  | 'south'       // Tamil Nadu, Karnataka, Andhra Pradesh, Telangana
  | 'west'        // Maharashtra, Gujarat
  | 'east'        // West Bengal
  | 'northeast'   // Seven sister states
  | 'central';    // Madhya Pradesh, Chhattisgarh

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: SupportedScript;
  region: IndianRegion;
  rtl: boolean;
  fontFamily: string;
  direction: 'ltr' | 'rtl';
  languageCode: string;
  voiceSupported: boolean;
}

export interface CulturalContext {
  region: IndianRegion;
  festivals: string[];
  historicalFigures: string[];
  geographicalReferences: string[];
  culturalValues: string[];
  preferredColors: string[];
  educationalTraditions: string[];
}

export interface RegionalPreferences {
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  dateFormat: string;
  numberFormat: string;
  currencyFormat: string;
  timeFormat: string;
}

export interface TranslationResult {
  translatedText: string;
  confidence: number;
  detectedLanguage?: SupportedLanguage;
  alternatives?: string[];
}

export interface VoiceProcessingResult {
  text: string;
  confidence: number;
  language: SupportedLanguage;
  accent?: string;
  alternatives?: string[];
}

export interface LocalizedContent {
  id: string;
  baseLanguage: SupportedLanguage;
  translations: Record<SupportedLanguage, {
    title: string;
    content: string;
    metadata: {
      translatedAt: Date;
      translatedBy: 'human' | 'ai';
      reviewStatus: 'pending' | 'approved' | 'rejected';
      culturalAdaptations: string[];
    };
  }>;
}

export interface CulturalAdaptation {
  type: 'example' | 'reference' | 'color' | 'imagery' | 'metaphor';
  original: string;
  adapted: string;
  region: IndianRegion;
  reasoning: string;
}

export interface FilteredContent {
  content: string;
  adaptations: CulturalAdaptation[];
  culturalScore: number; // 0-1, higher is more culturally appropriate
  warnings: string[];
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: {
    type: 'cultural' | 'linguistic' | 'educational';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion?: string;
  }[];
}

// Language configuration constants
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'devanagari',
    region: 'north',
    rtl: false,
    fontFamily: 'Noto Sans Devanagari, sans-serif',
    direction: 'ltr',
    languageCode: 'hi-IN',
    voiceSupported: true
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'roman',
    region: 'north', // Default, but used across all regions
    rtl: false,
    fontFamily: 'Inter, sans-serif',
    direction: 'ltr',
    languageCode: 'en-IN',
    voiceSupported: true
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'tamil',
    region: 'south',
    rtl: false,
    fontFamily: 'Noto Sans Tamil, sans-serif',
    direction: 'ltr',
    languageCode: 'ta-IN',
    voiceSupported: true
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'telugu',
    region: 'south',
    rtl: false,
    fontFamily: 'Noto Sans Telugu, sans-serif',
    direction: 'ltr',
    languageCode: 'te-IN',
    voiceSupported: true
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'bengali',
    region: 'east',
    rtl: false,
    fontFamily: 'Noto Sans Bengali, sans-serif',
    direction: 'ltr',
    languageCode: 'bn-IN',
    voiceSupported: true
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'devanagari',
    region: 'west',
    rtl: false,
    fontFamily: 'Noto Sans Devanagari, sans-serif',
    direction: 'ltr',
    languageCode: 'mr-IN',
    voiceSupported: true
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'gujarati',
    region: 'west',
    rtl: false,
    fontFamily: 'Noto Sans Gujarati, sans-serif',
    direction: 'ltr',
    languageCode: 'gu-IN',
    voiceSupported: true
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'kannada',
    region: 'south',
    rtl: false,
    fontFamily: 'Noto Sans Kannada, sans-serif',
    direction: 'ltr',
    languageCode: 'kn-IN',
    voiceSupported: true
  }
};

// Cultural context data for different regions
export const CULTURAL_CONTEXTS: Record<IndianRegion, CulturalContext> = {
  north: {
    region: 'north',
    festivals: ['Diwali', 'Holi', 'Dussehra', 'Karva Chauth', 'Baisakhi'],
    historicalFigures: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Chandragupta Maurya', 'Akbar'],
    geographicalReferences: ['Himalayas', 'Ganges', 'Delhi', 'Agra', 'Rajasthan'],
    culturalValues: ['Joint family', 'Respect for elders', 'Hospitality', 'Dharma'],
    preferredColors: ['#FF6B35', '#F7931E', '#FFD700', '#DC143C'],
    educationalTraditions: ['Gurukula system', 'Oral tradition', 'Sanskrit learning']
  },
  south: {
    region: 'south',
    festivals: ['Pongal', 'Onam', 'Ugadi', 'Dussehra', 'Diwali'],
    historicalFigures: ['Tipu Sultan', 'Krishnadevaraya', 'Chhatrapati Shivaji', 'APJ Abdul Kalam'],
    geographicalReferences: ['Western Ghats', 'Deccan Plateau', 'Chennai', 'Bangalore', 'Hyderabad'],
    culturalValues: ['Classical arts', 'Temple traditions', 'Rice culture', 'Dravidian heritage'],
    preferredColors: ['#8B4513', '#FFD700', '#FF4500', '#228B22'],
    educationalTraditions: ['Classical music', 'Dance forms', 'Temple education']
  },
  west: {
    region: 'west',
    festivals: ['Ganesh Chaturthi', 'Navratri', 'Gudi Padwa', 'Diwali'],
    historicalFigures: ['Chhatrapati Shivaji', 'Mahatma Gandhi', 'Sardar Patel', 'Dhirubhai Ambani'],
    geographicalReferences: ['Arabian Sea', 'Mumbai', 'Pune', 'Ahmedabad', 'Goa'],
    culturalValues: ['Entrepreneurship', 'Trade traditions', 'Maritime culture', 'Industrial progress'],
    preferredColors: ['#FF8C00', '#4169E1', '#32CD32', '#FF1493'],
    educationalTraditions: ['Business education', 'Technical skills', 'Cooperative learning']
  },
  east: {
    region: 'east',
    festivals: ['Durga Puja', 'Kali Puja', 'Poila Boishakh', 'Diwali'],
    historicalFigures: ['Rabindranath Tagore', 'Swami Vivekananda', 'Netaji Subhas Chandra Bose', 'Satyajit Ray'],
    geographicalReferences: ['Bay of Bengal', 'Kolkata', 'Sundarbans', 'Darjeeling'],
    culturalValues: ['Literature', 'Arts', 'Intellectual discourse', 'Cultural renaissance'],
    preferredColors: ['#800080', '#FFD700', '#FF6347', '#20B2AA'],
    educationalTraditions: ['Literary tradition', 'Philosophical discourse', 'Cultural education']
  },
  northeast: {
    region: 'northeast',
    festivals: ['Bihu', 'Hornbill Festival', 'Wangala', 'Chapchar Kut'],
    historicalFigures: ['Lachit Borphukan', 'Rani Gaidinliu', 'Bhupen Hazarika'],
    geographicalReferences: ['Brahmaputra', 'Guwahati', 'Shillong', 'Imphal', 'Aizawl'],
    culturalValues: ['Tribal traditions', 'Nature worship', 'Community living', 'Oral traditions'],
    preferredColors: ['#228B22', '#FF4500', '#4169E1', '#FFD700'],
    educationalTraditions: ['Oral storytelling', 'Traditional crafts', 'Community learning']
  },
  central: {
    region: 'central',
    festivals: ['Diwali', 'Dussehra', 'Holi', 'Teej', 'Karva Chauth'],
    historicalFigures: ['Rani Lakshmibai', 'Chandrashekhar Azad', 'Tantya Tope'],
    geographicalReferences: ['Narmada', 'Bhopal', 'Indore', 'Jabalpur', 'Raipur'],
    culturalValues: ['Warrior traditions', 'Forest culture', 'Tribal heritage', 'Agricultural life'],
    preferredColors: ['#8B4513', '#FF6B35', '#228B22', '#FFD700'],
    educationalTraditions: ['Practical learning', 'Agricultural knowledge', 'Craft traditions']
  }
};