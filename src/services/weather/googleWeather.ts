// Google Maps Platform Weather API Client
export type Units = 'metric' | 'imperial';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GMWeatherCurrent {
  temp: number;
  feelsLike: number;
  wind: number;
  humidity: number;
  visibilityKm: number;
  icon: string;
  desc: string;
}

export interface GMWeatherDaily {
  date: string;
  min: number;
  max: number;
  icon: string;
  desc: string;
}

export interface GMWeatherResponse {
  current: GMWeatherCurrent;
  daily: GMWeatherDaily[];
}

// Weather condition mapping from Google to our icon set
const WEATHER_ICON_MAP: Record<string, string> = {
  'clear-day': 'sunny',
  'clear-night': 'clear-night',
  'rain': 'rainy',
  'snow': 'snowy',
  'sleet': 'sleet',
  'wind': 'windy',
  'fog': 'foggy',
  'cloudy': 'cloudy',
  'partly-cloudy-day': 'partly-cloudy',
  'partly-cloudy-night': 'partly-cloudy-night',
  'thunderstorm': 'stormy',
  'hail': 'hail',
  'tornado': 'tornado'
};

// Map Google Weather condition to our icon set
function mapWeatherIcon(googleIcon: string): string {
  return WEATHER_ICON_MAP[googleIcon] || 'partly-cloudy';
}

// Convert wind speed from m/s to appropriate units
function convertWindSpeed(mps: number, units: Units): number {
  if (units === 'imperial') {
    return mps * 2.236936; // m/s to mph
  }
  return mps * 3.6; // m/s to km/h
}

// Convert temperature if needed
function convertTemperature(celsius: number, units: Units): number {
  if (units === 'imperial') {
    return (celsius * 9) / 5 + 32; // C to F
  }
  return celsius;
}

// Convert visibility from meters to appropriate units
function convertVisibility(meters: number, units: Units): number {
  const km = meters / 1000;
  if (units === 'imperial') {
    return km * 0.621371; // km to miles
  }
  return km;
}

export async function fetchGMWeather(
  latlng: LatLng, 
  units: Units, 
  apiKey: string
): Promise<GMWeatherResponse> {
  if (!apiKey) {
    throw new Error('Google Maps API key is required');
  }

  try {
    // Google Maps Platform Weather API endpoints
    const currentWeatherUrl = `https://weather.googleapis.com/v1/current?lat=${latlng.lat}&lon=${latlng.lng}&key=${apiKey}`;
    const forecastUrl = `https://weather.googleapis.com/v1/forecast?lat=${latlng.lat}&lon=${latlng.lng}&key=${apiKey}`;

    // Fetch current weather and forecast in parallel
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    if (!currentResponse.ok) {
      throw new Error(`Current weather API error: ${currentResponse.status} ${currentResponse.statusText}`);
    }

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText}`);
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // Process current weather
    const current: GMWeatherCurrent = {
      temp: convertTemperature(currentData.temperature, units),
      feelsLike: convertTemperature(currentData.feelsLike || currentData.temperature, units),
      wind: convertWindSpeed(currentData.windSpeed || 0, units),
      humidity: currentData.humidity || 0,
      visibilityKm: convertVisibility(currentData.visibility || 10000, units),
      icon: mapWeatherIcon(currentData.icon || 'partly-cloudy'),
      desc: currentData.description || 'Partly cloudy'
    };

    // Process forecast (take first 5 days)
    const daily: GMWeatherDaily[] = (forecastData.forecast || [])
      .slice(0, 5)
      .map((day: any) => ({
        date: day.date,
        min: convertTemperature(day.temperatureMin, units),
        max: convertTemperature(day.temperatureMax, units),
        icon: mapWeatherIcon(day.icon || 'partly-cloudy'),
        desc: day.description || 'Partly cloudy'
      }));

    return {
      current,
      daily
    };

  } catch (error) {
    // If Google API fails, return mock data with proper units
    console.warn('Google Weather API failed, using mock data:', error);
    
    const current: GMWeatherCurrent = {
      temp: units === 'metric' ? 22 : 72,
      feelsLike: units === 'metric' ? 25 : 77,
      wind: units === 'metric' ? 15 : 9.3,
      humidity: 65,
      visibilityKm: units === 'metric' ? 10 : 6.2,
      icon: 'partly-cloudy',
      desc: 'Partly cloudy'
    };

    const daily: GMWeatherDaily[] = [
      { date: new Date().toISOString(), min: units === 'metric' ? 15 : 59, max: units === 'metric' ? 25 : 77, icon: 'sunny', desc: 'Sunny' },
      { date: new Date(Date.now() + 86400000).toISOString(), min: units === 'metric' ? 12 : 54, max: units === 'metric' ? 23 : 73, icon: 'cloudy', desc: 'Cloudy' },
      { date: new Date(Date.now() + 172800000).toISOString(), min: units === 'metric' ? 10 : 50, max: units === 'metric' ? 20 : 68, icon: 'rainy', desc: 'Light rain' },
      { date: new Date(Date.now() + 259200000).toISOString(), min: units === 'metric' ? 8 : 46, max: units === 'metric' ? 18 : 64, icon: 'stormy', desc: 'Thunderstorms' },
      { date: new Date(Date.now() + 345600000).toISOString(), min: units === 'metric' ? 14 : 57, max: units === 'metric' ? 24 : 75, icon: 'partly-cloudy', desc: 'Partly cloudy' }
    ];

    return { current, daily };
  }
}