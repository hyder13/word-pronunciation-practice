import { useState } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { SpeechLoadingIndicator } from './LoadingIndicator';
import { useUISettings } from '../contexts/AppContext';

interface SpeechButtonProps {
  text: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'icon';
  disabled?: boolean;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: string) => void;
}

export function SpeechButton({
  text,
  className = '',
  size = 'medium',
  variant = 'primary',
  disabled = false,
  onSpeechStart,
  onSpeechEnd,
  onSpeechError
}: SpeechButtonProps) {
  const { speak, isSpeaking, error } = useSpeech();
  const uiSettings = useUISettings();
  const [isPressed, setIsPressed] = useState(false);

  const handleSpeak = async () => {
    if (disabled || isSpeaking) return;

    try {
      onSpeechStart?.();
      await speak(text);
      onSpeechEnd?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '語音播放失敗';
      onSpeechError?.(errorMessage);
    }
  };

  const handleMouseDown = () => {
    if (!disabled && uiSettings.animationsEnabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  // Size classes
  const sizeClasses = {
    small: 'p-2 text-child-sm',
    medium: 'p-3 text-child-base',
    large: 'p-4 text-child-lg'
  };

  // Variant classes
  const getVariantClasses = () => {
    if (disabled) {
      return 'btn-child-disabled';
    }

    switch (variant) {
      case 'primary':
        return 'btn-child-primary';
      case 'secondary':
        return 'btn-child-secondary';
      case 'icon':
        return `
          bg-childPrimary-100 hover:bg-childPrimary-200 active:bg-childPrimary-300
          text-childPrimary-700 rounded-full shadow-child hover:shadow-child-lg
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-4 focus:ring-childPrimary-200 focus:ring-offset-2
          ${uiSettings.animationsEnabled ? 'transform hover:scale-110 active:scale-95' : ''}
          dark:bg-childPrimary-800 dark:hover:bg-childPrimary-700 dark:text-childPrimary-200
        `;
      default:
        return 'btn-child-primary';
    }
  };

  // Animation classes
  const animationClasses = uiSettings.animationsEnabled && !disabled
    ? `${isPressed ? 'animate-pulse' : ''} speech-button`
    : '';

  const buttonContent = () => {
    if (isSpeaking) {
      return variant === 'icon' ? (
        <div className="flex items-center justify-center">
          <div className="loading-spinner w-5 h-5" />
        </div>
      ) : (
        <SpeechLoadingIndicator />
      );
    }

    const speakerIcon = (
      <svg 
        className={`${variant === 'icon' ? 'w-6 h-6' : 'w-5 h-5'}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6h3v-6H9z" 
        />
      </svg>
    );

    if (variant === 'icon') {
      return speakerIcon;
    }

    return (
      <div className="flex items-center space-x-2">
        {speakerIcon}
        <span>聽發音</span>
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={handleSpeak}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={disabled || isSpeaking}
        className={`
          ${getVariantClasses()}
          ${sizeClasses[size]}
          ${animationClasses}
          ${className}
          relative overflow-hidden
        `}
        aria-label={`播放「${text}」的發音`}
        title={disabled ? '語音功能不可用' : `點擊聽取「${text}」的發音`}
      >
        {buttonContent()}
        
        {/* Ripple effect for better feedback */}
        {uiSettings.animationsEnabled && isPressed && !disabled && (
          <div className="absolute inset-0 bg-white opacity-20 animate-ping rounded-inherit" />
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-error-500 text-white text-child-sm rounded-child shadow-child-lg z-10 whitespace-nowrap animate-fade-in">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

// Specialized speech buttons for different contexts
export function WordSpeechButton({ 
  word, 
  className = '' 
}: { 
  word: string; 
  className?: string 
}) {
  return (
    <SpeechButton
      text={word}
      variant="icon"
      size="large"
      className={className}
      aria-label={`播放單字「${word}」的發音`}
    />
  );
}

export function InlineSpeechButton({ 
  text, 
  className = '' 
}: { 
  text: string; 
  className?: string 
}) {
  return (
    <SpeechButton
      text={text}
      variant="secondary"
      size="small"
      className={className}
    />
  );
}