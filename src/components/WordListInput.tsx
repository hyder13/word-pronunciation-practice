import { useState, useCallback } from 'react';
import { WordItem } from '../types';
import { 
  validateEnglishWord, 
  validateChineseTranslation, 
  sanitizeWordItem, 
  generateId 
} from '../utils/validation';

interface WordListInputProps {
  onWordListComplete: (words: WordItem[]) => void;
  onCancel: () => void;
  initialWords?: WordItem[];
  className?: string;
}

interface WordInputItem {
  id: string;
  english: string;
  chinese: string;
  englishError: string;
  chineseError: string;
}

export function WordListInput({ 
  onWordListComplete, 
  onCancel, 
  initialWords = [], 
  className = '' 
}: WordListInputProps) {
  // 初始化單字輸入項目
  const initializeWordInputs = useCallback(() => {
    if (initialWords.length > 0) {
      return initialWords.map(word => ({
        id: word.id,
        english: word.english,
        chinese: word.chinese,
        englishError: '',
        chineseError: ''
      }));
    }
    // 預設提供一個空的輸入項目
    return [{
      id: generateId(),
      english: '',
      chinese: '',
      englishError: '',
      chineseError: ''
    }];
  }, [initialWords]);

  const [wordInputs, setWordInputs] = useState<WordInputItem[]>(initializeWordInputs);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 即時驗證英文單字
  const validateEnglishInput = useCallback((value: string): string => {
    if (!value.trim()) {
      return '';
    }
    const validation = validateEnglishWord(value);
    return validation.isValid ? '' : validation.errors[0];
  }, []);

  // 即時驗證中文翻譯
  const validateChineseInput = useCallback((value: string): string => {
    if (!value.trim()) {
      return '';
    }
    const validation = validateChineseTranslation(value);
    return validation.isValid ? '' : validation.errors[0];
  }, []);

  // 更新單字輸入項目
  const updateWordInput = useCallback((id: string, field: 'english' | 'chinese', value: string) => {
    setWordInputs(prev => prev.map(item => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };
      
      // 即時驗證
      if (field === 'english') {
        updated.englishError = validateEnglishInput(value);
      } else {
        updated.chineseError = validateChineseInput(value);
      }

      return updated;
    }));
  }, [validateEnglishInput, validateChineseInput]);

  // 新增單字輸入項目
  const addWordInput = useCallback(() => {
    if (wordInputs.length >= 20) {
      return; // 限制最多20個單字
    }

    const newWordInput: WordInputItem = {
      id: generateId(),
      english: '',
      chinese: '',
      englishError: '',
      chineseError: ''
    };

    setWordInputs(prev => [...prev, newWordInput]);
  }, [wordInputs.length]);

  // 刪除單字輸入項目
  const removeWordInput = useCallback((id: string) => {
    if (wordInputs.length <= 1) {
      return; // 至少保留一個輸入項目
    }

    setWordInputs(prev => prev.filter(item => item.id !== id));
  }, [wordInputs.length]);

  // 驗證所有輸入並提交
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    // 過濾掉空的輸入項目
    const filledInputs = wordInputs.filter(item => 
      item.english.trim() || item.chinese.trim()
    );

    if (filledInputs.length === 0) {
      alert('請至少輸入一個單字');
      setIsSubmitting(false);
      return;
    }

    // 驗證所有輸入
    let hasErrors = false;
    const updatedInputs = wordInputs.map(item => {
      const updated = { ...item };
      
      if (item.english.trim() || item.chinese.trim()) {
        // 只驗證有內容的項目
        updated.englishError = validateEnglishInput(item.english);
        updated.chineseError = validateChineseInput(item.chinese);
        
        if (updated.englishError || updated.chineseError) {
          hasErrors = true;
        }
      }
      
      return updated;
    });

    if (hasErrors) {
      setWordInputs(updatedInputs);
      setIsSubmitting(false);
      return;
    }

    // 檢查重複的英文單字
    const englishWords = filledInputs.map(item => item.english.toLowerCase().trim());
    const duplicates = englishWords.filter((word, index) => englishWords.indexOf(word) !== index);
    
    if (duplicates.length > 0) {
      alert(`發現重複的英文單字: ${[...new Set(duplicates)].join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    // 轉換為WordItem格式
    const wordItems: WordItem[] = filledInputs.map(item => {
      const sanitized = sanitizeWordItem({
        english: item.english,
        chinese: item.chinese
      });
      
      return {
        id: item.id,
        english: sanitized.english!,
        chinese: sanitized.chinese!,
        createdAt: new Date()
      };
    });

    // 提交單字清單
    onWordListComplete(wordItems);
    setIsSubmitting(false);
  }, [wordInputs, onWordListComplete, validateEnglishInput, validateChineseInput]);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">建立單字清單</h2>
          <p className="text-gray-600">
            請輸入要練習的英文單字和對應的中文翻譯。最多可以輸入20個單字。
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {wordInputs.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  單字 {index + 1}
                </span>
                {wordInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWordInput(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    disabled={isSubmitting}
                  >
                    刪除
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 英文單字輸入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    英文單字 *
                  </label>
                  <input
                    type="text"
                    value={item.english}
                    onChange={(e) => updateWordInput(item.id, 'english', e.target.value)}
                    placeholder="例如: apple"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      item.englishError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {item.englishError && (
                    <p className="mt-1 text-sm text-red-600">{item.englishError}</p>
                  )}
                </div>

                {/* 中文翻譯輸入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    中文翻譯 *
                  </label>
                  <input
                    type="text"
                    value={item.chinese}
                    onChange={(e) => updateWordInput(item.id, 'chinese', e.target.value)}
                    placeholder="例如: 蘋果"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      item.chineseError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {item.chineseError && (
                    <p className="mt-1 text-sm text-red-600">{item.chineseError}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 新增單字按鈕 */}
        {wordInputs.length < 20 && (
          <div className="mb-6">
            <button
              type="button"
              onClick={addWordInput}
              className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增單字
            </button>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '處理中...' : '開始練習'}
          </button>
        </div>

        {/* 提示信息 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">輸入提示：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>英文單字只能包含英文字母、空格、撇號(')和連字號(-)</li>
              <li>系統會自動清理多餘的空格並調整大小寫格式</li>
              <li>不能輸入重複的英文單字</li>
              <li>最少需要1個單字，最多可以輸入20個單字</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}