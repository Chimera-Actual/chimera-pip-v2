import React from 'react';

// Dynamic import with retry for handling stale service worker issues
export async function importWithRetry<T>(loader: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    // If a stale SW served old HTML pointing to new chunk, a reload resolves it
    if (retries > 0 && error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('Loading chunk') ||
         error.message.includes('dynamically imported module'))) {
      
      console.warn(`Dynamic import failed, retrying... (${retries} attempts remaining)`, error.message);
      
      // Small delay to allow SW update/activation
      await new Promise(resolve => setTimeout(resolve, 300));
      return importWithRetry(loader, retries - 1);
    }
    throw error;
  }
}

// Convenience wrapper for React.lazy with retry
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(() => importWithRetry(factory));
}