import { 
  IndianRegion, 
  CulturalContext, 
  RegionalPreferences, 
  FilteredContent, 
  ValidationResult, 
  CulturalAdaptation,
  CULTURAL_CONTEXTS 
} from '@/src/types/localization';

/**
 * Cultural Filter interface for ensuring culturally appropriate content
 */
export interface CulturalFilter {
  filterContent(content: string, region: IndianRegion): Promise<FilteredContent>;
  adaptExamples(examples: Example[], culturalContext: CulturalContext): Promise<Example[]>;
  validateCulturalSensitivity(response: string): Promise<ValidationResult>;
  getRegionalPreferences(region: IndianRegion): Promise<RegionalPreferences>;
}

export interface Example {
  id: string;
  text: string;
  context: string;
  culturalRelevance: number; // 0-1 score
}

/**
 * Implementation of Cultural Filter for Indian contexts
 */
export class IndianCulturalFilter implements CulturalFilter {
  private culturalKeywords: Record<IndianRegion, string[]>;
  private inappropriateContent: string[];
  private culturalReplacements: Record<string, Record<IndianRegion, string>>;

  constructor() {
    this.culturalKeywords = this.initializeCulturalKeywords();
    this.inappropriateContent = this.initializeInappropriateContent();
    this.culturalReplacements = this.initializeCulturalReplacements();
  }

  async filterContent(content: string, region: IndianRegion): Promise<FilteredContent> {
    const adaptations: CulturalAdaptation[] = [];
    let filteredContent = content;
    let culturalScore = 0.5; // Start with neutral score
    const warnings: string[] = [];

    // Check for inappropriate content
    for (const inappropriate of this.inappropriateContent) {
      if (content.toLowerCase().includes(inappropriate.toLowerCase())) {
        warnings.push(`Content contains potentially inappropriate reference: ${inappropriate}`);
        culturalScore -= 0.2;
      }
    }

    // Apply cultural replacements
    for (const [original, replacements] of Object.entries(this.culturalReplacements)) {
      if (content.includes(original) && replacements[region]) {
        const adapted = replacements[region];
        filteredContent = filteredContent.replace(new RegExp(original, 'gi'), adapted);
        
        adaptations.push({
          type: 'example',
          original,
          adapted,
          region,
          reasoning: `Replaced with culturally relevant example for ${region} region`
        });
        
        culturalScore += 0.1;
      }
    }

    // Check for cultural keywords that increase relevance
    const regionalKeywords = this.culturalKeywords[region] || [];
    for (const keyword of regionalKeywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        culturalScore += 0.05;
      }
    }

    // Ensure score stays within bounds
    culturalScore = Math.max(0, Math.min(1, culturalScore));

    return {
      content: filteredContent,
      adaptations,
      culturalScore,
      warnings
    };
  }

  async adaptExamples(examples: Example[], culturalContext: CulturalContext): Promise<Example[]> {
    const adaptedExamples: Example[] = [];

    for (const example of examples) {
      let adaptedText = example.text;
      let relevanceScore = example.culturalRelevance;

      // Replace generic examples with culturally relevant ones
      adaptedText = this.replaceWithCulturalExamples(adaptedText, culturalContext);
      
      // Increase relevance if cultural elements are present
      for (const festival of culturalContext.festivals) {
        if (adaptedText.toLowerCase().includes(festival.toLowerCase())) {
          relevanceScore += 0.1;
        }
      }

      for (const figure of culturalContext.historicalFigures) {
        if (adaptedText.toLowerCase().includes(figure.toLowerCase())) {
          relevanceScore += 0.1;
        }
      }

      adaptedExamples.push({
        ...example,
        text: adaptedText,
        culturalRelevance: Math.min(1, relevanceScore)
      });
    }

    return adaptedExamples;
  }

  async validateCulturalSensitivity(response: string): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];
    let score = 1.0;

    // Check for potentially insensitive content
    const sensitiveTopics = [
      'caste', 'religion', 'communal', 'partition', 'colonial',
      'poverty', 'illiteracy', 'dowry', 'sati'
    ];

    for (const topic of sensitiveTopics) {
      if (response.toLowerCase().includes(topic)) {
        issues.push({
          type: 'cultural',
          severity: 'medium',
          message: `Content mentions sensitive topic: ${topic}`,
          suggestion: 'Consider providing balanced context or avoiding the topic'
        });
        score -= 0.1;
      }
    }

    // Check for Western-centric examples
    const westernReferences = [
      'christmas', 'easter', 'thanksgiving', 'halloween',
      'dollar', 'pound', 'euro', 'fahrenheit'
    ];

    for (const reference of westernReferences) {
      if (response.toLowerCase().includes(reference)) {
        issues.push({
          type: 'cultural',
          severity: 'low',
          message: `Content uses Western reference: ${reference}`,
          suggestion: 'Consider using Indian equivalent or context'
        });
        score -= 0.05;
      }
    }

    // Check for educational appropriateness
    const educationalTerms = ['homework', 'grades', 'semester', 'gpa'];
    let hasIndianEducationalContext = false;

    const indianEducationalTerms = ['cbse', 'icse', 'board exam', 'jee', 'neet', 'class', 'standard'];
    for (const term of indianEducationalTerms) {
      if (response.toLowerCase().includes(term)) {
        hasIndianEducationalContext = true;
        score += 0.05;
        break;
      }
    }

    if (!hasIndianEducationalContext && educationalTerms.some(term => 
      response.toLowerCase().includes(term))) {
      issues.push({
        type: 'educational',
        severity: 'medium',
        message: 'Content uses non-Indian educational terminology',
        suggestion: 'Use Indian educational system terms (CBSE, ICSE, Board exams, etc.)'
      });
      score -= 0.1;
    }

    return {
      isValid: score >= 0.7,
      score: Math.max(0, score),
      issues
    };
  }

  async getRegionalPreferences(region: IndianRegion): Promise<RegionalPreferences> {
    const culturalContext = CULTURAL_CONTEXTS[region];
    const colors = culturalContext.preferredColors;

    const preferences: RegionalPreferences = {
      colorScheme: {
        primary: colors[0] || '#FF6B35',
        secondary: colors[1] || '#F7931E',
        accent: colors[2] || '#FFD700'
      },
      dateFormat: 'DD/MM/YYYY', // Indian date format
      numberFormat: 'en-IN', // Indian number format with lakhs/crores
      currencyFormat: '₹#,##,###', // Indian Rupee format
      timeFormat: '12' // 12-hour format commonly used in India
    };

    return preferences;
  }

  // Private helper methods

  private initializeCulturalKeywords(): Record<IndianRegion, string[]> {
    return {
      north: ['delhi', 'punjab', 'rajasthan', 'uttar pradesh', 'haryana', 'himachal', 'uttarakhand'],
      south: ['tamil nadu', 'karnataka', 'andhra pradesh', 'telangana', 'kerala', 'chennai', 'bangalore', 'hyderabad'],
      west: ['maharashtra', 'gujarat', 'goa', 'mumbai', 'pune', 'ahmedabad', 'surat'],
      east: ['west bengal', 'odisha', 'jharkhand', 'kolkata', 'bhubaneswar'],
      northeast: ['assam', 'meghalaya', 'manipur', 'tripura', 'nagaland', 'mizoram', 'arunachal pradesh', 'sikkim'],
      central: ['madhya pradesh', 'chhattisgarh', 'bhopal', 'indore', 'raipur']
    };
  }

  private initializeInappropriateContent(): string[] {
    return [
      'beef', 'pork', // Dietary restrictions
      'alcohol', 'drinking', // Cultural sensitivities
      'dating', 'boyfriend', 'girlfriend', // Conservative family values
      'nightclub', 'bar', // Social restrictions
      'bikini', 'revealing clothes' // Modesty concerns
    ];
  }

  private initializeCulturalReplacements(): Record<string, Record<IndianRegion, string>> {
    return {
      'apple pie': {
        north: 'gulab jamun',
        south: 'payasam',
        west: 'puran poli',
        east: 'rasgulla',
        northeast: 'pitha',
        central: 'malpua'
      },
      'thanksgiving dinner': {
        north: 'Diwali feast',
        south: 'Onam sadhya',
        west: 'Ganesh Chaturthi celebration',
        east: 'Durga Puja bhog',
        northeast: 'Bihu feast',
        central: 'Dussehra celebration'
      },
      'baseball': {
        north: 'cricket',
        south: 'cricket',
        west: 'cricket',
        east: 'football',
        northeast: 'archery',
        central: 'kabaddi'
      },
      'dollar': {
        north: 'rupee',
        south: 'rupee',
        west: 'rupee',
        east: 'rupee',
        northeast: 'rupee',
        central: 'rupee'
      },
      'George Washington': {
        north: 'Mahatma Gandhi',
        south: 'APJ Abdul Kalam',
        west: 'Chhatrapati Shivaji',
        east: 'Rabindranath Tagore',
        northeast: 'Lachit Borphukan',
        central: 'Rani Lakshmibai'
      }
    };
  }

  private replaceWithCulturalExamples(text: string, culturalContext: CulturalContext): string {
    let adaptedText = text;

    // Replace generic festivals with regional ones
    const genericFestivals = ['holiday', 'celebration', 'festival'];
    for (const generic of genericFestivals) {
      if (adaptedText.toLowerCase().includes(generic) && culturalContext.festivals.length > 0) {
        const randomFestival = culturalContext.festivals[
          Math.floor(Math.random() * culturalContext.festivals.length)
        ];
        adaptedText = adaptedText.replace(
          new RegExp(generic, 'gi'), 
          randomFestival
        );
      }
    }

    // Replace generic places with regional references
    const genericPlaces = ['city', 'town', 'place'];
    for (const generic of genericPlaces) {
      if (adaptedText.toLowerCase().includes(generic) && culturalContext.geographicalReferences.length > 0) {
        const randomPlace = culturalContext.geographicalReferences[
          Math.floor(Math.random() * culturalContext.geographicalReferences.length)
        ];
        adaptedText = adaptedText.replace(
          new RegExp(`the ${generic}`, 'gi'), 
          randomPlace
        );
      }
    }

    return adaptedText;
  }
}

// Singleton instance
export const culturalFilter = new IndianCulturalFilter();