import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You could send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-pip-bg-primary flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Alert className="border-pip-border bg-pip-bg-secondary/50 pip-widget">
              <AlertTriangle className="h-4 w-4 text-pip-orange" />
              <AlertTitle className="font-pip-display text-pip-green-primary pip-text-glow">
                SYSTEM ERROR DETECTED
              </AlertTitle>
              <AlertDescription className="font-pip-mono text-pip-text-muted mt-2">
                <div className="space-y-2">
                  <p>
                    {'>'} CRITICAL_FAULT: Component malfunction detected
                  </p>
                  <p className="text-xs opacity-70">
                    Error: {this.state.error?.message || 'Unknown system error'}
                  </p>
                </div>
              </AlertDescription>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={this.handleReset}
                  size="sm"
                  className="bg-pip-green-primary/20 border border-pip-green-primary/30 hover:bg-pip-green-primary/30 font-pip-mono text-pip-green-primary pip-button-glow"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  RETRY
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  size="sm"
                  className="border-pip-border text-pip-text-secondary hover:border-pip-orange hover:text-pip-orange pip-button-glow font-pip-mono"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  RESTART
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;