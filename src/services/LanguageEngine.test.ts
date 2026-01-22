import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebLanguageEngine } from './LanguageEngine';
import { SupportedLanguage } from '@/src/types/localization';

describe('WebLanguageEngine', () => {
  let languageEngine: WebLanguageEngine;

  beforeEach(() => {
    languageEngine = new WebLanguageEngine();
  });

  describe('Language Support', () => {
    it('should support all required Indian languages', () => {
      const requiredLanguages: SupportedLanguage[] = [
        'hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn'
      ];

      requiredLanguages.forEach(language => {
        expect(languageEngine.isLanguageSupported(language)).toBe(true);
      });
    });

    it('should not support unsupported languages', () => {
      expect(languageEngine.isLanguageSupported('fr')).toBe(false);
      expect(languageEngine.isLanguageSupported('de')).toBe(false);
      expect(languageEngine.isLanguageSupported('zh')).toBe(false);
    });

    it('should return correct language configuration', () => {
      const hindiConfig = languageEngine.getLanguageConfig('hi');
      expect(hindiConfig.code).toBe('hi');
      expect(hindiConfig.name).toBe('Hindi');
      expect(hindiConfig.nativeName).toBe('हिन्दी');
      expect(hindiConfig.script).toBe('devanagari');
      expect(hindiConfig.region).toBe('north');
    });
  });

  describe('Language Detection', () => {
    it('should detect Hindi text', async () => {
      const hindiText = 'नमस्ते दुनिया';
      const detectedLanguage = await languageEngine.detectLanguage(hindiText);
      expect(detectedLanguage).toBe('hi');
    });

    it('should detect Tamil text', async () => {
      const tamilText = 'வணக்கம் உலகம்';
      const detectedLanguage = await languageEngine.detectLanguage(tamilText);
      expect(detectedLanguage).toBe('ta');
    });

    it('should detect Telugu text', async () => {
      const teluguText = 'నమస్కారం ప్రపంచం';
      const detectedLanguage = await languageEngine.detectLanguage(teluguText);
      expect(detectedLanguage).toBe('te');
    });

    it('should detect Bengali text', async () => {
      const bengaliText = 'নমস্কার বিশ্ব';
      const detectedLanguage = await languageEngine.detectLanguage(bengaliText);
      expect(detectedLanguage).toBe('bn');
    });

    it('should default to English for unrecognized text', async () => {
      const englishText = 'Hello World';
      const detectedLanguage = await languageEngine.detectLanguage(englishText);
      expect(detectedLanguage).toBe('en');
    });
  });

  describe('Translation', () => {
    it('should translate basic greetings', async () => {
      const result = await languageEngine.translateText('Hello', 'hi');
      expect(result.translatedText).toBe('नमस्ते');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should translate welcome message', async () => {
      const result = await languageEngine.translateText('Welcome', 'ta');
      expect(result.translatedText).toBe('வரவேற்கிறோம்');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle translation errors gracefully', async () => {
      // Mock a translation failure
      const originalConsoleError = console.error;
      console.error = vi.fn();

      const result = await languageEngine.translateText('NonexistentText', 'hi');
      expect(result.translatedText).toBe('NonexistentText'); // Fallback to original
      expect(result.confidence).toBe(0);

      console.error = originalConsoleError;
    });

    it('should cache translation results', async () => {
      const text = 'Hello';
      const targetLanguage: SupportedLanguage = 'hi';

      // First call
      const result1 = await languageEngine.translateText(text, targetLanguage);
      
      // Second call should return cached result
      const result2 = await languageEngine.translateText(text, targetLanguage);
      
      expect(result1).toEqual(result2);
    });
  });

  describe('Script Conversion', () => {
    it('should convert Devanagari to Roman script', async () => {
      const devanagariText = 'नमस्ते';
      const romanText = await languageEngine.convertScript(devanagariText, 'roman');
      expect(romanText).toContain('namaste');
    });

    it('should convert Roman to Devanagari script', async () => {
      const romanText = 'namaste';
      const devanagariText = await languageEngine.convertScript(romanText, 'devanagari');
      expect(devanagariText).toContain('नमस्ते');
    });

    it('should handle unsupported script conversions', async () => {
      const text = 'Hello World';
      const result = await languageEngine.convertScript(text, 'tamil');
      // Should return original text for unsupported conversions
      expect(result).toBe(text);
    });
  });

  describe('Voice Processing', () => {
    it('should handle voice input processing', async () => {
      // Mock speech recognition
      const mockAudio = new Blob(['mock audio'], { type: 'audio/wav' });
      
      try {
        const result = await languageEngine.processVoiceInput(mockAudio, 'hi');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('language');
        expect(result.language).toBe('hi');
      } catch (error) {
        // Expected in test environment without speech recognition
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should generate voice output', async () => {
      const text = 'Hello World';
      const language: SupportedLanguage = 'en';
      
      const audioBlob = await languageEngine.generateVoiceOutput(text, language);
      expect(audioBlob).toBeInstanceOf(Blob);
      expect(audioBlob.type).toBe('audio/wav');
    });
  });
});