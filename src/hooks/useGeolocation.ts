// Geolocation Hook for Weather Widget
import { useState, useEffect, useCallback } from 'react';
import { WeatherLocation } from '@/services/weatherService';
import { localStorageService } from '@/services/storage';

interface GeolocationState {
  location: WeatherLocation | null;
  loading: boolean;
  error: string | null;
  permission: PermissionState | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackToIP?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    fallbackToIP = true
  } = options;

  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    permission: null
  });

  // Check geolocation permission
  const checkPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permission: permission.state }));
        
        permission.onchange = () => {
          setState(prev => ({ ...prev, permission: permission.state }));
        };
        
        return permission.state;
      } catch (error) {
        console.warn('Permission API not supported');
        return null;
      }
    }
    return null;
  }, []);

  // Reverse geocode coordinates to location info
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<WeatherLocation> => {
    // Mock reverse geocoding - in production, use Google Geocoding API
    const mockLocation: WeatherLocation = {
      lat,
      lng,
      city: 'Unknown City',
      country: 'US',
      displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };

    return mockLocation;
  }, []);

  // Get IP-based location as fallback
  const getIPLocation = useCallback(async (): Promise<WeatherLocation> => {
    try {
      // Mock IP-based location - in production, use IP geolocation service
      const mockIPLocation: WeatherLocation = {
        lat: 37.7749,
        lng: -122.4194,
        city: 'San Francisco',
        country: 'US',
        displayName: 'San Francisco, CA, USA (IP Location)'
      };

      return mockIPLocation;
    } catch (error) {
      throw new Error('Unable to determine location from IP');
    }
  }, []);

  // Get current position using GPS
  const getCurrentPosition = useCallback(async (): Promise<WeatherLocation> => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const location = await reverseGeocode(latitude, longitude);
            
            // Cache the GPS location
            localStorageService.set('weather_gps_location', location);
            
            resolve(location);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          let message = 'Unable to retrieve your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          
          reject(new Error(message));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge, reverseGeocode]);

  // Main function to get user location
  const getLocation = useCallback(async (forceRefresh = false): Promise<WeatherLocation> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check for cached location if not forcing refresh
      if (!forceRefresh) {
        const cached = localStorageService.get<WeatherLocation>('weather_gps_location');
        if (cached) {
          setState(prev => ({ 
            ...prev, 
            location: cached, 
            loading: false 
          }));
          return cached;
        }
      }

      // Try GPS first
      let location: WeatherLocation;
      
      try {
        location = await getCurrentPosition();
      } catch (gpsError) {
        console.warn('GPS location failed:', gpsError);
        
        // Fallback to IP location if enabled
        if (fallbackToIP) {
          try {
            location = await getIPLocation();
          } catch (ipError) {
            throw new Error('Unable to determine location using GPS or IP');
          }
        } else {
          throw gpsError;
        }
      }

      setState(prev => ({ 
        ...prev, 
        location, 
        loading: false 
      }));

      return location;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown location error';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      throw error;
    }
  }, [getCurrentPosition, getIPLocation, fallbackToIP]);

  // Request permission and get location
  const requestLocation = useCallback(async (): Promise<WeatherLocation> => {
    await checkPermission();
    return getLocation(true);
  }, [checkPermission, getLocation]);

  // Clear cached location
  const clearLocation = useCallback(() => {
    localStorageService.remove('weather_gps_location');
    setState(prev => ({ 
      ...prev, 
      location: null, 
      error: null 
    }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    checkPermission();
    
    // Load cached location
    const cached = localStorageService.get<WeatherLocation>('weather_gps_location');
    if (cached) {
      setState(prev => ({ ...prev, location: cached }));
    }
  }, [checkPermission]);

  return {
    ...state,
    getLocation,
    requestLocation,
    clearLocation,
    isSupported: 'geolocation' in navigator
  };
};