import React from 'react';
import { ErrorInfo, SpeechError, AppError } from '../types';

interface ErrorMessageProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  compact = false
}) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case SpeechError.NOT_SUPPORTED:
      case SpeechError.NO_VOICES:
        return (
          <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        );
      case AppError.NETWORK_ERROR:
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case AppError.STORAGE_ERROR:
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  const getErrorSeverity = () => {
    switch (error.type) {
      case SpeechError.NOT_SUPPORTED:
      case SpeechError.NO_VOICES:
        return 'warning';
      case AppError.VALIDATION_ERROR:
        return 'info';
      case AppError.NETWORK_ERROR:
      case AppError.STORAGE_ERROR:
      case AppError.UNKNOWN_ERROR:
      default:
        return 'error';
    }
  };

  const severity = getErrorSeverity();
  
  const severityClasses = {
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 p-3 rounded-md border ${severityClasses[severity]} ${className}`}>
        {getErrorIcon()}
        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
          {error.message}
        </span>
        {error.canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            重試
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${severityClasses[severity]} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
            錯誤訊息
          </h3>
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            <p>{error.message}</p>
          </div>
          
          {error.details && import.meta.env.DEV && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                技術詳情
              </summary>
              <pre className="mt-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-24">
                {error.details}
              </pre>
            </details>
          )}
          
          <div className="mt-3 flex space-x-2">
            {error.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                重新嘗試
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                關閉
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {error.timestamp.toLocaleString()}
      </div>
    </div>
  );
};