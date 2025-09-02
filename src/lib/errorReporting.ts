// Error Reporting Utilities for Production

interface ErrorContext {
  widgetId?: string;
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  error?: Error | unknown;
  context?: ErrorContext;
  timestamp: Date;
  userAgent: string;
  url: string;
}

class ErrorReporter {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Report an error with context information
   */
  reportError(message: string, context?: ErrorContext, error?: Error | unknown): void {
    const errorReport: ErrorReport = {
      message,
      error,
      context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    if (this.isDevelopment) {
      // In development, log to console with styling
      console.group('🚨 Error Report');
      console.error('Message:', message);
      if (context) console.info('Context:', context);
      if (error) console.error('Error:', error);
      console.info('Timestamp:', errorReport.timestamp.toISOString());
      console.groupEnd();
    } else {
      // In production, you would send to your error tracking service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      this.sendToErrorService(errorReport);
    }
  }

  /**
   * Report a warning (non-critical issue)
   */
  reportWarning(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.warn('⚠️ Warning:', message, context);
    } else {
      // Could send warnings to analytics or separate warning service
      this.sendToAnalytics('warning', message, context);
    }
  }

  /**
   * Report performance issues
   */
  reportPerformance(metric: string, value: number, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.info('📊 Performance:', metric, value, context);
    } else {
      this.sendToAnalytics('performance', metric, { ...context, value });
    }
  }

  private sendToErrorService(errorReport: ErrorReport): void {
    // In a real application, send to your error tracking service
    // Example implementations:
    
    // Sentry:
    // Sentry.captureException(errorReport.error, {
    //   tags: errorReport.context,
    //   extra: { message: errorReport.message }
    // });

    // Custom endpoint:
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // }).catch(() => {
    //   // Fallback to console if error service fails
    //   console.error('Failed to report error:', errorReport);
    // });

    // For now, store in localStorage as fallback
    try {
      const existingErrors = JSON.parse(localStorage.getItem('pip_error_reports') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 50 errors to prevent storage bloat
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }
      
      localStorage.setItem('pip_error_reports', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.error('Failed to store error report:', storageError);
    }
  }

  private sendToAnalytics(type: string, message: string, context?: any): void {
    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    // Example:
    // gtag('event', 'exception', {
    //   description: message,
    //   fatal: false,
    //   custom_map: context
    // });
  }
}

// Create singleton instance
const errorReporter = new ErrorReporter();

// Export convenience functions
export const reportError = (
  message: string, 
  context?: ErrorContext, 
  error?: Error | unknown
): void => {
  errorReporter.reportError(message, context, error);
};

export const reportWarning = (
  message: string, 
  context?: ErrorContext
): void => {
  errorReporter.reportWarning(message, context);
};

export const reportPerformance = (
  metric: string, 
  value: number, 
  context?: ErrorContext
): void => {
  errorReporter.reportPerformance(metric, value, context);
};

// React Error Boundary helper
export const createErrorBoundaryHandler = (componentName: string) => {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    reportError(
      `React Error Boundary: ${error.message}`,
      {
        component: componentName,
        metadata: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      },
      error
    );
  };
};

export default errorReporter;
