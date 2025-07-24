import { useEffect } from 'react';
import { AppProvider, useCurrentMode, useAppContext, useReviewState, useUISettings } from './contexts/AppContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorNotification } from './components/ErrorNotification';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { BrowserCompatWarning } from './components/BrowserCompatWarning';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { WordListInput } from './components/WordListInput';
import { ReviewSession } from './components/ReviewSession';
import { ExamSession } from './components/ExamSession';
import { WordItem, WordList } from './types';
import { generateId } from './utils/validation';
import { initializePolyfills, addBrowserClasses } from './utils/browserCompat';

function AppContent() {
  const currentMode = useCurrentMode();
  const { setMode, setWordList, updateReviewState } = useAppContext();
  const reviewState = useReviewState();
  const uiSettings = useUISettings();

  // Apply UI settings to document on mount and when settings change
  useEffect(() => {
    // Apply theme
    if (uiSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply font size
    document.body.className = document.body.className
      .replace(/font-size-(small|medium|large)/g, '')
      .trim();
    document.body.classList.add(`font-size-${uiSettings.fontSize}`);

    // Apply animations setting
    if (uiSettings.animationsEnabled) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
  }, [uiSettings]);

  const handleWordListComplete = (words: WordItem[]) => {
    // 創建新的單字清單
    const wordList: WordList = {
      id: generateId(),
      name: `單字清單 ${new Date().toLocaleDateString()}`,
      words,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    // 儲存單字清單並更新複習狀態
    setWordList(wordList);
    updateReviewState({
      phase: 'practicing',
      wordList: words,
      currentIndex: 0,
      isPlaying: false
    });
  };

  const handleCancelWordInput = () => {
    setMode('menu');
  };

  const renderContent = () => {
    switch (currentMode) {
      case 'menu':
        return <ModeSelector className="py-8" />;
      case 'review':
        // 根據複習階段顯示不同內容
        if (reviewState.phase === 'setup') {
          return (
            <div className="container-responsive padding-responsive">
              <WordListInput
                onWordListComplete={handleWordListComplete}
                onCancel={handleCancelWordInput}
              />
            </div>
          );
        } else {
          return (
            <div className="container-responsive padding-responsive">
              <ReviewSession
                onComplete={() => {
                  updateReviewState({ phase: 'completed' });
                  setMode('menu');
                }}
                onBackToSetup={() => {
                  updateReviewState({ phase: 'setup' });
                }}
              />
            </div>
          );
        }
      case 'exam':
        return <ExamSession />;
      default:
        return <ModeSelector className="py-8" />;
    }
  };

  return (
    <div className={`
      min-h-screen 
      bg-gradient-to-br from-blue-50 to-indigo-100 
      dark:from-gray-900 dark:to-gray-800 
      theme-transition
      ${uiSettings.animationsEnabled ? '' : 'no-animations'}
    `}>
      <Header />
      <main className="theme-transition">
        {renderContent()}
      </main>
      <ErrorNotification />
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  // Initialize browser compatibility features on app start
  useEffect(() => {
    initializePolyfills();
    addBrowserClasses();
  }, []);

  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AppProvider>
          <BrowserCompatWarning />
          <AppContent />
        </AppProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;