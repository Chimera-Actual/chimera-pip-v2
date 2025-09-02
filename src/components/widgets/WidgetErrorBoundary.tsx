import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportError } from '@/lib/errorReporting';

interface Props {
  children: ReactNode;
  widgetId?: string;
  widgetTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(
      `Widget Error: ${error.message}`,
      {
        widgetId: this.props.widgetId,
        component: 'WidgetErrorBoundary',
        action: 'componentDidCatch',
        metadata: {
          widgetTitle: this.props.widgetTitle,
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      },
      error
    );
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="pip-widget border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive font-pip-display">
              <AlertTriangle className="h-5 w-5" />
              Widget Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-pip-mono text-pip-text-bright">
                {this.props.widgetTitle || 'Widget'} encountered an error
              </div>
              <div className="text-xs font-pip-mono text-pip-text-muted">
                {this.state.error?.message || 'Unknown error occurred'}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={this.handleRetry}
              className="font-pip-mono"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              RETRY
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}