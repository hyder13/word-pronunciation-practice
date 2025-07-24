import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageManager } from '../LocalStorageManager';
import { WordList, SpeechSettings, UISettings } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    hasOwnProperty: vi.fn((key: string) => key in store),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LocalStorageManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('WordLists Management', () => {
    const mockWordLists: WordList[] = [
      {
        id: 'list1',
        name: 'Test List 1',
        words: [
          {
            id: 'word1',
            english: 'Hello',
            chinese: '你好',
            createdAt: new Date('2024-01-01')
          }
        ],
        createdAt: new Date('2024-01-01'),
        lastUsed: new Date('2024-01-02')
      }
    ];

    it('should save word lists successfully', () => {
      const result = LocalStorageManager.saveWordLists(mockWordLists);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'word-pronunciation-word-lists',
        expect.any(String)
      );
    });

    it('should load word lists successfully', () => {
      LocalStorageManager.saveWordLists(mockWordLists);
      const loadedLists = LocalStorageManager.loadWordLists();
      
      expect(loadedLists).toHaveLength(1);
      expect(loadedLists[0].id).toBe('list1');
      expect(loadedLists[0].name).toBe('Test List 1');
      expect(loadedLists[0].createdAt).toBeInstanceOf(Date);
      expect(loadedLists[0].lastUsed).toBeInstanceOf(Date);
      expect(loadedLists[0].words[0].createdAt).toBeInstanceOf(Date);
    });

    it('should return empty array when no word lists exist', () => {
      const loadedLists = LocalStorageManager.loadWordLists();
      expect(loadedLists).toEqual([]);
    });

    it('should handle corrupted word lists data', () => {
      localStorageMock.setItem('word-pronunciation-word-lists', 'invalid json');
      const loadedLists = LocalStorageManager.loadWordLists();
      expect(loadedLists).toEqual([]);
    });

    it('should handle save error gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });
      
      const result = LocalStorageManager.saveWordLists(mockWordLists);
      expect(result).toBe(false);
    });
  });

  describe('Speech Settings Management', () => {
    const mockSpeechSettings: SpeechSettings = {
      rate: 1.2,
      pitch: 1.1,
      volume: 0.8,
      voice: 'en-US'
    };

    it('should save speech settings successfully', () => {
      const result = LocalStorageManager.saveSpeechSettings(mockSpeechSettings);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'word-pronunciation-speech-settings',
        JSON.stringify(mockSpeechSettings)
      );
    });

    it('should load speech settings successfully', () => {
      LocalStorageManager.saveSpeechSettings(mockSpeechSettings);
      const loadedSettings = LocalStorageManager.loadSpeechSettings();
      
      expect(loadedSettings).toEqual(mockSpeechSettings);
    });

    it('should return null when no speech settings exist', () => {
      const loadedSettings = LocalStorageManager.loadSpeechSettings();
      expect(loadedSettings).toBeNull();
    });

    it('should handle corrupted speech settings data', () => {
      localStorageMock.setItem('word-pronunciation-speech-settings', 'invalid json');
      const loadedSettings = LocalStorageManager.loadSpeechSettings();
      expect(loadedSettings).toBeNull();
    });
  });

  describe('UI Settings Management', () => {
    const mockUISettings: UISettings = {
      fontSize: 'large',
      theme: 'dark',
      animationsEnabled: false
    };

    it('should save UI settings successfully', () => {
      const result = LocalStorageManager.saveUISettings(mockUISettings);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'word-pronunciation-ui-settings',
        JSON.stringify(mockUISettings)
      );
    });

    it('should load UI settings successfully', () => {
      LocalStorageManager.saveUISettings(mockUISettings);
      const loadedSettings = LocalStorageManager.loadUISettings();
      
      expect(loadedSettings).toEqual(mockUISettings);
    });

    it('should return null when no UI settings exist', () => {
      const loadedSettings = LocalStorageManager.loadUISettings();
      expect(loadedSettings).toBeNull();
    });
  });

  describe('Active Word List Management', () => {
    it('should save active word list ID successfully', () => {
      const result = LocalStorageManager.saveActiveWordListId('list123');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'word-pronunciation-active-word-list',
        'list123'
      );
    });

    it('should remove active word list ID when null is passed', () => {
      LocalStorageManager.saveActiveWordListId('list123');
      const result = LocalStorageManager.saveActiveWordListId(null);
      
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'word-pronunciation-active-word-list'
      );
    });

    it('should load active word list ID successfully', () => {
      LocalStorageManager.saveActiveWordListId('list123');
      const loadedId = LocalStorageManager.loadActiveWordListId();
      
      expect(loadedId).toBe('list123');
    });

    it('should return null when no active word list ID exists', () => {
      const loadedId = LocalStorageManager.loadActiveWordListId();
      expect(loadedId).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    it('should clear all data successfully', () => {
      LocalStorageManager.saveActiveWordListId('test');
      LocalStorageManager.saveSpeechSettings({ rate: 1, pitch: 1, volume: 1, voice: '' });
      
      const result = LocalStorageManager.clearAll();
      
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(4);
    });

    it('should detect localStorage availability', () => {
      const isAvailable = LocalStorageManager.isAvailable();
      expect(isAvailable).toBe(true);
    });

    it('should handle localStorage unavailability', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage not available');
      });
      
      const isAvailable = LocalStorageManager.isAvailable();
      expect(isAvailable).toBe(false);
    });

    it('should get storage info', () => {
      LocalStorageManager.saveActiveWordListId('test');
      const storageInfo = LocalStorageManager.getStorageInfo();
      
      expect(storageInfo).toHaveProperty('used');
      expect(storageInfo).toHaveProperty('available');
      expect(typeof storageInfo.used).toBe('number');
      expect(typeof storageInfo.available).toBe('number');
    });
  });
});