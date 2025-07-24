import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AnswerReveal } from '../AnswerReveal';
import { WordItem } from '../../types';

// Mock the useSpeech hook
vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: vi.fn(() => ({
    speak: vi.fn(),
    isSpeaking: false,
    error: null
  }))
}));

const mockWord: WordItem = {
  id: '1',
  english: 'apple',
  chinese: '蘋果',
  createdAt: new Date()
};

describe('AnswerReveal', () => {
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該顯示正確的英文答案和中文翻譯', () => {
    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={false}
      />
    );

    expect(screen.getByText('正確答案')).toBeInTheDocument();
    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText('蘋果')).toBeInTheDocument();
  });

  it('應該有再次播放發音的按鈕', () => {
    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={false}
      />
    );

    const replayButton = screen.getByRole('button', { name: /再次播放.*apple.*的發音/ });
    expect(replayButton).toBeInTheDocument();
    expect(replayButton).toHaveTextContent('再聽一次');
  });

  it('點擊再聽一次按鈕應該調用speak函數', async () => {
    const mockSpeak = vi.fn();
    const { useSpeech } = await import('../../hooks/useSpeech');
    
    vi.mocked(useSpeech).mockReturnValue({
      speak: mockSpeak,
      isSpeaking: false,
      error: null,
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      isPaused: false,
      isLoading: false,
      updateSettings: vi.fn(),
      availableVoices: [],
      currentSettings: null
    });

    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={false}
      />
    );

    const replayButton = screen.getByRole('button', { name: /再次播放.*apple.*的發音/ });
    fireEvent.click(replayButton);

    expect(mockSpeak).toHaveBeenCalledWith('apple');
  });

  it('當不是最後一題時應該顯示「下一個單字」按鈕', () => {
    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={false}
      />
    );

    const nextButton = screen.getByRole('button', { name: /下一個單字/ });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveTextContent('下一個單字');
  });

  it('當是最後一題時應該顯示「完成考試」按鈕', () => {
    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={true}
      />
    );

    const completeButton = screen.getByRole('button', { name: /完成考試/ });
    expect(completeButton).toBeInTheDocument();
    expect(completeButton).toHaveTextContent('完成考試');
  });

  it('點擊下一個單字按鈕應該調用onNext函數', () => {
    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={false}
      />
    );

    const nextButton = screen.getByRole('button', { name: /下一個單字/ });
    fireEvent.click(nextButton);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('點擊完成考試按鈕應該調用onNext函數', () => {
    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={true}
      />
    );

    const completeButton = screen.getByRole('button', { name: /完成考試/ });
    fireEvent.click(completeButton);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('當語音播放中時再聽一次按鈕應該顯示載入狀態', async () => {
    const { useSpeech } = await import('../../hooks/useSpeech');
    
    vi.mocked(useSpeech).mockReturnValue({
      speak: vi.fn(),
      isSpeaking: true,
      error: null,
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      isPaused: false,
      isLoading: false,
      updateSettings: vi.fn(),
      availableVoices: [],
      currentSettings: null
    });

    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={false}
      />
    );

    const replayButton = screen.getByRole('button', { name: /再次播放.*apple.*的發音/ });
    expect(replayButton).toHaveTextContent('播放中...');
    expect(replayButton).toBeDisabled();
  });

  it('應該顯示適當的提示文字', () => {
    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={false}
      />
    );

    expect(screen.getByText('準備好後點擊繼續下一個單字')).toBeInTheDocument();
  });

  it('最後一題時應該顯示完成提示文字', () => {
    render(
      <AnswerReveal
        word={mockWord}
        onNext={mockOnNext}
        isLastQuestion={true}
      />
    );

    expect(screen.getByText('點擊完成考試並查看結果')).toBeInTheDocument();
  });
});