
import { WordItem } from '../types';
import { useSpeech } from '../hooks/useSpeech';

interface QuestionCardProps {
  word: WordItem;
  questionNumber: number;
  totalQuestions: number;
  className?: string;
}

/**
 * QuestionCard組件 - 顯示中文翻譯並提供發音按鈕（不顯示英文）
 * 滿足需求 4.1: 隨機顯示一個單字的中文意思
 * 滿足需求 4.2: 提供發音按鈕，讓用戶聽到正確的英文發音（但不顯示英文單字）
 */
export function QuestionCard({ 
  word, 
  questionNumber, 
  totalQuestions, 
  className = '' 
}: QuestionCardProps) {
  const { speak, isSpeaking, error } = useSpeech();

  const handlePlayPronunciation = async () => {
    try {
      await speak(word.english);
    } catch (err) {
      console.error('播放發音失敗:', err);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto ${className}`}>
      {/* 進度指示器 */}
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-500 mb-2">
          第 {questionNumber} 題，共 {totalQuestions} 題
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 中文翻譯顯示 */}
      <div className="text-center mb-8">
        <h2 className="text-sm text-gray-600 mb-2">中文意思</h2>
        <div className="text-3xl font-bold text-gray-800 mb-4 min-h-[3rem] flex items-center justify-center">
          {word.chinese}
        </div>
        <p className="text-gray-500 text-sm">
          請想想這個中文對應的英文單字是什麼
        </p>
      </div>

      {/* 發音按鈕 */}
      <div className="text-center">
        <button
          onClick={handlePlayPronunciation}
          disabled={isSpeaking}
          className={`
            inline-flex items-center justify-center
            px-6 py-3 rounded-lg font-medium text-white
            transition-all duration-200 min-w-[140px]
            ${isSpeaking 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
          aria-label={`播放 ${word.chinese} 的英文發音`}
        >
          {isSpeaking ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              播放中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6zM7 9H4a1 1 0 00-1 1v4a1 1 0 001 1h3l5 4V5L7 9z" />
              </svg>
              聽發音
            </>
          )}
        </button>

        {/* 錯誤訊息顯示 */}
        {error && (
          <div className="mt-3 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* 提示文字 */}
        <p className="mt-4 text-xs text-gray-400">
          點擊按鈕聽取正確的英文發音
        </p>
      </div>
    </div>
  );
}