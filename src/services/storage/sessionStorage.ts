// Session Storage Service
import { StorageService, StorageOptions, StorageItem } from './types';
import { reportError } from '@/lib/errorReporting';

class SessionStorageService implements StorageService {
  private readonly prefix = 'pip_session_';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  setItem<T>(key: string, value: T, options: StorageOptions = {}): void {
    try {
      const storageKey = this.getKey(key);
      const now = Date.now();
      
      const item: StorageItem<T> = {
        data: value,
        timestamp: now,
        expiry: options.expiry ? now + options.expiry : undefined,
      };

      sessionStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      reportError('Failed to set sessionStorage item', { key }, error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const storageKey = this.getKey(key);
      const item = sessionStorage.getItem(storageKey);
      
      if (!item) {
        return null;
      }

      const parsed: StorageItem<T> = JSON.parse(item);
      
      // Check if item has expired
      if (parsed.expiry && Date.now() > parsed.expiry) {
        this.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      reportError('Failed to get sessionStorage item', { key }, error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      const storageKey = this.getKey(key);
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      reportError('Failed to remove sessionStorage item', { key }, error);
    }
  }

  clear(): void {
    try {
      const keys = this.keys();
      keys.forEach(key => {
        const unprefixedKey = key.replace(this.prefix, '');
        this.removeItem(unprefixedKey);
      });
    } catch (error) {
      reportError('Failed to clear sessionStorage', {}, error);
    }
  }

  hasItem(key: string): boolean {
    try {
      const storageKey = this.getKey(key);
      return sessionStorage.getItem(storageKey) !== null;
    } catch (error) {
      return false;
    }
  }

  keys(): string[] {
    try {
      const allKeys = Object.keys(sessionStorage);
      return allKeys.filter(key => key.startsWith(this.prefix));
    } catch (error) {
      reportError('Failed to get sessionStorage keys', {}, error);
      return [];
    }
  }
}

export const sessionStorageService = new SessionStorageService();