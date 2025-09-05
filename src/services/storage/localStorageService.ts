import { StorageOptions, StorageEventListener, StorageEvent } from './types';

class LocalStorageService {
  private eventListeners = new Map<string, Set<StorageEventListener>>();
  private defaultOptions: StorageOptions = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  constructor() {
    // Listen for storage events from other tabs
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (!event.key) return;

    const listeners = this.eventListeners.get(event.key);
    if (listeners) {
      const customEvent: StorageEvent = {
        key: event.key,
        oldValue: event.oldValue ? this.defaultOptions.deserialize!(event.oldValue) : null,
        newValue: event.newValue ? this.defaultOptions.deserialize!(event.newValue) : null,
        storageArea: 'localStorage',
      };

      listeners.forEach(listener => listener(customEvent));
    }
  }

  get<T>(key: string, options: StorageOptions = {}): T | null {
    const { deserialize = this.defaultOptions.deserialize!, validator } = options;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;

      // First try to deserialize as JSON
      try {
        const value = deserialize(item);
        
        if (validator && !validator(value)) {
          console.warn(`Invalid value in localStorage for key "${key}"`);
          this.remove(key);
          return null;
        }

        return value as T;
      } catch (parseError) {
        // If JSON parsing fails, check if it's a simple string value for themes
        if (key === 'pip-boy-theme' && typeof item === 'string') {
          // Handle legacy theme storage (raw string instead of JSON)
          const validThemes = ['green', 'amber', 'blue', 'red', 'white'];
          if (validThemes.includes(item)) {
            // Migrate to proper JSON storage
            this.set(key, item as T, options);
            return item as T;
          }
        }
        
        console.warn(`Error parsing localStorage key "${key}", removing corrupted data:`, parseError);
        this.remove(key);
        return null;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  }

  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    const { serialize = this.defaultOptions.serialize! } = options;

    try {
      const oldValue = this.get<T>(key, options);
      const serializedValue = serialize(value);
      
      localStorage.setItem(key, serializedValue);

      // Emit custom event for same-tab listeners
      this.emitEvent(key, oldValue, value);

      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  }

  remove(key: string): boolean {
    try {
      const oldValue = this.get(key);
      localStorage.removeItem(key);
      
      // Emit custom event
      this.emitEvent(key, oldValue, null);

      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }

  clear(): boolean {
    try {
      // Get all keys to emit events
      const keys = Object.keys(localStorage);
      
      localStorage.clear();

      // Emit events for all cleared keys
      keys.forEach(key => {
        this.emitEvent(key, this.get(key), null);
      });

      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  keys(): string[] {
    return Object.keys(localStorage);
  }

  size(): number {
    return localStorage.length;
  }

  // Event handling
  addEventListener<T>(key: string, listener: StorageEventListener<T>): () => void {
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set());
    }

    this.eventListeners.get(key)!.add(listener as StorageEventListener);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(key);
      if (listeners) {
        listeners.delete(listener as StorageEventListener);
        if (listeners.size === 0) {
          this.eventListeners.delete(key);
        }
      }
    };
  }

  removeEventListener<T>(key: string, listener: StorageEventListener<T>): void {
    const listeners = this.eventListeners.get(key);
    if (listeners) {
      listeners.delete(listener as StorageEventListener);
      if (listeners.size === 0) {
        this.eventListeners.delete(key);
      }
    }
  }

  private emitEvent<T>(key: string, oldValue: T | null, newValue: T | null): void {
    const listeners = this.eventListeners.get(key);
    if (listeners) {
      const event: StorageEvent<T> = {
        key,
        oldValue,
        newValue,
        storageArea: 'localStorage',
      };

      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in storage event listener:', error);
        }
      });
    }
  }

  // Batch operations
  getMultiple<T>(keys: string[], options: StorageOptions = {}): Record<string, T | null> {
    return keys.reduce((result, key) => {
      result[key] = this.get<T>(key, options);
      return result;
    }, {} as Record<string, T | null>);
  }

  setMultiple<T>(items: Record<string, T>, options: StorageOptions = {}): boolean {
    try {
      Object.entries(items).forEach(([key, value]) => {
        this.set(key, value, options);
      });
      return true;
    } catch (error) {
      console.error('Error setting multiple localStorage items:', error);
      return false;
    }
  }

  removeMultiple(keys: string[]): boolean {
    try {
      keys.forEach(key => this.remove(key));
      return true;
    } catch (error) {
      console.error('Error removing multiple localStorage items:', error);
      return false;
    }
  }

  // Storage quota management
  getStorageQuota(): { used: number; total: number; available: number } | null {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate().then(estimate => ({
        used: estimate.usage || 0,
        total: estimate.quota || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
      })) as any;
    }
    return null;
  }
}

export const localStorageService = new LocalStorageService();