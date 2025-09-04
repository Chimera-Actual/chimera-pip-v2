import React, { memo, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AsyncStateManagerProps {
  isLoading: boolean;
  error: string | null;
  children: ReactNode;
  
  // Customization options
  loadingText?: string;
  emptyState?: ReactNode;
  errorActions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  
  // Layout options
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  
  // Behavioral options
  showErrorDetails?: boolean;
  retryable?: boolean;
  onRetry?: () => void;
}

/**
 * Consistent async state management component that handles loading, 
 * error, and empty states with a unified pattern across all widgets.
 */
export const AsyncStateManager: React.FC<AsyncStateManagerProps> = memo(({
  isLoading,
  error,
  children,
  loadingText = "Loading...",
  emptyState = null,
  errorActions = [],
  className = "",
  loadingClassName = "",
  errorClassName = "",
  showErrorDetails = false,
  retryable = true,
  onRetry
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center p-6 min-h-[120px]",
        loadingClassName,
        className
      )}>
        <LoadingSpinner 
          size="md" 
          text={loadingText}
          className="text-pip-green-primary"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    const defaultActions = [
      ...(retryable && onRetry ? [{
        label: 'Retry',
        action: onRetry,
        variant: 'outline' as const
      }] : []),
      ...errorActions
    ];

    return (
      <div className={cn(
        "p-4",
        errorClassName,
        className
      )}>
        <Alert className="border-pip-orange/50 bg-pip-bg-secondary/30">
          <AlertTriangle className="h-4 w-4 text-pip-orange" />
          <AlertDescription className="font-pip-mono">
            <div className="space-y-2">
              <div className="text-pip-orange font-medium">
                Operation Failed
              </div>
              {showErrorDetails && (
                <div className="text-pip-text-muted text-sm">
                  {error}
                </div>
              )}
              {defaultActions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {defaultActions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={action.variant || 'outline'}
                      onClick={action.action}
                      className={cn(
                        "font-pip-mono text-xs",
                        action.variant === 'outline' && 
                        "border-pip-green-primary/30 text-pip-green-primary hover:bg-pip-green-primary/20"
                      )}
                    >
                      {action.label === 'Retry' && <RefreshCw className="h-3 w-3 mr-1" />}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state (when children is null/undefined)
  if (!children && emptyState) {
    return (
      <div className={cn("p-6 text-center", className)}>
        {emptyState}
      </div>
    );
  }

  // Success state - render children
  return (
    <div className={className}>
      {children}
    </div>
  );
});

AsyncStateManager.displayName = 'AsyncStateManager';

// Specialized components for common patterns
export const WidgetAsyncContent: React.FC<
  Omit<AsyncStateManagerProps, 'className'> & {
    title?: string;
  }
> = memo(({ title, ...props }) => (
  <AsyncStateManager
    {...props}
    className="pip-widget-body"
    loadingClassName="pip-widget-loading"
    errorClassName="pip-widget-error"
    emptyState={
      <div className="text-pip-text-muted font-pip-mono text-sm">
        {title ? `No ${title.toLowerCase()} data available` : 'No data available'}
      </div>
    }
  />
));

WidgetAsyncContent.displayName = 'WidgetAsyncContent';

// Higher-order component for wrapping components with async state management
export const withAsyncState = <P extends object>(
  Component: React.ComponentType<P>,
  getStateFromProps: (props: P) => Pick<AsyncStateManagerProps, 'isLoading' | 'error'>
) => {
  const WrappedComponent = memo((props: P) => {
    const { isLoading, error } = getStateFromProps(props);
    
    return (
      <AsyncStateManager isLoading={isLoading} error={error}>
        <Component {...props} />
      </AsyncStateManager>
    );
  });

  WrappedComponent.displayName = `withAsyncState(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};