// Storage Service Types

export interface StorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  validator?: (value: unknown) => boolean;
  encryptionKey?: string;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  length: number;
  key(index: number): string | null;
}

export interface SecureStorageOptions extends StorageOptions {
  keyDerivationRounds?: number;
  algorithm?: string;
}

export interface StorageEvent<T = any> {
  key: string;
  oldValue: T | null;
  newValue: T | null;
  storageArea: 'localStorage' | 'sessionStorage' | 'memory';
}

export type StorageEventListener<T = any> = (event: StorageEvent<T>) => void;