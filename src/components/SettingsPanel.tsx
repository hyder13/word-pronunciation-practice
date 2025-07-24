import { useUISettings, useAppContext } from '../contexts/AppContext';
import { UISettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const uiSettings = useUISettings();
  const { updateUISettings } = useAppContext();

  const handleThemeChange = (theme: UISettings['theme']) => {
    updateUISettings({ theme });
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFontSizeChange = (fontSize: UISettings['fontSize']) => {
    updateUISettings({ fontSize });
    // Apply font size class to body
    document.body.className = document.body.className
      .replace(/font-size-(small|medium|large)/g, '')
      .trim();
    document.body.classList.add(`font-size-${fontSize}`);
  };

  const handleAnimationsToggle = () => {
    const newAnimationsEnabled = !uiSettings.animationsEnabled;
    updateUISettings({ animationsEnabled: newAnimationsEnabled });
    
    // Apply no-animations class to body if disabled
    if (newAnimationsEnabled) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="settings-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Settings Panel */}
      <div 
        className={`settings-panel ${isOpen ? 'open' : 'closed'}`}
        role="dialog"
        aria-labelledby="settings-title"
        aria-modal="true"
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 
              id="settings-title"
              className="text-child-xl font-bold text-gray-800 dark:text-gray-100"
            >
              ⚙️ 設定
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-child transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-childPrimary-500"
              aria-label="關閉設定面板"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Theme Setting */}
          <div className="mb-8">
            <h3 className="text-child-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              🌙 主題模式
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={uiSettings.theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="w-5 h-5 text-childPrimary-500 focus:ring-childPrimary-500 focus:ring-2"
                />
                <span className="text-child-base font-medium text-gray-700 dark:text-gray-300">
                  ☀️ 淺色模式
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={uiSettings.theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="w-5 h-5 text-childPrimary-500 focus:ring-childPrimary-500 focus:ring-2"
                />
                <span className="text-child-base font-medium text-gray-700 dark:text-gray-300">
                  🌙 深色模式
                </span>
              </label>
            </div>
          </div>

          {/* Font Size Setting */}
          <div className="mb-8">
            <h3 className="text-child-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              📝 字體大小
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="fontSize"
                  value="small"
                  checked={uiSettings.fontSize === 'small'}
                  onChange={() => handleFontSizeChange('small')}
                  className="w-5 h-5 text-childPrimary-500 focus:ring-childPrimary-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🔍 小字體
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="fontSize"
                  value="medium"
                  checked={uiSettings.fontSize === 'medium'}
                  onChange={() => handleFontSizeChange('medium')}
                  className="w-5 h-5 text-childPrimary-500 focus:ring-childPrimary-500 focus:ring-2"
                />
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                  📄 中字體
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="fontSize"
                  value="large"
                  checked={uiSettings.fontSize === 'large'}
                  onChange={() => handleFontSizeChange('large')}
                  className="w-5 h-5 text-childPrimary-500 focus:ring-childPrimary-500 focus:ring-2"
                />
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  🔍 大字體
                </span>
              </label>
            </div>
          </div>

          {/* Animations Setting */}
          <div className="mb-8">
            <h3 className="text-child-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              ✨ 動畫效果
            </h3>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={uiSettings.animationsEnabled}
                onChange={handleAnimationsToggle}
                className="w-5 h-5 text-childPrimary-500 focus:ring-childPrimary-500 focus:ring-2 rounded"
              />
              <span className="text-child-base font-medium text-gray-700 dark:text-gray-300">
                啟用動畫效果
              </span>
            </label>
            <p className="text-child-sm text-gray-500 dark:text-gray-400 mt-2 ml-8">
              關閉動畫可以提升效能並減少視覺干擾
            </p>
          </div>

          {/* Preview Section */}
          <div className="mb-8">
            <h3 className="text-child-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              👀 預覽
            </h3>
            <div className="card-child">
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="text-child-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                  範例標題
                </h4>
                <p className="text-child-base text-gray-600 dark:text-gray-300 mb-4">
                  這是一個範例文字，用來預覽當前的字體大小和主題設定。
                </p>
                <button className="btn-child-primary">
                  範例按鈕
                </button>
              </div>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={() => {
                handleThemeChange('light');
                handleFontSizeChange('medium');
                updateUISettings({ animationsEnabled: true });
                document.body.classList.remove('no-animations');
              }}
              className="w-full btn-child-secondary text-child-sm"
            >
              🔄 重設為預設值
            </button>
          </div>
        </div>
      </div>
    </>
  );
}