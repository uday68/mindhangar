import { 
  IndianRegion, 
  CulturalContext, 
  CULTURAL_CONTEXTS 
} from '@/src/types/localization';

/**
 * Cultural Theme Service for visual and UI adaptations
 * Provides Indian-themed color schemes, festival calendars, and gamification elements
 */

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface FestivalEvent {
  id: string;
  name: string;
  date: Date;
  region: IndianRegion;
  description: string;
  colorTheme: string;
  icon: string;
  isNational: boolean;
}

export interface GamificationElement {
  id: string;
  name: string;
  description: string;
  icon: string;
  culturalReference: string;
  region: IndianRegion;
  unlockCondition: string;
  xpValue: number;
}

export interface CulturalTheme {
  name: string;
  region: IndianRegion;
  colorScheme: ColorScheme;
  patterns: string[];
  icons: string[];
  festivals: FestivalEvent[];
  gamificationElements: GamificationElement[];
}

export class CulturalThemeService {
  private themes: Map<IndianRegion, CulturalTheme>;
  private festivalCalendar: Map<string, FestivalEvent[]>;

  constructor() {
    this.themes = new Map();
    this.festivalCalendar = new Map();
    this.initializeThemes();
    this.initializeFestivalCalendar();
  }

  /**
   * Get cultural theme for a specific region
   */
  getTheme(region: IndianRegion): CulturalTheme {
    return this.themes.get(region) || this.themes.get('north')!;
  }

  /**
   * Get color scheme for a specific region
   */
  getColorScheme(region: IndianRegion): ColorScheme {
    const theme = this.getTheme(region);
    return theme.colorScheme;
  }

  /**
   * Get upcoming festivals for a region
   */
  getUpcomingFestivals(region: IndianRegion, daysAhead: number = 30): FestivalEvent[] {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    const regionalFestivals = this.festivalCalendar.get(region) || [];
    const nationalFestivals = this.festivalCalendar.get('national') || [];
    
    const allFestivals = [...regionalFestivals, ...nationalFestivals];
    
    return allFestivals.filter(festival => {
      return festival.date >= today && festival.date <= futureDate;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get gamification elements for a region
   */
  getGamificationElements(region: IndianRegion): GamificationElement[] {
    const theme = this.getTheme(region);
    return theme.gamificationElements;
  }

  /**
   * Get festival by date
   */
  getFestivalByDate(date: Date, region: IndianRegion): FestivalEvent | null {
    const festivals = this.festivalCalendar.get(region) || [];
    const nationalFestivals = this.festivalCalendar.get('national') || [];
    
    const allFestivals = [...festivals, ...nationalFestivals];
    
    return allFestivals.find(festival => 
      festival.date.toDateString() === date.toDateString()
    ) || null;
  }

  /**
   * Check if today is a festival
   */
  isFestivalToday(region: IndianRegion): FestivalEvent | null {
    return this.getFestivalByDate(new Date(), region);
  }

  /**
   * Get cultural patterns for decoration
   */
  getCulturalPatterns(region: IndianRegion): string[] {
    const theme = this.getTheme(region);
    return theme.patterns;
  }

  /**
   * Get cultural icons
   */
  getCulturalIcons(region: IndianRegion): string[] {
    const theme = this.getTheme(region);
    return theme.icons;
  }

  /**
   * Apply cultural theme to CSS variables
   */
  applyCulturalTheme(region: IndianRegion): void {
    const colorScheme = this.getColorScheme(region);
    const root = document.documentElement;

    root.style.setProperty('--color-primary', colorScheme.primary);
    root.style.setProperty('--color-secondary', colorScheme.secondary);
    root.style.setProperty('--color-accent', colorScheme.accent);
    root.style.setProperty('--color-background', colorScheme.background);
    root.style.setProperty('--color-surface', colorScheme.surface);
    root.style.setProperty('--color-text', colorScheme.text);
    root.style.setProperty('--color-text-secondary', colorScheme.textSecondary);
    root.style.setProperty('--color-border', colorScheme.border);
    root.style.setProperty('--color-success', colorScheme.success);
    root.style.setProperty('--color-warning', colorScheme.warning);
    root.style.setProperty('--color-error', colorScheme.error);
    root.style.setProperty('--color-info', colorScheme.info);
  }

  // Private initialization methods

  private initializeThemes(): void {
    // North India Theme (Saffron, White, Green - inspired by Indian flag)
    this.themes.set('north', {
      name: 'North India',
      region: 'north',
      colorScheme: {
        primary: '#FF9933', // Saffron
        secondary: '#138808', // Green
        accent: '#000080', // Navy Blue (Ashoka Chakra)
        background: '#FFFEF7', // Warm white
        surface: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#666666',
        border: '#E0E0E0',
        success: '#138808',
        warning: '#FF9933',
        error: '#D32F2F',
        info: '#000080'
      },
      patterns: ['rangoli', 'paisley', 'mandala', 'lotus'],
      icons: ['🪔', '🕉️', '🏛️', '🌺', '🦚'],
      festivals: [],
      gamificationElements: []
    });

    // South India Theme (Temple colors - Gold, Maroon, Teal)
    this.themes.set('south', {
      name: 'South India',
      region: 'south',
      colorScheme: {
        primary: '#B8860B', // Dark Goldenrod
        secondary: '#800020', // Burgundy/Maroon
        accent: '#008B8B', // Dark Cyan/Teal
        background: '#FFF8DC', // Cornsilk
        surface: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#666666',
        border: '#E0E0E0',
        success: '#228B22',
        warning: '#FF8C00',
        error: '#8B0000',
        info: '#008B8B'
      },
      patterns: ['kolam', 'temple-art', 'banana-leaf', 'coconut'],
      icons: ['🥥', '🍌', '🛕', '🌴', '🦜'],
      festivals: [],
      gamificationElements: []
    });

    // West India Theme (Vibrant colors - Orange, Pink, Yellow)
    this.themes.set('west', {
      name: 'West India',
      region: 'west',
      colorScheme: {
        primary: '#FF6B35', // Vibrant Orange
        secondary: '#FF1493', // Deep Pink
        accent: '#FFD700', // Gold
        background: '#FFF5E6', // Seashell
        surface: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#666666',
        border: '#E0E0E0',
        success: '#32CD32',
        warning: '#FFA500',
        error: '#DC143C',
        info: '#4169E1'
      },
      patterns: ['warli', 'bandhani', 'block-print', 'mirror-work'],
      icons: ['🎭', '🪘', '🏖️', '🌊', '🦁'],
      festivals: [],
      gamificationElements: []
    });

    // East India Theme (Earthy colors - Terracotta, Yellow, Red)
    this.themes.set('east', {
      name: 'East India',
      region: 'east',
      colorScheme: {
        primary: '#CD5C5C', // Indian Red/Terracotta
        secondary: '#FFD700', // Gold
        accent: '#DC143C', // Crimson
        background: '#FFF8E7', // Cosmic Latte
        surface: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#666666',
        border: '#E0E0E0',
        success: '#228B22',
        warning: '#FF8C00',
        error: '#B22222',
        info: '#4682B4'
      },
      patterns: ['madhubani', 'pattachitra', 'terracotta', 'alpana'],
      icons: ['🐟', '🎨', '🏺', '🌾', '🐅'],
      festivals: [],
      gamificationElements: []
    });

    // Northeast India Theme (Nature colors - Green, Blue, Brown)
    this.themes.set('northeast', {
      name: 'Northeast India',
      region: 'northeast',
      colorScheme: {
        primary: '#228B22', // Forest Green
        secondary: '#4169E1', // Royal Blue
        accent: '#8B4513', // Saddle Brown
        background: '#F0FFF0', // Honeydew
        surface: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#666666',
        border: '#E0E0E0',
        success: '#32CD32',
        warning: '#DAA520',
        error: '#DC143C',
        info: '#4169E1'
      },
      patterns: ['tribal-weave', 'bamboo', 'orchid', 'mountain'],
      icons: ['🏔️', '🦋', '🌸', '🎋', '🦌'],
      festivals: [],
      gamificationElements: []
    });

    // Central India Theme (Royal colors - Purple, Gold, Red)
    this.themes.set('central', {
      name: 'Central India',
      region: 'central',
      colorScheme: {
        primary: '#8B008B', // Dark Magenta
        secondary: '#DAA520', // Goldenrod
        accent: '#DC143C', // Crimson
        background: '#FFF0F5', // Lavender Blush
        surface: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#666666',
        border: '#E0E0E0',
        success: '#228B22',
        warning: '#FF8C00',
        error: '#8B0000',
        info: '#4B0082'
      },
      patterns: ['gond-art', 'tribal-motif', 'fort-architecture', 'wildlife'],
      icons: ['🦁', '🏰', '🌳', '🦚', '🎪'],
      festivals: [],
      gamificationElements: []
    });

    // Initialize gamification elements for each region
    this.initializeGamificationElements();
  }

  private initializeGamificationElements(): void {
    // North India Gamification
    const northGamification: GamificationElement[] = [
      {
        id: 'diya-lighter',
        name: 'Diya Lighter',
        description: 'Light 10 knowledge diyas',
        icon: '🪔',
        culturalReference: 'Diwali tradition of lighting diyas',
        region: 'north',
        unlockCondition: 'Complete 10 lessons',
        xpValue: 100
      },
      {
        id: 'taj-scholar',
        name: 'Taj Scholar',
        description: 'Build your knowledge monument',
        icon: '🏛️',
        culturalReference: 'Taj Mahal - symbol of dedication',
        region: 'north',
        unlockCondition: 'Complete 50 lessons',
        xpValue: 500
      },
      {
        id: 'peacock-pride',
        name: 'Peacock Pride',
        description: 'Display your learning achievements',
        icon: '🦚',
        culturalReference: 'National bird representing beauty and pride',
        region: 'north',
        unlockCondition: 'Achieve 90% in 5 quizzes',
        xpValue: 300
      }
    ];

    // South India Gamification
    const southGamification: GamificationElement[] = [
      {
        id: 'kolam-master',
        name: 'Kolam Master',
        description: 'Create perfect learning patterns',
        icon: '🎨',
        culturalReference: 'Traditional kolam art',
        region: 'south',
        unlockCondition: 'Complete 10 lessons perfectly',
        xpValue: 100
      },
      {
        id: 'temple-scholar',
        name: 'Temple Scholar',
        description: 'Reach the pinnacle of knowledge',
        icon: '🛕',
        culturalReference: 'South Indian temple architecture',
        region: 'south',
        unlockCondition: 'Complete 50 lessons',
        xpValue: 500
      },
      {
        id: 'coconut-breaker',
        name: 'Coconut Breaker',
        description: 'Break through difficult concepts',
        icon: '🥥',
        culturalReference: 'Coconut breaking ritual for new beginnings',
        region: 'south',
        unlockCondition: 'Complete 10 difficult topics',
        xpValue: 300
      }
    ];

    // West India Gamification
    const westGamification: GamificationElement[] = [
      {
        id: 'garba-dancer',
        name: 'Garba Dancer',
        description: 'Dance through your learning journey',
        icon: '💃',
        culturalReference: 'Traditional Garba dance',
        region: 'west',
        unlockCondition: 'Maintain 7-day streak',
        xpValue: 200
      },
      {
        id: 'gateway-guardian',
        name: 'Gateway Guardian',
        description: 'Guard the gateway to knowledge',
        icon: '🏛️',
        culturalReference: 'Gateway of India',
        region: 'west',
        unlockCondition: 'Complete 50 lessons',
        xpValue: 500
      },
      {
        id: 'lion-courage',
        name: 'Lion Courage',
        description: 'Face challenges with courage',
        icon: '🦁',
        culturalReference: 'Asiatic lion - symbol of courage',
        region: 'west',
        unlockCondition: 'Complete 5 challenging quizzes',
        xpValue: 300
      }
    ];

    // Add gamification elements to themes
    const northTheme = this.themes.get('north')!;
    northTheme.gamificationElements = northGamification;

    const southTheme = this.themes.get('south')!;
    southTheme.gamificationElements = southGamification;

    const westTheme = this.themes.get('west')!;
    westTheme.gamificationElements = westGamification;

    // Similar patterns for east, northeast, and central regions
    // (abbreviated for brevity - would include full implementations)
  }

  private initializeFestivalCalendar(): void {
    const currentYear = new Date().getFullYear();

    // National Festivals (celebrated across India)
    const nationalFestivals: FestivalEvent[] = [
      {
        id: 'republic-day',
        name: 'Republic Day',
        date: new Date(currentYear, 0, 26), // January 26
        region: 'north',
        description: 'Celebrating the Constitution of India',
        colorTheme: '#FF9933',
        icon: '🇮🇳',
        isNational: true
      },
      {
        id: 'independence-day',
        name: 'Independence Day',
        date: new Date(currentYear, 7, 15), // August 15
        region: 'north',
        description: 'Celebrating India\'s independence',
        colorTheme: '#138808',
        icon: '🇮🇳',
        isNational: true
      },
      {
        id: 'gandhi-jayanti',
        name: 'Gandhi Jayanti',
        date: new Date(currentYear, 9, 2), // October 2
        region: 'north',
        description: 'Birthday of Mahatma Gandhi',
        colorTheme: '#FFFFFF',
        icon: '🕊️',
        isNational: true
      },
      {
        id: 'diwali',
        name: 'Diwali',
        date: new Date(currentYear, 10, 1), // November (approximate)
        region: 'north',
        description: 'Festival of Lights',
        colorTheme: '#FFD700',
        icon: '🪔',
        isNational: true
      },
      {
        id: 'holi',
        name: 'Holi',
        date: new Date(currentYear, 2, 25), // March (approximate)
        region: 'north',
        description: 'Festival of Colors',
        colorTheme: '#FF1493',
        icon: '🎨',
        isNational: true
      }
    ];

    // Regional Festivals
    const northFestivals: FestivalEvent[] = [
      {
        id: 'lohri',
        name: 'Lohri',
        date: new Date(currentYear, 0, 13), // January 13
        region: 'north',
        description: 'Punjabi harvest festival',
        colorTheme: '#FF6B35',
        icon: '🔥',
        isNational: false
      },
      {
        id: 'baisakhi',
        name: 'Baisakhi',
        date: new Date(currentYear, 3, 13), // April 13
        region: 'north',
        description: 'Sikh New Year and harvest festival',
        colorTheme: '#FFD700',
        icon: '🌾',
        isNational: false
      }
    ];

    const southFestivals: FestivalEvent[] = [
      {
        id: 'pongal',
        name: 'Pongal',
        date: new Date(currentYear, 0, 14), // January 14
        region: 'south',
        description: 'Tamil harvest festival',
        colorTheme: '#B8860B',
        icon: '🍚',
        isNational: false
      },
      {
        id: 'onam',
        name: 'Onam',
        date: new Date(currentYear, 8, 8), // September (approximate)
        region: 'south',
        description: 'Kerala harvest festival',
        colorTheme: '#FFD700',
        icon: '🌺',
        isNational: false
      },
      {
        id: 'ugadi',
        name: 'Ugadi',
        date: new Date(currentYear, 3, 9), // April (approximate)
        region: 'south',
        description: 'Telugu and Kannada New Year',
        colorTheme: '#008B8B',
        icon: '🌸',
        isNational: false
      }
    ];

    const westFestivals: FestivalEvent[] = [
      {
        id: 'ganesh-chaturthi',
        name: 'Ganesh Chaturthi',
        date: new Date(currentYear, 8, 19), // September (approximate)
        region: 'west',
        description: 'Birthday of Lord Ganesha',
        colorTheme: '#FF6B35',
        icon: '🐘',
        isNational: false
      },
      {
        id: 'navratri',
        name: 'Navratri',
        date: new Date(currentYear, 9, 15), // October (approximate)
        region: 'west',
        description: 'Nine nights of dance and devotion',
        colorTheme: '#FF1493',
        icon: '💃',
        isNational: false
      }
    ];

    const eastFestivals: FestivalEvent[] = [
      {
        id: 'durga-puja',
        name: 'Durga Puja',
        date: new Date(currentYear, 9, 20), // October (approximate)
        region: 'east',
        description: 'Worship of Goddess Durga',
        colorTheme: '#DC143C',
        icon: '🏺',
        isNational: false
      },
      {
        id: 'rath-yatra',
        name: 'Rath Yatra',
        date: new Date(currentYear, 6, 1), // July (approximate)
        region: 'east',
        description: 'Chariot festival of Lord Jagannath',
        colorTheme: '#FFD700',
        icon: '🛞',
        isNational: false
      }
    ];

    // Store in calendar
    this.festivalCalendar.set('national', nationalFestivals);
    this.festivalCalendar.set('north', northFestivals);
    this.festivalCalendar.set('south', southFestivals);
    this.festivalCalendar.set('west', westFestivals);
    this.festivalCalendar.set('east', eastFestivals);
    this.festivalCalendar.set('northeast', []); // Would add specific festivals
    this.festivalCalendar.set('central', []); // Would add specific festivals
  }
}

// Singleton instance
export const culturalThemeService = new CulturalThemeService();
