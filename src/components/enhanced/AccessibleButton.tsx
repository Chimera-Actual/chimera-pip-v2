import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  /** Screen reader only text for better accessibility */
  ariaLabel?: string;
  /** Description for complex actions */
  ariaDescription?: string;
  /** Loading state with accessible feedback */
  isLoading?: boolean;
  /** Loading text for screen readers */
  loadingText?: string;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Whether the button represents a toggle state */
  isPressed?: boolean;
  /** Controls associated element (for dropdowns, menus, etc.) */
  controls?: string;
  /** Expanded state for collapsible content */
  isExpanded?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className,
    children,
    ariaLabel,
    ariaDescription,
    isLoading = false,
    loadingText = 'Loading...',
    shortcut,
    isPressed,
    controls,
    isExpanded,
    disabled,
    ...props
  }, ref) => {
    // Build aria attributes
    const ariaProps: Record<string, any> = {};
    
    if (ariaLabel) {
      ariaProps['aria-label'] = ariaLabel;
    }
    
    if (ariaDescription) {
      ariaProps['aria-describedby'] = `${props.id || 'btn'}-description`;
    }
    
    if (isPressed !== undefined) {
      ariaProps['aria-pressed'] = isPressed;
    }
    
    if (controls) {
      ariaProps['aria-controls'] = controls;
    }
    
    if (isExpanded !== undefined) {
      ariaProps['aria-expanded'] = isExpanded;
    }
    
    if (isLoading) {
      ariaProps['aria-live'] = 'polite';
      ariaProps['aria-busy'] = 'true';
    }

    return (
      <>
        <Button
          ref={ref}
          className={cn(
            // Enhanced focus styles
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            // Loading state styles
            isLoading && 'cursor-wait opacity-75',
            // Pressed state styles for toggle buttons
            isPressed && 'bg-primary/20',
            className
          )}
          disabled={disabled || isLoading}
          {...ariaProps}
          {...props}
        >
          {/* Loading spinner */}
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          
          {/* Button content */}
          <span className={isLoading ? 'sr-only' : undefined}>
            {children}
          </span>
          
          {/* Loading text for screen readers */}
          {isLoading && <span className="sr-only">{loadingText}</span>}
          
          {/* Keyboard shortcut hint */}
          {shortcut && (
            <kbd className="ml-2 hidden rounded border border-border px-1 text-xs sm:inline">
              {shortcut}
            </kbd>
          )}
        </Button>
        
        {/* Description for screen readers */}
        {ariaDescription && (
          <span id={`${props.id || 'btn'}-description`} className="sr-only">
            {ariaDescription}
          </span>
        )}
      </>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';