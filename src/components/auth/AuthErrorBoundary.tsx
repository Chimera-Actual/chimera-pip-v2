import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { reportError } from '@/lib/errorReporting';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError('Auth component error', {
      error,
      errorInfo,
      component: 'AuthErrorBoundary'
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Alert variant="destructive" className="pip-terminal border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-4">
                <div className="space-y-2">
                  <p className="font-mono font-bold text-destructive">
                    SYSTEM ERROR DETECTED
                  </p>
                  <p className="font-mono text-sm">
                    A critical error occurred in the authentication system. 
                    Please try refreshing the page or contact support if the problem persists.
                  </p>
                </div>
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="w-full font-mono pip-button-glow"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  RETRY AUTHENTICATION
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}