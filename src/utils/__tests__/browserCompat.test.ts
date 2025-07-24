import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isSpeechSynthesisSupported,
  isServiceWorkerSupported,
  isLocalStorageSupported,
  isTouchDevice,
  isMobileDevice,
  isIOSDevice,
  isAndroidDevice,
  getBrowserInfo,
  checkCriticalFeatures,
  initializePolyfills
} from '../browserCompat';

// Mock global objects
const mockWindow = {
  speechSynthesis: {},
  SpeechSynthesisUtterance: class {},
  navigator: {
    serviceWorker: {},
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    maxTouchPoints: 0
  },
  localStorage: {
    setItem: vi.fn(),
    removeItem: vi.fn(),
    getItem: vi.fn()
  },
  CSS: {
    supports: vi.fn()
  },
  requestAnimationFrame: vi.fn(),
  cancelAnimationFrame: vi.fn()
};

describe('Browser Compatibility Utils', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Set up global mocks
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    });
    
    Object.defineProperty(global, 'navigator', {
      value: mockWindow.navigator,
      writable: true
    });
    
    Object.defineProperty(global, 'localStorage', {
      value: mockWindow.localStorage,
      writable: true
    });
  });

  describe('Feature Detection', () => {
    it('should detect speech synthesis support', () => {
      expect(isSpeechSynthesisSupported()).toBe(true);
      
      // Test when not supported
      delete (global as any).window.speechSynthesis;
      expect(isSpeechSynthesisSupported()).toBe(false);
    });

    it('should detect service worker support', () => {
      expect(isServiceWorkerSupported()).toBe(true);
      
      // Test when not supported
      delete mockWindow.navigator.serviceWorker;
      expect(isServiceWorkerSupported()).toBe(false);
    });

    it('should detect localStorage support', () => {
      expect(isLocalStorageSupported()).toBe(true);
      
      // Test when localStorage throws error
      mockWindow.localStorage.setItem = vi.fn(() => {
        throw new Error('Storage not available');
      });
      expect(isLocalStorageSupported()).toBe(false);
    });

    it('should detect touch device', () => {
      expect(isTouchDevice()).toBe(false);
      
      // Test with touch support
      mockWindow.navigator.maxTouchPoints = 1;
      expect(isTouchDevice()).toBe(true);
    });
  });

  describe('Device Detection', () => {
    it('should detect mobile devices', () => {
      expect(isMobileDevice()).toBe(false);
      
      // Test with mobile user agent
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isMobileDevice()).toBe(true);
    });

    it('should detect iOS devices', () => {
      // Reset to non-iOS user agent
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      expect(isIOSDevice()).toBe(false);
      
      // Test with iOS user agent
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isIOSDevice()).toBe(true);
    });

    it('should detect Android devices', () => {
      expect(isAndroidDevice()).toBe(false);
      
      // Test with Android user agent
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F)';
      expect(isAndroidDevice()).toBe(true);
    });
  });

  describe('Browser Information', () => {
    it('should detect Chrome browser', () => {
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      
      const browserInfo = getBrowserInfo();
      expect(browserInfo.name).toBe('Chrome');
      expect(browserInfo.version).toBe('91');
      expect(browserInfo.isSupported).toBe(true);
    });

    it('should detect Firefox browser', () => {
      mockWindow.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      
      const browserInfo = getBrowserInfo();
      expect(browserInfo.name).toBe('Firefox');
      expect(browserInfo.version).toBe('89');
      expect(browserInfo.isSupported).toBe(true);
    });

    it('should detect unsupported browsers', () => {
      mockWindow.navigator.userAgent = 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)';
      
      const browserInfo = getBrowserInfo();
      expect(browserInfo.name).toBe('Internet Explorer');
      expect(browserInfo.isSupported).toBe(false);
    });
  });

  describe('Critical Features Check', () => {
    it('should return feature support status', () => {
      const features = checkCriticalFeatures();
      
      expect(features).toHaveProperty('speechSynthesis');
      expect(features).toHaveProperty('localStorage');
      expect(features).toHaveProperty('serviceWorker');
      expect(features).toHaveProperty('warnings');
      expect(Array.isArray(features.warnings)).toBe(true);
    });

    it('should generate warnings for unsupported features', () => {
      // Remove speech synthesis support
      delete (global as any).window.speechSynthesis;
      
      const features = checkCriticalFeatures();
      expect(features.speechSynthesis).toBe(false);
      expect(features.warnings.length).toBeGreaterThan(0);
      expect(features.warnings[0]).toContain('語音合成功能');
    });
  });

  describe('Polyfills', () => {
    it('should initialize polyfills without errors', () => {
      expect(() => initializePolyfills()).not.toThrow();
    });

    it('should add requestAnimationFrame polyfill if missing', () => {
      delete (global as any).window.requestAnimationFrame;
      
      initializePolyfills();
      
      expect(typeof (global as any).window.requestAnimationFrame).toBe('function');
    });

    it('should add CSS.supports polyfill if missing', () => {
      delete (global as any).window.CSS;
      
      initializePolyfills();
      
      expect(typeof (global as any).window.CSS.supports).toBe('function');
    });
  });
});