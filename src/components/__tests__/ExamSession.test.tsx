import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ExamSession } from '../ExamSession';
import { WordItem, WordList } from '../../types';

// Mock the context hooks
const mockUpdateExamState = vi.fn();
const mockSetMode = vi.fn();

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    updateExamState: mockUpdateExamState,
    setMode: mockSetMode
  }),
  useExamState: vi.fn(() => ({
    phase: 'testing',
    shuffledWords: [],
    currentIndex: 0,
    showAnswer: false,
    isPlaying: false
  })),
  useActiveWordList: vi.fn(() => null),
  useUISettings: () => ({
    fontSize: 'medium',
    theme: 'light',
    animationsEnabled: true
  })
}));

// Mock the child components
vi.mock('../QuestionCard', () => ({
  QuestionCard: ({ word, questionNumber, totalQuestions }: any) => (
    <div data-testid="question-card">
      <div>Question {questionNumber} of {totalQuestions}</div>
      <div>{word.chinese}</div>
    </div>
  )
}));

vi.mock('../AnswerReveal', () => ({
  AnswerReveal: ({ word, onNext, isLastQuestion }: any) => (
    <div data-testid="answer-reveal">
      <div>{word.english}</div>
      <button onClick={onNext}>
        {isLastQuestion ? '完成考試' : '下一個單字'}
      </button>
    </div>
  )
}));

const mockWords: WordItem[] = [
  { id: '1', english: 'apple', chinese: '蘋果', createdAt: new Date() },
  { id: '2', english: 'banana', chinese: '香蕉', createdAt: new Date() },
  { id: '3', english: 'orange', chinese: '橘子', createdAt: new Date() }
];

const mockWordList: WordList = {
  id: 'list1',
  name: '測試清單',
  words: mockWords,
  createdAt: new Date(),
  lastUsed: new Date()
};

describe('ExamSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('當沒有活躍單字清單時應該顯示提示訊息', () => {
    render(<ExamSession />);

    expect(screen.getByText('沒有可用的單字清單')).toBeInTheDocument();
    expect(screen.getByText('請先進入複習模式建立單字清單，然後再開始考試。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '返回主選單' })).toBeInTheDocument();
  });

  it('當有活躍單字清單時應該初始化考試狀態', async () => {
    const { useActiveWordList } = await import('../../contexts/AppContext');
    vi.mocked(useActiveWordList).mockReturnValue(mockWordList);

    render(<ExamSession />);

    await waitFor(() => {
      expect(mockUpdateExamState).toHaveBeenCalledWith({
        phase: 'testing',
        shuffledWords: expect.any(Array),
        currentIndex: 0,
        showAnswer: false,
        isPlaying: false
      });
    });
  });

  it('應該顯示考試模式標題', async () => {
    const { useActiveWordList, useExamState } = await import('../../contexts/AppContext');
    vi.mocked(useActiveWordList).mockReturnValue(mockWordList);
    vi.mocked(useExamState).mockReturnValue({
      phase: 'testing',
      shuffledWords: mockWords,
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });

    render(<ExamSession />);

    expect(screen.getByText('考試模式')).toBeInTheDocument();
    expect(screen.getByText('看中文，想英文，測試你的記憶力')).toBeInTheDocument();
  });

  it('當showAnswer為false時應該顯示QuestionCard', async () => {
    const { useActiveWordList, useExamState } = await import('../../contexts/AppContext');
    vi.mocked(useActiveWordList).mockReturnValue(mockWordList);
    vi.mocked(useExamState).mockReturnValue({
      phase: 'testing',
      shuffledWords: mockWords,
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });

    render(<ExamSession />);

    expect(screen.getByTestId('question-card')).toBeInTheDocument();
    expect(screen.getByText('蘋果')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '看答案' })).toBeInTheDocument();
  });

  it('當showAnswer為true時應該顯示AnswerReveal', async () => {
    const { useActiveWordList, useExamState } = await import('../../contexts/AppContext');
    vi.mocked(useActiveWordList).mockReturnValue(mockWordList);
    vi.mocked(useExamState).mockReturnValue({
      phase: 'testing',
      shuffledWords: mockWords,
      currentIndex: 0,
      showAnswer: true,
      isPlaying: false
    });

    render(<ExamSession />);

    expect(screen.getByTestId('answer-reveal')).toBeInTheDocument();
    expect(screen.getByText('apple')).toBeInTheDocument();
  });

  it('點擊看答案按鈕應該更新showAnswer狀態', async () => {
    const { useActiveWordList, useExamState } = await import('../../contexts/AppContext');
    vi.mocked(useActiveWordList).mockReturnValue(mockWordList);
    vi.mocked(useExamState).mockReturnValue({
      phase: 'testing',
      shuffledWords: mockWords,
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });

    render(<ExamSession />);

    const showAnswerButton = screen.getByRole('button', { name: '看答案' });
    fireEvent.click(showAnswerButton);

    expect(mockUpdateExamState).toHaveBeenCalledWith({ showAnswer: true });
  });

  it('考試完成時應該顯示完成畫面', async () => {
    const { useActiveWordList, useExamState } = await import('../../contexts/AppContext');
    vi.mocked(useActiveWordList).mockReturnValue(mockWordList);
    vi.mocked(useExamState).mockReturnValue({
      phase: 'completed',
      shuffledWords: mockWords,
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });

    render(<ExamSession />);

    expect(screen.getByText('考試完成！')).toBeInTheDocument();
    expect(screen.getByText(/你已經完成了所有.*個單字的測試/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重新開始考試' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '返回主選單' })).toBeInTheDocument();
  });

  it('點擊返回主選單應該重置狀態並切換模式', async () => {
    const { useActiveWordList, useExamState } = await import('../../contexts/AppContext');
    vi.mocked(useActiveWordList).mockReturnValue(mockWordList);
    vi.mocked(useExamState).mockReturnValue({
      phase: 'completed',
      shuffledWords: mockWords,
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });

    render(<ExamSession />);

    const backButton = screen.getByRole('button', { name: '返回主選單' });
    fireEvent.click(backButton);

    expect(mockSetMode).toHaveBeenCalledWith('menu');
    expect(mockUpdateExamState).toHaveBeenCalledWith({
      phase: 'testing',
      shuffledWords: [],
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });
  });

  it('點擊重新開始考試應該重新初始化考試狀態', async () => {
    const { useActiveWordList, useExamState } = await import('../../contexts/AppContext');
    vi.mocked(useActiveWordList).mockReturnValue(mockWordList);
    vi.mocked(useExamState).mockReturnValue({
      phase: 'completed',
      shuffledWords: mockWords,
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });

    render(<ExamSession />);

    const restartButton = screen.getByRole('button', { name: '重新開始考試' });
    fireEvent.click(restartButton);

    expect(mockUpdateExamState).toHaveBeenCalledWith({
      phase: 'testing',
      shuffledWords: expect.any(Array),
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });
  });
});