import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportError } from '@/lib/errorReporting';

interface Props {
  children: ReactNode;
  formName?: string;
  onRetry?: () => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class FormErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: `form-error-${Date.now()}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(
      `Form Error: ${error.message}`,
      {
        formName: this.props.formName,
        component: 'FormErrorBoundary',
        action: 'componentDidCatch',
        metadata: {
          errorId: this.state.errorId,
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
          formContext: true,
        },
      },
      error
    );
  }

  private handleRetry = () => {
    if (this.props.onRetry) {
      this.props.onRetry();
    }
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="pip-widget border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive font-pip-display">
              <AlertTriangle className="h-5 w-5" />
              Form Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-pip-mono text-pip-text-bright">
                {this.props.formName ? `${this.props.formName} form` : 'Form'} encountered an error
              </div>
              <div className="text-xs font-pip-mono text-pip-text-muted">
                {this.state.error?.message || 'An unexpected error occurred while processing the form'}
              </div>
              {this.state.errorId && (
                <div className="text-xs font-pip-mono text-pip-text-muted opacity-70">
                  Error ID: {this.state.errorId}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={this.handleRetry}
                className="font-pip-mono"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                RETRY
              </Button>
              
              {this.props.onReset && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={this.handleReset}
                  className="font-pip-mono"
                >
                  <FileX className="h-4 w-4 mr-2" />
                  RESET FORM
                </Button>
              )}
            </div>

            <div className="border-t pt-3">
              <details className="text-xs font-pip-mono">
                <summary className="cursor-pointer text-pip-text-muted hover:text-pip-text-bright">
                  Technical Details
                </summary>
                <pre className="mt-2 p-2 bg-background/50 rounded text-xs overflow-x-auto">
                  {this.state.error?.stack || 'No stack trace available'}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping forms with error boundary
export function withFormErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    formName?: string;
    onRetry?: () => void;
    onReset?: () => void;
  } = {}
) {
  const WithFormErrorBoundaryComponent = (props: P) => (
    <FormErrorBoundary
      formName={options.formName}
      onRetry={options.onRetry}
      onReset={options.onReset}
    >
      <WrappedComponent {...props} />
    </FormErrorBoundary>
  );

  WithFormErrorBoundaryComponent.displayName = `withFormErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithFormErrorBoundaryComponent;
}