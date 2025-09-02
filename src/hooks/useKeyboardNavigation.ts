import { useEffect, useRef, useCallback } from 'react';
import { keyboardNavigation } from '@/lib/accessibility';

interface UseKeyboardNavigationOptions {
  items: HTMLElement[] | NodeListOf<HTMLElement>;
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  onEnter?: (index: number) => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({
  items,
  currentIndex,
  onIndexChange,
  onEnter,
  onEscape,
  enabled = true
}: UseKeyboardNavigationOptions) => {
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !items.length) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        keyboardNavigation.handleArrowKeys(event, items, currentIndex, onIndexChange);
        break;
      case 'Enter':
      case ' ':
        if (onEnter) {
          event.preventDefault();
          onEnter(currentIndex);
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
    }
  }, [items, currentIndex, onIndexChange, onEnter, onEscape, enabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  // Focus management
  const focusItem = useCallback((index: number) => {
    if (items[index]) {
      (items[index] as HTMLElement).focus();
    }
  }, [items]);

  return {
    containerRef,
    focusItem,
    handleKeyDown
  };
};

// Hook for managing focus trap in modals/dialogs
export const useFocusTrap = (enabled: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Store previous active element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set up focus trap
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      // Restore focus to previous element
      if (previousActiveElement.current && document.contains(previousActiveElement.current)) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled]);

  return containerRef;
};