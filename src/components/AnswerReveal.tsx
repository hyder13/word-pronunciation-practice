
import { WordItem } from '../types';
import { useSpeech } from '../hooks/useSpeech';

interface AnswerRevealProps {
  word: WordItem;
  onNext: () => void;
  isLastQuestion: boolean;
  className?: string;
}

/**
 * AnswerReveal組件 - 提供「看答案」功能顯示正確英文單字
 * 滿足需求 4.4: 當用戶點擊「看答案」後，系統應該顯示正確的英文單字
 * 滿足需求 4.5: 顯示答案後，系統應該提供「下一個單字」按鈕繼續測試
 */
export function AnswerReveal({ 
  word, 
  onNext, 
  isLastQuestion, 
  className = '' 
}: AnswerRevealProps) {
  const { speak, isSpeaking } = useSpeech();

  const handlePlayPronunciation = async () => {
    try {
      await speak(word.english);
    } catch (err) {
      console.error('播放發音失敗:', err);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto ${className}`}>
      {/* 答案顯示區域 */}
      <div className="text-center mb-8">
        <h2 className="text-sm text-gray-600 mb-2">正確答案</h2>
        
        {/* 英文單字顯示 */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-4">
          <div className="text-4xl font-bold text-green-700 mb-2">
            {word.english}
          </div>
          <div className="text-lg text-gray-600">
            {word.chinese}
          </div>
        </div>

        {/* 發音按鈕 */}
        <button
          onClick={handlePlayPronunciation}
          disabled={isSpeaking}
          className={`
            inline-flex items-center justify-center
            px-4 py-2 rounded-md font-medium text-green-700 bg-green-100
            transition-all duration-200 mb-6
            ${isSpeaking 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-green-200 active:bg-green-300'
            }
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          `}
          aria-label={`再次播放 ${word.english} 的發音`}
        >
          {isSpeaking ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              播放中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6zM7 9H4a1 1 0 00-1 1v4a1 1 0 001 1h3l5 4V5L7 9z" />
              </svg>
              再聽一次
            </>
          )}
        </button>
      </div>

      {/* 操作按鈕 */}
      <div className="text-center">
        <button
          onClick={onNext}
          className={`
            w-full py-3 px-6 rounded-lg font-medium text-white
            transition-all duration-200
            ${isLastQuestion
              ? 'bg-green-500 hover:bg-green-600 active:bg-green-700'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isLastQuestion ? 'focus:ring-green-500' : 'focus:ring-blue-500'}
          `}
        >
          {isLastQuestion ? (
            <>
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              完成考試
            </>
          ) : (
            <>
              下一個單字
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>

        {/* 提示文字 */}
        <p className="mt-3 text-xs text-gray-500">
          {isLastQuestion 
            ? '點擊完成考試並查看結果' 
            : '準備好後點擊繼續下一個單字'
          }
        </p>
      </div>
    </div>
  );
}