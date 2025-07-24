
import { useAppContext, useActiveWordList, useUISettings } from '../contexts/AppContext';
import { useState } from 'react';

interface ModeSelectorProps {
  className?: string;
}

export function ModeSelector({ className = '' }: ModeSelectorProps) {
  const { setMode, resetState, updateReviewState, updateExamState } = useAppContext();
  const activeWordList = useActiveWordList();
  const uiSettings = useUISettings();
  const hasWordList = activeWordList && activeWordList.words.length > 0;
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleModeSelect = (mode: 'review' | 'exam') => {
    setMode(mode);
  };

  const handleClearWordList = () => {
    // 重設所有狀態
    resetState();
    // 重設複習和考試狀態
    updateReviewState({
      phase: 'setup',
      wordList: [],
      currentIndex: 0,
      isPlaying: false
    });
    updateExamState({
      phase: 'testing',
      shuffledWords: [],
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });
    setShowClearConfirm(false);
  };

  const handleStartNewPractice = () => {
    // 重設練習狀態但保留單字清單
    updateReviewState({
      phase: 'setup',
      wordList: [],
      currentIndex: 0,
      isPlaying: false
    });
    updateExamState({
      phase: 'testing',
      shuffledWords: [],
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });
  };

  return (
    <div className={`container-responsive ${className}`}>
      {/* Welcome Section */}
      <div className={`text-center spacing-responsive-lg ${uiSettings.animationsEnabled ? 'animate-fade-in-up' : ''}`}>
        <div className={`text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 ${uiSettings.animationsEnabled ? 'animate-bounce-gentle' : ''}`}>
          🎯
        </div>
        <h1 className="text-responsive-xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-4 theme-transition">
          單字發音練習
        </h1>
        <p className="text-responsive-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto theme-transition">
          專為小學生設計的英文單字學習工具
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid-responsive max-w-4xl mx-auto">
        {/* Review Mode Card */}
        <div className={`
          card-child 
          ${uiSettings.animationsEnabled ? 'animate-slide-up' : ''}
        `}>
          <div className="text-center spacing-responsive-sm">
            <div className={`text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 ${uiSettings.animationsEnabled ? 'animate-bounce-gentle' : ''}`}>
              📚
            </div>
            <h2 className="text-responsive-lg font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-4 theme-transition">
              複習模式
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-responsive-sm leading-relaxed theme-transition">
              輸入單字清單，依序練習每個單字的發音和意思
            </p>
            <button
              onClick={() => handleModeSelect('review')}
              className="btn-child-primary w-full"
              aria-label="開始複習模式"
            >
              🚀 開始複習
            </button>
          </div>
        </div>

        {/* Exam Mode Card */}
        <div className={`
          card-child 
          ${uiSettings.animationsEnabled ? 'animate-slide-up' : ''}
        `} style={{ animationDelay: '0.1s' }}>
          <div className="text-center spacing-responsive-sm">
            <div className={`text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 ${uiSettings.animationsEnabled ? 'animate-bounce-gentle' : ''}`}>
              🎮
            </div>
            <h2 className="text-responsive-lg font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-4 theme-transition">
              考試模式
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-responsive-sm leading-relaxed theme-transition">
              看中文意思，練習說出正確的英文單字
            </p>
            <button
              onClick={() => handleModeSelect('exam')}
              disabled={!hasWordList}
              className={`w-full ${hasWordList ? 'btn-child-success' : 'btn-child-disabled'}`}
              aria-label={hasWordList ? '開始考試模式' : '需要先建立單字清單才能開始考試'}
              title={hasWordList ? undefined : '請先在複習模式中建立單字清單'}
            >
              {hasWordList ? '🎯 開始考試' : '📝 需要單字清單'}
            </button>
            {!hasWordList && (
              <p className="text-responsive-xs text-gray-500 dark:text-gray-400 mt-3 theme-transition">
                請先在複習模式中建立單字清單
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Word List Status and Actions */}
      {hasWordList && (
        <div className={`mt-6 sm:mt-8 text-center spacing-responsive-sm ${uiSettings.animationsEnabled ? 'animate-fade-in' : ''}`}>
          <div className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 bg-childSuccess-50 dark:bg-childSuccess-900 border-2 border-childSuccess-200 dark:border-childSuccess-700 rounded-child-lg theme-transition">
            <div className="text-childSuccess-600 dark:text-childSuccess-400 text-base sm:text-child-lg">✅</div>
            <span className="text-childSuccess-700 dark:text-childSuccess-300 font-bold text-responsive-sm theme-transition">
              已準備 {activeWordList.words.length} 個單字
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex-responsive justify-center items-center">
            <button
              onClick={handleStartNewPractice}
              className={`
                touch-target flex items-center space-x-2 px-4 sm:px-6 py-3 
                text-childPrimary-600 dark:text-childPrimary-400 
                hover:text-childPrimary-800 dark:hover:text-childPrimary-200 
                hover:bg-childPrimary-50 dark:hover:bg-childPrimary-900 
                rounded-child-lg transition-all duration-200 font-bold text-responsive-sm theme-transition
                focus:outline-none focus:ring-4 focus:ring-childPrimary-200 focus:ring-offset-2
                ${uiSettings.animationsEnabled ? 'transform hover:scale-105 active:scale-95' : ''}
                w-full sm:w-auto
              `}
              aria-label="重新開始練習"
            >
              <span>🔄</span>
              <span>重新開始練習</span>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className={`
                touch-target flex items-center space-x-2 px-4 sm:px-6 py-3 
                text-error-600 dark:text-error-400 
                hover:text-error-800 dark:hover:text-error-200 
                hover:bg-error-50 dark:hover:bg-error-900 
                rounded-child-lg transition-all duration-200 font-bold text-responsive-sm theme-transition
                focus:outline-none focus:ring-4 focus:ring-error-200 focus:ring-offset-2
                ${uiSettings.animationsEnabled ? 'transform hover:scale-105 active:scale-95' : ''}
                w-full sm:w-auto
              `}
              aria-label="清除單字清單"
            >
              <span>🗑️</span>
              <span>清除單字清單</span>
            </button>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`
            bg-white dark:bg-gray-800 rounded-child-xl shadow-child-lg 
            max-w-md w-full mx-4 padding-responsive theme-transition
            ${uiSettings.animationsEnabled ? 'animate-scale-in' : ''}
          `}>
            <div className="text-center spacing-responsive-sm">
              <div className={`text-4xl sm:text-5xl mb-4 sm:mb-6 ${uiSettings.animationsEnabled ? 'animate-wiggle' : ''}`}>⚠️</div>
              <h3 className="text-responsive-lg font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-4 theme-transition">
                確認清除單字清單
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-responsive-sm leading-relaxed theme-transition">
                這將會刪除所有已儲存的單字清單和練習進度，此操作無法復原。
              </p>
              <div className="flex-responsive justify-center">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="btn-child-secondary w-full sm:w-auto"
                >
                  ❌ 取消
                </button>
                <button
                  onClick={handleClearWordList}
                  className="bg-error-500 hover:bg-error-600 active:bg-error-700 text-white font-bold py-child-lg px-child-xl rounded-child-lg shadow-child hover:shadow-child-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-error-200 focus:ring-offset-2 w-full sm:w-auto touch:min-h-[3.5rem] touch:py-4 touch:px-6"
                >
                  🗑️ 確認清除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}