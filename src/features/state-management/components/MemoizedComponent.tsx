import React, { memo, forwardRef, ComponentType, PropsWithChildren } from 'react';
import { isEqual } from 'lodash';

/**
 * Higher-order component that adds deep equality checking for props
 * to prevent unnecessary re-renders
 */
export function withDeepMemo<P = {}>(
  Component: ComponentType<P>
) {
  return memo(Component as any, (prevProps: any, nextProps: any) => {
    return isEqual(prevProps, nextProps);
  });
}

/**
 * Higher-order component that adds shallow equality checking for props
 * More performant than deep equality for simple props
 */
export function withShallowMemo<P = {}>(
  Component: ComponentType<P>
) {
  return memo(Component as any, (prevProps: any, nextProps: any) => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => prevProps[key] === nextProps[key]);
  });
}

/**
 * Generic memoized wrapper component for quick optimization
 */
interface MemoizedWrapperProps extends PropsWithChildren {
  dependencies?: any[];
  useDeepComparison?: boolean;
}

export const MemoizedWrapper: React.FC<MemoizedWrapperProps> = memo(
  ({ children }) => {
    return <>{children}</>;
  },
  (prevProps, nextProps) => {
    if (prevProps.useDeepComparison) {
      return isEqual(prevProps.dependencies, nextProps.dependencies);
    }
    
    // Shallow comparison
    return prevProps.dependencies?.length === nextProps.dependencies?.length &&
           prevProps.dependencies?.every((dep, index) => dep === nextProps.dependencies?.[index]);
  }
);

/**
 * Forwardable memoized component factory
 */
export function createMemoizedForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
  compareProps?: (prevProps: any, nextProps: any) => boolean
) {
  return memo(
    forwardRef<T, P>(render as any),
    compareProps || ((prevProps: any, nextProps: any) => isEqual(prevProps, nextProps))
  );
}

MemoizedWrapper.displayName = 'MemoizedWrapper';