import React, { Suspense } from 'react';
import { BootSequence } from '@/components/PipBoy/BootSequence';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface LoadingSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  useBootSequence?: boolean;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

const BootFallback = () => <BootSequence />;

export const LoadingSuspense: React.FC<LoadingSuspenseProps> = ({
  children,
  fallback,
  useBootSequence = false,
}) => {
  const defaultFallback = useBootSequence ? <BootFallback /> : <DefaultFallback />;

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};