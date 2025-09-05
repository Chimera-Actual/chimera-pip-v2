import { useCallback, useRef, useState } from 'react';

interface BatchedUpdateOptions {
  batchDelay?: number;
  maxBatchSize?: number;
}

type UpdateFunction<T> = () => Promise<T>;

/**
 * Hook for batching multiple async updates to improve performance
 * Useful for rapid state changes or API calls
 */
export function useBatchedUpdates<T = void>({
  batchDelay = 100,
  maxBatchSize = 10,
}: BatchedUpdateOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const batchQueue = useRef<Array<{
    updateFn: UpdateFunction<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
  }>>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const processBatch = useCallback(async () => {
    if (batchQueue.current.length === 0) return;

    setIsProcessing(true);
    const currentBatch = [...batchQueue.current];
    batchQueue.current = [];

    try {
      // Process all updates in parallel
      const results = await Promise.allSettled(
        currentBatch.map(item => item.updateFn())
      );

      // Resolve/reject each promise based on results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          currentBatch[index].resolve(result.value);
        } else {
          currentBatch[index].reject(result.reason);
        }
      });
    } catch (error) {
      // Fallback: reject all promises if batch processing fails
      currentBatch.forEach(item => item.reject(error));
    } finally {
      setIsProcessing(false);
      
      // Process next batch if there are more items
      if (batchQueue.current.length > 0) {
        timeoutRef.current = setTimeout(processBatch, 0);
      }
    }
  }, []);

  const scheduleUpdate = useCallback((updateFn: UpdateFunction<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      batchQueue.current.push({ updateFn, resolve, reject });

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Process immediately if batch is full, otherwise wait for delay
      if (batchQueue.current.length >= maxBatchSize) {
        processBatch();
      } else {
        timeoutRef.current = setTimeout(processBatch, batchDelay);
      }
    });
  }, [processBatch, batchDelay, maxBatchSize]);

  const flushBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    processBatch();
  }, [processBatch]);

  const cancelBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reject all pending promises
    batchQueue.current.forEach(item => 
      item.reject(new Error('Batch cancelled'))
    );
    batchQueue.current = [];
  }, []);

  return {
    scheduleUpdate,
    flushBatch,
    cancelBatch,
    isProcessing,
    queueSize: batchQueue.current.length,
  };
}