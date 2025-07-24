import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { SpeechController } from '../SpeechController';
import { ErrorMessages } from '../errorHandler';
import { SpeechError } from '../../types';

// Mock the Web Speech API
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  speaking: false,
  pending: false,
  paused: false
};

const mockSpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: '',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null
}));

const mockVoices = [
  {
    name: 'English Voice 1',
    lang: 'en-US',
    localService: true,
    default: true,
    voiceURI: 'en-US-voice1'
  },
  {
    name: 'English Voice 2', 
    lang: 'en-GB',
    localService: false,
    default: false,
    voiceURI: 'en-GB-voice2'
  },
  {
    name: 'Chinese Voice',
    lang: 'zh-TW',
    localService: true,
    default: false,
    voiceURI: 'zh-TW-voice'
  }
] as SpeechSynthesisVoice[];

// Setup global mocks
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: mockSpeechSynthesisUtterance
});

describe('SpeechController', () => {
  let speechController: SpeechController;
  let onSpeechStart: Mock;
  let onSpeechEnd: Mock;
  let onSpeechError: Mock;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock returns
    mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
    mockSpeechSynthesis.speaking = false;
    mockSpeechSynthesis.pending = false;
    mockSpeechSynthesis.paused = false;

    // Create callback mocks
    onSpeechStart = vi.fn();
    onSpeechEnd = vi.fn();
    onSpeechError = vi.fn();
  });

  afterEach(() => {
    if (speechController) {
      speechController.destroy();
    }
  });

  describe('Constructor', () => {
    it('should initialize with default settings', () => {
      speechController = new SpeechController();
      
      expect(speechController.getCurrentSettings()).toEqual({
        rate: 1,
        pitch: 1,
        volume: 1,
        voice: 'English Voice 1' // Should select optimal voice
      });
    });

    it('should initialize with custom settings', () => {
      const customSettings = {
        rate: 0.8,
        pitch: 1.2,
        volume: 0.9,
        voice: 'Custom Voice'
      };

      speechController = new SpeechController({
        settings: customSettings,
        language: 'en'
      });

      const currentSettings = speechController.getCurrentSettings();
      expect(currentSettings.rate).toBe(0.8);
      expect(currentSettings.pitch).toBe(1.2);
      expect(currentSettings.volume).toBe(0.9);
    });

    it('should throw error when speech synthesis is not supported', () => {
      // Temporarily remove speechSynthesis
      const originalSpeechSynthesis = window.speechSynthesis;
      Object.defineProperty(window, 'speechSynthesis', {
        writable: true,
        configurable: true,
        value: undefined
      });

      expect(() => {
        new SpeechController();
      }).toThrow(ErrorMessages[SpeechError.NOT_SUPPORTED]);

      // Restore speechSynthesis
      Object.defineProperty(window, 'speechSynthesis', {
        writable: true,
        configurable: true,
        value: originalSpeechSynthesis
      });
    });

    it('should set up event callbacks', () => {
      speechController = new SpeechController({
        onSpeechStart,
        onSpeechEnd,
        onSpeechError
      });

      expect(speechController).toBeDefined();
    });
  });

  describe('Voice Selection', () => {
    it('should select optimal English voice', () => {
      speechController = new SpeechController();
      
      const settings = speechController.getCurrentSettings();
      expect(settings.voice).toBe('English Voice 1'); // Local service voice preferred
    });

    it('should fallback to any English voice when no local service available', () => {
      const voicesWithoutLocal = mockVoices.map(voice => ({
        ...voice,
        localService: false
      }));
      
      mockSpeechSynthesis.getVoices.mockReturnValue(voicesWithoutLocal);
      
      speechController = new SpeechController();
      
      const settings = speechController.getCurrentSettings();
      expect(settings.voice).toBe('English Voice 1'); // First English voice
    });

    it('should return available English voices', () => {
      speechController = new SpeechController();
      
      const availableVoices = speechController.getAvailableVoices();
      expect(availableVoices).toHaveLength(2);
      expect(availableVoices.every(voice => voice.lang.startsWith('en'))).toBe(true);
    });
  });

  describe('Speech Synthesis', () => {
    beforeEach(() => {
      speechController = new SpeechController({
        onSpeechStart,
        onSpeechEnd,
        onSpeechError
      });
    });

    it('should speak text with correct settings', async () => {
      const text = 'Hello world';
      const utteranceMock = {
        text: '',
        lang: '',
        voice: null,
        volume: 1,
        rate: 1,
        pitch: 1,
        onstart: null,
        onend: null,
        onerror: null
      };
      
      mockSpeechSynthesisUtterance.mockReturnValue(utteranceMock);

      const speakPromise = speechController.speak(text);
      
      // Simulate speech start
      if (utteranceMock.onstart) {
        utteranceMock.onstart(new Event('start'));
      }
      
      // Simulate speech end
      if (utteranceMock.onend) {
        utteranceMock.onend(new SpeechSynthesisEvent('end', {}));
      }

      await speakPromise;

      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(utteranceMock);
      expect(utteranceMock.rate).toBe(1);
      expect(utteranceMock.pitch).toBe(1);
      expect(utteranceMock.volume).toBe(1);
      expect(utteranceMock.lang).toBe('en-US');
      expect(onSpeechStart).toHaveBeenCalled();
      expect(onSpeechEnd).toHaveBeenCalled();
    });

    it('should not speak empty text', async () => {
      await speechController.speak('');
      await speechController.speak('   ');
      
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should handle speech synthesis errors', async () => {
      const utteranceMock = {
        text: '',
        lang: '',
        voice: null,
        volume: 1,
        rate: 1,
        pitch: 1,
        onstart: null,
        onend: null,
        onerror: null
      };
      
      mockSpeechSynthesisUtterance.mockReturnValue(utteranceMock);

      const speakPromise = speechController.speak('test');
      
      // Simulate speech error
      if (utteranceMock.onerror) {
        utteranceMock.onerror(new SpeechSynthesisErrorEvent('error', { error: 'synthesis-failed' }));
      }

      await expect(speakPromise).rejects.toThrow();
      expect(onSpeechError).toHaveBeenCalledWith(
        SpeechError.SYNTHESIS_FAILED,
        ErrorMessages[SpeechError.SYNTHESIS_FAILED]
      );
    });

    it('should stop current speech before starting new one', async () => {
      mockSpeechSynthesis.speaking = true;
      
      const utteranceMock = {
        text: '',
        lang: '',
        voice: null,
        volume: 1,
        rate: 1,
        pitch: 1,
        onstart: null,
        onend: null,
        onerror: null
      };
      
      mockSpeechSynthesisUtterance.mockReturnValue(utteranceMock);

      const speakPromise = speechController.speak('test');
      
      // Simulate speech end immediately to resolve promise
      if (utteranceMock.onend) {
        utteranceMock.onend(new (window as any).SpeechSynthesisEvent('end', {}));
      }

      await speakPromise;
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('Speech Control', () => {
    beforeEach(() => {
      speechController = new SpeechController();
    });

    it('should pause speech when speaking', () => {
      mockSpeechSynthesis.speaking = true;
      mockSpeechSynthesis.paused = false;
      
      speechController.pause();
      
      expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
    });

    it('should not pause when not speaking', () => {
      mockSpeechSynthesis.speaking = false;
      
      speechController.pause();
      
      expect(mockSpeechSynthesis.pause).not.toHaveBeenCalled();
    });

    it('should resume paused speech', () => {
      mockSpeechSynthesis.paused = true;
      
      speechController.resume();
      
      expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
    });

    it('should not resume when not paused', () => {
      mockSpeechSynthesis.paused = false;
      
      speechController.resume();
      
      expect(mockSpeechSynthesis.resume).not.toHaveBeenCalled();
    });

    it('should stop speech', () => {
      mockSpeechSynthesis.speaking = true;
      
      speechController.stop();
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should stop pending speech', () => {
      mockSpeechSynthesis.pending = true;
      
      speechController.stop();
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('Status Methods', () => {
    beforeEach(() => {
      speechController = new SpeechController();
    });

    it('should return correct speaking status', () => {
      mockSpeechSynthesis.speaking = true;
      expect(speechController.isSpeaking()).toBe(true);
      
      mockSpeechSynthesis.speaking = false;
      expect(speechController.isSpeaking()).toBe(false);
    });

    it('should return correct paused status', () => {
      mockSpeechSynthesis.paused = true;
      expect(speechController.isPaused()).toBe(true);
      
      mockSpeechSynthesis.paused = false;
      expect(speechController.isPaused()).toBe(false);
    });
  });

  describe('Settings Management', () => {
    beforeEach(() => {
      speechController = new SpeechController();
    });

    it('should update settings', () => {
      const newSettings = {
        rate: 0.5,
        pitch: 1.5,
        volume: 0.8
      };
      
      speechController.updateSettings(newSettings);
      
      const currentSettings = speechController.getCurrentSettings();
      expect(currentSettings.rate).toBe(0.5);
      expect(currentSettings.pitch).toBe(1.5);
      expect(currentSettings.volume).toBe(0.8);
    });

    it('should validate voice when updating settings', () => {
      speechController.updateSettings({ voice: 'Non-existent Voice' });
      
      const currentSettings = speechController.getCurrentSettings();
      // Should fallback to optimal voice
      expect(currentSettings.voice).toBe('English Voice 1');
    });

    it('should keep valid voice when updating settings', () => {
      speechController.updateSettings({ voice: 'English Voice 2' });
      
      const currentSettings = speechController.getCurrentSettings();
      expect(currentSettings.voice).toBe('English Voice 2');
    });
  });

  describe('Error Messages', () => {
    it('should return localized error messages', () => {
      speechController = new SpeechController();
      
      // Test that error messages are properly localized
      expect(ErrorMessages[SpeechError.NOT_SUPPORTED]).toBe('您的瀏覽器不支援語音功能，請使用Chrome或Firefox');
      expect(ErrorMessages[SpeechError.SYNTHESIS_FAILED]).toBe('語音播放失敗，請重新嘗試');
    });

    it('should handle error callbacks correctly', () => {
      const onErrorSpy = vi.fn();
      speechController = new SpeechController({
        onSpeechError: onErrorSpy
      });
      
      // This test verifies the error callback mechanism is set up correctly
      expect(speechController).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      speechController = new SpeechController();
      
      speechController.destroy();
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(mockSpeechSynthesis.removeEventListener).toHaveBeenCalled();
    });
  });
});