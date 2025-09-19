/**
 * Quick Access vault for encrypted session storage
 * Uses IndexedDB/localStorage for persistent storage
 */

import { EncryptedData, SessionPayload } from './crypto';

export interface QuickAccessRecord {
  version: 1;
  user_id: string;
  numeric_id: string;
  created_at: number;
  iv: string;
  salt: string;
  ciphertext: string;
}

const STORAGE_PREFIX = 'chimera:qa:';
const VAULT_VERSION = 1;

/**
 * Storage adapter interface
 */
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * localStorage adapter
 */
const localStorageAdapter: StorageAdapter = {
  async getItem(key: string) {
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    localStorage.removeItem(key);
  }
};

/**
 * IndexedDB adapter with localStorage fallback
 */
let storageAdapter: StorageAdapter = localStorageAdapter;

// Try to use IndexedDB for better storage
if (typeof window !== 'undefined' && 'indexedDB' in window) {
  try {
    // Simple IndexedDB wrapper for key-value storage
    const dbName = 'ChimeraQuickAccess';
    const storeName = 'vault';
    
    const openDB = (): Promise<IDBDatabase> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };
      });
    };
    
    const indexedDBAdapter: StorageAdapter = {
      async getItem(key: string) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);
          
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      },
      
      async setItem(key: string, value: string) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(value, key);
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      },
      
      async removeItem(key: string) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(key);
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    };
    
    storageAdapter = indexedDBAdapter;
  } catch (error) {
    console.warn('IndexedDB not available, falling back to localStorage:', error);
  }
}

/**
 * Saves encrypted Quick Access record
 */
export async function saveQuickAccess(record: QuickAccessRecord): Promise<void> {
  const key = `${STORAGE_PREFIX}${record.numeric_id}`;
  await storageAdapter.setItem(key, JSON.stringify(record));
}

/**
 * Loads Quick Access record by numeric ID
 */
export async function loadQuickAccess(numericId: string): Promise<QuickAccessRecord | null> {
  const key = `${STORAGE_PREFIX}${numericId}`;
  const data = await storageAdapter.getItem(key);
  
  if (!data) {
    return null;
  }
  
  try {
    const record = JSON.parse(data) as QuickAccessRecord;
    
    // Validate record structure
    if (record.version !== VAULT_VERSION || record.numeric_id !== numericId) {
      console.warn('Invalid or outdated Quick Access record');
      await deleteQuickAccess(numericId);
      return null;
    }
    
    return record;
  } catch (error) {
    console.error('Failed to parse Quick Access record:', error);
    await deleteQuickAccess(numericId);
    return null;
  }
}

/**
 * Deletes Quick Access record
 */
export async function deleteQuickAccess(numericId: string): Promise<void> {
  const key = `${STORAGE_PREFIX}${numericId}`;
  await storageAdapter.removeItem(key);
}

/**
 * Creates a Quick Access record from encrypted session data
 */
export function createQuickAccessRecord(
  userId: string,
  numericId: string,
  encrypted: EncryptedData
): QuickAccessRecord {
  return {
    version: VAULT_VERSION,
    user_id: userId,
    numeric_id: numericId,
    created_at: Date.now(),
    iv: encrypted.iv,
    salt: encrypted.salt,
    ciphertext: encrypted.ciphertext
  };
}

/**
 * Converts Quick Access record to encrypted data format
 */
export function recordToEncryptedData(record: QuickAccessRecord): EncryptedData {
  return {
    iv: record.iv,
    salt: record.salt,
    ciphertext: record.ciphertext
  };
}

/**
 * Lists all stored numeric IDs (for debugging/management)
 */
export async function listStoredNumericIds(): Promise<string[]> {
  // This is a simple implementation for localStorage
  // IndexedDB would need a more complex approach
  if (storageAdapter === localStorageAdapter) {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.substring(STORAGE_PREFIX.length));
      }
    }
    return keys;
  }
  
  // For IndexedDB, this would require iterating through all records
  return [];
}