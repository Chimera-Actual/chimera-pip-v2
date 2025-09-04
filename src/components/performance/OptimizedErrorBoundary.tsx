import React, { Component, ErrorInfo, memo, ReactNode } from 'react';
import { reportError } from '@/lib/errorReporting';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  level?: 'critical' | 'warning' | 'info';
}

interface State {
  hasError: boolean;
  error?: Error;
  prevResetKeys?: Array<string | number>;
}

/**
 * Optimized Error Boundary with proper memoization and error reporting.
 * Automatically resets when resetKeys change to handle transient errors.
 */
class OptimizedErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    prevResetKeys: this.props.resetKeys
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    const { resetKeys } = props;
    const { prevResetKeys } = state;
    
    // Reset error state if resetKeys have changed
    if (resetKeys && prevResetKeys) {
      if (resetKeys.length !== prevResetKeys.length || 
          resetKeys.some((key, idx) => key !== prevResetKeys[idx])) {
        return {
          hasError: false,
          error: undefined,
          prevResetKeys: resetKeys
        };
      }
    }
    
    return { prevResetKeys: resetKeys };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'critical' } = this.props;
    
    // Report error with appropriate level
    reportError(
      `${level.toUpperCase()} Error Boundary: ${error.message}`,
      {
        component: 'OptimizedErrorBoundary',
        action: 'componentDidCatch',
        metadata: {
          level,
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
          resetKeys: this.props.resetKeys
        }
      },
      error
    );

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="pip-widget border border-pip-orange/50 bg-pip-bg-secondary/30 p-4 rounded">
          <div className="text-pip-orange font-pip-mono text-sm">
            Component Error: {this.state.error?.message || 'Unknown error'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Memoized wrapper component
export const OptimizedErrorBoundary = memo<Props>(({ children, ...props }) => (
  <OptimizedErrorBoundaryClass {...props}>
    {children}
  </OptimizedErrorBoundaryClass>
));

OptimizedErrorBoundary.displayName = 'OptimizedErrorBoundary';

// Higher-order component for easy wrapping
export const withOptimizedErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = memo((props: P) => (
    <OptimizedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </OptimizedErrorBoundary>
  ));

  WrappedComponent.displayName = `withOptimizedErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};