interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

export function LoadingIndicator({ 
  size = 'medium', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'border-childPrimary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  const textSizeClasses = {
    small: 'text-child-sm',
    medium: 'text-child-base',
    large: 'text-child-lg'
  };

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-2 rounded-full animate-spin
        `}
        role="status"
        aria-label="載入中"
      />
      {text && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-600 dark:text-gray-300`}>
          {text}
        </span>
      )}
      <span className="sr-only">載入中...</span>
    </div>
  );
}

// Specialized loading indicators for different contexts
export function SpeechLoadingIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`playing-indicator ${className}`}>
      <div className="loading-spinner w-5 h-5" />
      <span className="text-child-sm font-medium">播放中...</span>
    </div>
  );
}

export function ButtonLoadingIndicator({ 
  text = '處理中...', 
  size = 'medium' 
}: { 
  text?: string; 
  size?: 'small' | 'medium' | 'large' 
}) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <LoadingIndicator size={size} color="white" />
      <span>{text}</span>
    </div>
  );
}

export function PageLoadingIndicator({ text = '載入中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <LoadingIndicator size="large" />
      <p className="text-child-lg font-medium text-gray-600 dark:text-gray-300">
        {text}
      </p>
    </div>
  );
}