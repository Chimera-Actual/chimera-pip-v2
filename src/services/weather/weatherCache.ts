// Enhanced caching system for weather data with {lat,lng,units} keying
import { WeatherData, WeatherLocation } from '@/services/weatherService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export class WeatherCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 10 * 60 * 1000; // 10 minutes
  private readonly maxSize = 50;

  constructor(private options: CacheOptions = {}) {}

  /**
   * Generate cache key from location and units
   */
  private generateKey(location: WeatherLocation, units: string, type: string = 'weather'): string {
    return `${type}_${location.lat.toFixed(4)}_${location.lng.toFixed(4)}_${units}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    const ttl = this.options.ttl || this.defaultTTL;
    return Date.now() - entry.timestamp > ttl;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Ensure cache doesn't exceed max size
   */
  private enforceSizeLimit(): void {
    const maxSize = this.options.maxSize || this.maxSize;
    if (this.cache.size <= maxSize) return;

    // Remove oldest entries first
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = entries.slice(0, this.cache.size - maxSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Get cached data
   */
  get<T>(location: WeatherLocation, units: string, type: string = 'weather'): T | null {
    this.cleanup();
    
    const key = this.generateKey(location, units, type);
    const entry = this.cache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cached data
   */
  set<T>(location: WeatherLocation, units: string, data: T, type: string = 'weather'): void {
    this.cleanup();
    this.enforceSizeLimit();
    
    const key = this.generateKey(location, units, type);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      key
    };
    
    this.cache.set(key, entry);
  }

  /**
   * Check if data exists in cache and is not expired
   */
  has(location: WeatherLocation, units: string, type: string = 'weather'): boolean {
    const key = this.generateKey(location, units, type);
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Clear specific entry
   */
  delete(location: WeatherLocation, units: string, type: string = 'weather'): boolean {
    const key = this.generateKey(location, units, type);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize || this.maxSize,
      entries: Array.from(this.cache.values()).map(entry => ({
        key: entry.key,
        timestamp: entry.timestamp,
        age: Date.now() - entry.timestamp
      }))
    };
  }

  /**
   * Get all cached locations (for quick location switching)
   */
  getCachedLocations(): Array<{ location: WeatherLocation; units: string; lastAccessed: Date }> {
    this.cleanup();
    
    const locations = new Map<string, { location: WeatherLocation; units: string; lastAccessed: Date }>();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.key.startsWith('weather_')) {
        const parts = entry.key.split('_');
        if (parts.length >= 4) {
          const lat = parseFloat(parts[1]);
          const lng = parseFloat(parts[2]);
          const units = parts[3];
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const locationKey = `${lat}_${lng}`;
            
            if (!locations.has(locationKey) || locations.get(locationKey)!.lastAccessed < new Date(entry.timestamp)) {
              locations.set(locationKey, {
                location: {
                  lat,
                  lng,
                  city: 'Cached Location',
                  country: 'Unknown',
                  displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                },
                units,
                lastAccessed: new Date(entry.timestamp)
              });
            }
          }
        }
      }
    }
    
    return Array.from(locations.values())
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
  }
}

// Global weather cache instance
export const weatherCache = new WeatherCache({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50
});