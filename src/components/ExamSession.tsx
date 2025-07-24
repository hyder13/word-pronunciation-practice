import { useEffect, useMemo } from 'react';
import { useAppContext, useExamState, useActiveWordList } from '../contexts/AppContext';
import { QuestionCard } from './QuestionCard';
import { AnswerReveal } from './AnswerReveal';
import { ProgressIndicator } from './ProgressIndicator';

interface ExamSessionProps {
  className?: string;
}

/**
 * 隨機排序函數 - Fisher-Yates shuffle算法
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * ExamSession組件 - 考試模式的主要會話控制器
 * 滿足需求 3.2: 系統應該隨機排列單字順序進行測試
 * 滿足需求 4.1: 當考試開始時，系統應該隨機顯示一個單字的中文意思
 * 滿足需求 4.4: 當用戶準備好查看答案時，系統應該提供「看答案」按鈕
 * 滿足需求 4.5: 顯示答案後，系統應該提供「下一個單字」按鈕繼續測試
 */
export function ExamSession({ className = '' }: ExamSessionProps) {
  const { updateExamState, setMode } = useAppContext();
  const examState = useExamState();
  const activeWordList = useActiveWordList();

  // 初始化考試狀態
  useEffect(() => {
    if (activeWordList && activeWordList.words.length > 0) {
      // 如果還沒有打亂的單字清單，或者清單為空，則重新初始化
      if (examState.shuffledWords.length === 0) {
        const shuffledWords = shuffleArray(activeWordList.words);
        updateExamState({
          phase: 'testing',
          shuffledWords,
          currentIndex: 0,
          showAnswer: false,
          isPlaying: false
        });
      }
    }
  }, [activeWordList, examState.shuffledWords.length, updateExamState]);

  // 記憶化當前單字
  const currentWord = useMemo(() => {
    if (examState.shuffledWords.length > 0 && examState.currentIndex < examState.shuffledWords.length) {
      return examState.shuffledWords[examState.currentIndex];
    }
    return null;
  }, [examState.shuffledWords, examState.currentIndex]);

  // 處理顯示答案
  const handleShowAnswer = () => {
    updateExamState({ showAnswer: true });
  };

  // 處理下一個單字
  const handleNext = () => {
    const nextIndex = examState.currentIndex + 1;
    
    if (nextIndex >= examState.shuffledWords.length) {
      // 考試完成
      updateExamState({
        phase: 'completed',
        showAnswer: false
      });
    } else {
      // 進入下一個單字
      updateExamState({
        currentIndex: nextIndex,
        showAnswer: false
      });
    }
  };

  // 處理返回主選單
  const handleBackToMenu = () => {
    setMode('menu');
    // 重置考試狀態
    updateExamState({
      phase: 'testing',
      shuffledWords: [],
      currentIndex: 0,
      showAnswer: false,
      isPlaying: false
    });
  };

  // 處理重新開始考試
  const handleRestartExam = () => {
    if (activeWordList && activeWordList.words.length > 0) {
      const shuffledWords = shuffleArray(activeWordList.words);
      updateExamState({
        phase: 'testing',
        shuffledWords,
        currentIndex: 0,
        showAnswer: false,
        isPlaying: false
      });
    }
  };

  // 如果沒有活躍的單字清單，顯示提示
  if (!activeWordList || activeWordList.words.length === 0) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="max-w-md mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              沒有可用的單字清單
            </h3>
            <p className="text-yellow-700 mb-4">
              請先進入複習模式建立單字清單，然後再開始考試。
            </p>
            <button
              onClick={handleBackToMenu}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              返回主選單
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 考試完成畫面
  if (examState.phase === 'completed') {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              考試完成！
            </h2>
            <p className="text-green-700 mb-6">
              你已經完成了所有 {examState.shuffledWords.length} 個單字的測試。
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleRestartExam}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                重新開始考試
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                返回主選單
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果沒有當前單字，顯示載入狀態
  if (!currentWord) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="max-w-md mx-auto text-center">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
          <p className="mt-4 text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  // 主要考試介面
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {/* 頁面標題 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">考試模式</h1>
        <p className="text-gray-600">
          看中文，想英文，測試你的記憶力
        </p>
      </div>

      {/* 進度指示器 */}
      <div className="max-w-4xl mx-auto mb-8">
        <ProgressIndicator
          current={examState.currentIndex + 1}
          total={examState.shuffledWords.length}
          size="medium"
          color="primary"
        />
      </div>

      {/* 考試內容 */}
      {!examState.showAnswer ? (
        <div>
          <QuestionCard
            word={currentWord}
            questionNumber={examState.currentIndex + 1}
            totalQuestions={examState.shuffledWords.length}
            className="mb-6"
          />
          
          {/* 看答案按鈕 */}
          <div className="text-center">
            <button
              onClick={handleShowAnswer}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              看答案
            </button>
          </div>
        </div>
      ) : (
        <AnswerReveal
          word={currentWord}
          onNext={handleNext}
          isLastQuestion={examState.currentIndex === examState.shuffledWords.length - 1}
        />
      )}

      {/* 返回按鈕 */}
      <div className="text-center mt-8">
        <button
          onClick={handleBackToMenu}
          className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          ← 返回主選單
        </button>
      </div>
    </div>
  );
}