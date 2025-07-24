import React, { useEffect, useState } from 'react';
import { useError } from '../contexts/ErrorContext';
import { ErrorMessage } from './ErrorMessage';
import { RetryButton } from './RetryButton';

interface ErrorNotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  autoHide?: boolean;
  duration?: number;
  maxVisible?: number;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  position = 'top-right',
  autoHide = true,
  duration = 5000,
  maxVisible = 3
}) => {
  const { errorState, clearError } = useError();
  const [visibleErrors, setVisibleErrors] = useState<string[]>([]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  useEffect(() => {
    if (errorState.hasError && errorState.error) {
      const errorId = `${errorState.error.type}-${errorState.error.timestamp.getTime()}`;
      
      if (!visibleErrors.includes(errorId)) {
        setVisibleErrors(prev => {
          const newErrors = [errorId, ...prev].slice(0, maxVisible);
          return newErrors;
        });

        if (autoHide) {
          setTimeout(() => {
            setVisibleErrors(prev => prev.filter(id => id !== errorId));
            if (errorState.error && `${errorState.error.type}-${errorState.error.timestamp.getTime()}` === errorId) {
              clearError();
            }
          }, duration);
        }
      }
    }
  }, [errorState.hasError, errorState.error, autoHide, duration, maxVisible, visibleErrors, clearError]);

  const handleDismiss = (errorId: string) => {
    setVisibleErrors(prev => prev.filter(id => id !== errorId));
    if (errorState.error && `${errorState.error.type}-${errorState.error.timestamp.getTime()}` === errorId) {
      clearError();
    }
  };

  const handleRetry = async () => {
    // 這裡可以實現重試邏輯，例如重新載入頁面或重新執行失敗的操作
    window.location.reload();
  };

  if (!errorState.hasError || !errorState.error || visibleErrors.length === 0) {
    return null;
  }

  const currentErrorId = `${errorState.error.type}-${errorState.error.timestamp.getTime()}`;
  
  if (!visibleErrors.includes(currentErrorId)) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${positionClasses[position]} max-w-sm w-full`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                發生錯誤
              </h3>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                <p>{errorState.error.message}</p>
              </div>
              
              {errorState.error.canRetry && (
                <div className="mt-3">
                  <RetryButton
                    onRetry={handleRetry}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    重新嘗試
                  </RetryButton>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => handleDismiss(currentErrorId)}
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">關閉</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar for auto-hide */}
        {autoHide && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-blue-500 transition-all ease-linear"
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      

    </div>
  );
};

// Toast-style error notifications
export const ErrorToast: React.FC<{
  errors: Array<{ id: string; error: any; timestamp: Date }>;
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}> = ({ errors, onDismiss, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${positionClasses[position]} space-y-2`}>
      {errors.map((item) => (
        <div
          key={item.id}
          className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
        >
          <ErrorMessage
            error={item.error}
            onDismiss={() => onDismiss(item.id)}
            compact
          />
        </div>
      ))}
    </div>
  );
};