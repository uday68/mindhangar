import { describe, it, expect, beforeEach } from 'vitest';
import { IndianCulturalFilter, Example } from './CulturalFilter';
import { IndianRegion, CULTURAL_CONTEXTS } from '@/src/types/localization';

describe('IndianCulturalFilter', () => {
  let culturalFilter: IndianCulturalFilter;

  beforeEach(() => {
    culturalFilter = new IndianCulturalFilter();
  });

  describe('Content Filtering', () => {
    it('should adapt Western examples to Indian context', async () => {
      const content = 'Let\'s celebrate thanksgiving dinner with apple pie';
      const result = await culturalFilter.filterContent(content, 'north');
      
      expect(result.content).toContain('Diwali feast');
      expect(result.content).toContain('gulab jamun');
      expect(result.adaptations).toHaveLength(2);
      expect(result.culturalScore).toBeGreaterThan(0.5);
    });

    it('should detect inappropriate content', async () => {
      const content = 'Let\'s go to the bar for drinks';
      const result = await culturalFilter.filterContent(content, 'north');
      
      expect(result.warnings).toHaveLength(2); // 'bar' and 'drinks'
      expect(result.culturalScore).toBeLessThan(0.5);
    });

    it('should increase cultural score for regional keywords', async () => {
      const content = 'Students in Delhi are preparing for exams';
      const result = await culturalFilter.filterContent(content, 'north');
      
      expect(result.culturalScore).toBeGreaterThan(0.5);
      expect(result.warnings).toHaveLength(0);
    });

    it('should adapt content differently for different regions', async () => {
      const content = 'Let\'s celebrate thanksgiving dinner';
      
      const northResult = await culturalFilter.filterContent(content, 'north');
      const southResult = await culturalFilter.filterContent(content, 'south');
      
      expect(northResult.content).toContain('Diwali feast');
      expect(southResult.content).toContain('Onam sadhya');
    });
  });

  describe('Example Adaptation', () => {
    it('should adapt examples with cultural context', async () => {
      const examples: Example[] = [
        {
          id: '1',
          text: 'During the holiday season, families gather together',
          context: 'family traditions',
          culturalRelevance: 0.3
        }
      ];

      const culturalContext = CULTURAL_CONTEXTS.north;
      const adaptedExamples = await culturalFilter.adaptExamples(examples, culturalContext);
      
      expect(adaptedExamples[0].culturalRelevance).toBeGreaterThan(0.3);
      expect(adaptedExamples[0].text).toMatch(/Diwali|Holi|Dussehra/);
    });

    it('should increase relevance for cultural references', async () => {
      const examples: Example[] = [
        {
          id: '1',
          text: 'Mahatma Gandhi led the independence movement',
          context: 'historical figures',
          culturalRelevance: 0.5
        }
      ];

      const culturalContext = CULTURAL_CONTEXTS.north;
      const adaptedExamples = await culturalFilter.adaptExamples(examples, culturalContext);
      
      expect(adaptedExamples[0].culturalRelevance).toBeGreaterThan(0.5);
    });
  });

  describe('Cultural Sensitivity Validation', () => {
    it('should validate culturally appropriate content', async () => {
      const response = 'Students should prepare for CBSE board exams using Indian examples';
      const result = await culturalFilter.validateCulturalSensitivity(response);
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0.7);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect sensitive topics', async () => {
      const response = 'The caste system has historical significance in Indian society';
      const result = await culturalFilter.validateCulturalSensitivity(response);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('cultural');
      expect(result.issues[0].severity).toBe('medium');
      expect(result.score).toBeLessThan(1.0);
    });

    it('should detect Western-centric references', async () => {
      const response = 'The temperature is 70 degrees Fahrenheit, like a Christmas morning';
      const result = await culturalFilter.validateCulturalSensitivity(response);
      
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some(issue => issue.message.includes('Western reference'))).toBe(true);
    });

    it('should detect non-Indian educational terminology', async () => {
      const response = 'Students should focus on their GPA and semester grades';
      const result = await culturalFilter.validateCulturalSensitivity(response);
      
      expect(result.issues.some(issue => issue.type === 'educational')).toBe(true);
      expect(result.score).toBeLessThan(0.9);
    });

    it('should reward Indian educational context', async () => {
      const response = 'Students preparing for JEE should focus on CBSE syllabus';
      const result = await culturalFilter.validateCulturalSensitivity(response);
      
      expect(result.score).toBeGreaterThan(0.7);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Regional Preferences', () => {
    it('should return appropriate color schemes for each region', async () => {
      const regions: IndianRegion[] = ['north', 'south', 'west', 'east', 'northeast', 'central'];
      
      for (const region of regions) {
        const preferences = await culturalFilter.getRegionalPreferences(region);
        
        expect(preferences.colorScheme.primary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(preferences.colorScheme.secondary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(preferences.colorScheme.accent).toMatch(/^#[0-9A-F]{6}$/i);
        expect(preferences.dateFormat).toBe('DD/MM/YYYY');
        expect(preferences.currencyFormat).toBe('₹#,##,###');
        expect(preferences.timeFormat).toBe('12');
      }
    });

    it('should return different color schemes for different regions', async () => {
      const northPrefs = await culturalFilter.getRegionalPreferences('north');
      const southPrefs = await culturalFilter.getRegionalPreferences('south');
      
      expect(northPrefs.colorScheme.primary).not.toBe(southPrefs.colorScheme.primary);
    });
  });

  describe('Cultural Context Integration', () => {
    it('should use cultural context data correctly', () => {
      const northContext = CULTURAL_CONTEXTS.north;
      
      expect(northContext.festivals).toContain('Diwali');
      expect(northContext.festivals).toContain('Holi');
      expect(northContext.historicalFigures).toContain('Mahatma Gandhi');
      expect(northContext.geographicalReferences).toContain('Delhi');
    });

    it('should have different cultural contexts for different regions', () => {
      const northContext = CULTURAL_CONTEXTS.north;
      const southContext = CULTURAL_CONTEXTS.south;
      
      expect(northContext.festivals).not.toEqual(southContext.festivals);
      expect(southContext.festivals).toContain('Pongal');
      expect(southContext.festivals).toContain('Onam');
    });
  });
});