import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportError } from '@/lib/errorReporting';
import { useComponentMetrics } from '@/hooks/usePerformanceMonitor';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
  level?: 'widget' | 'page' | 'app';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundaryWithFallback extends Component<Props, State> {
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, componentName = 'UnknownComponent', level = 'widget' } = this.props;
    
    this.setState({ errorInfo });

    // Report error with context
    reportError(
      `${level} Error: ${error.message}`,
      {
        component: componentName,
        action: 'componentDidCatch',
        metadata: {
          level,
          retryCount: this.state.retryCount,
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      },
      error
    );

    // Call custom error handler
    onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private renderErrorUI() {
    const { level = 'widget', componentName } = this.props;
    const { error, retryCount } = this.state;
    const canRetry = retryCount < this.maxRetries;

    const errorMessages = {
      widget: 'Widget encountered an error',
      page: 'Page failed to load',
      app: 'Application encountered a critical error'
    };

    const icons = {
      widget: AlertTriangle,
      page: Bug,
      app: AlertTriangle
    };

    const Icon = icons[level];

    return (
      <Card className={`pip-widget border-destructive/50 ${level === 'app' ? 'min-h-screen flex items-center justify-center' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive font-pip-display">
            <Icon className="h-5 w-5" />
            {errorMessages[level]}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-pip-mono text-pip-text-bright">
              {componentName && `${componentName}: `}
              {error?.message || 'An unexpected error occurred'}
            </div>
            {retryCount > 0 && (
              <div className="text-xs font-pip-mono text-pip-text-muted">
                Retry attempt: {retryCount}/{this.maxRetries}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 justify-center">
            {canRetry && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={this.handleRetry}
                className="font-pip-mono"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                RETRY
              </Button>
            )}
            
            {level === 'app' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={this.handleReload}
                className="font-pip-mono"
              >
                RELOAD APP
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorUI();
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryWithFallback {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryWithFallback>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};