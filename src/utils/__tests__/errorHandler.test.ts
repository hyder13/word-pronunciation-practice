import { vi } from 'vitest';
import { GlobalErrorHandler, globalErrorHandler, ErrorMessages } from '../errorHandler';
import { AppError, SpeechError, ErrorInfo } from '../../types';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;

  beforeEach(() => {
    handler = GlobalErrorHandler.getInstance();
    handler.clearErrorHistory();
  });

  afterEach(() => {
    // Clean up event listeners
    handler.clearErrorHistory();
  });

  describe('Singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = GlobalErrorHandler.getInstance();
      const instance2 = GlobalErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Error creation', () => {
    it('creates error with default message', () => {
      const error = handler.createError(AppError.STORAGE_ERROR);
      
      expect(error.type).toBe(AppError.STORAGE_ERROR);
      expect(error.message).toBe(ErrorMessages[AppError.STORAGE_ERROR]);
      expect(error.canRetry).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('creates error with custom message', () => {
      const customMessage = 'Custom error message';
      const error = handler.createError(AppError.STORAGE_ERROR, customMessage);
      
      expect(error.message).toBe(customMessage);
    });

    it('creates error with details and retry flag', () => {
      const error = handler.createError(
        AppError.VALIDATION_ERROR,
        'Custom message',
        'Error details',
        false
      );
      
      expect(error.details).toBe('Error details');
      expect(error.canRetry).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('adds error to history', () => {
      const error = handler.createError(AppError.STORAGE_ERROR);
      handler.handleError(error);
      
      const history = handler.getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toBe(error);
    });

    it('notifies error listeners', () => {
      const listener = vi.fn();
      const unsubscribe = handler.addErrorListener(listener);
      
      const error = handler.createError(AppError.STORAGE_ERROR);
      handler.handleError(error);
      
      expect(listener).toHaveBeenCalledWith(error);
      
      unsubscribe();
    });

    it('limits error history size', () => {
      // Add more than max history size
      for (let i = 0; i < 60; i++) {
        const error = handler.createError(AppError.STORAGE_ERROR, `Error ${i}`);
        handler.handleError(error);
      }
      
      const history = handler.getErrorHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Specific error handlers', () => {
    it('handles speech errors', () => {
      const listener = vi.fn();
      handler.addErrorListener(listener);
      
      const errorInfo = handler.handleSpeechError(SpeechError.NOT_SUPPORTED, 'Details');
      
      expect(errorInfo.type).toBe(SpeechError.NOT_SUPPORTED);
      expect(errorInfo.message).toBe(ErrorMessages[SpeechError.NOT_SUPPORTED]);
      expect(errorInfo.details).toBe('Details');
      expect(listener).toHaveBeenCalledWith(errorInfo);
    });

    it('handles storage errors', () => {
      const listener = vi.fn();
      handler.addErrorListener(listener);
      
      const errorInfo = handler.handleStorageError('save operation');
      
      expect(errorInfo.type).toBe(AppError.STORAGE_ERROR);
      expect(errorInfo.message).toContain('save operation');
      expect(listener).toHaveBeenCalledWith(errorInfo);
    });

    it('handles validation errors', () => {
      const listener = vi.fn();
      handler.addErrorListener(listener);
      
      const errorInfo = handler.handleValidationError('email', 'Invalid format');
      
      expect(errorInfo.type).toBe(AppError.VALIDATION_ERROR);
      expect(errorInfo.message).toBe('email: Invalid format');
      expect(errorInfo.canRetry).toBe(false);
      expect(listener).toHaveBeenCalledWith(errorInfo);
    });

    it('handles network errors', () => {
      const listener = vi.fn();
      handler.addErrorListener(listener);
      
      const errorInfo = handler.handleNetworkError('Connection timeout');
      
      expect(errorInfo.type).toBe(AppError.NETWORK_ERROR);
      expect(errorInfo.details).toBe('Connection timeout');
      expect(listener).toHaveBeenCalledWith(errorInfo);
    });
  });

  describe('Duplicate error detection', () => {
    it('detects duplicate errors within time window', () => {
      const error1 = handler.createError(AppError.STORAGE_ERROR, 'Same message');
      const error2 = handler.createError(AppError.STORAGE_ERROR, 'Same message');
      
      handler.handleError(error1);
      
      // Set error2 timestamp to be within the time window
      error2.timestamp = new Date(error1.timestamp.getTime() + 1000);
      
      const isDuplicate = handler.isDuplicateError(error2, 5000);
      expect(isDuplicate).toBe(true);
    });

    it('does not detect duplicates outside time window', () => {
      const error1 = handler.createError(AppError.STORAGE_ERROR, 'Same message');
      const error2 = handler.createError(AppError.STORAGE_ERROR, 'Same message');
      
      handler.handleError(error1);
      
      // Set error2 timestamp to be outside the time window
      error2.timestamp = new Date(error1.timestamp.getTime() + 10000);
      
      const isDuplicate = handler.isDuplicateError(error2, 5000);
      expect(isDuplicate).toBe(false);
    });

    it('does not detect duplicates with different messages', () => {
      const error1 = handler.createError(AppError.STORAGE_ERROR, 'Message 1');
      const error2 = handler.createError(AppError.STORAGE_ERROR, 'Message 2');
      
      handler.handleError(error1);
      
      const isDuplicate = handler.isDuplicateError(error2);
      expect(isDuplicate).toBe(false);
    });
  });

  describe('Error listener management', () => {
    it('removes error listeners correctly', () => {
      const listener = vi.fn();
      const unsubscribe = handler.addErrorListener(listener);
      
      const error = handler.createError(AppError.STORAGE_ERROR);
      handler.handleError(error);
      expect(listener).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      
      handler.handleError(error);
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('handles errors in error listeners gracefully', () => {
      const faultyListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();
      
      handler.addErrorListener(faultyListener);
      handler.addErrorListener(goodListener);
      
      const error = handler.createError(AppError.STORAGE_ERROR);
      
      // Should not throw despite faulty listener
      expect(() => handler.handleError(error)).not.toThrow();
      
      // Good listener should still be called
      expect(goodListener).toHaveBeenCalledWith(error);
    });
  });

  describe('Error history management', () => {
    it('clears error history', () => {
      const error = handler.createError(AppError.STORAGE_ERROR);
      handler.handleError(error);
      
      expect(handler.getErrorHistory()).toHaveLength(1);
      
      handler.clearErrorHistory();
      
      expect(handler.getErrorHistory()).toHaveLength(0);
    });

    it('returns copy of error history', () => {
      const error = handler.createError(AppError.STORAGE_ERROR);
      handler.handleError(error);
      
      const history1 = handler.getErrorHistory();
      const history2 = handler.getErrorHistory();
      
      expect(history1).not.toBe(history2); // Different array instances
      expect(history1).toEqual(history2); // Same content
    });
  });
});

describe('Error Messages', () => {
  it('has messages for all error types', () => {
    // Check SpeechError messages
    Object.values(SpeechError).forEach(errorType => {
      expect(ErrorMessages[errorType]).toBeDefined();
      expect(typeof ErrorMessages[errorType]).toBe('string');
    });

    // Check AppError messages
    Object.values(AppError).forEach(errorType => {
      expect(ErrorMessages[errorType]).toBeDefined();
      expect(typeof ErrorMessages[errorType]).toBe('string');
    });
  });

  it('provides meaningful error messages', () => {
    expect(ErrorMessages[SpeechError.NOT_SUPPORTED]).toContain('瀏覽器不支援');
    expect(ErrorMessages[AppError.STORAGE_ERROR]).toContain('儲存');
    expect(ErrorMessages[AppError.NETWORK_ERROR]).toContain('網路');
  });
});

describe('Exported functions', () => {
  it('handleError function works', async () => {
    const listener = vi.fn();
    globalErrorHandler.addErrorListener(listener);
    
    const error: ErrorInfo = {
      type: AppError.STORAGE_ERROR,
      message: 'Test error',
      timestamp: new Date(),
      canRetry: true
    };
    
    // Use the exported function
    const { handleError } = await import('../errorHandler');
    handleError(error);
    
    expect(listener).toHaveBeenCalledWith(error);
  });

  it('createError function works', async () => {
    const { createError } = await import('../errorHandler');
    const error = createError(AppError.STORAGE_ERROR, 'Custom message');
    
    expect(error.type).toBe(AppError.STORAGE_ERROR);
    expect(error.message).toBe('Custom message');
  });
});