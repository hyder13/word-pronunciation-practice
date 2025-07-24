import { WordItem, WordList, ValidationRules } from '../types';

/**
 * 驗證規則配置
 */
export const validationRules: ValidationRules = {
  english: {
    required: true,
    pattern: /^[a-zA-Z\s'-]+$/,
    maxLength: 50
  },
  chinese: {
    required: true,
    maxLength: 100
  },
  wordListSize: {
    min: 1,
    max: 20
  }
};

/**
 * 驗證結果介面
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 驗證英文單字格式
 */
export function validateEnglishWord(word: string): ValidationResult {
  const errors: string[] = [];
  const trimmedWord = word.trim();

  // 檢查是否為空
  if (!trimmedWord) {
    errors.push('英文單字不能為空');
    return { isValid: false, errors };
  }

  // 檢查長度
  if (trimmedWord.length > validationRules.english.maxLength) {
    errors.push(`英文單字長度不能超過${validationRules.english.maxLength}個字符`);
  }

  // 檢查格式（只允許英文字母、空格、撇號和連字號）
  if (!validationRules.english.pattern.test(trimmedWord)) {
    errors.push('英文單字只能包含英文字母、空格、撇號(\')和連字號(-)');
  }

  // 檢查是否包含連續空格
  if (/\s{2,}/.test(trimmedWord)) {
    errors.push('英文單字不能包含連續空格');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 驗證中文翻譯格式
 */
export function validateChineseTranslation(translation: string): ValidationResult {
  const errors: string[] = [];
  const trimmedTranslation = translation.trim();

  // 檢查是否為空
  if (!trimmedTranslation) {
    errors.push('中文翻譯不能為空');
    return { isValid: false, errors };
  }

  // 檢查長度
  if (trimmedTranslation.length > validationRules.chinese.maxLength) {
    errors.push(`中文翻譯長度不能超過${validationRules.chinese.maxLength}個字符`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 驗證單字項目
 */
export function validateWordItem(wordItem: Partial<WordItem>): ValidationResult {
  const errors: string[] = [];

  // 驗證英文單字
  if (wordItem.english !== undefined) {
    const englishValidation = validateEnglishWord(wordItem.english);
    if (!englishValidation.isValid) {
      errors.push(...englishValidation.errors);
    }
  } else {
    errors.push('缺少英文單字');
  }

  // 驗證中文翻譯
  if (wordItem.chinese !== undefined) {
    const chineseValidation = validateChineseTranslation(wordItem.chinese);
    if (!chineseValidation.isValid) {
      errors.push(...chineseValidation.errors);
    }
  } else {
    errors.push('缺少中文翻譯');
  }

  // 驗證ID
  if (wordItem.id !== undefined && typeof wordItem.id !== 'string') {
    errors.push('單字ID必須是字串');
  }

  // 驗證創建時間
  if (wordItem.createdAt !== undefined && !(wordItem.createdAt instanceof Date)) {
    errors.push('創建時間必須是Date物件');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 驗證單字清單
 */
export function validateWordList(wordList: Partial<WordList>): ValidationResult {
  const errors: string[] = [];

  // 驗證名稱
  if (!wordList.name || typeof wordList.name !== 'string') {
    errors.push('單字清單名稱不能為空');
  } else if (wordList.name.trim().length === 0) {
    errors.push('單字清單名稱不能為空');
  } else if (wordList.name.length > 50) {
    errors.push('單字清單名稱長度不能超過50個字符');
  }

  // 驗證ID
  if (wordList.id !== undefined && typeof wordList.id !== 'string') {
    errors.push('單字清單ID必須是字串');
  }

  // 驗證單字陣列
  if (!wordList.words || !Array.isArray(wordList.words)) {
    errors.push('單字清單必須包含單字陣列');
  } else {
    // 檢查單字數量
    if (wordList.words.length < validationRules.wordListSize.min) {
      errors.push(`單字清單至少需要${validationRules.wordListSize.min}個單字`);
    }
    
    if (wordList.words.length > validationRules.wordListSize.max) {
      errors.push(`單字清單最多只能有${validationRules.wordListSize.max}個單字`);
    }

    // 驗證每個單字項目
    wordList.words.forEach((word, index) => {
      const wordValidation = validateWordItem(word);
      if (!wordValidation.isValid) {
        errors.push(`第${index + 1}個單字: ${wordValidation.errors.join(', ')}`);
      }
    });

    // 檢查重複的英文單字
    const englishWords = wordList.words.map(word => word.english?.toLowerCase().trim()).filter(Boolean);
    const duplicates = englishWords.filter((word, index) => englishWords.indexOf(word) !== index);
    if (duplicates.length > 0) {
      errors.push(`發現重複的英文單字: ${[...new Set(duplicates)].join(', ')}`);
    }
  }

  // 驗證時間戳
  if (wordList.createdAt !== undefined && !(wordList.createdAt instanceof Date)) {
    errors.push('創建時間必須是Date物件');
  }

  if (wordList.lastUsed !== undefined && !(wordList.lastUsed instanceof Date)) {
    errors.push('最後使用時間必須是Date物件');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 清理和標準化英文單字
 */
export function sanitizeEnglishWord(word: string): string {
  return word
    .trim()
    .replace(/\s+/g, ' ') // 將多個空格替換為單個空格
    .toLowerCase()
    .replace(/^./, char => char.toUpperCase()); // 首字母大寫
}

/**
 * 清理和標準化中文翻譯
 */
export function sanitizeChineseTranslation(translation: string): string {
  return translation
    .trim()
    .replace(/\s+/g, ' '); // 將多個空格替換為單個空格
}

/**
 * 清理和標準化單字項目
 */
export function sanitizeWordItem(wordItem: Partial<WordItem>): Partial<WordItem> {
  const sanitized: Partial<WordItem> = { ...wordItem };

  if (sanitized.english) {
    sanitized.english = sanitizeEnglishWord(sanitized.english);
  }

  if (sanitized.chinese) {
    sanitized.chinese = sanitizeChineseTranslation(sanitized.chinese);
  }

  return sanitized;
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 檢查兩個單字項目是否相同
 */
export function areWordItemsEqual(word1: WordItem, word2: WordItem): boolean {
  return (
    word1.english.toLowerCase().trim() === word2.english.toLowerCase().trim() &&
    word1.chinese.trim() === word2.chinese.trim()
  );
}