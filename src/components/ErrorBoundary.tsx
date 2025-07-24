import React, { Component, ReactNode } from 'react';
import { ErrorInfo, AppError } from '../types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 以顯示錯誤 UI
    const errorInfo: ErrorInfo = {
      type: AppError.UNKNOWN_ERROR,
      message: error.message || '發生未知錯誤',
      details: error.stack,
      timestamp: new Date(),
      canRetry: true
    };

    return {
      hasError: true,
      error: errorInfo
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 記錄錯誤到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    const appErrorInfo: ErrorInfo = {
      type: AppError.UNKNOWN_ERROR,
      message: error.message || '發生未知錯誤',
      details: `${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`,
      timestamp: new Date(),
      canRetry: true
    };

    // 呼叫父組件的錯誤處理函數
    if (this.props.onError) {
      this.props.onError(appErrorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定義的 fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 預設的錯誤 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-500"
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
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  哎呀！出現了一些問題
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {this.state.error?.message || '應用程式遇到了意外錯誤'}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                重新嘗試
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                重新載入頁面
              </button>
            </div>

            {import.meta.env.DEV && this.state.error?.details && (
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  技術詳情 (開發模式)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.details}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}