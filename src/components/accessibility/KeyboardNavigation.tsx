import React, { useEffect, useCallback } from 'react';
import { useFocusManager } from './FocusManager';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  disabled?: boolean;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  disabled = false,
}) => {
  const { focusNext, focusPrevious } = useFocusManager();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        } else {
          // Default behavior: focus previous element
          event.preventDefault();
          focusPrevious();
        }
        break;
      
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        } else {
          // Default behavior: focus next element
          event.preventDefault();
          focusNext();
        }
        break;
      
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
      
      case 'Tab':
        // Allow default Tab behavior, but provide visual feedback
        const activeElement = document.activeElement;
        if (activeElement) {
          activeElement.classList.add('keyboard-focus');
          setTimeout(() => {
            activeElement.classList.remove('keyboard-focus');
          }, 150);
        }
        break;
    }
  }, [
    disabled,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    focusNext,
    focusPrevious,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <div className="keyboard-navigation-container">{children}</div>;
};

// Hook for tab reordering with keyboard
export const useTabKeyboardReorder = (
  tabs: Array<{ id: string; name: string }>,
  onReorder: (fromIndex: number, toIndex: number) => void
) => {
  const [focusedTabIndex, setFocusedTabIndex] = React.useState<number | null>(null);

  const handleTabKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (focusedTabIndex === null) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (focusedTabIndex > 0) {
          onReorder(focusedTabIndex, focusedTabIndex - 1);
          setFocusedTabIndex(focusedTabIndex - 1);
        }
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        if (focusedTabIndex < tabs.length - 1) {
          onReorder(focusedTabIndex, focusedTabIndex + 1);
          setFocusedTabIndex(focusedTabIndex + 1);
        }
        break;
      
      case 'Home':
        event.preventDefault();
        if (focusedTabIndex !== 0) {
          onReorder(focusedTabIndex, 0);
          setFocusedTabIndex(0);
        }
        break;
      
      case 'End':
        event.preventDefault();
        const lastIndex = tabs.length - 1;
        if (focusedTabIndex !== lastIndex) {
          onReorder(focusedTabIndex, lastIndex);
          setFocusedTabIndex(lastIndex);
        }
        break;
    }
  }, [focusedTabIndex, tabs.length, onReorder]);

  const focusTab = useCallback((index: number) => {
    setFocusedTabIndex(index);
  }, []);

  const blurTab = useCallback(() => {
    setFocusedTabIndex(null);
  }, []);

  return {
    focusedTabIndex,
    focusTab,
    blurTab,
    handleTabKeyNavigation,
  };
};