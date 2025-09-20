// Weather Service for Google APIs Integration
import { fetchGMWeather, type Units, type LatLng } from './weather/googleWeather';
import { getGoogleMapsKey } from '@/lib/getGoogleMapsKey';
import { reverseGeocode, type ReverseGeocodeResult } from './location/reverseGeocode';
import { getBrowserPosition, getLocationWithFallback, GeolocationError } from './location/geolocation';
import { convertWeatherValues, type WeatherValues } from '@/utils/units';
import { localStorageService } from '@/services/storage';
import { weatherCache } from './weather/weatherCache';

export interface WeatherLocation {
  lat: number;
  lng: number;
  city: string;
  country: string;
  displayName: string;
}

export interface CurrentWeather {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  description: string;
  icon: string;
  lastUpdated: string;
  units: string;
}

export interface ForecastDay {
  date: string;
  icon: string;
  high: number;
  low: number;
  description: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface AirQuality {
  aqi: number;
  category: string;
  color: string;
  description: string;
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  so2: number;
  co: number;
}

export interface PollenData {
  overall: number;
  tree: number;
  grass: number;
  weed: number;
  category: string;
  color: string;
  description: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  airQuality: AirQuality;
  pollen: PollenData;
  location: WeatherLocation;
}

// Pip-Boy radiation level calculation
export interface RadiationLevel {
  level: number; // 0-100
  category: 'safe' | 'caution' | 'danger';
  color: string;
  message: string;
  rads: number; // Mock radiation value
}

class WeatherService {
  // Enhanced caching with location + units keying
  async getCurrentWeather(location: WeatherLocation, units: string = 'metric'): Promise<CurrentWeather> {
    // Check cache first
    const cached = weatherCache.get<CurrentWeather>(location, units, 'current');
    if (cached) return cached;

    try {
      // Get Google Maps API key from Supabase
      const apiKey = await getGoogleMapsKey();
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const latlng: LatLng = { lat: location.lat, lng: location.lng };
      const unitsType: Units = units as Units;
      
      const weatherData = await fetchGMWeather(latlng, unitsType, apiKey);
      
      const currentWeather: CurrentWeather = {
        location: location.city,
        country: location.country,
        temperature: Math.round(weatherData.current.temp),
        feelsLike: Math.round(weatherData.current.feelsLike),
        humidity: weatherData.current.humidity,
        pressure: 1013, // Not provided by Google Weather, use standard
        windSpeed: Math.round(weatherData.current.wind * 10) / 10,
        windDirection: 180, // Not provided by Google Weather
        visibility: Math.round(weatherData.current.visibilityKm * 10) / 10,
        uvIndex: 6, // Not provided by Google Weather, use moderate
        description: weatherData.current.desc,
        icon: weatherData.current.icon,
        lastUpdated: new Date().toISOString(),
        units
      };

      weatherCache.set(location, units, currentWeather, 'current');
      return currentWeather;
      
    } catch (error) {
      console.warn('Weather API error:', error);
      // Return mock data for development with unit-appropriate values
      const isMetric = units === 'metric';
      const mockWeather: CurrentWeather = {
        location: location.city,
        country: location.country,
        temperature: isMetric ? 22 : 72, // 22°C = 72°F
        feelsLike: isMetric ? 25 : 77, // 25°C = 77°F
        humidity: 65,
        pressure: 1013,
        windSpeed: isMetric ? 15 : 9.3, // 15 km/h = 9.3 mph
        windDirection: 180,
        visibility: isMetric ? 10 : 6.2, // 10 km = 6.2 miles
        uvIndex: 6,
        description: 'Partly cloudy',
        icon: 'partly-cloudy',
        lastUpdated: new Date().toISOString(),
        units
      };
      weatherCache.set(location, units, mockWeather, 'current');
      return mockWeather;
    }
  }

  async getForecast(location: WeatherLocation, units: string = 'metric'): Promise<ForecastDay[]> {
    // Check cache first
    const cached = weatherCache.get<ForecastDay[]>(location, units, 'forecast');
    if (cached) return cached;

    try {
      // Get Google Maps API key from Supabase
      const apiKey = await getGoogleMapsKey();
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const latlng: LatLng = { lat: location.lat, lng: location.lng };
      const unitsType: Units = units as Units;
      
      const weatherData = await fetchGMWeather(latlng, unitsType, apiKey);
      
      const forecast: ForecastDay[] = weatherData.daily.map(day => ({
        date: day.date,
        icon: day.icon,
        high: Math.round(day.max),
        low: Math.round(day.min),
        description: day.desc,
        humidity: 60, // Not provided by Google Weather
        windSpeed: units === 'metric' ? 12 : 7.5, // Not provided by Google Weather
        precipitation: 20 // Not provided by Google Weather
      }));

      weatherCache.set(location, units, forecast, 'forecast');
      return forecast;
      
    } catch (error) {
      console.warn('Forecast API error:', error);
      // Mock forecast data for development with unit-appropriate values
      const isMetric = units === 'metric';
      const mockForecast: ForecastDay[] = [
        { date: new Date().toISOString(), icon: 'sunny', high: isMetric ? 25 : 77, low: isMetric ? 15 : 59, description: 'Sunny', humidity: 50, windSpeed: isMetric ? 15 : 9.3, precipitation: 0 },
        { date: new Date(Date.now() + 86400000).toISOString(), icon: 'cloudy', high: isMetric ? 23 : 73, low: isMetric ? 12 : 54, description: 'Cloudy', humidity: 60, windSpeed: isMetric ? 12 : 7.5, precipitation: 10 },
        { date: new Date(Date.now() + 172800000).toISOString(), icon: 'rainy', high: isMetric ? 20 : 68, low: isMetric ? 10 : 50, description: 'Light rain', humidity: 80, windSpeed: isMetric ? 18 : 11.2, precipitation: 70 },
        { date: new Date(Date.now() + 259200000).toISOString(), icon: 'stormy', high: isMetric ? 18 : 64, low: isMetric ? 8 : 46, description: 'Thunderstorms', humidity: 85, windSpeed: isMetric ? 22 : 13.7, precipitation: 90 },
        { date: new Date(Date.now() + 345600000).toISOString(), icon: 'partly-cloudy', high: isMetric ? 24 : 75, low: isMetric ? 14 : 57, description: 'Partly cloudy', humidity: 55, windSpeed: isMetric ? 10 : 6.2, precipitation: 20 }
      ];

      weatherCache.set(location, units, mockForecast, 'forecast');
      return mockForecast;
    }
  }

  async getAirQuality(location: WeatherLocation): Promise<AirQuality> {
    // Check cache first
    const cached = weatherCache.get<AirQuality>(location, 'none', 'airquality');
    if (cached) return cached;

    try {
      // Get API key from Supabase
      const apiKey = await getGoogleMapsKey();
      
      // Call Google Maps Air Quality API
      const response = await fetch(`https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            latitude: location.lat,
            longitude: location.lng
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Air Quality API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse Google Air Quality response
      const universalAqi = data.indexes?.find((index: any) => index.code === 'uaqi');
      const aqi = universalAqi?.aqi || 50;
      
      // Extract pollutants
      const pollutants = data.pollutants || [];
      const getPollutant = (code: string) => {
        const pollutant = pollutants.find((p: any) => p.code === code);
        return pollutant?.concentration?.value || 0;
      };

      const airQuality: AirQuality = {
        aqi,
        category: universalAqi?.category || (aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy'),
        color: universalAqi?.color ? `#${universalAqi.color}` : (aqi <= 50 ? '#22c55e' : aqi <= 100 ? '#eab308' : '#ef4444'),
        description: universalAqi?.displayName || 'Air quality data',
        pm25: getPollutant('pm25'),
        pm10: getPollutant('pm10'),
        ozone: getPollutant('o3'),
        no2: getPollutant('no2'),
        so2: getPollutant('so2'),
        co: getPollutant('co')
      };

      weatherCache.set(location, 'none', airQuality, 'airquality');
      return airQuality;
      
    } catch (error) {
      console.warn('Air Quality API error:', error);
      // Return mock data on error
      const aqi = Math.floor(Math.random() * 150) + 20;
      const mockAirQuality: AirQuality = {
        aqi,
        category: aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive Groups' : 'Unhealthy',
        color: aqi <= 50 ? '#22c55e' : aqi <= 100 ? '#eab308' : aqi <= 150 ? '#f97316' : '#ef4444',
        description: aqi <= 50 ? 'Air quality is good' : aqi <= 100 ? 'Air quality is acceptable' : 'Air quality may be unhealthy',
        pm25: Math.floor(Math.random() * 50) + 10,
        pm10: Math.floor(Math.random() * 80) + 20,
        ozone: Math.floor(Math.random() * 100) + 30,
        no2: Math.floor(Math.random() * 60) + 10,
        so2: Math.floor(Math.random() * 40) + 5,
        co: Math.floor(Math.random() * 200) + 50
      };

      weatherCache.set(location, 'none', mockAirQuality, 'airquality');
      return mockAirQuality;
    }
  }

  async getPollenData(location: WeatherLocation): Promise<PollenData> {
    // Check cache first
    const cached = weatherCache.get<PollenData>(location, 'none', 'pollen');
    if (cached) return cached;

    try {
      // Get API key from Supabase
      const apiKey = await getGoogleMapsKey();
      
      // Call Google Maps Pollen API
      const response = await fetch(`https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            latitude: location.lat,
            longitude: location.lng
          },
          days: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Pollen API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse today's pollen forecast
      const todayForecast = data.dailyInfo?.[0];
      if (!todayForecast) {
        throw new Error('No pollen data available');
      }

      // Extract pollen indices
      const getPollenIndex = (type: string) => {
        const plantInfo = todayForecast.plantInfo?.find((p: any) => p.code === type);
        return plantInfo?.indexInfo?.value || 1;
      };

      const tree = getPollenIndex('TREE');
      const grass = getPollenIndex('GRASS'); 
      const weed = getPollenIndex('WEED');
      const overall = Math.max(tree, grass, weed);

      const mapCategory = (level: number) => {
        if (level <= 1) return 'Low';
        if (level <= 2) return 'Moderate'; 
        if (level <= 4) return 'High';
        return 'Very High';
      };

      const mapColor = (level: number) => {
        if (level <= 1) return '#22c55e';
        if (level <= 2) return '#eab308';
        if (level <= 4) return '#f97316';
        return '#ef4444';
      };

      const pollen: PollenData = {
        overall,
        tree,
        grass,
        weed,
        category: mapCategory(overall),
        color: mapColor(overall),
        description: `${mapCategory(overall)} pollen levels`
      };

      weatherCache.set(location, 'none', pollen, 'pollen');
      return pollen;
      
    } catch (error) {
      console.warn('Pollen API error:', error);
      // Return mock data on error
      const overall = Math.floor(Math.random() * 5) + 1;
      const mockPollen: PollenData = {
        overall,
        tree: Math.floor(Math.random() * 5) + 1,
        grass: Math.floor(Math.random() * 5) + 1,
        weed: Math.floor(Math.random() * 5) + 1,
        category: overall <= 2 ? 'Low' : overall <= 3 ? 'Moderate' : overall <= 4 ? 'High' : 'Very High',
        color: overall <= 2 ? '#22c55e' : overall <= 3 ? '#eab308' : overall <= 4 ? '#f97316' : '#ef4444',
        description: overall <= 2 ? 'Low pollen levels' : overall <= 3 ? 'Moderate pollen levels' : 'High pollen levels'
      };

      weatherCache.set(location, 'none', mockPollen, 'pollen');
      return mockPollen;
    }
  }

  // Get cached locations for quick switching
  getCachedLocations() {
    return weatherCache.getCachedLocations();
  }

  // Clear weather cache
  clearCache() {
    weatherCache.clear();
  }

  async getCompleteWeatherData(location: WeatherLocation, units: string = 'metric'): Promise<WeatherData> {
    const [current, forecast, airQuality, pollen] = await Promise.all([
      this.getCurrentWeather(location, units),
      this.getForecast(location, units),  
      this.getAirQuality(location),
      this.getPollenData(location)
    ]);

    return {
      current,
      forecast,
      airQuality,
      pollen,
      location
    };
  }

  calculateRadiationLevel(weather: WeatherData): RadiationLevel {
    // Calculate threat level based on weather conditions, air quality, and pollen
    let threatScore = 0;

    // Weather conditions (0-40 points)
    const weatherConditions = weather.current.description.toLowerCase();
    if (weatherConditions.includes('storm') || weatherConditions.includes('thunder')) {
      threatScore += 40;
    } else if (weatherConditions.includes('rain') || weatherConditions.includes('heavy')) {
      threatScore += 25;
    } else if (weatherConditions.includes('cloudy') || weatherConditions.includes('overcast')) {
      threatScore += 15;
    } else if (weatherConditions.includes('clear') || weatherConditions.includes('sunny')) {
      threatScore += 5;
    }

    // Air quality (0-35 points)
    const aqi = weather.airQuality.aqi;
    if (aqi > 150) threatScore += 35;
    else if (aqi > 100) threatScore += 25;
    else if (aqi > 50) threatScore += 15;
    else threatScore += 5;

    // Pollen levels (0-25 points)
    const pollenLevel = weather.pollen.overall;
    threatScore += pollenLevel * 5;

    // Convert to 0-100 scale
    const level = Math.min(100, threatScore);

    let category: 'safe' | 'caution' | 'danger';
    let color: string;
    let message: string;

    if (level <= 30) {
      category = 'safe';
      color = 'green';
      message = '✅ All Clear – Environment is Rad-free, Vault Dweller!';
    } else if (level <= 65) {
      category = 'caution';
      color = 'yellow';
      message = '⚠️ Caution – Elevated environmental readings detected.';
    } else {
      category = 'danger';
      color = 'red';
      message = '☢️ Warning: Heavy RADs incoming! High environmental threat!';
    }

    // Calculate mock radiation value (0-999 rads)
    const rads = Math.floor((level / 100) * 999);

    return {
      level,
      category,
      color,
      message,
      rads
    };
  }

  // Location search using Google Places API - no more mock data
  async searchLocations(query: string): Promise<WeatherLocation[]> {
    try {
      // Get API key from edge function
      const response = await fetch('/supabase/functions/get-maps-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Could not get API key');
      }
      
      const { apiKey } = await response.json();
      
      // Use Google Places API for real location search
      const { searchPlaces } = await import('@/services/location/placesSearch');
      const results = await searchPlaces(query, apiKey, {
        types: 'locality|administrative_area_level_1|country'
      });

      // Convert search results to WeatherLocation format
      return results.map(result => ({
        lat: result.latlng?.lat || 0,
        lng: result.latlng?.lng || 0,
        city: result.description.split(',')[0] || 'Unknown',
        country: result.description.split(',').pop()?.trim() || 'Unknown',
        displayName: result.description
      }));
      
    } catch (error) {
      console.error('Location search error:', error);
      // Return empty array instead of mock data
      return [];
    }
  }

  // Get current GPS location with reverse geocoding
  async getCurrentLocation(): Promise<WeatherLocation> {
    try {
      // Get API key from Supabase
      const apiKey = await getGoogleMapsKey();
      
      // Get browser position
      const position = await getBrowserPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });

      // Reverse geocode to get place name
      const geocodeResult = await reverseGeocode(position, apiKey);
      
      return {
        lat: position.lat,
        lng: position.lng,
        city: geocodeResult.city,
        country: geocodeResult.country || 'Unknown',
        displayName: geocodeResult.displayName || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
      };
      
    } catch (error) {
      if (error instanceof GeolocationError) {
        // Re-throw geolocation errors so UI can handle them appropriately
        throw error;
      }
      
      // For other errors, try fallback location
      try {
        const { position, source } = await getLocationWithFallback();
        return {
          lat: position.lat,
          lng: position.lng,
          city: source === 'default' ? 'New York' : 'Unknown City',
          country: source === 'default' ? 'US' : 'Unknown',
          displayName: source === 'default' ? 'New York, NY, USA' : `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
        };
      } catch (fallbackError) {
        throw new Error('Unable to determine location. Please search for a city manually.');
      }
    }
  }

  // Saved locations management
  saveRecentLocation(location: WeatherLocation): void {
    const recent = this.getRecentLocations();
    const filtered = recent.filter(loc => 
      loc.lat !== location.lat || loc.lng !== location.lng
    );
    
    const updated = [location, ...filtered].slice(0, 5);
    localStorageService.set('weather_recent_locations', updated);
  }

  getRecentLocations(): WeatherLocation[] {
    return localStorageService.get('weather_recent_locations') || [];
  }

  clearRecentLocations(): void {
    localStorageService.remove('weather_recent_locations');
  }
}

export const weatherService = new WeatherService();