// Storage Service Types
export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  expiry?: number; // milliseconds
}

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export interface StorageService {
  setItem<T>(key: string, value: T, options?: StorageOptions): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;
  hasItem(key: string): boolean;
  keys(): string[];
}