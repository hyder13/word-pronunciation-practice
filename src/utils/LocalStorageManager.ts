import { WordList, SpeechSettings, UISettings } from '../types';

/**
 * LocalStorage工具類別，處理單字清單和應用程式設定的儲存和讀取
 */
export class LocalStorageManager {
  private static readonly WORD_LISTS_KEY = 'word-pronunciation-word-lists';
  private static readonly SPEECH_SETTINGS_KEY = 'word-pronunciation-speech-settings';
  private static readonly UI_SETTINGS_KEY = 'word-pronunciation-ui-settings';
  private static readonly ACTIVE_WORD_LIST_KEY = 'word-pronunciation-active-word-list';

  /**
   * 儲存單字清單到LocalStorage
   */
  static saveWordLists(wordLists: WordList[]): boolean {
    try {
      const serializedData = JSON.stringify(wordLists, (key, value) => {
        // 處理Date物件的序列化
        if (key === 'createdAt' || key === 'lastUsed') {
          return value instanceof Date ? value.toISOString() : value;
        }
        return value;
      });
      localStorage.setItem(this.WORD_LISTS_KEY, serializedData);
      return true;
    } catch (error) {
      console.error('儲存單字清單失敗:', error);
      return false;
    }
  }

  /**
   * 從LocalStorage讀取單字清單
   */
  static loadWordLists(): WordList[] {
    try {
      const data = localStorage.getItem(this.WORD_LISTS_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      // 還原Date物件
      return parsed.map((wordList: any) => ({
        ...wordList,
        createdAt: new Date(wordList.createdAt),
        lastUsed: new Date(wordList.lastUsed),
        words: wordList.words.map((word: any) => ({
          ...word,
          createdAt: new Date(word.createdAt)
        }))
      }));
    } catch (error) {
      console.error('讀取單字清單失敗:', error);
      return [];
    }
  }

  /**
   * 儲存語音設定
   */
  static saveSpeechSettings(settings: SpeechSettings): boolean {
    try {
      localStorage.setItem(this.SPEECH_SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('儲存語音設定失敗:', error);
      return false;
    }
  }

  /**
   * 讀取語音設定
   */
  static loadSpeechSettings(): SpeechSettings | null {
    try {
      const data = localStorage.getItem(this.SPEECH_SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('讀取語音設定失敗:', error);
      return null;
    }
  }

  /**
   * 儲存UI設定
   */
  static saveUISettings(settings: UISettings): boolean {
    try {
      localStorage.setItem(this.UI_SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('儲存UI設定失敗:', error);
      return false;
    }
  }

  /**
   * 讀取UI設定
   */
  static loadUISettings(): UISettings | null {
    try {
      const data = localStorage.getItem(this.UI_SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('讀取UI設定失敗:', error);
      return null;
    }
  }

  /**
   * 儲存當前活躍的單字清單ID
   */
  static saveActiveWordListId(wordListId: string | null): boolean {
    try {
      if (wordListId === null) {
        localStorage.removeItem(this.ACTIVE_WORD_LIST_KEY);
      } else {
        localStorage.setItem(this.ACTIVE_WORD_LIST_KEY, wordListId);
      }
      return true;
    } catch (error) {
      console.error('儲存活躍單字清單ID失敗:', error);
      return false;
    }
  }

  /**
   * 讀取當前活躍的單字清單ID
   */
  static loadActiveWordListId(): string | null {
    try {
      return localStorage.getItem(this.ACTIVE_WORD_LIST_KEY);
    } catch (error) {
      console.error('讀取活躍單字清單ID失敗:', error);
      return null;
    }
  }

  /**
   * 清除所有儲存的資料
   */
  static clearAll(): boolean {
    try {
      localStorage.removeItem(this.WORD_LISTS_KEY);
      localStorage.removeItem(this.SPEECH_SETTINGS_KEY);
      localStorage.removeItem(this.UI_SETTINGS_KEY);
      localStorage.removeItem(this.ACTIVE_WORD_LIST_KEY);
      return true;
    } catch (error) {
      console.error('清除儲存資料失敗:', error);
      return false;
    }
  }

  /**
   * 檢查LocalStorage是否可用
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 獲取儲存空間使用情況
   */
  static getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // 估算可用空間（大多數瀏覽器限制為5MB）
      const available = 5 * 1024 * 1024 - used;
      
      return { used, available };
    } catch (error) {
      console.error('獲取儲存空間資訊失敗:', error);
      return { used: 0, available: 0 };
    }
  }
}