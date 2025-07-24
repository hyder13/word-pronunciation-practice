import { useCallback, useEffect } from 'react';
import { useAppContext, useReviewState, useActiveWordList, useSpeechSettings } from '../contexts/AppContext';
import { useSpeech } from '../hooks/useSpeech';
import { WordItem } from '../types';
import { ProgressIndicator } from './ProgressIndicator';

interface ReviewSessionProps {
    onComplete: () => void;
    onBackToSetup: () => void;
    className?: string;
}

export function ReviewSession({ onComplete, onBackToSetup, className = '' }: ReviewSessionProps) {
    const { updateReviewState } = useAppContext();
    const reviewState = useReviewState();
    const activeWordList = useActiveWordList();
    const speechSettings = useSpeechSettings();

    const {
        speak,
        stop,
        isSpeaking,
        error: speechError
    } = useSpeech();

    // 確保有單字清單
    useEffect(() => {
        if (!activeWordList || activeWordList.words.length === 0) {
            onBackToSetup();
            return;
        }

        // 初始化複習狀態
        if (reviewState.wordList.length === 0) {
            updateReviewState({
                wordList: activeWordList.words,
                currentIndex: 0,
                phase: 'practicing',
                isPlaying: false
            });
        }
    }, [activeWordList, reviewState.wordList.length, onBackToSetup, updateReviewState]);

    // 當前單字
    const currentWord: WordItem | null = reviewState.wordList[reviewState.currentIndex] || null;
    const isLastWord = reviewState.currentIndex >= reviewState.wordList.length - 1;
    const progress = {
        current: reviewState.currentIndex + 1,
        total: reviewState.wordList.length,
        percentage: reviewState.wordList.length > 0
            ? Math.round(((reviewState.currentIndex + 1) / reviewState.wordList.length) * 100)
            : 0
    };

    // 播放發音
    const handleSpeak = useCallback(async () => {
        if (!currentWord || isSpeaking) return;

        try {
            await speak(currentWord.english);
        } catch (error) {
            console.error('語音播放失敗:', error);
        }
    }, [currentWord, isSpeaking, speak]);

    // 下一個單字
    const handleNext = useCallback(() => {
        if (isLastWord) {
            // 完成複習
            updateReviewState({
                phase: 'completed',
                isPlaying: false
            });
            onComplete();
        } else {
            // 移到下一個單字
            stop(); // 停止當前播放
            updateReviewState({
                currentIndex: reviewState.currentIndex + 1,
                isPlaying: false
            });
        }
    }, [isLastWord, reviewState.currentIndex, updateReviewState, onComplete, stop]);

    // 上一個單字
    const handlePrevious = useCallback(() => {
        if (reviewState.currentIndex > 0) {
            stop(); // 停止當前播放
            updateReviewState({
                currentIndex: reviewState.currentIndex - 1,
                isPlaying: false
            });
        }
    }, [reviewState.currentIndex, updateReviewState, stop]);

    // 鍵盤快捷鍵
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return; // 忽略輸入框中的按鍵
            }

            switch (event.key) {
                case ' ':
                case 'Enter':
                    event.preventDefault();
                    if (!isSpeaking) {
                        handleSpeak();
                    }
                    break;
                case 'ArrowRight':
                case 'n':
                case 'N':
                    event.preventDefault();
                    handleNext();
                    break;
                case 'ArrowLeft':
                case 'p':
                case 'P':
                    event.preventDefault();
                    handlePrevious();
                    break;
                case 'Escape':
                    event.preventDefault();
                    onBackToSetup();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isSpeaking, handleSpeak, handleNext, handlePrevious, onBackToSetup]);

    // 如果沒有單字，顯示載入狀態
    if (!currentWord) {
        return (
            <div className={`max-w-4xl mx-auto ${className}`}>
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">載入中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-4xl mx-auto ${className}`}>
            {/* 進度指示器 */}
            <ProgressIndicator
                current={progress.current}
                total={progress.total}
                className="mb-8"
                size="medium"
                color="primary"
            />

            {/* 單字卡片 */}
            <div className="card-child mb-8">
                <div className="text-center">
                    {/* 英文單字 */}
                    <div className="mb-8">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
                            {currentWord.english}
                        </h2>
                        <div className="text-lg md:text-xl text-gray-600">
                            英文單字
                        </div>
                    </div>

                    {/* 中文翻譯 */}
                    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-blue-800 mb-2">
                            {currentWord.chinese}
                        </h3>
                        <div className="text-base md:text-lg text-blue-600">
                            中文翻譯
                        </div>
                    </div>

                    {/* 發音按鈕 */}
                    <div className="mb-8">
                        <button
                            onClick={handleSpeak}
                            disabled={isSpeaking}
                            className={
                                isSpeaking
                                    ? 'btn-child-disabled text-xl md:text-2xl'
                                    : 'btn-child-primary text-xl md:text-2xl'
                            }
                            aria-label={`播放 ${currentWord.english} 的發音`}
                        >
                            {isSpeaking ? (
                                <>
                                    <svg className="w-6 h-6 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    播放中...
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8.586 8.586A2 2 0 018 10v4a2 2 0 01.586 1.414L12 19l3.414-3.586A2 2 0 0116 14v-4a2 2 0 01-.586-1.414L12 5l-3.414 3.586z" />
                                    </svg>
                                    🔊 聽發音
                                </>
                            )}
                        </button>
                    </div>

                    {/* 語音錯誤提示 */}
                    {speechError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-700 text-sm">{speechError}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 導航按鈕 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-3">
                    <button
                        onClick={onBackToSetup}
                        className="btn-child-secondary"
                        aria-label="返回單字設定"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        返回設定
                    </button>

                    {reviewState.currentIndex > 0 && (
                        <button
                            onClick={handlePrevious}
                            className="btn-child-secondary"
                            aria-label="上一個單字"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            上一個
                        </button>
                    )}
                </div>

                <button
                    onClick={handleNext}
                    className="btn-child-primary"
                    aria-label={isLastWord ? '完成複習' : '下一個單字'}
                >
                    {isLastWord ? (
                        <>
                            完成複習
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </>
                    ) : (
                        <>
                            下一個單字
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            {/* 鍵盤快捷鍵提示 */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">鍵盤快捷鍵：</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>空白鍵 / Enter：播放發音</div>
                        <div>→ / N：下一個單字</div>
                        <div>← / P：上一個單字</div>
                        <div>Esc：返回設定</div>
                    </div>
                </div>
            </div>
        </div>
    );
}