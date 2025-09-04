import React, { memo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, Info, XCircle, Zap } from 'lucide-react';
import { AnimatedTransition } from './animated-transitions';

export type FeedbackType = 'success' | 'warning' | 'info' | 'error' | 'pip';

interface FeedbackProps {
  type: FeedbackType;
  message: string;
  duration?: number;
  onClose?: () => void;
  showIcon?: boolean;
  className?: string;
}

const feedbackIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XCircle,
  pip: Zap,
};

const feedbackStyles = {
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  pip: 'bg-pip-green-primary/10 border-pip-green-primary/30 text-pip-green-primary pip-glow',
};

export const InteractiveFeedback = memo<FeedbackProps>(({
  type,
  message,
  duration = 3000,
  onClose,
  showIcon = true,
  className
}) => {
  const [visible, setVisible] = useState(true);
  const IconComponent = feedbackIcons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <AnimatedTransition type="fade" speed="fast">
      <div
        className={cn(
          'flex items-center space-x-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
          feedbackStyles[type],
          className
        )}
      >
        {showIcon && (
          <IconComponent className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="ml-auto text-current/70 hover:text-current transition-colors"
        >
          ×
        </button>
      </div>
    </AnimatedTransition>
  );
});

InteractiveFeedback.displayName = 'InteractiveFeedback';

// Progress Indicator with Pip-Boy styling
export const PipBoyProgress = memo<{
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}>(({ progress, label, showPercentage = true, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-pip-text-primary font-mono">{label}</span>
          {showPercentage && (
            <span className="text-sm text-pip-text-secondary font-mono">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-pip-bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pip-green-primary to-pip-green-secondary transition-all duration-300 ease-out animate-pip-glow"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
});

PipBoyProgress.displayName = 'PipBoyProgress';

// Interactive Status Indicator
export const StatusIndicator = memo<{
  status: 'online' | 'offline' | 'busy' | 'idle';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}>(({ status, label, size = 'md', animated = true }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-pip-green-primary',
    offline: 'bg-gray-500',
    busy: 'bg-red-500',
    idle: 'bg-yellow-500',
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          'rounded-full',
          sizeClasses[size],
          statusColors[status],
          animated && status === 'online' && 'animate-pip-glow'
        )}
      />
      {label && (
        <span className="text-sm text-pip-text-secondary font-mono">{label}</span>
      )}
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

// Click Ripple Effect
export const useRipple = () => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  const RippleContainer = memo<{ className?: string }>(({ className }) => (
    <div className={cn('absolute inset-0 overflow-hidden rounded-inherit pointer-events-none', className)}>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute w-full h-full bg-pip-green-primary/20 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  ));

  RippleContainer.displayName = 'RippleContainer';

  return { addRipple, RippleContainer };
};