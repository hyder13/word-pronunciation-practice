import { describe, it, expect } from 'vitest';
import {
  validateEnglishWord,
  validateChineseTranslation,
  validateWordItem,
  validateWordList,
  sanitizeEnglishWord,
  sanitizeChineseTranslation,
  sanitizeWordItem,
  generateId,
  areWordItemsEqual,
  validationRules
} from '../validation';
import { WordItem, WordList } from '../../types';

describe('Validation Functions', () => {
  describe('validateEnglishWord', () => {
    it('should validate correct English words', () => {
      const validWords = ['Hello', 'World', 'Apple', "Don't", 'Mother-in-law', 'New York'];
      
      validWords.forEach(word => {
        const result = validateEnglishWord(word);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject empty or whitespace-only words', () => {
      const invalidWords = ['', '   ', '\t', '\n'];
      
      invalidWords.forEach(word => {
        const result = validateEnglishWord(word);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('英文單字不能為空');
      });
    });

    it('should reject words that are too long', () => {
      const longWord = 'a'.repeat(validationRules.english.maxLength + 1);
      const result = validateEnglishWord(longWord);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`英文單字長度不能超過${validationRules.english.maxLength}個字符`);
    });

    it('should reject words with invalid characters', () => {
      const invalidWords = ['Hello123', 'Hello!', 'Hello@world', '你好', 'Café'];
      
      invalidWords.forEach(word => {
        const result = validateEnglishWord(word);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('英文單字只能包含英文字母、空格、撇號(\')和連字號(-)');
      });
    });

    it('should reject words with consecutive spaces', () => {
      const result = validateEnglishWord('Hello  World');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('英文單字不能包含連續空格');
    });
  });

  describe('validateChineseTranslation', () => {
    it('should validate correct Chinese translations', () => {
      const validTranslations = ['你好', '世界', '蘋果', '不要', '岳母', '紐約'];
      
      validTranslations.forEach(translation => {
        const result = validateChineseTranslation(translation);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject empty or whitespace-only translations', () => {
      const invalidTranslations = ['', '   ', '\t', '\n'];
      
      invalidTranslations.forEach(translation => {
        const result = validateChineseTranslation(translation);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('中文翻譯不能為空');
      });
    });

    it('should reject translations that are too long', () => {
      const longTranslation = '中'.repeat(validationRules.chinese.maxLength + 1);
      const result = validateChineseTranslation(longTranslation);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`中文翻譯長度不能超過${validationRules.chinese.maxLength}個字符`);
    });
  });

  describe('validateWordItem', () => {
    it('should validate correct word items', () => {
      const validWordItem: WordItem = {
        id: 'word1',
        english: 'Hello',
        chinese: '你好',
        createdAt: new Date()
      };
      
      const result = validateWordItem(validWordItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject word items with missing fields', () => {
      const incompleteWordItem = {
        id: 'word1'
      };
      
      const result = validateWordItem(incompleteWordItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('缺少英文單字');
      expect(result.errors).toContain('缺少中文翻譯');
    });

    it('should reject word items with invalid field types', () => {
      const invalidWordItem = {
        id: 123,
        english: 'Hello',
        chinese: '你好',
        createdAt: 'not a date'
      };
      
      const result = validateWordItem(invalidWordItem as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('單字ID必須是字串');
      expect(result.errors).toContain('創建時間必須是Date物件');
    });
  });

  describe('validateWordList', () => {
    it('should validate correct word lists', () => {
      const validWordList: WordList = {
        id: 'list1',
        name: 'Test List',
        words: [
          {
            id: 'word1',
            english: 'Hello',
            chinese: '你好',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      const result = validateWordList(validWordList);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject word lists with invalid names', () => {
      const invalidNames = ['', '   ', null, undefined];
      
      invalidNames.forEach(name => {
        const wordList = {
          id: 'list1',
          name: name as any,
          words: [{ id: 'word1', english: 'Hello', chinese: '你好', createdAt: new Date() }],
          createdAt: new Date(),
          lastUsed: new Date()
        };
        
        const result = validateWordList(wordList);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('單字清單名稱不能為空');
      });
    });

    it('should reject word lists with too few words', () => {
      const wordList = {
        id: 'list1',
        name: 'Test List',
        words: [],
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      const result = validateWordList(wordList);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`單字清單至少需要${validationRules.wordListSize.min}個單字`);
    });

    it('should reject word lists with too many words', () => {
      const words = Array.from({ length: validationRules.wordListSize.max + 1 }, (_, i) => ({
        id: `word${i}`,
        english: `Word${i}`,
        chinese: `單字${i}`,
        createdAt: new Date()
      }));
      
      const wordList = {
        id: 'list1',
        name: 'Test List',
        words,
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      const result = validateWordList(wordList);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`單字清單最多只能有${validationRules.wordListSize.max}個單字`);
    });

    it('should detect duplicate English words', () => {
      const wordList = {
        id: 'list1',
        name: 'Test List',
        words: [
          { id: 'word1', english: 'Hello', chinese: '你好', createdAt: new Date() },
          { id: 'word2', english: 'hello', chinese: '哈囉', createdAt: new Date() }
        ],
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      const result = validateWordList(wordList);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('發現重複的英文單字'))).toBe(true);
    });
  });

  describe('Sanitization Functions', () => {
    describe('sanitizeEnglishWord', () => {
      it('should trim and normalize spaces', () => {
        expect(sanitizeEnglishWord('  hello  world  ')).toBe('Hello world');
      });

      it('should capitalize first letter', () => {
        expect(sanitizeEnglishWord('hello')).toBe('Hello');
      });

      it('should handle multiple spaces', () => {
        expect(sanitizeEnglishWord('hello    world')).toBe('Hello world');
      });
    });

    describe('sanitizeChineseTranslation', () => {
      it('should trim and normalize spaces', () => {
        expect(sanitizeChineseTranslation('  你好  世界  ')).toBe('你好 世界');
      });

      it('should handle multiple spaces', () => {
        expect(sanitizeChineseTranslation('你好    世界')).toBe('你好 世界');
      });
    });

    describe('sanitizeWordItem', () => {
      it('should sanitize both English and Chinese fields', () => {
        const wordItem = {
          english: '  hello  world  ',
          chinese: '  你好  世界  '
        };
        
        const sanitized = sanitizeWordItem(wordItem);
        expect(sanitized.english).toBe('Hello world');
        expect(sanitized.chinese).toBe('你好 世界');
      });
    });
  });

  describe('Utility Functions', () => {
    describe('generateId', () => {
      it('should generate unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        
        expect(id1).not.toBe(id2);
        expect(typeof id1).toBe('string');
        expect(typeof id2).toBe('string');
        expect(id1.length).toBeGreaterThan(0);
        expect(id2.length).toBeGreaterThan(0);
      });
    });

    describe('areWordItemsEqual', () => {
      it('should return true for identical word items', () => {
        const word1: WordItem = {
          id: 'word1',
          english: 'Hello',
          chinese: '你好',
          createdAt: new Date()
        };
        
        const word2: WordItem = {
          id: 'word2',
          english: 'Hello',
          chinese: '你好',
          createdAt: new Date()
        };
        
        expect(areWordItemsEqual(word1, word2)).toBe(true);
      });

      it('should return true for case-insensitive English matches', () => {
        const word1: WordItem = {
          id: 'word1',
          english: 'Hello',
          chinese: '你好',
          createdAt: new Date()
        };
        
        const word2: WordItem = {
          id: 'word2',
          english: 'hello',
          chinese: '你好',
          createdAt: new Date()
        };
        
        expect(areWordItemsEqual(word1, word2)).toBe(true);
      });

      it('should return false for different word items', () => {
        const word1: WordItem = {
          id: 'word1',
          english: 'Hello',
          chinese: '你好',
          createdAt: new Date()
        };
        
        const word2: WordItem = {
          id: 'word2',
          english: 'World',
          chinese: '世界',
          createdAt: new Date()
        };
        
        expect(areWordItemsEqual(word1, word2)).toBe(false);
      });

      it('should handle whitespace differences', () => {
        const word1: WordItem = {
          id: 'word1',
          english: ' Hello ',
          chinese: ' 你好 ',
          createdAt: new Date()
        };
        
        const word2: WordItem = {
          id: 'word2',
          english: 'Hello',
          chinese: '你好',
          createdAt: new Date()
        };
        
        expect(areWordItemsEqual(word1, word2)).toBe(true);
      });
    });
  });
});