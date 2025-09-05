import { useEffect, useRef, useCallback } from 'react';
import { localStorageService } from '@/services/storage';
import { useDebounce } from '@/hooks/core/useDebounce';

export interface FormPersistenceOptions<T> {
  key: string;
  values: T;
  enabled?: boolean;
  debounceMs?: number;
  exclude?: (keyof T)[];
  transformer?: {
    serialize?: (values: T) => any;
    deserialize?: (stored: any) => Partial<T>;
  };
}

export interface FormPersistenceResult<T> {
  clearPersistedData: () => void;
  getPersistedData: () => Partial<T> | null;
  isDataPersisted: boolean;
}

export function useFormPersistence<T extends Record<string, any>>({
  key,
  values,
  enabled = true,
  debounceMs = 1000,
  exclude = [],
  transformer,
}: FormPersistenceOptions<T>): FormPersistenceResult<T> {
  const isInitialized = useRef(false);
  const previousValues = useRef<T>(values);

  // Debounce the values to avoid excessive storage writes
  const debouncedValues = useDebounce(values, debounceMs);

  const getStorageKey = useCallback(() => `form_draft_${key}`, [key]);

  const filterValues = useCallback((vals: T): Partial<T> => {
    if (exclude.length === 0) return vals;
    
    const filtered = { ...vals };
    exclude.forEach(field => {
      delete filtered[field];
    });
    
    return filtered;
  }, [exclude]);

  const saveToStorage = useCallback((vals: T) => {
    if (!enabled) return;
    
    try {
      const filteredValues = filterValues(vals);
      const dataToSave = transformer?.serialize 
        ? transformer.serialize(vals)
        : filteredValues;
        
      localStorageService.set(getStorageKey(), dataToSave);
    } catch (error) {
      console.warn('Failed to persist form data:', error);
    }
  }, [enabled, filterValues, transformer, getStorageKey]);

  const getPersistedData = useCallback((): Partial<T> | null => {
    if (!enabled) return null;
    
    try {
      const stored = localStorageService.get<any>(getStorageKey());
      if (!stored) return null;
      
      return transformer?.deserialize 
        ? transformer.deserialize(stored)
        : stored;
    } catch (error) {
      console.warn('Failed to retrieve persisted form data:', error);
      return null;
    }
  }, [enabled, transformer, getStorageKey]);

  const clearPersistedData = useCallback(() => {
    try {
      localStorageService.remove(getStorageKey());
    } catch (error) {
      console.warn('Failed to clear persisted form data:', error);
    }
  }, [getStorageKey]);

  const isDataPersisted = useCallback(() => {
    return getPersistedData() !== null;
  }, [getPersistedData]);

  // Save form data when values change (debounced)
  useEffect(() => {
    // Skip saving on first render to avoid saving initial values
    if (!isInitialized.current) {
      isInitialized.current = true;
      previousValues.current = values;
      return;
    }

    // Only save if values actually changed
    const hasChanged = JSON.stringify(previousValues.current) !== JSON.stringify(values);
    if (hasChanged && enabled) {
      saveToStorage(debouncedValues);
      previousValues.current = values;
    }
  }, [debouncedValues, enabled, saveToStorage, values]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: Clear data on unmount if form is submitted successfully
      // This would need to be controlled by the calling component
    };
  }, []);

  return {
    clearPersistedData,
    getPersistedData,
    isDataPersisted: isDataPersisted(),
  };
}

// Hook for auto-restoring form data on mount
export function useFormAutoRestore<T extends Record<string, any>>(
  key: string,
  setInitialValues: (values: Partial<T>) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const storageKey = `form_draft_${key}`;
      const stored = localStorageService.get<Partial<T>>(storageKey);
      
      if (stored) {
        setInitialValues(stored);
      }
    } catch (error) {
      console.warn('Failed to auto-restore form data:', error);
    }
  }, [key, setInitialValues, enabled]);
}

// Utility hook for managing form draft status
export function useFormDraftStatus<T extends Record<string, any>>(
  key: string,
  currentValues: T,
  initialValues: T
) {
  const isDraft = JSON.stringify(currentValues) !== JSON.stringify(initialValues);
  const hasDraftData = localStorageService.get(`form_draft_${key}`) !== null;
  
  return {
    isDraft,
    hasDraftData,
    isDirty: isDraft,
  };
}