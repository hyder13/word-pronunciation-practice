import { ErrorInfo, AppError, SpeechError } from '../types';

// 錯誤訊息本地化
export const ErrorMessages = {
  [SpeechError.NOT_SUPPORTED]: '您的瀏覽器不支援語音功能，請使用Chrome或Firefox',
  [SpeechError.NO_VOICES]: '找不到可用的語音，請檢查瀏覽器設定',
  [SpeechError.SYNTHESIS_FAILED]: '語音播放失敗，請重新嘗試',
  [SpeechError.INTERRUPTED]: '語音播放被中斷',
  [AppError.STORAGE_ERROR]: '儲存資料時發生錯誤，請重新整理頁面',
  [AppError.VALIDATION_ERROR]: '輸入的資料格式不正確',
  [AppError.NETWORK_ERROR]: '網路連線發生問題，請檢查網路狀態',
  [AppError.UNKNOWN_ERROR]: '發生未知錯誤，請重新嘗試'
};

// 全域錯誤處理器類別
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorListeners: ((error: ErrorInfo) => void)[] = [];
  private errorHistory: ErrorInfo[] = [];
  private maxHistorySize = 50;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  // 設置全域錯誤監聽器
  private setupGlobalErrorHandlers() {
    // 捕獲未處理的 JavaScript 錯誤
    window.addEventListener('error', (event) => {
      const errorInfo: ErrorInfo = {
        type: AppError.UNKNOWN_ERROR,
        message: event.message || '發生未知的JavaScript錯誤',
        details: `File: ${event.filename}, Line: ${event.lineno}, Column: ${event.colno}`,
        timestamp: new Date(),
        canRetry: true
      };
      this.handleError(errorInfo);
    });

    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      const errorInfo: ErrorInfo = {
        type: AppError.UNKNOWN_ERROR,
        message: '發生未處理的Promise錯誤',
        details: event.reason?.toString() || 'Unknown promise rejection',
        timestamp: new Date(),
        canRetry: true
      };
      this.handleError(errorInfo);
    });
  }

  // 處理錯誤
  handleError(error: ErrorInfo) {
    // 添加到錯誤歷史
    this.addToHistory(error);
    
    // 記錄到控制台
    console.error('Global Error Handler:', error);
    
    // 通知所有監聽器
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  // 創建錯誤資訊
  createError(
    type: SpeechError | AppError,
    customMessage?: string,
    details?: string,
    canRetry: boolean = true
  ): ErrorInfo {
    return {
      type,
      message: customMessage || ErrorMessages[type] || '發生未知錯誤',
      details,
      timestamp: new Date(),
      canRetry
    };
  }

  // 處理語音錯誤
  handleSpeechError(error: SpeechError, details?: string): ErrorInfo {
    const errorInfo = this.createError(error, undefined, details);
    this.handleError(errorInfo);
    return errorInfo;
  }

  // 處理儲存錯誤
  handleStorageError(operation: string, originalError?: Error): ErrorInfo {
    const errorInfo = this.createError(
      AppError.STORAGE_ERROR,
      `儲存操作失敗: ${operation}`,
      originalError?.message
    );
    this.handleError(errorInfo);
    return errorInfo;
  }

  // 處理驗證錯誤
  handleValidationError(field: string, message: string): ErrorInfo {
    const errorInfo = this.createError(
      AppError.VALIDATION_ERROR,
      `${field}: ${message}`,
      undefined,
      false // 驗證錯誤通常不需要重試
    );
    this.handleError(errorInfo);
    return errorInfo;
  }

  // 處理網路錯誤
  handleNetworkError(details?: string): ErrorInfo {
    const errorInfo = this.createError(AppError.NETWORK_ERROR, undefined, details);
    this.handleError(errorInfo);
    return errorInfo;
  }

  // 添加錯誤監聽器
  addErrorListener(listener: (error: ErrorInfo) => void) {
    this.errorListeners.push(listener);
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  // 獲取錯誤歷史
  getErrorHistory(): ErrorInfo[] {
    return [...this.errorHistory];
  }

  // 清除錯誤歷史
  clearErrorHistory() {
    this.errorHistory = [];
  }

  // 添加到錯誤歷史
  private addToHistory(error: ErrorInfo) {
    this.errorHistory.unshift(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  // 檢查是否為重複錯誤
  isDuplicateError(error: ErrorInfo, timeWindow: number = 5000): boolean {
    const now = error.timestamp.getTime();
    return this.errorHistory.some(historyError => 
      historyError.type === error.type &&
      historyError.message === error.message &&
      (now - historyError.timestamp.getTime()) < timeWindow
    );
  }
}

// 導出單例實例
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// 便利函數
export const handleError = (error: ErrorInfo) => globalErrorHandler.handleError(error);
export const createError = (
  type: SpeechError | AppError,
  message?: string,
  details?: string,
  canRetry?: boolean
) => globalErrorHandler.createError(type, message, details, canRetry);