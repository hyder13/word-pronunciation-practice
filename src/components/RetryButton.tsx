import React, { useState } from 'react';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  disabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  disabled = false,
  maxRetries = 3,
  retryDelay = 1000,
  className = '',
  children = '重新嘗試',
  size = 'md',
  variant = 'primary'
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
    outline: 'bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600 dark:hover:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400'
  };

  const handleRetry = async () => {
    if (disabled || isRetrying || retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    
    try {
      await onRetry();
      // 成功後重置重試計數
      setRetryCount(0);
    } catch (error) {
      console.error('Retry failed:', error);
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      // 如果還有重試機會，開始倒數計時
      if (newRetryCount < maxRetries) {
        let timeLeft = retryDelay / 1000;
        setCountdown(timeLeft);
        
        const countdownInterval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            setCountdown(0);
          }
        }, 1000);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const isDisabled = disabled || isRetrying || retryCount >= maxRetries || countdown > 0;
  const remainingRetries = maxRetries - retryCount;

  const getButtonText = () => {
    if (isRetrying) {
      return (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          重試中...
        </span>
      );
    }
    
    if (countdown > 0) {
      return `請等待 ${countdown} 秒`;
    }
    
    if (retryCount >= maxRetries) {
      return '已達最大重試次數';
    }
    
    if (retryCount > 0) {
      return `重新嘗試 (剩餘 ${remainingRetries} 次)`;
    }
    
    return children;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleRetry}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-medium rounded-md border
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
      >
        {getButtonText()}
      </button>
      
      {retryCount > 0 && retryCount < maxRetries && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          已重試 {retryCount} 次，還可重試 {remainingRetries} 次
        </p>
      )}
      
      {retryCount >= maxRetries && (
        <p className="text-xs text-red-500 dark:text-red-400">
          已達最大重試次數，請重新整理頁面或聯繫技術支援
        </p>
      )}
    </div>
  );
};

// 高階組件：為任何組件添加重試功能
interface WithRetryProps {
  children: (retry: () => void, isRetrying: boolean, error: Error | null) => React.ReactNode;
  onAction: () => Promise<void> | void;
  maxRetries?: number;
  retryDelay?: number;
}

export const WithRetry: React.FC<WithRetryProps> = ({
  children,
  onAction,
  maxRetries = 3,
  retryDelay = 1000
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = async () => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    setError(null);

    try {
      await onAction();
      setRetryCount(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setRetryCount(prev => prev + 1);
      
      // 如果還有重試機會，延遲後自動重試
      if (retryCount + 1 < maxRetries) {
        setTimeout(() => {
          retry();
        }, retryDelay);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return <>{children(retry, isRetrying, error)}</>;
};