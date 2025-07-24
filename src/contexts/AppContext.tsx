import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, WordList, SpeechSettings, UISettings } from '../types';
import { LocalStorageManager } from '../utils/LocalStorageManager';

/**
 * 預設的語音設定
 */
const defaultSpeechSettings: SpeechSettings = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  voice: ''
};

/**
 * 預設的UI設定
 */
const defaultUISettings: UISettings = {
  fontSize: 'medium',
  theme: 'light',
  animationsEnabled: true
};

/**
 * 初始應用程式狀態
 */
const initialState: AppState = {
  currentMode: 'menu',
  wordLists: [],
  activeWordList: null,
  reviewState: {
    phase: 'setup',
    wordList: [],
    currentIndex: 0,
    isPlaying: false
  },
  examState: {
    phase: 'testing',
    shuffledWords: [],
    currentIndex: 0,
    showAnswer: false,
    isPlaying: false
  },
  speechSettings: defaultSpeechSettings,
  uiSettings: defaultUISettings
};

/**
 * 狀態管理Reducer
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        currentMode: action.payload
      };

    case 'SET_WORD_LIST':
      const updatedWordLists = [...state.wordLists];
      const existingIndex = updatedWordLists.findIndex(list => list.id === action.payload.id);
      
      if (existingIndex >= 0) {
        updatedWordLists[existingIndex] = action.payload;
      } else {
        updatedWordLists.push(action.payload);
      }

      // 更新最後使用時間
      const updatedWordList = { ...action.payload, lastUsed: new Date() };
      if (existingIndex >= 0) {
        updatedWordLists[existingIndex] = updatedWordList;
      }

      return {
        ...state,
        wordLists: updatedWordLists,
        activeWordList: updatedWordList
      };

    case 'UPDATE_REVIEW_STATE':
      return {
        ...state,
        reviewState: {
          ...state.reviewState,
          ...action.payload
        }
      };

    case 'UPDATE_EXAM_STATE':
      return {
        ...state,
        examState: {
          ...state.examState,
          ...action.payload
        }
      };

    case 'UPDATE_SPEECH_SETTINGS':
      return {
        ...state,
        speechSettings: {
          ...state.speechSettings,
          ...action.payload
        }
      };

    case 'UPDATE_UI_SETTINGS':
      return {
        ...state,
        uiSettings: {
          ...state.uiSettings,
          ...action.payload
        }
      };

    case 'RESET_STATE':
      return {
        ...initialState,
        speechSettings: state.speechSettings,
        uiSettings: state.uiSettings
      };

    default:
      return state;
  }
}

/**
 * Context介面
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 便利方法
  setMode: (mode: AppState['currentMode']) => void;
  setWordList: (wordList: WordList) => void;
  updateReviewState: (updates: Partial<AppState['reviewState']>) => void;
  updateExamState: (updates: Partial<AppState['examState']>) => void;
  updateSpeechSettings: (updates: Partial<SpeechSettings>) => void;
  updateUISettings: (updates: Partial<UISettings>) => void;
  resetState: () => void;
  // 資料持久化方法
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

/**
 * 建立Context
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Context Provider組件
 */
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 便利方法
  const setMode = (mode: AppState['currentMode']) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  };

  const setWordList = (wordList: WordList) => {
    dispatch({ type: 'SET_WORD_LIST', payload: wordList });
  };

  const updateReviewState = (updates: Partial<AppState['reviewState']>) => {
    dispatch({ type: 'UPDATE_REVIEW_STATE', payload: updates });
  };

  const updateExamState = (updates: Partial<AppState['examState']>) => {
    dispatch({ type: 'UPDATE_EXAM_STATE', payload: updates });
  };

  const updateSpeechSettings = (updates: Partial<SpeechSettings>) => {
    dispatch({ type: 'UPDATE_SPEECH_SETTINGS', payload: updates });
  };

  const updateUISettings = (updates: Partial<UISettings>) => {
    dispatch({ type: 'UPDATE_UI_SETTINGS', payload: updates });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  // 儲存到LocalStorage
  const saveToStorage = () => {
    try {
      LocalStorageManager.saveWordLists(state.wordLists);
      LocalStorageManager.saveSpeechSettings(state.speechSettings);
      LocalStorageManager.saveUISettings(state.uiSettings);
      LocalStorageManager.saveActiveWordListId(state.activeWordList?.id || null);
    } catch (error) {
      console.error('儲存資料到LocalStorage失敗:', error);
    }
  };

  // 從LocalStorage載入
  const loadFromStorage = () => {
    try {
      const wordLists = LocalStorageManager.loadWordLists();
      const speechSettings = LocalStorageManager.loadSpeechSettings();
      const uiSettings = LocalStorageManager.loadUISettings();
      const activeWordListId = LocalStorageManager.loadActiveWordListId();

      // 更新單字清單
      wordLists.forEach(wordList => {
        dispatch({ type: 'SET_WORD_LIST', payload: wordList });
      });

      // 設定活躍的單字清單
      if (activeWordListId) {
        const activeWordList = wordLists.find(list => list.id === activeWordListId);
        if (activeWordList) {
          dispatch({ type: 'SET_WORD_LIST', payload: activeWordList });
        }
      }

      // 更新設定
      if (speechSettings) {
        dispatch({ type: 'UPDATE_SPEECH_SETTINGS', payload: speechSettings });
      }

      if (uiSettings) {
        dispatch({ type: 'UPDATE_UI_SETTINGS', payload: uiSettings });
      }
    } catch (error) {
      console.error('從LocalStorage載入資料失敗:', error);
    }
  };

  // 組件掛載時載入資料
  useEffect(() => {
    loadFromStorage();
  }, []);

  // 狀態變更時自動儲存
  useEffect(() => {
    // 避免初始載入時觸發儲存
    if (state.wordLists.length > 0 || state.activeWordList) {
      saveToStorage();
    }
  }, [state.wordLists, state.activeWordList, state.speechSettings, state.uiSettings]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    setMode,
    setWordList,
    updateReviewState,
    updateExamState,
    updateSpeechSettings,
    updateUISettings,
    resetState,
    saveToStorage,
    loadFromStorage
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * 使用Context的Hook
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext必須在AppProvider內部使用');
  }
  return context;
}

/**
 * 選擇器Hook - 只訂閱特定狀態片段
 */
export function useAppSelector<T>(selector: (state: AppState) => T): T {
  const { state } = useAppContext();
  return selector(state);
}

/**
 * 便利Hook - 獲取當前模式
 */
export function useCurrentMode() {
  return useAppSelector(state => state.currentMode);
}

/**
 * 便利Hook - 獲取單字清單
 */
export function useWordLists() {
  return useAppSelector(state => state.wordLists);
}

/**
 * 便利Hook - 獲取活躍的單字清單
 */
export function useActiveWordList() {
  return useAppSelector(state => state.activeWordList);
}

/**
 * 便利Hook - 獲取複習狀態
 */
export function useReviewState() {
  return useAppSelector(state => state.reviewState);
}

/**
 * 便利Hook - 獲取考試狀態
 */
export function useExamState() {
  return useAppSelector(state => state.examState);
}

/**
 * 便利Hook - 獲取語音設定
 */
export function useSpeechSettings() {
  return useAppSelector(state => state.speechSettings);
}

/**
 * 便利Hook - 獲取UI設定
 */
export function useUISettings() {
  return useAppSelector(state => state.uiSettings);
}