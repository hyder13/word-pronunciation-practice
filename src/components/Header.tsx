
import { useState } from 'react';
import { useAppContext, useCurrentMode, useUISettings } from '../contexts/AppContext';
import { SettingsPanel } from './SettingsPanel';

interface HeaderProps {
  onBackToMenu?: () => void;
}

export function Header({ onBackToMenu }: HeaderProps) {
  const { setMode } = useAppContext();
  const currentMode = useCurrentMode();
  const uiSettings = useUISettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleBackToMenu = () => {
    setMode('menu');
    onBackToMenu?.();
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 theme-transition">
        <div className="container-responsive py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className={`text-2xl sm:text-3xl ${uiSettings.animationsEnabled ? 'animate-bounce-gentle' : ''}`}>
                🎯
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-responsive-lg font-bold text-gray-800 dark:text-gray-100 theme-transition truncate">
                  單字發音練習
                </h1>
                <p className="text-responsive-xs text-gray-600 dark:text-gray-400 hidden sm:block theme-transition">
                  專為小學生設計的英文單字學習工具
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-1 sm:space-x-3">
              {/* Settings Button */}
              <button
                onClick={toggleSettings}
                className={`
                  touch-target p-2 sm:p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-child-lg 
                  transition-all duration-200 theme-transition
                  focus:outline-none focus:ring-2 focus:ring-childPrimary-500 focus:ring-offset-2
                  ${uiSettings.animationsEnabled ? 'transform hover:scale-105 active:scale-95' : ''}
                  ${isSettingsOpen ? 'bg-childPrimary-100 dark:bg-childPrimary-900 text-childPrimary-700 dark:text-childPrimary-300' : ''}
                `}
                aria-label="開啟設定面板"
                title="設定"
              >
                <svg 
                  className={`w-6 h-6 ${uiSettings.animationsEnabled && isSettingsOpen ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </button>

              {/* Back to Menu Button */}
              {currentMode !== 'menu' && (
                <button
                  onClick={handleBackToMenu}
                  className={`
                    touch-target flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-600 dark:text-gray-400 
                    hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 
                    rounded-child-lg transition-all duration-200 theme-transition
                    focus:outline-none focus:ring-2 focus:ring-childPrimary-500 focus:ring-offset-2
                    ${uiSettings.animationsEnabled ? 'transform hover:scale-105 active:scale-95' : ''}
                  `}
                  aria-label="返回主選單"
                >
                  <svg 
                    className="w-5 h-5 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                    />
                  </svg>
                  <span className="hidden sm:inline text-responsive-sm font-medium">返回主選單</span>
                </button>
              )}

              {/* Mode Indicator */}
              {currentMode !== 'menu' && (
                <div className={`
                  flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 
                  bg-gray-100 dark:bg-gray-700 rounded-child-lg theme-transition
                  ${uiSettings.animationsEnabled ? 'animate-fade-in' : ''}
                `}>
                  <div className="text-base sm:text-child-base flex-shrink-0">
                    {currentMode === 'review' && '📚'}
                    {currentMode === 'exam' && '🎮'}
                  </div>
                  <span className="text-responsive-sm font-semibold text-gray-700 dark:text-gray-300 theme-transition hidden xs:inline">
                    {currentMode === 'review' && '複習模式'}
                    {currentMode === 'exam' && '考試模式'}
                  </span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}