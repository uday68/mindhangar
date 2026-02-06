import { describe, it, expect, beforeEach } from 'vitest';
import { CulturalThemeService } from './CulturalThemeService';
import { IndianRegion } from '@/src/types/localization';

describe('CulturalThemeService', () => {
  let service: CulturalThemeService;

  beforeEach(() => {
    service = new CulturalThemeService();
  });

  describe('Theme Management', () => {
    it('should return theme for each region', () => {
      const regions: IndianRegion[] = ['north', 'south', 'west', 'east', 'northeast', 'central'];
      
      for (const region of regions) {
        const theme = service.getTheme(region);
        expect(theme).toBeDefined();
        expect(theme.name).toBeDefined();
        expect(theme.region).toBe(region);
        expect(theme.colorScheme).toBeDefined();
        expect(theme.patterns).toBeInstanceOf(Array);
        expect(theme.icons).toBeInstanceOf(Array);
      }
    });

    it('should return different themes for different regions', () => {
      const northTheme = service.getTheme('north');
      const southTheme = service.getTheme('south');
      
      expect(northTheme.colorScheme.primary).not.toBe(southTheme.colorScheme.primary);
      expect(northTheme.patterns).not.toEqual(southTheme.patterns);
    });

    it('should have valid color schemes', () => {
      const regions: IndianRegion[] = ['north', 'south', 'west', 'east', 'northeast', 'central'];
      
      for (const region of regions) {
        const colorScheme = service.getColorScheme(region);
        
        // Check all required colors are present
        expect(colorScheme.primary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.secondary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.accent).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.background).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.surface).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.text).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.textSecondary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.border).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.success).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.warning).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.error).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.info).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });
  });

  describe('Festival Calendar', () => {
    it('should return upcoming festivals', () => {
      const festivals = service.getUpcomingFestivals('north', 365);
      expect(festivals).toBeInstanceOf(Array);
      expect(festivals.length).toBeGreaterThan(0);
    });

    it('should return festivals sorted by date', () => {
      const festivals = service.getUpcomingFestivals('north', 365);
      
      for (let i = 1; i < festivals.length; i++) {
        expect(festivals[i].date.getTime()).toBeGreaterThanOrEqual(
          festivals[i - 1].date.getTime()
        );
      }
    });

    it('should include both national and regional festivals', () => {
      const festivals = service.getUpcomingFestivals('north', 365);
      
      const hasNational = festivals.some(f => f.isNational);
      const hasRegional = festivals.some(f => !f.isNational);
      
      expect(hasNational).toBe(true);
      expect(hasRegional).toBe(true);
    });

    it('should return different regional festivals for different regions', () => {
      const northFestivals = service.getUpcomingFestivals('north', 365);
      const southFestivals = service.getUpcomingFestivals('south', 365);
      
      const northRegionalNames = northFestivals
        .filter(f => !f.isNational)
        .map(f => f.name);
      const southRegionalNames = southFestivals
        .filter(f => !f.isNational)
        .map(f => f.name);
      
      // Should have some different regional festivals
      const hasUniqueFestivals = northRegionalNames.some(
        name => !southRegionalNames.includes(name)
      );
      expect(hasUniqueFestivals).toBe(true);
    });

    it('should check if today is a festival', () => {
      const result = service.isFestivalToday('north');
      // Result can be null or a festival object
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should get festival by specific date', () => {
      // Test with Republic Day (January 26)
      const republicDay = new Date(new Date().getFullYear(), 0, 26);
      const festival = service.getFestivalByDate(republicDay, 'north');
      
      if (festival) {
        expect(festival.name).toBe('Republic Day');
        expect(festival.isNational).toBe(true);
      }
    });
  });

  describe('Gamification Elements', () => {
    it('should return gamification elements for each region', () => {
      const regions: IndianRegion[] = ['north', 'south', 'west'];
      
      for (const region of regions) {
        const elements = service.getGamificationElements(region);
        expect(elements).toBeInstanceOf(Array);
        expect(elements.length).toBeGreaterThan(0);
      }
    });

    it('should have valid gamification element structure', () => {
      const elements = service.getGamificationElements('north');
      
      for (const element of elements) {
        expect(element.id).toBeDefined();
        expect(element.name).toBeDefined();
        expect(element.description).toBeDefined();
        expect(element.icon).toBeDefined();
        expect(element.culturalReference).toBeDefined();
        expect(element.region).toBe('north');
        expect(element.unlockCondition).toBeDefined();
        expect(element.xpValue).toBeGreaterThan(0);
      }
    });

    it('should have culturally relevant gamification elements', () => {
      const northElements = service.getGamificationElements('north');
      const southElements = service.getGamificationElements('south');
      
      // North should have different cultural references than South
      const northReferences = northElements.map(e => e.culturalReference);
      const southReferences = southElements.map(e => e.culturalReference);
      
      expect(northReferences).not.toEqual(southReferences);
    });
  });

  describe('Cultural Patterns and Icons', () => {
    it('should return cultural patterns for each region', () => {
      const regions: IndianRegion[] = ['north', 'south', 'west', 'east', 'northeast', 'central'];
      
      for (const region of regions) {
        const patterns = service.getCulturalPatterns(region);
        expect(patterns).toBeInstanceOf(Array);
        expect(patterns.length).toBeGreaterThan(0);
      }
    });

    it('should return cultural icons for each region', () => {
      const regions: IndianRegion[] = ['north', 'south', 'west', 'east', 'northeast', 'central'];
      
      for (const region of regions) {
        const icons = service.getCulturalIcons(region);
        expect(icons).toBeInstanceOf(Array);
        expect(icons.length).toBeGreaterThan(0);
      }
    });

    it('should have different patterns for different regions', () => {
      const northPatterns = service.getCulturalPatterns('north');
      const southPatterns = service.getCulturalPatterns('south');
      
      expect(northPatterns).not.toEqual(southPatterns);
    });

    it('should have region-specific patterns', () => {
      const northPatterns = service.getCulturalPatterns('north');
      const southPatterns = service.getCulturalPatterns('south');
      const westPatterns = service.getCulturalPatterns('west');
      
      // North should have rangoli, paisley
      expect(northPatterns).toContain('rangoli');
      
      // South should have kolam
      expect(southPatterns).toContain('kolam');
      
      // West should have warli
      expect(westPatterns).toContain('warli');
    });
  });

  describe('Theme Application', () => {
    it('should apply cultural theme without errors', () => {
      // This test checks if the method runs without throwing errors
      // In a real browser environment, it would set CSS variables
      expect(() => {
        service.applyCulturalTheme('north');
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid region gracefully', () => {
      // @ts-expect-error Testing invalid input
      const theme = service.getTheme('invalid-region');
      expect(theme).toBeDefined();
      // Should fallback to north theme
      expect(theme.region).toBe('north');
    });

    it('should handle zero days ahead for festivals', () => {
      const festivals = service.getUpcomingFestivals('north', 0);
      expect(festivals).toBeInstanceOf(Array);
      // Should return festivals happening today
    });

    it('should handle negative days ahead for festivals', () => {
      const festivals = service.getUpcomingFestivals('north', -1);
      expect(festivals).toBeInstanceOf(Array);
      expect(festivals.length).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should provide complete theme data for a region', () => {
      const theme = service.getTheme('north');
      const colorScheme = service.getColorScheme('north');
      const patterns = service.getCulturalPatterns('north');
      const icons = service.getCulturalIcons('north');
      const gamification = service.getGamificationElements('north');
      const festivals = service.getUpcomingFestivals('north', 30);
      
      expect(theme).toBeDefined();
      expect(colorScheme).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);
      expect(icons.length).toBeGreaterThan(0);
      expect(gamification.length).toBeGreaterThan(0);
      expect(festivals).toBeInstanceOf(Array);
    });

    it('should maintain consistency across multiple calls', () => {
      const theme1 = service.getTheme('north');
      const theme2 = service.getTheme('north');
      
      expect(theme1).toEqual(theme2);
      expect(theme1.colorScheme).toEqual(theme2.colorScheme);
    });
  });
});
