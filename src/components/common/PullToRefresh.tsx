import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const pullDist = Math.max(0, currentY - touchStartY.current);
    
    if (pullDist > 0) {
      e.preventDefault();
      setPullDistance(pullDist);
      setIsPulling(pullDist > threshold);
    }
  }, [threshold, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const rotation = pullProgress * 180;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          "pull-to-refresh transition-all duration-300 ease-out",
          (isPulling || isRefreshing) && "active"
        )}
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <RefreshCw 
            className={cn(
              "w-5 h-5 text-pip-text-secondary transition-all duration-300",
              isRefreshing && "animate-spin text-primary",
              isPulling && "text-primary"
            )}
            style={{
              transform: `rotate(${rotation}deg)`
            }}
          />
          <span className="text-sm font-mono uppercase tracking-wide">
            {isRefreshing ? 'Refreshing...' : isPulling ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div 
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.3, 24)}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};