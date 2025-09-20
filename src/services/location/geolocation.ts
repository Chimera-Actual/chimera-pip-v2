// Browser Geolocation Service
export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export class GeolocationError extends Error {
  constructor(
    message: string,
    public code: number,
    public originalError?: GeolocationPositionError
  ) {
    super(message);
    this.name = 'GeolocationError';
  }
}

export async function getBrowserPosition(
  options: GeolocationOptions = {}
): Promise<LatLng> {
  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000, // 10 seconds
    maximumAge: 300000, // 5 minutes
    ...options
  };

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    throw new GeolocationError(
      'Geolocation is not supported by this browser',
      0
    );
  }

  return new Promise((resolve, reject) => {
    const success = (position: GeolocationPosition) => {
      resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    };

    const error = (error: GeolocationPositionError) => {
      let message: string;
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location access denied. Please enable location permissions and try again.';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable. Please check your connection and try again.';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out. Please try again.';
          break;
        default:
          message = 'An unknown error occurred while retrieving location.';
          break;
      }

      reject(new GeolocationError(message, error.code, error));
    };

    navigator.geolocation.getCurrentPosition(success, error, defaultOptions);
  });
}

// Get approximate location using IP-based geolocation as fallback
export async function getApproximatePosition(): Promise<LatLng> {
  try {
    // Use a free IP geolocation service as fallback
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('IP geolocation service unavailable');
    }
    
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude)
      };
    }
    
    throw new Error('Invalid location data from IP service');
  } catch (error) {
    // Ultimate fallback - return a default location (New York City)
    console.warn('IP geolocation failed, using default location:', error);
    return {
      lat: 40.7128,
      lng: -74.0060
    };
  }
}

// Get location with fallback strategy
export async function getLocationWithFallback(
  options: GeolocationOptions = {}
): Promise<{ position: LatLng; source: 'gps' | 'ip' | 'default' }> {
  try {
    const position = await getBrowserPosition(options);
    return { position, source: 'gps' };
  } catch (error) {
    console.warn('GPS location failed, trying IP-based location:', error);
    
    try {
      const position = await getApproximatePosition();
      return { position, source: 'ip' };
    } catch (ipError) {
      console.warn('IP location failed, using default:', ipError);
      const position = await getApproximatePosition(); // This has built-in default
      return { position, source: 'default' };
    }
  }
}