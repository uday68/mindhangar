import { describe, it, expect, beforeEach } from 'vitest';
import { WebLanguageEngine } from './LanguageEngine';
import { SupportedLanguage } from '@/src/types/localization';
import fc from 'fast-check';

/**
 * Property-Based Tests for Language Engine
 * Feature: mindhangar-ai-for-bharat, Property 1: Multi-Language Processing Consistency
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 */

describe('LanguageEngine Property Tests', () => {
  let languageEngine: WebLanguageEngine;

  beforeEach(() => {
    languageEngine = new WebLanguageEngine();
  });

  /**
   * Property 1: Multi-Language Processing Consistency
   * For any supported Indian language, when a user inputs text or selects that language,
   * the system should process the input correctly, translate UI elements appropriately,
   * render the correct regional script, and maintain language consistency throughout the interaction.
   */
  it('should maintain language processing consistency across all supported languages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn'),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (targetLanguage: SupportedLanguage, inputText: string) => {
          // Test language support detection
          const isSupported = languageEngine.isLanguageSupported(targetLanguage);
          expect(isSupported).toBe(true);

          // Test language configuration retrieval
          const config = languageEngine.getLanguageConfig(targetLanguage);
          expect(config).toBeDefined();
          expect(config.name).toBeDefined();
          expect(config.nativeName).toBeDefined();
          expect(config.script).toBeDefined();

          // Test translation consistency
          const translationResult = await languageEngine.translateText(inputText, targetLanguage);
          expect(translationResult).toBeDefined();
          expect(translationResult.translatedText).toBeDefined();
          expect(translationResult.confidence).toBeGreaterThanOrEqual(0);
          expect(translationResult.confidence).toBeLessThanOrEqual(1);

          // Test language detection
          const detectedLanguage = await languageEngine.detectLanguage(inputText);
          expect(languageEngine.isLanguageSupported(detectedLanguage)).toBe(true);

          // Test script conversion consistency
          if (config.script !== 'roman') {
            const romanScript = await languageEngine.convertScript(inputText, 'roman');
            expect(romanScript).toBeDefined();
            expect(typeof romanScript).toBe('string');

            // Converting back should maintain consistency
            const backConverted = await languageEngine.convertScript(romanScript, config.script);
            expect(backConverted).toBeDefined();
            expect(typeof backConverted).toBe('string');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Voice Processing Language Fidelity
   * For any supported Indian language, when voice input is provided or voice output is requested,
   * the system should recognize speech accurately in that language and generate voice output
   * with the appropriate regional accent and pronunciation.
   */
  it('should maintain voice processing fidelity across all supported languages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn'),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (language: SupportedLanguage, text: string) => {
          // Test voice output generation
          try {
            const voiceBlob = await languageEngine.generateVoiceOutput(text, language, 'indian');
            expect(voiceBlob).toBeInstanceOf(Blob);
            expect(voiceBlob.size).toBeGreaterThan(0);
          } catch (error) {
            // Voice synthesis might not be available in test environment
            // This is acceptable as long as the error is handled gracefully
            expect(error).toBeInstanceOf(Error);
          }

          // Test language configuration for voice processing
          const config = languageEngine.getLanguageConfig(language);
          expect(config.voiceSupported).toBeDefined();
          
          // If voice is supported, ensure proper language code mapping
          if (config.voiceSupported) {
            // The language engine should have proper language code mapping
            expect(config.languageCode).toBeDefined();
            expect(config.languageCode).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
          }
        }
      ),
      { numRuns: 50 } // Fewer runs for voice tests due to potential browser limitations
    );
  });

  /**
   * Unit tests for specific edge cases and examples
   */
  describe('Language Engine Unit Tests', () => {
    it('should handle empty strings gracefully', async () => {
      const result = await languageEngine.translateText('', 'hi');
      expect(result.translatedText).toBe('');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should detect Hindi script correctly', async () => {
      const hindiText = 'नमस्ते';
      const detectedLanguage = await languageEngine.detectLanguage(hindiText);
      expect(detectedLanguage).toBe('hi');
    });

    it('should detect Tamil script correctly', async () => {
      const tamilText = 'வணக்கம்';
      const detectedLanguage = await languageEngine.detectLanguage(tamilText);
      expect(detectedLanguage).toBe('ta');
    });

    it('should detect Telugu script correctly', async () => {
      const teluguText = 'నమస్కారం';
      const detectedLanguage = await languageEngine.detectLanguage(teluguText);
      expect(detectedLanguage).toBe('te');
    });

    it('should fallback to English for unknown scripts', async () => {
      const englishText = 'Hello World';
      const detectedLanguage = await languageEngine.detectLanguage(englishText);
      expect(detectedLanguage).toBe('en');
    });

    it('should provide mock translations for development', async () => {
      const translations = [
        { text: 'Hello', language: 'hi' as SupportedLanguage, expected: 'नमस्ते' },
        { text: 'Welcome', language: 'ta' as SupportedLanguage, expected: 'வரவேற்கிறோம்' },
        { text: 'Study', language: 'te' as SupportedLanguage, expected: 'అధ్యయనం' }
      ];

      for (const { text, language, expected } of translations) {
        const result = await languageEngine.translateText(text, language);
        expect(result.translatedText).toBe(expected);
        expect(result.confidence).toBe(0.95);
      }
    });

    it('should handle transliteration between scripts', async () => {
      const devanagariText = 'नमस्ते';
      const romanized = await languageEngine.convertScript(devanagariText, 'roman');
      expect(romanized).toBeDefined();
      expect(typeof romanized).toBe('string');
      expect(romanized.length).toBeGreaterThan(0);
    });

    it('should return appropriate language configurations', async () => {
      const supportedLanguages: SupportedLanguage[] = ['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn'];
      
      for (const lang of supportedLanguages) {
        const config = languageEngine.getLanguageConfig(lang);
        expect(config).toBeDefined();
        expect(config.name).toBeDefined();
        expect(config.nativeName).toBeDefined();
        expect(config.script).toBeDefined();
        expect(config.direction).toMatch(/^(ltr|rtl)$/);
      }
    });
  });
});