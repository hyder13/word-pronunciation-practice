import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { RetryButton, WithRetry } from '../RetryButton';

describe('RetryButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders with default text', () => {
    const onRetry = vi.fn();
    render(<RetryButton onRetry={onRetry} />);

    expect(screen.getByText('重新嘗試')).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    const onRetry = vi.fn();
    render(<RetryButton onRetry={onRetry}>Custom Retry</RetryButton>);

    expect(screen.getByText('Custom Retry')).toBeInTheDocument();
  });

  it('calls onRetry when clicked', async () => {
    const onRetry = vi.fn().mockResolvedValue(undefined);
    render(<RetryButton onRetry={onRetry} />);

    fireEvent.click(screen.getByText('重新嘗試'));

    await waitFor(() => {
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state during retry', async () => {
    const onRetry = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<RetryButton onRetry={onRetry} />);

    fireEvent.click(screen.getByText('重新嘗試'));

    expect(screen.getByText('重試中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles retry failure and shows countdown', async () => {
    const onRetry = vi.fn().mockRejectedValue(new Error('Retry failed'));
    render(<RetryButton onRetry={onRetry} retryDelay={3000} />);

    fireEvent.click(screen.getByText('重新嘗試'));

    await waitFor(() => {
      expect(screen.getByText('請等待 3 秒')).toBeInTheDocument();
    });

    // Fast-forward time
    vi.advanceTimersByTime(1000);
    expect(screen.getByText('請等待 2 秒')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    expect(screen.getByText('請等待 1 秒')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    expect(screen.getByText('重新嘗試 (剩餘 2 次)')).toBeInTheDocument();
  });

  it('disables button after max retries', async () => {
    const onRetry = vi.fn().mockRejectedValue(new Error('Always fails'));
    render(<RetryButton onRetry={onRetry} maxRetries={2} retryDelay={1000} />);

    // First retry
    fireEvent.click(screen.getByText('重新嘗試'));
    await waitFor(() => {
      expect(screen.getByText('請等待 1 秒')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(1000);

    // Second retry
    fireEvent.click(screen.getByText('重新嘗試 (剩餘 1 次)'));
    await waitFor(() => {
      expect(screen.getByText('請等待 1 秒')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(1000);

    // Should be disabled now
    expect(screen.getByText('已達最大重試次數')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('resets retry count on successful retry', async () => {
    let shouldFail = true;
    const onRetry = vi.fn().mockImplementation(() => {
      if (shouldFail) {
        shouldFail = false;
        return Promise.reject(new Error('First attempt fails'));
      }
      return Promise.resolve();
    });

    render(<RetryButton onRetry={onRetry} retryDelay={1000} />);

    // First attempt (fails)
    fireEvent.click(screen.getByText('重新嘗試'));
    await waitFor(() => {
      expect(screen.getByText('請等待 1 秒')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(1000);

    // Second attempt (succeeds)
    fireEvent.click(screen.getByText('重新嘗試 (剩餘 2 次)'));
    await waitFor(() => {
      expect(screen.getByText('重新嘗試')).toBeInTheDocument();
    });
  });

  it('respects disabled prop', () => {
    const onRetry = vi.fn();
    render(<RetryButton onRetry={onRetry} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('applies different sizes correctly', () => {
    const onRetry = vi.fn();
    const { rerender } = render(<RetryButton onRetry={onRetry} size="sm" />);
    
    expect(screen.getByRole('button')).toHaveClass('px-2', 'py-1', 'text-xs');

    rerender(<RetryButton onRetry={onRetry} size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('applies different variants correctly', () => {
    const onRetry = vi.fn();
    const { rerender } = render(<RetryButton onRetry={onRetry} variant="secondary" />);
    
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600');

    rerender(<RetryButton onRetry={onRetry} variant="outline" />);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent', 'border-blue-600');
  });
});

describe('WithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('provides retry function to children', () => {
    const onAction = vi.fn().mockResolvedValue(undefined);
    
    render(
      <WithRetry onAction={onAction}>
        {(retry, isRetrying, error) => (
          <div>
            <button onClick={retry}>Retry Action</button>
            <div>Retrying: {isRetrying.toString()}</div>
            <div>Error: {error?.message || 'none'}</div>
          </div>
        )}
      </WithRetry>
    );

    expect(screen.getByText('Retrying: false')).toBeInTheDocument();
    expect(screen.getByText('Error: none')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Retry Action'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('handles errors and provides error state', async () => {
    const onAction = vi.fn().mockRejectedValue(new Error('Action failed'));
    
    render(
      <WithRetry onAction={onAction} maxRetries={1}>
        {(retry, isRetrying, error) => (
          <div>
            <button onClick={retry}>Retry Action</button>
            <div>Error: {error?.message || 'none'}</div>
          </div>
        )}
      </WithRetry>
    );

    fireEvent.click(screen.getByText('Retry Action'));

    await waitFor(() => {
      expect(screen.getByText('Error: Action failed')).toBeInTheDocument();
    });
  });
});