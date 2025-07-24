import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { WordListInput } from '../WordListInput';
import { WordItem } from '../../types';

// Mock the validation utilities
vi.mock('../../utils/validation', () => ({
  validateEnglishWord: vi.fn((word: string) => {
    if (!word.trim()) return { isValid: true, errors: [] };
    if (!/^[a-zA-Z\s'-]+$/.test(word)) {
      return { isValid: false, errors: ['英文單字只能包含英文字母、空格、撇號(\')和連字號(-)'] };
    }
    return { isValid: true, errors: [] };
  }),
  validateChineseTranslation: vi.fn((translation: string) => {
    if (!translation.trim()) return { isValid: true, errors: [] };
    return { isValid: true, errors: [] };
  }),
  sanitizeWordItem: vi.fn((item) => ({
    english: item.english?.trim(),
    chinese: item.chinese?.trim()
  })),
  generateId: vi.fn(() => 'test-id-' + Math.random().toString(36).substr(2, 9))
}));

describe('WordListInput', () => {
  const mockOnWordListComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    onWordListComplete: mockOnWordListComplete,
    onCancel: mockOnCancel
  };

  it('renders with initial empty word input', () => {
    render(<WordListInput {...defaultProps} />);
    
    expect(screen.getByText('建立單字清單')).toBeInTheDocument();
    expect(screen.getByText('單字 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例如: apple')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例如: 蘋果')).toBeInTheDocument();
  });

  it('allows adding new word inputs', async () => {
    const user = userEvent.setup();
    render(<WordListInput {...defaultProps} />);
    
    const addButton = screen.getByText('新增單字');
    await user.click(addButton);
    
    expect(screen.getByText('單字 2')).toBeInTheDocument();
  });

  it('allows removing word inputs when more than one exists', async () => {
    const user = userEvent.setup();
    render(<WordListInput {...defaultProps} />);
    
    // Add a second word input
    const addButton = screen.getByText('新增單字');
    await user.click(addButton);
    
    // Remove the second word input
    const deleteButtons = screen.getAllByText('刪除');
    await user.click(deleteButtons[1]);
    
    expect(screen.queryByText('單字 2')).not.toBeInTheDocument();
  });

  it('does not show delete button when only one word input exists', () => {
    render(<WordListInput {...defaultProps} />);
    
    expect(screen.queryByText('刪除')).not.toBeInTheDocument();
  });

  it('validates English word input in real-time', async () => {
    const user = userEvent.setup();
    render(<WordListInput {...defaultProps} />);
    
    const englishInput = screen.getByPlaceholderText('例如: apple');
    await user.type(englishInput, '123');
    
    await waitFor(() => {
      // Look for the error message specifically in the error paragraph
      const errorMessages = screen.getAllByText('英文單字只能包含英文字母、空格、撇號(\')和連字號(-)');
      const errorMessage = errorMessages.find(el => el.className.includes('text-red-600'));
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('allows valid English and Chinese input', async () => {
    const user = userEvent.setup();
    render(<WordListInput {...defaultProps} />);
    
    const englishInput = screen.getByPlaceholderText('例如: apple');
    const chineseInput = screen.getByPlaceholderText('例如: 蘋果');
    
    await user.type(englishInput, 'apple');
    await user.type(chineseInput, '蘋果');
    
    expect(englishInput).toHaveValue('apple');
    expect(chineseInput).toHaveValue('蘋果');
  });

  it('submits valid word list', async () => {
    const user = userEvent.setup();
    render(<WordListInput {...defaultProps} />);
    
    const englishInput = screen.getByPlaceholderText('例如: apple');
    const chineseInput = screen.getByPlaceholderText('例如: 蘋果');
    
    await user.type(englishInput, 'apple');
    await user.type(chineseInput, '蘋果');
    
    const submitButton = screen.getByText('開始練習');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnWordListComplete).toHaveBeenCalledWith([
        expect.objectContaining({
          english: 'apple',
          chinese: '蘋果'
        })
      ]);
    });
  });

  it('shows alert when submitting empty word list', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<WordListInput {...defaultProps} />);
    
    const submitButton = screen.getByText('開始練習');
    await user.click(submitButton);
    
    expect(alertSpy).toHaveBeenCalledWith('請至少輸入一個單字');
    alertSpy.mockRestore();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<WordListInput {...defaultProps} />);
    
    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('limits maximum number of word inputs to 20', async () => {
    const user = userEvent.setup();
    render(<WordListInput {...defaultProps} />);
    
    const addButton = screen.getByText('新增單字');
    
    // Try to add 20 more inputs (we start with 1)
    for (let i = 0; i < 20; i++) {
      await user.click(addButton);
    }
    
    // Should have maximum 20 word inputs
    const wordInputs = screen.getAllByText(/單字 \d+/);
    expect(wordInputs.length).toBeLessThanOrEqual(20);
  });

  it('renders with initial words when provided', () => {
    const initialWords: WordItem[] = [
      {
        id: '1',
        english: 'hello',
        chinese: '你好',
        createdAt: new Date()
      },
      {
        id: '2',
        english: 'world',
        chinese: '世界',
        createdAt: new Date()
      }
    ];

    render(<WordListInput {...defaultProps} initialWords={initialWords} />);
    
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
    expect(screen.getByDisplayValue('你好')).toBeInTheDocument();
    expect(screen.getByDisplayValue('world')).toBeInTheDocument();
    expect(screen.getByDisplayValue('世界')).toBeInTheDocument();
  });

  it('shows input hints and guidelines', () => {
    render(<WordListInput {...defaultProps} />);
    
    expect(screen.getByText('輸入提示：')).toBeInTheDocument();
    expect(screen.getByText(/英文單字只能包含英文字母、空格、撇號/)).toBeInTheDocument();
    expect(screen.getByText(/最少需要1個單字，最多可以輸入20個單字/)).toBeInTheDocument();
  });

  it('prevents duplicate English words', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<WordListInput {...defaultProps} />);
    
    // Add a second word input
    const addButton = screen.getByText('新增單字');
    await user.click(addButton);
    
    // Fill in duplicate English words
    const englishInputs = screen.getAllByPlaceholderText('例如: apple');
    const chineseInputs = screen.getAllByPlaceholderText('例如: 蘋果');
    
    await user.type(englishInputs[0], 'apple');
    await user.type(chineseInputs[0], '蘋果');
    await user.type(englishInputs[1], 'apple');
    await user.type(chineseInputs[1], '蘋果2');
    
    const submitButton = screen.getByText('開始練習');
    await user.click(submitButton);
    
    expect(alertSpy).toHaveBeenCalledWith('發現重複的英文單字: apple');
    alertSpy.mockRestore();
  });
});