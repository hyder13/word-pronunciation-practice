import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpeech } from '../useSpeech';

// Mock the SpeechController module
vi.mock('../../utils/SpeechController', () => {
  return {
    SpeechController: vi.fn().mockImplementation(() => ({
      speak: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      updateSettings: vi.fn(),
      getAvailableVoices: vi.fn(() => []),
      getCurrentSettings: vi.fn(() => ({ rate: 1, pitch: 1, volume: 1, voice: '' })),
      destroy: vi.fn()
    })),
    ErrorMessages: {
      'zh-TW': {
        'SPEECH_NOT_SUPPORTED': '您的瀏覽器不支援語音功能',
        'SYNTHESIS_FAILED': '語音播放失敗'
      }
    }
  };
});

describe('useSpeech - Basic Tests', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSpeech({ autoInitialize: false }));

    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(Array.isArray(result.current.availableVoices)).toBe(true);
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => useSpeech({ autoInitialize: false }));

    expect(typeof result.current.speak).toBe('function');
    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.resume).toBe('function');
    expect(typeof result.current.stop).toBe('function');
    expect(typeof result.current.updateSettings).toBe('function');
  });

  it('should have correct return type structure', () => {
    const { result } = renderHook(() => useSpeech({ autoInitialize: false }));

    expect(result.current).toHaveProperty('speak');
    expect(result.current).toHaveProperty('pause');
    expect(result.current).toHaveProperty('resume');
    expect(result.current).toHaveProperty('stop');
    expect(result.current).toHaveProperty('isSpeaking');
    expect(result.current).toHaveProperty('isPaused');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('updateSettings');
    expect(result.current).toHaveProperty('availableVoices');
    expect(result.current).toHaveProperty('currentSettings');
  });
});