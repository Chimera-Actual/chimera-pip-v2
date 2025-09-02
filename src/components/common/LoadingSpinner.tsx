import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-pip-green-primary pip-glow`} />
        <div className="absolute inset-0">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-pip-green-secondary/30`} style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
        </div>
      </div>
      {text && (
        <p className="text-sm font-pip-mono text-pip-text-muted animate-pulse">
          {'>'} {text}...
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;