// Core data models
export interface WordItem {
  id: string;
  english: string;
  chinese: string;
  createdAt: Date;
}

export interface WordList {
  id: string;
  name: string;
  words: WordItem[];
  createdAt: Date;
  lastUsed: Date;
}

// Application state types
export type AppMode = 'menu' | 'review' | 'exam';
export type ReviewPhase = 'setup' | 'practicing' | 'completed';
export type ExamPhase = 'testing' | 'completed';

export interface ReviewModeState {
  phase: ReviewPhase;
  wordList: WordItem[];
  currentIndex: number;
  isPlaying: boolean;
}

export interface ExamModeState {
  phase: ExamPhase;
  shuffledWords: WordItem[];
  currentIndex: number;
  showAnswer: boolean;
  isPlaying: boolean;
}

// Settings interfaces
export interface SpeechSettings {
  rate: number;        // 語速 (0.1 - 10)
  pitch: number;       // 音調 (0 - 2)
  volume: number;      // 音量 (0 - 1)
  voice: string;       // 語音選擇
}

export interface UISettings {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark';
  animationsEnabled: boolean;
}

// Main application state
export interface AppState {
  currentMode: AppMode;
  wordLists: WordList[];
  activeWordList: WordList | null;
  reviewState: ReviewModeState;
  examState: ExamModeState;
  speechSettings: SpeechSettings;
  uiSettings: UISettings;
}

// Error handling types
export enum SpeechError {
  NOT_SUPPORTED = 'SPEECH_NOT_SUPPORTED',
  NO_VOICES = 'NO_VOICES_AVAILABLE',
  SYNTHESIS_FAILED = 'SYNTHESIS_FAILED',
  INTERRUPTED = 'SPEECH_INTERRUPTED'
}

export enum AppError {
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorInfo {
  type: SpeechError | AppError;
  message: string;
  details?: string;
  timestamp: Date;
  canRetry: boolean;
}

export interface ErrorState {
  hasError: boolean;
  error: ErrorInfo | null;
  errorHistory: ErrorInfo[];
}

// Component prop interfaces
export interface MainMenuProps {
  onModeSelect: (mode: 'review' | 'exam') => void;
  hasWordList: boolean;
}

export interface SpeechControllerProps {
  text: string;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onSpeechError: (error: string) => void;
}

// Validation interfaces
export interface ValidationRules {
  english: {
    required: boolean;
    pattern: RegExp;
    maxLength: number;
  };
  chinese: {
    required: boolean;
    maxLength: number;
  };
  wordListSize: {
    min: number;
    max: number;
  };
}

// Action types for state management
export type AppAction =
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_WORD_LIST'; payload: WordList }
  | { type: 'UPDATE_REVIEW_STATE'; payload: Partial<ReviewModeState> }
  | { type: 'UPDATE_EXAM_STATE'; payload: Partial<ExamModeState> }
  | { type: 'UPDATE_SPEECH_SETTINGS'; payload: Partial<SpeechSettings> }
  | { type: 'UPDATE_UI_SETTINGS'; payload: Partial<UISettings> }
  | { type: 'RESET_STATE' };