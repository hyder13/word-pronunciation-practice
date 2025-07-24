# 設計文件

## 概述

單字發音練習網站是一個基於網頁的教育工具，專為小學生設計。系統採用單頁應用程式（SPA）架構，使用現代前端技術實現響應式設計。核心功能包括複習模式和考試模式，透過Web Speech API提供語音合成功能，讓學生能夠聽到標準的英文發音。

## 架構

### 整體架構
```
┌─────────────────────────────────────┐
│           前端應用程式                │
├─────────────────────────────────────┤
│  React/Vue.js + TypeScript          │
│  - 狀態管理 (Context API/Vuex)      │
│  - 路由管理                         │
│  - 響應式UI組件                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         瀏覽器原生API               │
├─────────────────────────────────────┤
│  Web Speech API (SpeechSynthesis)  │
│  - 語音合成                         │
│  - 語音設定                         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         本地儲存                    │
├─────────────────────────────────────┤
│  LocalStorage                       │
│  - 單字清單儲存                     │
│  - 用戶偏好設定                     │
└─────────────────────────────────────┘
```

### 技術選擇
- **前端框架**: React 18 with TypeScript
- **狀態管理**: React Context API + useReducer
- **樣式**: CSS Modules + Tailwind CSS
- **語音合成**: Web Speech API (SpeechSynthesis)
- **資料儲存**: LocalStorage
- **建置工具**: Vite
- **測試**: Jest + React Testing Library

## 組件和介面

### 核心組件架構

```
App
├── Header (標題和導航)
├── ModeSelector (模式選擇)
├── ReviewMode
│   ├── WordListInput (單字清單輸入)
│   ├── ReviewSession (複習會話)
│   └── ReviewProgress (進度顯示)
├── ExamMode
│   ├── ExamSession (考試會話)
│   ├── QuestionCard (問題卡片)
│   └── AnswerReveal (答案顯示)
├── SpeechController (語音控制)
├── ProgressIndicator (進度指示器)
└── ErrorBoundary (錯誤邊界)
```

### 主要介面設計

#### 1. 主選單介面
```typescript
interface MainMenuProps {
  onModeSelect: (mode: 'review' | 'exam') => void;
  hasWordList: boolean;
}
```

#### 2. 複習模式介面
```typescript
interface ReviewModeState {
  phase: 'setup' | 'practicing' | 'completed';
  wordList: WordItem[];
  currentIndex: number;
  isPlaying: boolean;
}

interface WordItem {
  english: string;
  chinese: string;
  id: string;
}
```

#### 3. 考試模式介面
```typescript
interface ExamModeState {
  phase: 'testing' | 'completed';
  shuffledWords: WordItem[];
  currentIndex: number;
  showAnswer: boolean;
  isPlaying: boolean;
}
```

#### 4. 語音控制介面
```typescript
interface SpeechControllerProps {
  text: string;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onSpeechError: (error: string) => void;
}
```

## 資料模型

### 單字資料模型
```typescript
interface WordItem {
  id: string;
  english: string;
  chinese: string;
  createdAt: Date;
}

interface WordList {
  id: string;
  name: string;
  words: WordItem[];
  createdAt: Date;
  lastUsed: Date;
}
```

### 應用程式狀態模型
```typescript
interface AppState {
  currentMode: 'menu' | 'review' | 'exam';
  wordLists: WordList[];
  activeWordList: WordList | null;
  reviewState: ReviewModeState;
  examState: ExamModeState;
  speechSettings: SpeechSettings;
  uiSettings: UISettings;
}

interface SpeechSettings {
  rate: number;        // 語速 (0.1 - 10)
  pitch: number;       // 音調 (0 - 2)
  volume: number;      // 音量 (0 - 1)
  voice: string;       // 語音選擇
}

interface UISettings {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark';
  animationsEnabled: boolean;
}
```

## 錯誤處理

### 語音合成錯誤處理
```typescript
enum SpeechError {
  NOT_SUPPORTED = 'SPEECH_NOT_SUPPORTED',
  NO_VOICES = 'NO_VOICES_AVAILABLE',
  SYNTHESIS_FAILED = 'SYNTHESIS_FAILED',
  INTERRUPTED = 'SPEECH_INTERRUPTED'
}

interface ErrorHandler {
  handleSpeechError(error: SpeechError): void;
  handleInputValidationError(field: string, message: string): void;
  handleStorageError(operation: string): void;
}
```

### 輸入驗證
```typescript
interface ValidationRules {
  english: {
    required: true;
    pattern: /^[a-zA-Z\s]+$/;
    maxLength: 50;
  };
  chinese: {
    required: true;
    maxLength: 100;
  };
  wordListSize: {
    min: 1;
    max: 20;
  };
}
```

### 錯誤訊息本地化
```typescript
const ErrorMessages = {
  'zh-TW': {
    SPEECH_NOT_SUPPORTED: '您的瀏覽器不支援語音功能，請使用Chrome或Firefox',
    NO_VOICES_AVAILABLE: '找不到可用的語音，請檢查瀏覽器設定',
    INVALID_ENGLISH_WORD: '請輸入有效的英文單字（只能包含英文字母）',
    EMPTY_WORD_LIST: '請至少輸入一個單字',
    STORAGE_ERROR: '儲存資料時發生錯誤，請重新整理頁面'
  }
};
```

## 測試策略

### 單元測試
- **組件測試**: 每個React組件的渲染和互動測試
- **工具函數測試**: 輸入驗證、資料處理函數測試
- **狀態管理測試**: Context和Reducer的狀態變更測試

### 整合測試
- **語音功能測試**: Web Speech API整合測試
- **儲存功能測試**: LocalStorage讀寫測試
- **用戶流程測試**: 完整的複習和考試流程測試

### 端到端測試
- **跨瀏覽器測試**: Chrome、Firefox、Safari、Edge
- **響應式測試**: 桌面、平板、手機尺寸
- **無障礙測試**: 鍵盤導航、螢幕閱讀器支援

### 測試覆蓋率目標
- 單元測試覆蓋率: > 90%
- 整合測試覆蓋率: > 80%
- 關鍵用戶流程覆蓋率: 100%

## 效能考量

### 語音合成最佳化
```typescript
class SpeechOptimizer {
  private voiceCache: Map<string, SpeechSynthesisVoice> = new Map();
  private preloadVoices(): void;
  private selectOptimalVoice(language: string): SpeechSynthesisVoice;
  private applySpeechSettings(utterance: SpeechSynthesisUtterance): void;
}
```

### 資料儲存最佳化
- 使用壓縮演算法減少LocalStorage使用量
- 實現資料清理機制，移除過期的單字清單
- 批次儲存操作，減少I/O次數

### UI效能最佳化
- 使用React.memo避免不必要的重新渲染
- 實現虛擬滾動處理大量單字清單
- 使用CSS動畫而非JavaScript動畫

## 無障礙設計

### 鍵盤導航
```typescript
interface KeyboardNavigation {
  Tab: '在可聚焦元素間移動';
  Enter: '啟動按鈕或確認輸入';
  Space: '播放語音或選擇選項';
  Escape: '返回上一層或取消操作';
  ArrowKeys: '在選項間移動';
}
```

### ARIA標籤
- 為所有互動元素提供適當的aria-label
- 使用role屬性標示組件功能
- 實現live regions通知狀態變更

### 視覺設計
- 確保顏色對比度符合WCAG 2.1 AA標準
- 提供大字體選項
- 支援高對比度模式