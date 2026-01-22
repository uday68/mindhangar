import { vi } from 'vitest';

// Mock Web APIs that might not be available in test environment
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
});

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn(() => ({
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    onresult: null,
    onerror: null,
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }))
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: window.SpeechRecognition
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  },
  writable: true
});

// Mock IndexedDB for offline storage
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
    databases: vi.fn()
  },
  writable: true
});

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US'
});

// Mock navigator.languages
Object.defineProperty(navigator, 'languages', {
  writable: true,
  value: ['en-US', 'en']
});

// Mock Intl APIs
global.Intl = {
  ...Intl,
  NumberFormat: vi.fn(() => ({
    format: vi.fn((num) => num.toString())
  })) as any,
  DateTimeFormat: vi.fn(() => ({
    format: vi.fn((date) => date.toString())
  })) as any
};