import { useState, useEffect } from 'react';
import { checkCriticalFeatures, getBrowserInfo } from '../utils/browserCompat';
import { useUISettings } from '../contexts/AppContext';

export function BrowserCompatWarning() {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const uiSettings = useUISettings();

  useEffect(() => {
    // Check if warning was already dismissed in this session
    const wasDismissed = sessionStorage.getItem('browser-warning-dismissed') === 'true';
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Check browser compatibility
    const features = checkCriticalFeatures();
    const browserInfo = getBrowserInfo();
    
    if (features.warnings.length > 0 || !browserInfo.isSupported) {
      setWarnings(features.warnings);
      setShowWarning(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowWarning(false);
    setDismissed(true);
    sessionStorage.setItem('browser-warning-dismissed', 'true');
  };

  const handleUpgrade = () => {
    // Provide links to download modern browsers
    const browserInfo = getBrowserInfo();
    let downloadUrl = '';
    
    switch (browserInfo.name) {
      case 'Chrome':
        downloadUrl = 'https://www.google.com/chrome/';
        break;
      case 'Firefox':
        downloadUrl = 'https://www.mozilla.org/firefox/';
        break;
      case 'Safari':
        // Safari updates come through system updates
        alert('請透過系統更新來升級 Safari 瀏覽器');
        return;
      case 'Edge':
        downloadUrl = 'https://www.microsoft.com/edge/';
        break;
      default:
        downloadUrl = 'https://www.google.com/chrome/';
    }
    
    window.open(downloadUrl, '_blank');
  };

  if (!showWarning || dismissed || warnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning-500 text-white shadow-lg">
      <div className="container-responsive py-3">
        <div className="flex items-start space-x-3">
          <div className="text-xl sm:text-2xl flex-shrink-0">⚠️</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-responsive-sm mb-2">
              瀏覽器兼容性提醒
            </h3>
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <p key={index} className="text-responsive-xs leading-relaxed">
                  • {warning}
                </p>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <button
                onClick={handleUpgrade}
                className={`
                  bg-white text-warning-600 hover:bg-gray-100 active:bg-gray-200
                  font-bold py-2 px-4 rounded-child text-responsive-xs
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-warning-500
                  ${uiSettings.animationsEnabled ? 'transform hover:scale-105 active:scale-95' : ''}
                `}
              >
                🔄 升級瀏覽器
              </button>
              <button
                onClick={handleDismiss}
                className={`
                  bg-transparent border-2 border-white text-white hover:bg-white hover:text-warning-600
                  font-bold py-2 px-4 rounded-child text-responsive-xs
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-warning-500
                  ${uiSettings.animationsEnabled ? 'transform hover:scale-105 active:scale-95' : ''}
                `}
              >
                ✕ 關閉提醒
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}