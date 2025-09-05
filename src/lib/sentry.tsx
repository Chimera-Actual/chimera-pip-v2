import * as Sentry from '@sentry/react';
import React, { useEffect } from 'react';
import { 
  useLocation, 
  useNavigationType, 
  createRoutesFromChildren,
  matchRoutes
} from 'react-router-dom';

interface SentryConfig {
  dsn?: string;
  environment?: string;
  enabled?: boolean;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
}

class SentryManager {
  private initialized = false;

  initialize(config?: SentryConfig) {
    // Only initialize in production and if DSN is provided
    const dsn = config?.dsn || import.meta.env.VITE_SENTRY_DSN;
    const enabled = config?.enabled ?? import.meta.env.PROD;

    if (!enabled || !dsn || this.initialized) {
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment: config?.environment || import.meta.env.MODE,
        integrations: [
          new Sentry.BrowserTracing({
            // Set tracing origins to your app's domain
            tracingOrigins: [
              'localhost',
              window.location.hostname,
              /^\//,
            ],
            // Performance Monitoring
            routingInstrumentation: Sentry.reactRouterV6Instrumentation(
              useEffect,
              useLocation,
              useNavigationType,
              createRoutesFromChildren,
              matchRoutes
            ),
          }),
          new Sentry.Replay({
            // Mask all text and inputs by default for privacy
            maskAllText: true,
            maskAllInputs: true,
            // Capture errors in more detail
            blockAllMedia: false,
            // Sample rate for session replays
            sessionSampleRate: config?.replaysSessionSampleRate || 0.1,
            // Sample rate for replays on errors
            errorSampleRate: config?.replaysOnErrorSampleRate || 1.0,
          }),
        ],
        // Performance Monitoring
        tracesSampleRate: config?.tracesSampleRate || 0.1,
        // Release tracking
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
        // User context
        beforeSend(event, hint) {
          // Filter out sensitive information
          if (event.request?.cookies) {
            delete event.request.cookies;
          }
          
          // Don't send events in development unless explicitly enabled
          if (!import.meta.env.PROD && !config?.enabled) {
            return null;
          }

          // Add custom context
          event.contexts = {
            ...event.contexts,
            app: {
              version: import.meta.env.VITE_APP_VERSION || 'unknown',
              build_time: import.meta.env.VITE_BUILD_TIME || 'unknown',
            },
          };

          return event;
        },
        // Ignore certain errors
        ignoreErrors: [
          // Browser extensions
          'top.GLOBALS',
          // Random network errors
          'Non-Error promise rejection captured',
          'Network request failed',
          'NetworkError',
          'Failed to fetch',
          // User canceled actions
          'AbortError',
          'Request aborted',
          // Common browser quirks
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed',
        ],
        // Only capture errors from our domain
        allowUrls: [
          window.location.hostname,
          'localhost',
        ],
      });

      this.initialized = true;
      console.info('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  // Set user context
  setUser(user: { id: string; email?: string; username?: string } | null) {
    if (!this.initialized) return;

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    } else {
      Sentry.setUser(null);
    }
  }

  // Add custom context
  setContext(key: string, context: Record<string, any>) {
    if (!this.initialized) return;
    Sentry.setContext(key, context);
  }

  // Add breadcrumb for better error tracking
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: Sentry.SeverityLevel;
    data?: Record<string, any>;
  }) {
    if (!this.initialized) return;
    Sentry.addBreadcrumb(breadcrumb);
  }

  // Capture custom error
  captureError(error: Error | string, context?: Record<string, any>) {
    if (!this.initialized) return;

    if (typeof error === 'string') {
      Sentry.captureMessage(error, 'error');
    } else {
      Sentry.captureException(error, { extra: context });
    }
  }

  // Capture custom message
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (!this.initialized) return;
    Sentry.captureMessage(message, level);
  }

  // Start performance transaction
  startTransaction(name: string, op: string = 'navigation') {
    if (!this.initialized) return null;
    
    return Sentry.startTransaction({
      name,
      op,
    });
  }

  // Profile a function
  async profile<T>(
    name: string,
    fn: () => T | Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    if (!this.initialized) {
      return fn();
    }

    const transaction = this.startTransaction(name, 'function');
    
    try {
      const result = await fn();
      transaction?.setStatus('ok');
      return result;
    } catch (error) {
      transaction?.setStatus('internal_error');
      this.captureError(error as Error, context);
      throw error;
    } finally {
      transaction?.finish();
    }
  }

  // Wrap React components with error boundary
  withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryOptions?: Sentry.ErrorBoundaryOptions
  ) {
    if (!this.initialized) {
      return Component;
    }

    return Sentry.withErrorBoundary(Component, {
      fallback: ({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-pip-bg-primary p-4">
          <div className="max-w-md w-full bg-pip-bg-secondary border-2 border-destructive rounded-lg p-6">
            <h2 className="text-xl font-bold text-destructive mb-4">
              CRITICAL ERROR DETECTED
            </h2>
            <p className="text-pip-text-secondary mb-4">
              An unexpected error has occurred. The error has been logged and our team has been notified.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-pip-text-muted hover:text-pip-text-secondary">
                Error Details
              </summary>
              <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-pip-bg-primary rounded">
                {error?.toString()}
              </pre>
            </details>
            <button
              onClick={resetError}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              RETRY
            </button>
          </div>
        </div>
      ),
      showDialog: false,
      ...errorBoundaryOptions,
    });
  }

  // Wrap React Router routes
  withSentryRouting<T extends React.ComponentType<any>>(Component: T): T {
    if (!this.initialized) {
      return Component;
    }

    return Sentry.withSentryRouting(Component);
  }
}

// Export singleton instance
export const sentryManager = new SentryManager();

// React hooks for Sentry
export function useSentryUser(user: { id: string; email?: string; username?: string } | null) {
  useEffect(() => {
    sentryManager.setUser(user);
  }, [user]);
}

export function useSentryContext(key: string, context: Record<string, any>) {
  useEffect(() => {
    sentryManager.setContext(key, context);
  }, [key, context]);
}

// Error boundary component
export const SentryErrorBoundary = sentryManager.withErrorBoundary;

// Export for direct use
export default sentryManager;

// Re-export useful Sentry types
export type { SeverityLevel } from '@sentry/react';