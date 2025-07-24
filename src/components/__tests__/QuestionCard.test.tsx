import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QuestionCard } from '../QuestionCard';
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

describe('QuestionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該顯示中文翻譯', () => {
    render(
      <QuestionCard
        word={mockWord}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    expect(screen.getByText('蘋果')).toBeInTheDocument();
    expect(screen.getByText('中文意思')).toBeInTheDocument();
  });

  it('應該顯示正確的進度指示器', () => {
    const { container } = render(
      <QuestionCard
        word={mockWord}
        questionNumber={3}
        totalQuestions={10}
      />
    );

    expect(screen.getByText('第 3 題，共 10 題')).toBeInTheDocument();
    
    // 檢查進度條寬度
    const progressBar = container.querySelector('.bg-blue-500');
    expect(progressBar).toHaveStyle({ width: '30%' });
  });

  it('應該不顯示英文單字', () => {
    render(
      <QuestionCard
        word={mockWord}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    expect(screen.queryByText('apple')).not.toBeInTheDocument();
  });

  it('應該有發音按鈕', () => {
    render(
      <QuestionCard
        word={mockWord}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    const pronunciationButton = screen.getByRole('button', { name: /播放.*蘋果.*的英文發音/ });
    expect(pronunciationButton).toBeInTheDocument();
    expect(pronunciationButton).toHaveTextContent('聽發音');
  });

  it('點擊發音按鈕應該調用speak函數', async () => {
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
      <QuestionCard
        word={mockWord}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    const pronunciationButton = screen.getByRole('button', { name: /播放.*蘋果.*的英文發音/ });
    fireEvent.click(pronunciationButton);

    expect(mockSpeak).toHaveBeenCalledWith('apple');
  });

  it('當語音播放中時應該顯示載入狀態', async () => {
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
      <QuestionCard
        word={mockWord}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    const pronunciationButton = screen.getByRole('button', { name: /播放.*蘋果.*的英文發音/ });
    expect(pronunciationButton).toHaveTextContent('播放中...');
    expect(pronunciationButton).toBeDisabled();
  });

  it('當有錯誤時應該顯示錯誤訊息', async () => {
    const { useSpeech } = await import('../../hooks/useSpeech');
    
    vi.mocked(useSpeech).mockReturnValue({
      speak: vi.fn(),
      isSpeaking: false,
      error: '語音播放失敗',
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
      <QuestionCard
        word={mockWord}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    expect(screen.getByText('語音播放失敗')).toBeInTheDocument();
  });

  it('應該有適當的提示文字', () => {
    render(
      <QuestionCard
        word={mockWord}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    expect(screen.getByText('請想想這個中文對應的英文單字是什麼')).toBeInTheDocument();
    expect(screen.getByText('點擊按鈕聽取正確的英文發音')).toBeInTheDocument();
  });
});