import React, { Suspense, lazy, ComponentType } from 'react';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  delay?: number;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback,
  errorFallback,
  delay = 200
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" text="Loading..." />
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyWrappedComponent = (props: P) => (
    <LazyComponent fallback={fallback}>
      <Component {...props} />
    </LazyComponent>
  );

  LazyWrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  
  return LazyWrappedComponent;
};

// Factory for creating lazy components with custom loading states
export const createLazyComponent = (
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyLoadedComponent = lazy(importFunction);
  
  return (props: any) => (
    <LazyComponent fallback={fallback}>
      <LazyLoadedComponent {...props} />
    </LazyComponent>
  );
};