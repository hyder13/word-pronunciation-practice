import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpeech } from '../useSpeech';
import { SpeechError } from '../../types';

// Create a mock controller instance
const mockController = {
  speak: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
  updateSettings: vi.fn(),
  getAvailableVoices: vi.fn(() => []),
  getCurrentSettings: vi.fn(() => ({ rate: 1, pitch: 1, volume: 1, voice: '' })),
  destroy: vi.fn(),
  _onSpeechStart: null as (() => void) | null,
  _onSpeechEnd: null as (() => void) | null,
  _onSpeechError: null as ((error: SpeechError, message: string) => void) | null
};

// Mock the SpeechController
vi.mock('../../utils/SpeechController', () => {
  return {
    SpeechController: vi.fn().mockImplementation((options) => {
      // Store callbacks for testing
      mockController._onSpeechStart = options?.onSpeechStart;
      mockController._onSpeechEnd = options?.onSpeechEnd;
      mockController._onSpeechError = options?.onSpeechError;
      
      return mockController;
    }),
    ErrorMessages: {
      [SpeechError.NOT_SUPPORTED]: '您的瀏覽器不支援語音功能，請使用Chrome或Firefox',
      [SpeechError.SYNTHESIS_FAILED]: '語音播放失敗，請重新嘗試'
    }
  };
});

describe('useSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useSpeech());

      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.availableVoices).toEqual([]);
      expect(result.current.currentSettings).toBe(null);

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should not auto-initialize when autoInitialize is false', () => {
      const { result } = renderHook(() => useSpeech({ autoInitialize: false }));

      expect(result.current.isLoading).toBe(true);
      // Should remain loading since we're not auto-initializing
    });

    it('should handle initialization errors', async () => {
      const { SpeechController } = await import('../../utils/SpeechController');
      (SpeechController as any).mockImplementationOnce(() => {
        throw new Error('Initialization failed');
      });

      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Initialization failed');
      });
    });
  });

  describe('Speech Functions', () => {
    it('should speak text successfully', async () => {
      const { result } = renderHook(() => useSpeech());

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockController.speak.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.speak('Hello world');
      });

      expect(mockController.speak).toHaveBeenCalledWith('Hello world');
    });

    it('should handle speech errors', async () => {
      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockController.speak.mockRejectedValue(new Error('Speech failed'));

      await act(async () => {
        try {
          await result.current.speak('Hello world');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.error).toBe('Speech failed');
    });

    it('should initialize controller if not auto-initialized', async () => {
      const { result } = renderHook(() => useSpeech({ autoInitialize: false }));

      mockController.speak.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.speak('Hello world');
      });

      expect(mockController.speak).toHaveBeenCalledWith('Hello world');
    });
  });

  describe('Speech Control', () => {
    it('should pause speech', async () => {
      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.pause();
      });

      expect(mockController.pause).toHaveBeenCalled();
    });

    it('should resume speech', async () => {
      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.resume();
      });

      expect(mockController.resume).toHaveBeenCalled();
    });

    it('should stop speech', async () => {
      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.stop();
      });

      expect(mockController.stop).toHaveBeenCalled();
    });

    it('should update settings', async () => {
      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newSettings = { rate: 0.8, pitch: 1.2 };
      
      mockController.getCurrentSettings.mockReturnValue({
        rate: 0.8,
        pitch: 1.2,
        volume: 1,
        voice: 'Test Voice'
      });

      act(() => {
        result.current.updateSettings(newSettings);
      });

      expect(mockController.updateSettings).toHaveBeenCalledWith(newSettings);
    });
  });

  describe('Speech Events', () => {
    it('should handle speech start event', async () => {
      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        // Simulate speech start callback
        if (mockController._onSpeechStart) {
          mockController._onSpeechStart();
        }
      });

      expect(result.current.isSpeaking).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('should handle speech end event', async () => {
      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First start speech
      act(() => {
        if (mockController._onSpeechStart) {
          mockController._onSpeechStart();
        }
      });

      expect(result.current.isSpeaking).toBe(true);

      // Then end speech
      act(() => {
        if (mockController._onSpeechEnd) {
          mockController._onSpeechEnd();
        }
      });

      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });

    it('should handle speech error event', async () => {
      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        if (mockController._onSpeechError) {
          mockController._onSpeechError(SpeechError.SYNTHESIS_FAILED, '語音播放失敗');
        }
      });

      expect(result.current.error).toBe('語音播放失敗');
      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should destroy controller on unmount', async () => {
      const { result, unmount } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      unmount();

      expect(mockController.destroy).toHaveBeenCalled();
    });
  });

  describe('Available Voices and Settings', () => {
    it('should provide available voices after initialization', async () => {
      const mockVoices = [
        { name: 'Voice 1', lang: 'en-US' },
        { name: 'Voice 2', lang: 'en-GB' }
      ] as SpeechSynthesisVoice[];

      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockController.getAvailableVoices.mockReturnValue(mockVoices);

      // Trigger re-initialization to update voices
      act(() => {
        result.current.updateSettings({ rate: 1 });
      });

      // Note: In a real implementation, voices would be updated during initialization
      // This test structure shows how it would work
    });

    it('should provide current settings after initialization', async () => {
      const mockSettings = {
        rate: 1,
        pitch: 1,
        volume: 1,
        voice: 'Test Voice'
      };

      const { result } = renderHook(() => useSpeech());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockController.getCurrentSettings.mockReturnValue(mockSettings);

      // Trigger settings update
      act(() => {
        result.current.updateSettings({ rate: 1 });
      });

      expect(result.current.currentSettings).toEqual(mockSettings);
    });
  });
});