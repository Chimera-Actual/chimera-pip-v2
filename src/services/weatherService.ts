// Weather Service for Google APIs Integration
import { fetchGMWeather, type Units, type LatLng } from './weather/googleWeather';
import { convertWeatherValues, type WeatherValues } from '@/utils/units';
import { localStorageService } from '@/services/storage';

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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  private getCacheKey(type: string, location: WeatherLocation): string {
    return `${type}_${location.lat}_${location.lng}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getCurrentWeather(location: WeatherLocation, units: string = 'metric'): Promise<CurrentWeather> {
    const cacheKey = this.getCacheKey('weather', location) + `_${units}`;
    const cached = this.getCachedData<CurrentWeather>(cacheKey);
    if (cached) return cached;

    try {
      // Get Google Maps API key from environment
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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

      this.setCachedData(cacheKey, currentWeather);
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
      this.setCachedData(cacheKey, mockWeather);
      return mockWeather;
    }
  }

  async getForecast(location: WeatherLocation, units: string = 'metric'): Promise<ForecastDay[]> {
    const cacheKey = this.getCacheKey('forecast', location) + `_${units}`;
    const cached = this.getCachedData<ForecastDay[]>(cacheKey);
    if (cached) return cached;

    try {
      // Get Google Maps API key from environment
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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

      this.setCachedData(cacheKey, forecast);
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

      this.setCachedData(cacheKey, mockForecast);
      return mockForecast;
    }
  }

  async getAirQuality(location: WeatherLocation): Promise<AirQuality> {
    const cacheKey = this.getCacheKey('airquality', location);
    const cached = this.getCachedData<AirQuality>(cacheKey);
    if (cached) return cached;

    // Mock air quality data
    const aqi = Math.floor(Math.random() * 150) + 20;
    const mockAirQuality: AirQuality = {
      aqi,
      category: aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive Groups' : 'Unhealthy',
      color: aqi <= 50 ? 'green' : aqi <= 100 ? 'yellow' : aqi <= 150 ? 'orange' : 'red',
      description: aqi <= 50 ? 'Air quality is good' : aqi <= 100 ? 'Air quality is acceptable' : 'Air quality may be unhealthy',
      pm25: Math.floor(Math.random() * 50) + 10,
      pm10: Math.floor(Math.random() * 80) + 20,
      ozone: Math.floor(Math.random() * 100) + 30,
      no2: Math.floor(Math.random() * 60) + 10,
      so2: Math.floor(Math.random() * 40) + 5,
      co: Math.floor(Math.random() * 200) + 50
    };

    this.setCachedData(cacheKey, mockAirQuality);
    return mockAirQuality;
  }

  async getPollenData(location: WeatherLocation): Promise<PollenData> {
    const cacheKey = this.getCacheKey('pollen', location);
    const cached = this.getCachedData<PollenData>(cacheKey);
    if (cached) return cached;

    // Mock pollen data
    const overall = Math.floor(Math.random() * 5) + 1;
    const mockPollen: PollenData = {
      overall,
      tree: Math.floor(Math.random() * 5) + 1,
      grass: Math.floor(Math.random() * 5) + 1,
      weed: Math.floor(Math.random() * 5) + 1,
      category: overall <= 2 ? 'Low' : overall <= 3 ? 'Moderate' : overall <= 4 ? 'High' : 'Very High',
      color: overall <= 2 ? 'green' : overall <= 3 ? 'yellow' : overall <= 4 ? 'orange' : 'red',
      description: overall <= 2 ? 'Low pollen levels' : overall <= 3 ? 'Moderate pollen levels' : 'High pollen levels'
    };

    this.setCachedData(cacheKey, mockPollen);
    return mockPollen;
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

  // Location search methods (will use Google Places API in future)
  async searchLocations(query: string): Promise<WeatherLocation[]> {
    // Mock location search results
    const mockResults: WeatherLocation[] = [
      { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'US', displayName: 'New York, NY, USA' },
      { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'US', displayName: 'Los Angeles, CA, USA' },
      { lat: 51.5074, lng: -0.1278, city: 'London', country: 'GB', displayName: 'London, UK' },
      { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'JP', displayName: 'Tokyo, Japan' },
      { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'FR', displayName: 'Paris, France' }
    ];

    return mockResults.filter(location => 
      location.displayName.toLowerCase().includes(query.toLowerCase())
    );
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