import { CacheEntry, CacheConfig } from './types';

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, config?: CacheConfig): void {
    const ttl = config?.ttl ?? this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    this.cache.set(key, entry);
    
    // Schedule cleanup
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Invalidate cache entries by pattern
  invalidate(pattern: string | RegExp): void {
    const keys = Array.from(this.cache.keys());
    
    for (const key of keys) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          this.delete(key);
        }
      } else {
        if (pattern.test(key)) {
          this.delete(key);
        }
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    const keys = Array.from(this.cache.keys());
    
    for (const key of keys) {
      const entry = this.cache.get(key);
      if (entry && now - entry.timestamp > entry.ttl) {
        this.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);