type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      const entry: LogEntry = { level: 'debug', message, timestamp: new Date(), context };
      this.addToBuffer(entry);
      
      if (this.isDevelopment) {
        console.debug(this.formatMessage('debug', message, context));
      }
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      const entry: LogEntry = { level: 'info', message, timestamp: new Date(), context };
      this.addToBuffer(entry);
      
      if (this.isDevelopment) {
        console.info(this.formatMessage('info', message, context));
      }
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      const entry: LogEntry = { level: 'warn', message, timestamp: new Date(), context };
      this.addToBuffer(entry);
      
      // Always log warnings to console in dev, use error reporting in prod
      if (this.isDevelopment) {
        console.warn(this.formatMessage('warn', message, context));
      } else {
        // In production, send to error reporting service
        this.sendToErrorReporting(entry);
      }
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      const entry: LogEntry = { 
        level: 'error', 
        message, 
        timestamp: new Date(), 
        context: { ...context, error: error?.stack || error?.message }
      };
      this.addToBuffer(entry);
      
      // Always log errors to console in dev, use error reporting in prod
      if (this.isDevelopment) {
        console.error(this.formatMessage('error', message, context), error);
      } else {
        // In production, send to error reporting service
        this.sendToErrorReporting(entry);
      }
    }
  }

  private sendToErrorReporting(entry: LogEntry): void {
    // Integration with error reporting service
    // This could be Sentry, LogRocket, or custom service
    try {
      // Store in localStorage as fallback
      const existingLogs = localStorage.getItem('pip_error_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(entry);
      
      // Keep only last 50 entries
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      localStorage.setItem('pip_error_logs', JSON.stringify(logs));
    } catch {
      // Silently fail if storage is full
    }
  }

  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearLogBuffer(): void {
    this.logBuffer = [];
  }
}

export const logger = new Logger();