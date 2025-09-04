import { useState, useEffect, useCallback } from 'react';

export interface UseLocalStorageOptions<T> {
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
  validator?: (value: unknown) => value is T;
  syncAcrossTabs?: boolean;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
    validator,
    syncAcrossTabs = true,
  } = options;

  // Get initial value from localStorage
  const getStoredValue = useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      const parsedValue = serializer.deserialize(item);
      
      // Validate if validator is provided
      if (validator && !validator(parsedValue)) {
        console.warn(`Invalid value in localStorage for key "${key}", using default`);
        return defaultValue;
      }

      return parsedValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue, serializer, validator]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, serializer.serialize(valueToStore));

      // Dispatch custom event for cross-tab sync
      if (syncAcrossTabs) {
        window.dispatchEvent(
          new CustomEvent('localStorage-change', {
            detail: { key, value: valueToStore },
          })
        );
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serializer, storedValue, syncAcrossTabs]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(defaultValue);

      if (syncAcrossTabs) {
        window.dispatchEvent(
          new CustomEvent('localStorage-change', {
            detail: { key, value: undefined },
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue, syncAcrossTabs]);

  // Listen for changes in other tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = serializer.deserialize(e.newValue);
          if (!validator || validator(newValue)) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        if (e.detail.value === undefined) {
          setStoredValue(defaultValue);
        } else if (!validator || validator(e.detail.value)) {
          setStoredValue(e.detail.value);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorage-change', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage-change', handleCustomStorageChange as EventListener);
    };
  }, [key, defaultValue, serializer, validator, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}