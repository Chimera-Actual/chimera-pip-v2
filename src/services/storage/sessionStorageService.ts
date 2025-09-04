import { StorageOptions, StorageEventListener, StorageEvent } from './types';

class SessionStorageService {
  private eventListeners = new Map<string, Set<StorageEventListener>>();
  private defaultOptions: StorageOptions = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  get<T>(key: string, options: StorageOptions = {}): T | null {
    const { deserialize = this.defaultOptions.deserialize!, validator } = options;

    try {
      const item = sessionStorage.getItem(key);
      if (item === null) return null;

      const value = deserialize(item);

      if (validator && !validator(value)) {
        console.warn(`Invalid value in sessionStorage for key "${key}"`);
        this.remove(key);
        return null;
      }

      return value as T;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return null;
    }
  }

  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    const { serialize = this.defaultOptions.serialize! } = options;

    try {
      const oldValue = this.get<T>(key, options);
      const serializedValue = serialize(value);
      
      sessionStorage.setItem(key, serializedValue);

      // Emit custom event
      this.emitEvent(key, oldValue, value);

      return true;
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
      return false;
    }
  }

  remove(key: string): boolean {
    try {
      const oldValue = this.get(key);
      sessionStorage.removeItem(key);
      
      // Emit custom event
      this.emitEvent(key, oldValue, null);

      return true;
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
      return false;
    }
  }

  clear(): boolean {
    try {
      // Get all keys to emit events
      const keys = Object.keys(sessionStorage);
      
      sessionStorage.clear();

      // Emit events for all cleared keys
      keys.forEach(key => {
        this.emitEvent(key, this.get(key), null);
      });

      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }

  has(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }

  keys(): string[] {
    return Object.keys(sessionStorage);
  }

  size(): number {
    return sessionStorage.length;
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
        storageArea: 'sessionStorage',
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
      console.error('Error setting multiple sessionStorage items:', error);
      return false;
    }
  }

  removeMultiple(keys: string[]): boolean {
    try {
      keys.forEach(key => this.remove(key));
      return true;
    } catch (error) {
      console.error('Error removing multiple sessionStorage items:', error);
      return false;
    }
  }

  // Session-specific utilities
  generateSessionKey(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setWithExpiry<T>(key: string, value: T, expiryMinutes: number, options: StorageOptions = {}): boolean {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);
    const dataWithExpiry = {
      value,
      expiry: expiryTime,
    };

    return this.set(key, dataWithExpiry, options);
  }

  getWithExpiry<T>(key: string, options: StorageOptions = {}): T | null {
    const item = this.get<{ value: T; expiry: number }>(key, options);
    
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }

    return item.value;
  }
}

export const sessionStorageService = new SessionStorageService();