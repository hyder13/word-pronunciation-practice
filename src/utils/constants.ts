import { ValidationRules, SpeechSettings, UISettings } from '../types';

// Validation rules for input fields
export const VALIDATION_RULES: ValidationRules = {
  english: {
    required: true,
    pattern: /^[a-zA-Z\s]+$/,
    maxLength: 50,
  },
  chinese: {
    required: true,
    maxLength: 100,
  },
  wordListSize: {
    min: 1,
    max: 20,
  },
};

// Default speech settings
export const DEFAULT_SPEECH_SETTINGS: SpeechSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: '',
};

// Default UI settings
export const DEFAULT_UI_SETTINGS: UISettings = {
  fontSize: 'medium',
  theme: 'light',
  animationsEnabled: true,
};

// Error messages in Traditional Chinese
export const ERROR_MESSAGES = {
  SPEECH_NOT_SUPPORTED: '您的瀏覽器不支援語音功能，請使用Chrome或Firefox',
  NO_VOICES_AVAILABLE: '找不到可用的語音，請檢查瀏覽器設定',
  SYNTHESIS_FAILED: '語音播放失敗，請重新嘗試',
  SPEECH_INTERRUPTED: '語音播放被中斷',
  INVALID_ENGLISH_WORD: '請輸入有效的英文單字（只能包含英文字母）',
  INVALID_CHINESE_TRANSLATION: '請輸入有效的中文翻譯',
  EMPTY_WORD_LIST: '請至少輸入一個單字',
  STORAGE_ERROR: '儲存資料時發生錯誤，請重新整理頁面',
  WORD_TOO_LONG: '單字長度不能超過50個字符',
  TRANSLATION_TOO_LONG: '翻譯長度不能超過100個字符',
  TOO_MANY_WORDS: '單字清單不能超過20個單字',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  WORD_LISTS: 'wordPronunciation_wordLists',
  SPEECH_SETTINGS: 'wordPronunciation_speechSettings',
  UI_SETTINGS: 'wordPronunciation_uiSettings',
  ACTIVE_WORD_LIST: 'wordPronunciation_activeWordList',
} as const;