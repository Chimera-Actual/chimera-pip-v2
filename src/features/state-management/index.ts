// Context Providers
export { PerformanceProvider, usePerformance } from './contexts/PerformanceContext';

// Performance Hooks
export { useOptimizedPerformance } from './hooks/useOptimizedPerformance';
export { useMemoizedSelector, useShallowMemoizedSelector, useMemoizedSelectorWithEquality } from './hooks/useMemoizedSelector';
export { useBatchedUpdates } from './hooks/useBatchedUpdates';

// Memoization Components
export { 
  withDeepMemo, 
  withShallowMemo, 
  MemoizedWrapper, 
  createMemoizedForwardRef 
} from './components/MemoizedComponent';

// Performance Utilities
export * from './utils/performanceOptimizer';
export * from './utils/renderPerformanceMonitor';