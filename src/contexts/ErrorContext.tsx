import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ErrorInfo, ErrorState } from '../types';
import { globalErrorHandler } from '../utils/errorHandler';

// Error actions
type ErrorAction =
  | { type: 'SET_ERROR'; payload: ErrorInfo }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_TO_HISTORY'; payload: ErrorInfo }
  | { type: 'CLEAR_HISTORY' };

// Error reducer
const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case 'SET_ERROR':
      return {
        ...state,
        hasError: true,
        error: action.payload,
        errorHistory: [action.payload, ...state.errorHistory.slice(0, 49)]
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        hasError: false,
        error: null
      };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        errorHistory: [action.payload, ...state.errorHistory.slice(0, 49)]
      };
    case 'CLEAR_HISTORY':
      return {
        ...state,
        errorHistory: []
      };
    default:
      return state;
  }
};

// Initial state
const initialErrorState: ErrorState = {
  hasError: false,
  error: null,
  errorHistory: []
};

// Context type
interface ErrorContextType {
  errorState: ErrorState;
  setError: (error: ErrorInfo) => void;
  clearError: () => void;
  clearHistory: () => void;
  showError: (error: ErrorInfo, autoHide?: boolean, duration?: number) => void;
}

// Create context
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Provider props
interface ErrorProviderProps {
  children: ReactNode;
}

// Error provider component
export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errorState, dispatch] = useReducer(errorReducer, initialErrorState);

  useEffect(() => {
    // 監聽全域錯誤處理器
    const unsubscribe = globalErrorHandler.addErrorListener((error: ErrorInfo) => {
      // 避免重複錯誤
      if (!globalErrorHandler.isDuplicateError(error)) {
        dispatch({ type: 'SET_ERROR', payload: error });
      }
    });

    return unsubscribe;
  }, []);

  const setError = (error: ErrorInfo) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
    globalErrorHandler.clearErrorHistory();
  };

  const showError = (error: ErrorInfo, autoHide: boolean = true, duration: number = 5000) => {
    setError(error);
    
    if (autoHide) {
      setTimeout(() => {
        clearError();
      }, duration);
    }
  };

  const value: ErrorContextType = {
    errorState,
    setError,
    clearError,
    clearHistory,
    showError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

// Hook to use error context
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Hook for error handling with automatic retry
export const useErrorHandler = () => {
  const { showError } = useError();

  const handleAsyncOperation = async <T,>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      onError?: (error: ErrorInfo) => void;
      showErrorMessage?: boolean;
    }
  ): Promise<T | null> => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      onError,
      showErrorMessage = true
    } = options || {};

    let lastError: ErrorInfo | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const errorInfo = globalErrorHandler.createError(
          'UNKNOWN_ERROR' as any,
          error instanceof Error ? error.message : '操作失敗',
          error instanceof Error ? error.stack : undefined,
          attempt < maxRetries
        );

        lastError = errorInfo;

        if (onError) {
          onError(errorInfo);
        }

        // 如果不是最後一次嘗試，等待後重試
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // 所有重試都失敗了
    if (lastError && showErrorMessage) {
      showError(lastError);
    }

    return null;
  };

  return {
    handleAsyncOperation,
    showError
  };
};

// Hook for form validation with error handling
export const useFormValidation = () => {
  const { showError } = useError();

  const validateField = (
    value: string,
    rules: {
      required?: boolean;
      pattern?: RegExp;
      minLength?: number;
      maxLength?: number;
      custom?: (value: string) => string | null;
    },
    fieldName: string
  ): string | null => {
    if (rules.required && (!value || value.trim() === '')) {
      const error = globalErrorHandler.handleValidationError(fieldName, '此欄位為必填');
      showError(error, true, 3000);
      return '此欄位為必填';
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      const error = globalErrorHandler.handleValidationError(fieldName, '格式不正確');
      showError(error, true, 3000);
      return '格式不正確';
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      const error = globalErrorHandler.handleValidationError(
        fieldName,
        `至少需要 ${rules.minLength} 個字符`
      );
      showError(error, true, 3000);
      return `至少需要 ${rules.minLength} 個字符`;
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      const error = globalErrorHandler.handleValidationError(
        fieldName,
        `不能超過 ${rules.maxLength} 個字符`
      );
      showError(error, true, 3000);
      return `不能超過 ${rules.maxLength} 個字符`;
    }

    if (value && rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        const error = globalErrorHandler.handleValidationError(fieldName, customError);
        showError(error, true, 3000);
        return customError;
      }
    }

    return null;
  };

  return { validateField };
};