import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorMessage } from '../ErrorMessage';
import { AppError, SpeechError, ErrorInfo } from '../../types';

describe('ErrorMessage', () => {
    const mockError: ErrorInfo = {
        type: AppError.VALIDATION_ERROR,
        message: 'Test error message',
        details: 'Error details',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        canRetry: true
    };

    it('renders error message correctly', () => {
        render(<ErrorMessage error={mockError} />);

        expect(screen.getByText('錯誤訊息')).toBeInTheDocument();
        expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('shows retry button when error can be retried', () => {
        const onRetry = vi.fn();

        render(<ErrorMessage error={mockError} onRetry={onRetry} />);

        const retryButton = screen.getByText('重新嘗試');
        expect(retryButton).toBeInTheDocument();

        fireEvent.click(retryButton);
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button when error cannot be retried', () => {
        const nonRetryableError: ErrorInfo = {
            ...mockError,
            canRetry: false
        };

        render(<ErrorMessage error={nonRetryableError} />);

        expect(screen.queryByText('重新嘗試')).not.toBeInTheDocument();
    });

    it('shows dismiss button when onDismiss is provided', () => {
        const onDismiss = vi.fn();

        render(<ErrorMessage error={mockError} onDismiss={onDismiss} />);

        const dismissButton = screen.getByText('關閉');
        expect(dismissButton).toBeInTheDocument();

        fireEvent.click(dismissButton);
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders in compact mode', () => {
        render(<ErrorMessage error={mockError} compact />);

        // In compact mode, should not show the "錯誤訊息" title
        expect(screen.queryByText('錯誤訊息')).not.toBeInTheDocument();
        expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('shows different icons for different error types', () => {
        const speechError: ErrorInfo = {
            ...mockError,
            type: SpeechError.NOT_SUPPORTED
        };

        const { rerender } = render(<ErrorMessage error={speechError} />);

        // Should render without throwing
        expect(screen.getByText('Test error message')).toBeInTheDocument();

        // Test network error
        const networkError: ErrorInfo = {
            ...mockError,
            type: AppError.NETWORK_ERROR
        };

        rerender(<ErrorMessage error={networkError} />);
        expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('shows technical details in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        render(<ErrorMessage error={mockError} />);

        expect(screen.getByText('技術詳情')).toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });

    it('hides technical details in production mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        render(<ErrorMessage error={mockError} />);

        expect(screen.queryByText('技術詳情')).not.toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });

    it('displays timestamp', () => {
        render(<ErrorMessage error={mockError} />);

        // Should show formatted timestamp
        expect(screen.getByText(/2023/)).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <ErrorMessage error={mockError} className="custom-class" />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });
});