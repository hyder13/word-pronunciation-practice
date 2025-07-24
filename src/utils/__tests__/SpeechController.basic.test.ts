import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeechController } from '../SpeechController';
import { ErrorMessages } from '../errorHandler';
import { SpeechError } from '../../types';

// Simple test to verify the core functionality works
describe('SpeechController - Basic Tests', () => {
  beforeEach(() => {
    // Ensure we have a clean mock setup
    vi.clearAllMocks();
  });

  it('should export ErrorMessages correctly', () => {
    expect(ErrorMessages).toBeDefined();
    expect(ErrorMessages[SpeechError.NOT_SUPPORTED]).toBe('您的瀏覽器不支援語音功能，請使用Chrome或Firefox');
    expect(ErrorMessages[SpeechError.SYNTHESIS_FAILED]).toBe('語音播放失敗，請重新嘗試');
  });

  it('should create SpeechController with valid speechSynthesis', () => {
    // This test will pass if speechSynthesis is available (mocked in setup)
    expect(() => {
      const controller = new SpeechController();
      expect(controller).toBeDefined();
      expect(controller.getCurrentSettings()).toBeDefined();
      controller.destroy();
    }).not.toThrow();
  });

  it('should have correct default settings structure', () => {
    const controller = new SpeechController();
    const settings = controller.getCurrentSettings();
    
    expect(settings).toHaveProperty('rate');
    expect(settings).toHaveProperty('pitch');
    expect(settings).toHaveProperty('volume');
    expect(settings).toHaveProperty('voice');
    expect(typeof settings.rate).toBe('number');
    expect(typeof settings.pitch).toBe('number');
    expect(typeof settings.volume).toBe('number');
    expect(typeof settings.voice).toBe('string');
    
    controller.destroy();
  });

  it('should update settings correctly', () => {
    const controller = new SpeechController();
    const newSettings = { rate: 0.8, pitch: 1.2 };
    
    controller.updateSettings(newSettings);
    const updatedSettings = controller.getCurrentSettings();
    
    expect(updatedSettings.rate).toBe(0.8);
    expect(updatedSettings.pitch).toBe(1.2);
    
    controller.destroy();
  });

  it('should provide available voices method', () => {
    const controller = new SpeechController();
    
    expect(typeof controller.getAvailableVoices).toBe('function');
    const voices = controller.getAvailableVoices();
    expect(Array.isArray(voices)).toBe(true);
    
    controller.destroy();
  });

  it('should provide speech control methods', () => {
    const controller = new SpeechController();
    
    expect(typeof controller.speak).toBe('function');
    expect(typeof controller.pause).toBe('function');
    expect(typeof controller.resume).toBe('function');
    expect(typeof controller.stop).toBe('function');
    expect(typeof controller.isSpeaking).toBe('function');
    expect(typeof controller.isPaused).toBe('function');
    
    controller.destroy();
  });
});