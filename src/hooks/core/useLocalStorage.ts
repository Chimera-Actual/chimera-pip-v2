// Local Storage Hook
import { useState, useEffect } from 'react';
import { localStorageService } from '@/services/storage/localStorage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: { expiry?: number }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorageService.getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key "' + key + '":', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorageService.setItem(key, valueToStore, options);
    } catch (error) {
      console.error('Error setting localStorage key "' + key + '":', error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      localStorageService.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage key "' + key + '":', error);
    }
  };

  return [storedValue, setValue, removeValue];
}