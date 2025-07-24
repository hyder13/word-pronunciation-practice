import { useState, useEffect } from 'react';
import { useUISettings } from '../contexts/AppContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const uiSettings = useUISettings();

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check for standalone mode (iOS)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check for PWA mode (iOS Safari)
      const isPWA = (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandalone || isPWA);
    };

    checkIfInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay if not already installed
      if (!isInstalled) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 5000); // Show after 5 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50">
      <div className={`
        bg-white dark:bg-gray-800 rounded-child-lg shadow-child-lg border-2 border-childPrimary-200 dark:border-childPrimary-700
        p-4 sm:p-6 theme-transition
        ${uiSettings.animationsEnabled ? 'animate-slide-up' : ''}
      `}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl sm:text-3xl">📱</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-responsive-sm font-bold text-gray-800 dark:text-gray-100 mb-2 theme-transition">
              安裝到主畫面
            </h3>
            <p className="text-responsive-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed theme-transition">
              將單字練習安裝到您的裝置，享受更好的學習體驗！
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className={`
                  flex-1 bg-childPrimary-500 hover:bg-childPrimary-600 active:bg-childPrimary-700
                  text-white font-bold py-2 px-4 rounded-child text-responsive-xs
                  transition-all duration-200 theme-transition
                  focus:outline-none focus:ring-2 focus:ring-childPrimary-300 focus:ring-offset-2
                  ${uiSettings.animationsEnabled ? 'transform hover:scale-105 active:scale-95' : ''}
                `}
              >
                📥 安裝
              </button>
              <button
                onClick={handleDismiss}
                className={`
                  px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                  rounded-child text-responsive-xs font-medium
                  transition-all duration-200 theme-transition
                  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                  ${uiSettings.animationsEnabled ? 'transform hover:scale-105 active:scale-95' : ''}
                `}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}