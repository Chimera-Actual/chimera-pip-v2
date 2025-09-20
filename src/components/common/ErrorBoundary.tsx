import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: any, errorInfo: any) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false };
  
  static getDerivedStateFromError() { 
    return { hasError: true }; 
  }
  
  componentDidCatch(err: any, errorInfo: any) { 
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', err);
    }
    this.props.onError?.(err, errorInfo);
  }
  
  render() { 
    return this.state.hasError 
      ? (this.props.fallback ?? <div className="text-destructive p-4">Widget failed to load</div>) 
      : this.props.children; 
  }
}