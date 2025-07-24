import { useUISettings } from '../contexts/AppContext';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
  showPercentage?: boolean;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

export function ProgressIndicator({
  current,
  total,
  className = '',
  showPercentage = true,
  showText = true,
  size = 'medium',
  color = 'primary',
  animated = true
}: ProgressIndicatorProps) {
  const uiSettings = useUISettings();
  const clampedCurrent = Math.max(0, Math.min(current, total));
  const percentage = total > 0 ? Math.round((clampedCurrent / total) * 100) : 0;

  // Size classes
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  // Color classes for progress bar
  const colorClasses = {
    primary: 'bg-gradient-to-r from-childPrimary-400 to-childPrimary-600',
    success: 'bg-gradient-to-r from-childSuccess-400 to-childSuccess-600',
    warning: 'bg-gradient-to-r from-childWarning-400 to-childWarning-600',
    error: 'bg-gradient-to-r from-error-400 to-error-600'
  };

  // Text color classes
  const textColorClasses = {
    primary: 'text-childPrimary-600 dark:text-childPrimary-400',
    success: 'text-childSuccess-600 dark:text-childSuccess-400',
    warning: 'text-childWarning-600 dark:text-childWarning-400',
    error: 'text-error-600 dark:text-error-400'
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-child-sm',
    medium: 'text-child-base',
    large: 'text-child-lg'
  };

  // Get emoji based on progress
  const getProgressEmoji = () => {
    if (percentage === 100) return '🎉';
    if (percentage >= 75) return '🌟';
    if (percentage >= 50) return '💪';
    if (percentage >= 25) return '🚀';
    return '📚';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress text and percentage */}
      {(showText || showPercentage) && (
        <div className="flex items-center justify-between mb-3">
          {showText && (
            <div className="flex items-center space-x-2">
              <span className={`${uiSettings.animationsEnabled ? 'animate-bounce-gentle' : ''}`}>
                {getProgressEmoji()}
              </span>
              <span className={`${textSizeClasses[size]} font-bold text-gray-700 dark:text-gray-300 theme-transition`}>
                第 {clampedCurrent} 個，共 {total} 個
              </span>
            </div>
          )}
          {showPercentage && (
            <span className={`${textSizeClasses[size]} font-bold ${textColorClasses[color]} theme-transition`}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div className={`
        w-full bg-gray-200 dark:bg-gray-700 rounded-child-lg overflow-hidden shadow-inner theme-transition
        ${sizeClasses[size]}
      `}>
        {/* Progress bar fill */}
        <div 
          className={`
            ${colorClasses[color]} 
            ${sizeClasses[size]} 
            rounded-child-lg 
            transition-all duration-500 ease-out
            relative overflow-hidden
            ${animated && uiSettings.animationsEnabled ? 'progress-bar-child' : ''}
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={clampedCurrent}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`進度：${clampedCurrent} / ${total} (${percentage}%)`}
        >
          {/* Animated shine effect */}
          {animated && uiSettings.animationsEnabled && percentage > 0 && (
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse-gentle" />
          )}
        </div>
      </div>

      {/* Progress steps indicator for small totals */}
      {total <= 10 && (
        <div className="flex justify-between mt-2 px-1">
          {Array.from({ length: total }, (_, index) => (
            <div
              key={index}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${index < clampedCurrent 
                  ? `${colorClasses[color].replace('bg-gradient-to-r from-', 'bg-').replace(' to-childPrimary-600', '').replace(' to-childSuccess-600', '').replace(' to-childWarning-600', '').replace(' to-error-600', '')} shadow-child` 
                  : 'bg-gray-300 dark:bg-gray-600'
                }
                ${uiSettings.animationsEnabled ? 'transform hover:scale-125' : ''}
              `}
              aria-label={`步驟 ${index + 1}${index < clampedCurrent ? ' 已完成' : ' 未完成'}`}
            />
          ))}
        </div>
      )}

      {/* Accessible text for screen readers */}
      <div className="sr-only">
        進度：{clampedCurrent} / {total}，完成 {percentage}%
      </div>

      {/* Completion celebration */}
      {percentage === 100 && uiSettings.animationsEnabled && (
        <div className="text-center mt-3 animate-bounce-in">
          <span className="text-child-lg">🎊 完成了！太棒了！ 🎊</span>
        </div>
      )}
    </div>
  );
}

// Specialized progress indicators
export function ReviewProgressIndicator({ 
  current, 
  total, 
  className = '' 
}: { 
  current: number; 
  total: number; 
  className?: string; 
}) {
  return (
    <ProgressIndicator
      current={current}
      total={total}
      color="primary"
      size="large"
      className={className}
      animated={true}
    />
  );
}

export function ExamProgressIndicator({ 
  current, 
  total, 
  className = '' 
}: { 
  current: number; 
  total: number; 
  className?: string; 
}) {
  return (
    <ProgressIndicator
      current={current}
      total={total}
      color="success"
      size="large"
      className={className}
      animated={true}
    />
  );
}