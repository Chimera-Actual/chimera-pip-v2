import { useRef, useCallback, useEffect, useState } from 'react';

interface UseWebWorkerOptions {
  onError?: (error: Error) => void;
  onSuccess?: (result: any) => void;
}

export function useWebWorker(workerPath: string, options: UseWebWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingTasks = useRef<Map<string, (value: any) => void>>(new Map());

  // Initialize worker
  useEffect(() => {
    const worker = new Worker(new URL(workerPath, import.meta.url), {
      type: 'module'
    });

    worker.addEventListener('message', (event) => {
      const { id, result, error: workerError } = event.data;
      
      const resolver = pendingTasks.current.get(id);
      if (resolver) {
        if (workerError) {
          setError(workerError);
          options.onError?.(new Error(workerError));
        } else {
          resolver(result);
          options.onSuccess?.(result);
        }
        pendingTasks.current.delete(id);
      }
      
      if (pendingTasks.current.size === 0) {
        setIsProcessing(false);
      }
    });

    worker.addEventListener('error', (event) => {
      const errorMessage = `Worker error: ${event.message}`;
      setError(errorMessage);
      options.onError?.(new Error(errorMessage));
      setIsProcessing(false);
    });

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [workerPath, options]);

  // Send message to worker
  const postMessage = useCallback(async <T = any>(
    type: string,
    payload: any
  ): Promise<T> => {
    if (!workerRef.current) {
      throw new Error('Worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const id = `${type}-${Date.now()}-${Math.random()}`;
      
      pendingTasks.current.set(id, (result) => {
        resolve(result as T);
      });

      setIsProcessing(true);
      setError(null);

      try {
        workerRef.current.postMessage({ type, payload, id });
      } catch (err) {
        pendingTasks.current.delete(id);
        setIsProcessing(false);
        const errorMessage = err instanceof Error ? err.message : 'Failed to post message to worker';
        setError(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  }, []);

  // Process large dataset
  const processData = useCallback(async <T = any>(data: any[]): Promise<T[]> => {
    return postMessage<T[]>('PROCESS_DATA', data);
  }, [postMessage]);

  // Calculate statistics
  const calculateStats = useCallback(async (data: number[]) => {
    return postMessage<{
      mean: number;
      median: number;
      mode: number;
      stdDev: number;
      min: number;
      max: number;
    }>('CALCULATE_STATS', data);
  }, [postMessage]);

  // Filter complex dataset
  const filterData = useCallback(async <T = any>(
    data: T[],
    filters: Array<{ field: string; operator: string; value: any }>
  ): Promise<T[]> => {
    return postMessage<T[]>('FILTER_LARGE_SET', { data, filters });
  }, [postMessage]);

  // Sort complex dataset
  const sortData = useCallback(async <T = any>(
    data: T[],
    sortKeys: Array<{ field: string; direction: 'asc' | 'desc' }>
  ): Promise<T[]> => {
    return postMessage<T[]>('SORT_COMPLEX', { data, sortKeys });
  }, [postMessage]);

  // Terminate worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      pendingTasks.current.clear();
      setIsProcessing(false);
    }
  }, []);

  return {
    postMessage,
    processData,
    calculateStats,
    filterData,
    sortData,
    terminate,
    isProcessing,
    error
  };
}

// Specific hook for computation worker
export function useComputationWorker(options?: UseWebWorkerOptions) {
  return useWebWorker('../workers/computation.worker.ts', options);
}