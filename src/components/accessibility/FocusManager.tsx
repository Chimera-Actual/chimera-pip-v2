import React, { useEffect, useRef } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
}

export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  autoFocus = false,
  restoreFocus = false,
  trapFocus = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store previously focused element
    if (restoreFocus) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    }

    // Auto focus first focusable element
    if (autoFocus && containerRef.current) {
      const focusableElement = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusableElement) {
        focusableElement.focus();
      }
    }

    // Cleanup function to restore focus
    return () => {
      if (restoreFocus && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [autoFocus, restoreFocus]);

  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus]);

  return (
    <div ref={containerRef} className="focus-manager">
      {children}
    </div>
  );
};

// Hook for managing focus programmatically
export const useFocusManager = () => {
  const focusNext = () => {
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const currentIndex = Array.from(focusableElements).findIndex(
      (element) => element === document.activeElement
    );

    const nextIndex = (currentIndex + 1) % focusableElements.length;
    (focusableElements[nextIndex] as HTMLElement)?.focus();
  };

  const focusPrevious = () => {
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const currentIndex = Array.from(focusableElements).findIndex(
      (element) => element === document.activeElement
    );

    const previousIndex = currentIndex === 0 
      ? focusableElements.length - 1 
      : currentIndex - 1;
    (focusableElements[previousIndex] as HTMLElement)?.focus();
  };

  const focusFirst = () => {
    const firstFocusable = document.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    ) as HTMLElement;
    
    firstFocusable?.focus();
  };

  return {
    focusNext,
    focusPrevious,
    focusFirst,
  };
};