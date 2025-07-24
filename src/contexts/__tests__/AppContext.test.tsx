import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AppProvider, useAppContext, useCurrentMode, useWordLists, useActiveWordList } from '../AppContext';
import { WordList, SpeechSettings, UISettings } from '../../types';
import { LocalStorageManager } from '../../utils/LocalStorageManager';

// Mock LocalStorageManager
vi.mock('../../utils/LocalStorageManager', () => ({
  LocalStorageManager: {
    saveWordLists: vi.fn(() => true),
    loadWordLists: vi.fn(() => []),
    saveSpeechSettings: vi.fn(() => true),
    loadSpeechSettings: vi.fn(() => null),
    saveUISettings: vi.fn(() => true),
    loadUISettings: vi.fn(() => null),
    saveActiveWordListId: vi.fn(() => true),
    loadActiveWordListId: vi.fn(() => null)
  }
}));

const mockLocalStorageManager = LocalStorageManager as any;

// Test wrapper component
function TestWrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAppContext', () => {
    it('should throw error when used outside AppProvider', () => {
      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext必須在AppProvider內部使用');
    });

    it('should provide context when used inside AppProvider', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      expect(result.current).toBeDefined();
      expect(result.current.state).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.setMode).toBe('function');
      expect(typeof result.current.setWordList).toBe('function');
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      const { state } = result.current;
      
      expect(state.currentMode).toBe('menu');
      expect(state.wordLists).toEqual([]);
      expect(state.activeWordList).toBeNull();
      expect(state.reviewState.phase).toBe('setup');
      expect(state.examState.phase).toBe('testing');
      expect(state.speechSettings).toEqual({
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        voice: ''
      });
      expect(state.uiSettings).toEqual({
        fontSize: 'medium',
        theme: 'light',
        animationsEnabled: true
      });
    });
  });

  describe('State Management Actions', () => {
    it('should set mode correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.setMode('review');
      });

      expect(result.current.state.currentMode).toBe('review');
    });

    it('should set word list correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      const mockWordList: WordList = {
        id: 'list1',
        name: 'Test List',
        words: [
          {
            id: 'word1',
            english: 'Hello',
            chinese: '你好',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        lastUsed: new Date()
      };

      act(() => {
        result.current.setWordList(mockWordList);
      });

      expect(result.current.state.wordLists).toHaveLength(1);
      expect(result.current.state.activeWordList).toEqual(expect.objectContaining({
        id: 'list1',
        name: 'Test List'
      }));
    });

    it('should update existing word list', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      const originalWordList: WordList = {
        id: 'list1',
        name: 'Original List',
        words: [],
        createdAt: new Date(),
        lastUsed: new Date()
      };

      const updatedWordList: WordList = {
        id: 'list1',
        name: 'Updated List',
        words: [
          {
            id: 'word1',
            english: 'Hello',
            chinese: '你好',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        lastUsed: new Date()
      };

      act(() => {
        result.current.setWordList(originalWordList);
      });

      act(() => {
        result.current.setWordList(updatedWordList);
      });

      expect(result.current.state.wordLists).toHaveLength(1);
      expect(result.current.state.wordLists[0].name).toBe('Updated List');
      expect(result.current.state.wordLists[0].words).toHaveLength(1);
    });

    it('should update review state correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.updateReviewState({
          phase: 'practicing',
          currentIndex: 2,
          isPlaying: true
        });
      });

      expect(result.current.state.reviewState.phase).toBe('practicing');
      expect(result.current.state.reviewState.currentIndex).toBe(2);
      expect(result.current.state.reviewState.isPlaying).toBe(true);
    });

    it('should update exam state correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.updateExamState({
          showAnswer: true,
          currentIndex: 1
        });
      });

      expect(result.current.state.examState.showAnswer).toBe(true);
      expect(result.current.state.examState.currentIndex).toBe(1);
    });

    it('should update speech settings correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      const newSpeechSettings: Partial<SpeechSettings> = {
        rate: 1.5,
        pitch: 1.2
      };

      act(() => {
        result.current.updateSpeechSettings(newSpeechSettings);
      });

      expect(result.current.state.speechSettings.rate).toBe(1.5);
      expect(result.current.state.speechSettings.pitch).toBe(1.2);
      expect(result.current.state.speechSettings.volume).toBe(1.0); // Should remain unchanged
    });

    it('should update UI settings correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      const newUISettings: Partial<UISettings> = {
        fontSize: 'large',
        theme: 'dark'
      };

      act(() => {
        result.current.updateUISettings(newUISettings);
      });

      expect(result.current.state.uiSettings.fontSize).toBe('large');
      expect(result.current.state.uiSettings.theme).toBe('dark');
      expect(result.current.state.uiSettings.animationsEnabled).toBe(true); // Should remain unchanged
    });

    it('should reset state correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      // First, modify the state
      act(() => {
        result.current.setMode('review');
        result.current.updateSpeechSettings({ rate: 2.0 });
        result.current.updateUISettings({ fontSize: 'large' });
      });

      // Then reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.state.currentMode).toBe('menu');
      expect(result.current.state.wordLists).toEqual([]);
      expect(result.current.state.activeWordList).toBeNull();
      // Settings should be preserved
      expect(result.current.state.speechSettings.rate).toBe(2.0);
      expect(result.current.state.uiSettings.fontSize).toBe('large');
    });
  });

  describe('LocalStorage Integration', () => {
    it('should load data from storage on initialization', () => {
      const mockWordLists: WordList[] = [
        {
          id: 'list1',
          name: 'Loaded List',
          words: [],
          createdAt: new Date(),
          lastUsed: new Date()
        }
      ];

      const mockSpeechSettings: SpeechSettings = {
        rate: 1.5,
        pitch: 1.2,
        volume: 0.8,
        voice: 'en-US'
      };

      mockLocalStorageManager.loadWordLists.mockReturnValue(mockWordLists);
      mockLocalStorageManager.loadSpeechSettings.mockReturnValue(mockSpeechSettings);
      mockLocalStorageManager.loadActiveWordListId.mockReturnValue('list1');

      renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      expect(mockLocalStorageManager.loadWordLists).toHaveBeenCalled();
      expect(mockLocalStorageManager.loadSpeechSettings).toHaveBeenCalled();
      expect(mockLocalStorageManager.loadUISettings).toHaveBeenCalled();
      expect(mockLocalStorageManager.loadActiveWordListId).toHaveBeenCalled();
    });

    it('should save data to storage when state changes', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: TestWrapper
      });

      const mockWordList: WordList = {
        id: 'list1',
        name: 'Test List',
        words: [],
        createdAt: new Date(),
        lastUsed: new Date()
      };

      act(() => {
        result.current.setWordList(mockWordList);
      });

      // Wait for the effect to run
      expect(mockLocalStorageManager.saveWordLists).toHaveBeenCalled();
      expect(mockLocalStorageManager.saveActiveWordListId).toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', () => {
      mockLocalStorageManager.loadWordLists.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw error
      expect(() => {
        renderHook(() => useAppContext(), {
          wrapper: TestWrapper
        });
      }).not.toThrow();
    });
  });

  describe('Selector Hooks', () => {
    it('should return current mode with useCurrentMode', () => {
      const { result } = renderHook(() => {
        const context = useAppContext();
        const currentMode = useCurrentMode();
        return { context, currentMode };
      }, {
        wrapper: TestWrapper
      });

      expect(result.current.currentMode).toBe('menu');

      act(() => {
        result.current.context.setMode('review');
      });

      expect(result.current.currentMode).toBe('review');
    });

    it('should return word lists with useWordLists', () => {
      const { result } = renderHook(() => {
        const context = useAppContext();
        const wordLists = useWordLists();
        return { context, wordLists };
      }, {
        wrapper: TestWrapper
      });

      expect(result.current.wordLists).toEqual([]);

      const mockWordList: WordList = {
        id: 'list1',
        name: 'Test List',
        words: [],
        createdAt: new Date(),
        lastUsed: new Date()
      };

      act(() => {
        result.current.context.setWordList(mockWordList);
      });

      expect(result.current.wordLists).toHaveLength(1);
    });

    it('should return active word list with useActiveWordList', () => {
      const { result } = renderHook(() => {
        const context = useAppContext();
        const activeWordList = useActiveWordList();
        return { context, activeWordList };
      }, {
        wrapper: TestWrapper
      });

      expect(result.current.activeWordList).toBeNull();

      const mockWordList: WordList = {
        id: 'list1',
        name: 'Test List',
        words: [],
        createdAt: new Date(),
        lastUsed: new Date()
      };

      act(() => {
        result.current.context.setWordList(mockWordList);
      });

      expect(result.current.activeWordList).toEqual(expect.objectContaining({
        id: 'list1',
        name: 'Test List'
      }));
    });
  });
});