// Weather Data Management Hook
import { useState, useEffect, useCallback } from 'react';
import { weatherService, WeatherData, WeatherLocation, RadiationLevel } from '@/services/weatherService';
import { useAsyncState } from '@/hooks/core/useAsyncState';
import { localStorageService } from '@/services/storage';
import { useRetryWithBackoff } from '@/hooks/useRetryWithBackoff';

interface WeatherSettings {
  units: 'metric' | 'imperial';
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  showRadiation: boolean;
  defaultLocation?: WeatherLocation;
}

interface UseWeatherDataOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
}

export const useWeatherData = (options: UseWeatherDataOptions = {}) => {
  const { autoLoad = true, refreshInterval = 10 } = options;
  
  // Initialize settings from persistent storage
  const [settings, setSettings] = useState<WeatherSettings>(() => {
    return localStorageService.get('weather_settings') || {
      units: 'metric',
      autoRefresh: true,
      refreshInterval: 10,
      showRadiation: false
    };
  });

  const [currentLocation, setCurrentLocation] = useState<WeatherLocation | null>(null);
  const [radiationLevel, setRadiationLevel] = useState<RadiationLevel | null>(null);

  // Retry mechanism for failed requests
  const { executeWithRetry, retryState } = useRetryWithBackoff({
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 4000
  });

  // Weather data async state with retry
  const [
    weatherState,
    loadWeatherData,
    resetWeatherData
  ] = useAsyncState(
    async (location: WeatherLocation) => {
      return await executeWithRetry(async () => {
        const weatherData = await weatherService.getCompleteWeatherData(location, settings.units);
        
        // Calculate radiation level for Pip-Boy mode
        const radiation = weatherService.calculateRadiationLevel(weatherData);
        setRadiationLevel(radiation);
        
        return weatherData;
      });
    },
    { 
      initialData: null,
      retryCount: 0, // We handle retries with our custom hook
      retryDelay: 0
    }
  );

  // Update settings and persist using localStorage
  const updateSettings = useCallback((newSettings: Partial<WeatherSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorageService.set('weather_settings', updated);
  }, [settings]);

  // Load weather for a specific location with location saving
  const loadWeatherForLocation = useCallback(async (location: WeatherLocation) => {
    setCurrentLocation(location);
    weatherService.saveRecentLocation(location);
    await loadWeatherData(location);
  }, [loadWeatherData]);

  // Refresh current weather data
  const refreshWeather = useCallback(async () => {
    if (currentLocation) {
      await loadWeatherData(currentLocation);
    }
  }, [currentLocation, loadWeatherData]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!settings.autoRefresh || !currentLocation || weatherState.loading) {
      return;
    }

    const intervalMs = settings.refreshInterval * 60 * 1000; // Convert to milliseconds
    const interval = setInterval(() => {
      refreshWeather();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval, currentLocation, weatherState.loading, refreshWeather]);

  // Load recent location on mount if available
  useEffect(() => {
    if (autoLoad && !currentLocation) {
      const recentLocations = weatherService.getRecentLocations();
      if (recentLocations.length > 0) {
        loadWeatherForLocation(recentLocations[0]);
      }
    }
  }, [autoLoad, currentLocation, loadWeatherForLocation]);

  // Refresh data when units change to ensure proper conversions
  useEffect(() => {
    if (currentLocation && weatherState.data && !weatherState.loading) {
      // Re-fetch data when units change to get properly converted values
      loadWeatherData(currentLocation);
    }
  }, [settings.units, currentLocation, loadWeatherData, weatherState.data, weatherState.loading]);

  // Get cached weather data
  const getCachedWeather = useCallback((location: WeatherLocation): WeatherData | null => {
    // This would typically check the cache, but for now return null
    // The weatherService already handles caching internally
    return null;
  }, []);

  // Get recent locations
  const getRecentLocations = useCallback(() => {
    return weatherService.getRecentLocations();
  }, []);

  // Clear all cached data
  const clearCache = useCallback(() => {
    resetWeatherData();
    setCurrentLocation(null);
    setRadiationLevel(null);
    weatherService.clearRecentLocations();
  }, [resetWeatherData]);

  // Set default location
  const setDefaultLocation = useCallback((location: WeatherLocation) => {
    updateSettings({ defaultLocation: location });
  }, [updateSettings]);

  // Convert temperature units using utility functions
  const convertTemperature = useCallback((temp: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === toUnit) return temp;
    
    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      return (temp * 9/5) + 32;
    } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
      return (temp - 32) * 5/9;
    } else if (fromUnit === 'metric' && toUnit === 'imperial') {
      return (temp * 9/5) + 32;
    } else if (fromUnit === 'imperial' && toUnit === 'metric') {
      return (temp - 32) * 5/9;
    }
    
    return temp;
  }, []);

  return {
    // Data
    weatherData: weatherState.data,
    currentLocation,
    radiationLevel,
    settings,
    
    // State
    loading: weatherState.loading,
    error: weatherState.error,
    lastUpdated: weatherState.lastUpdated,
    
    // Retry state
    retryState,
    
    // Actions
    loadWeatherForLocation,
    refreshWeather,
    updateSettings,
    setDefaultLocation,
    clearCache,
    
    // Utilities
    getCachedWeather,
    getRecentLocations,
    convertTemperature,
    
    // Computed values
    isStale: weatherState.lastUpdated ? 
      Date.now() - weatherState.lastUpdated.getTime() > (settings.refreshInterval * 60 * 1000) : 
      false,
    canRefresh: !weatherState.loading && !retryState.isRetrying && currentLocation !== null
  };
};