import React, { Children, cloneElement, isValidElement, KeyboardEvent } from 'react';
import { generateAriaLabel } from '@/lib/accessibility';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  onActivate?: (index: number) => void;
  className?: string;
  role?: string;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  orientation = 'horizontal',
  loop = true,
  onActivate,
  className = '',
  role = 'navigation'
}) => {
  const childArray = Children.toArray(children);
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent) => {
    const isHorizontal = orientation === 'horizontal';
    let newIndex = focusedIndex;

    switch (event.key) {
      case isHorizontal ? 'ArrowRight' : 'ArrowDown':
        event.preventDefault();
        newIndex = loop && focusedIndex === childArray.length - 1 ? 0 : Math.min(focusedIndex + 1, childArray.length - 1);
        break;
      case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
        event.preventDefault();
        newIndex = loop && focusedIndex === 0 ? childArray.length - 1 : Math.max(focusedIndex - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = childArray.length - 1;
        break;
      case 'Enter':
      case ' ':
        if (onActivate) {
          event.preventDefault();
          onActivate(focusedIndex);
        }
        break;
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      // Focus the element at the new index
      const container = containerRef.current;
      if (container) {
        const focusableElements = container.querySelectorAll('[tabindex]');
        const elementToFocus = focusableElements[newIndex] as HTMLElement;
        elementToFocus?.focus();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      role={role}
      className={className}
      onKeyDown={handleKeyDown}
      aria-orientation={orientation}
    >
      {childArray.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            key: index,
            tabIndex: index === focusedIndex ? 0 : -1,
            'aria-selected': index === focusedIndex,
            ...child.props
          });
        }
        return child;
      })}
    </div>
  );
};

// Specialized components for common navigation patterns
export const TabNavigation: React.FC<Omit<KeyboardNavigationProps, 'role'>> = (props) => (
  <KeyboardNavigation {...props} role="tablist" />
);

export const MenuNavigation: React.FC<Omit<KeyboardNavigationProps, 'role' | 'orientation'>> = (props) => (
  <KeyboardNavigation {...props} role="menu" orientation="vertical" />
);