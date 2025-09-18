import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportError } from '@/lib/errorReporting';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorId: string | null;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  errorId 
}) => (
  <Card className="m-4 border-destructive/20 bg-destructive/5">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        Something went wrong
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-2">Error Details:</p>
        <code className="block p-2 bg-muted rounded text-xs">
          {error.message}
        </code>
        {errorId && (
          <p className="text-xs mt-2 opacity-70">
            Error ID: {errorId}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={resetError}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button
          onClick={() => window.location.reload()}
          size="sm"
          variant="ghost"
        >
          Reload Page
        </Button>
      </div>
    </CardContent>
  </Card>
);

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;

    // Report error to monitoring service
    reportError('React Error Boundary', {
      component: 'ErrorBoundary',
      errorId,
      componentStack: errorInfo.componentStack,
    }, error);

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys have changed
    if (
      hasError &&
      prevProps.resetKeys !== resetKeys &&
      resetKeys?.some((key, idx) => key !== prevProps.resetKeys?.[idx])
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorId: null,
      });
    }, 0);
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, fallback: Fallback = DefaultErrorFallback } = this.props;

    if (hasError && error) {
      return (
        <Fallback
          error={error}
          resetError={this.resetError}
          errorId={errorId}
        />
      );
    }

    return children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const catchError = React.useCallback((error: Error) => {
    reportError('Async Error Handler', {
      component: 'useErrorHandler',
    }, error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { catchError, resetError, error };
};