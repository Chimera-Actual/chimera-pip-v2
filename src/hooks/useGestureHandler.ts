import React, { useRef, useCallback, useEffect } from 'react';

interface GestureHandlerOptions {
  onLongPress?: (event: React.TouchEvent | React.MouseEvent) => void;
  onSwipeLeft?: (event: React.TouchEvent) => void;
  onSwipeRight?: (event: React.TouchEvent) => void;
  onSwipeUp?: (event: React.TouchEvent) => void;
  onSwipeDown?: (event: React.TouchEvent) => void;
  onPullToRefresh?: () => void;
  longPressDelay?: number;
  swipeThreshold?: number;
  refreshThreshold?: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  pullDistance: number;
}

export const useGestureHandler = (options: GestureHandlerOptions) => {
  const {
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    longPressDelay = 400,
    swipeThreshold = 50,
    refreshThreshold = 80
  } = options;

  const touchState = useRef<TouchState | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      pullDistance: 0
    };

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(event);
        // Add visual feedback
        if (elementRef.current) {
          elementRef.current.classList.add('long-press-indicator');
          setTimeout(() => {
            elementRef.current?.classList.remove('long-press-indicator');
          }, 400);
        }
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!touchState.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;

    // Clear long press if moved too much
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearLongPressTimer();
    }

    // Handle pull to refresh
    if (onPullToRefresh && deltaY > 0 && window.scrollY === 0) {
      touchState.current.pullDistance = deltaY;
      
      const pullElement = document.querySelector('.pull-to-refresh');
      if (pullElement) {
        if (deltaY > refreshThreshold) {
          pullElement.classList.add('active');
        } else {
          pullElement.classList.remove('active');
        }
      }
    }
  }, [clearLongPressTimer, onPullToRefresh, refreshThreshold]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    clearLongPressTimer();

    if (!touchState.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;

    // Check for swipe gestures (fast movement)
    if (deltaTime < 300) {
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight(event);
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft(event);
        }
      } else if (Math.abs(deltaY) > swipeThreshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown(event);
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp(event);
        }
      }
    }

    // Check for pull to refresh
    if (onPullToRefresh && touchState.current.pullDistance > refreshThreshold) {
      onPullToRefresh();
    }

    // Reset pull to refresh visual state
    const pullElement = document.querySelector('.pull-to-refresh');
    if (pullElement) {
      pullElement.classList.remove('active');
    }

    touchState.current = null;
  }, [clearLongPressTimer, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPullToRefresh, swipeThreshold, refreshThreshold]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(event);
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleMouseUp = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleMouseLeave = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  // Gesture handler props to spread on elements
  const gestureProps = {
    ref: (el: HTMLElement | null) => {
      elementRef.current = el;
    },
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    style: {
      touchAction: 'manipulation', // Prevent default browser gestures
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return {
    gestureProps,
    clearLongPressTimer
  };
};