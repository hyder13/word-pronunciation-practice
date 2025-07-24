// Browser compatibility utilities and polyfills

// Check if Web Speech API is supported
export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

// Check if Service Worker is supported
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

// Check if localStorage is supported and available
export function isLocalStorageSupported(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Check if the device supports touch
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Check if the device is mobile
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Check if the device is iOS
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Check if the device is Android
export function isAndroidDevice(): boolean {
  return /Android/.test(navigator.userAgent);
}

// Get browser information
export function getBrowserInfo(): {
  name: string;
  version: string;
  isSupported: boolean;
} {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let isSupported = true;

  // Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = parseInt(browserVersion) >= 80; // Chrome 80+ for good Web Speech API support
  }
  // Firefox
  else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = parseInt(browserVersion) >= 75; // Firefox 75+ for better compatibility
  }
  // Safari
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = parseInt(browserVersion) >= 13; // Safari 13+ for Web Speech API
  }
  // Edge
  else if (userAgent.includes('Edg')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    isSupported = parseInt(browserVersion) >= 80; // Edge 80+ (Chromium-based)
  }
  // Internet Explorer (not supported)
  else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    browserName = 'Internet Explorer';
    isSupported = false;
  }

  return { name: browserName, version: browserVersion, isSupported };
}

// Polyfill for requestAnimationFrame
export function polyfillRequestAnimationFrame(): void {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      return window.setTimeout(callback, 1000 / 60);
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id: number): void => {
      clearTimeout(id);
    };
  }
}

// Polyfill for CSS.supports
export function polyfillCSSSupports(): void {
  if (!window.CSS || !window.CSS.supports) {
    if (!window.CSS) {
      (window as any).CSS = {};
    }
    
    window.CSS.supports = (property: string, value?: string): boolean => {
      // Basic polyfill - just return true for common properties
      const commonProperties = [
        'display', 'position', 'color', 'background', 'border',
        'margin', 'padding', 'width', 'height', 'font-size',
        'transform', 'transition', 'animation', 'flex', 'grid'
      ];
      
      if (value === undefined) {
        // CSS.supports(propertyValue) format
        return true; // Assume supported for simplicity
      }
      
      return commonProperties.some(prop => property.includes(prop));
    };
  }
}

// Polyfill for IntersectionObserver (for future use)
export function polyfillIntersectionObserver(): void {
  if (!window.IntersectionObserver) {
    // Simple polyfill that always calls the callback
    (window as any).IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      
      observe() {
        // Simple implementation - call callback immediately
        setTimeout(() => {
          this.callback([{
            isIntersecting: true,
            target: document.body,
            intersectionRatio: 1,
            boundingClientRect: document.body.getBoundingClientRect(),
            intersectionRect: document.body.getBoundingClientRect(),
            rootBounds: document.body.getBoundingClientRect(),
            time: Date.now()
          }] as any, this as any);
        }, 100);
      }
      
      unobserve() {}
      disconnect() {}
      
      private callback: IntersectionObserverCallback;
    };
  }
}

// Initialize all polyfills
export function initializePolyfills(): void {
  polyfillRequestAnimationFrame();
  polyfillCSSSupports();
  polyfillIntersectionObserver();
}

// Check for critical feature support and show warnings
export function checkCriticalFeatures(): {
  speechSynthesis: boolean;
  localStorage: boolean;
  serviceWorker: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  const speechSynthesis = isSpeechSynthesisSupported();
  if (!speechSynthesis) {
    warnings.push('您的瀏覽器不支援語音合成功能，請使用 Chrome、Firefox 或 Safari 的最新版本');
  }
  
  const localStorage = isLocalStorageSupported();
  if (!localStorage) {
    warnings.push('無法使用本地儲存功能，您的學習進度可能無法保存');
  }
  
  const serviceWorker = isServiceWorkerSupported();
  if (!serviceWorker) {
    warnings.push('您的瀏覽器不支援離線功能');
  }
  
  const browserInfo = getBrowserInfo();
  if (!browserInfo.isSupported) {
    warnings.push(`您的瀏覽器 (${browserInfo.name} ${browserInfo.version}) 可能不完全支援此應用程式的功能，建議升級到最新版本`);
  }
  
  return {
    speechSynthesis,
    localStorage,
    serviceWorker,
    warnings
  };
}

// Add CSS classes based on browser capabilities
export function addBrowserClasses(): void {
  const html = document.documentElement;
  
  // Add touch/no-touch classes
  if (isTouchDevice()) {
    html.classList.add('touch');
  } else {
    html.classList.add('no-touch');
  }
  
  // Add mobile/desktop classes
  if (isMobileDevice()) {
    html.classList.add('mobile');
  } else {
    html.classList.add('desktop');
  }
  
  // Add platform-specific classes
  if (isIOSDevice()) {
    html.classList.add('ios');
  } else if (isAndroidDevice()) {
    html.classList.add('android');
  }
  
  // Add browser-specific classes
  const browserInfo = getBrowserInfo();
  html.classList.add(`browser-${browserInfo.name.toLowerCase()}`);
  
  // Add feature support classes
  const features = checkCriticalFeatures();
  if (features.speechSynthesis) {
    html.classList.add('speech-supported');
  } else {
    html.classList.add('no-speech');
  }
  
  if (features.localStorage) {
    html.classList.add('localstorage-supported');
  } else {
    html.classList.add('no-localstorage');
  }
}