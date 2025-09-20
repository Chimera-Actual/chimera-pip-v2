// Centralized weather display formatters
import { cToF, mpsToMph, mpsToKmh, kmToMiles } from './units';

export type Units = 'metric' | 'imperial';

/**
 * Format temperature with proper unit symbol
 * @param t - Temperature in Celsius
 * @param units - Unit system to display in
 */
export function fmtTemp(t: number, units: Units): string {
  const temp = units === 'imperial' ? Math.round(cToF(t)) : Math.round(t);
  return `${temp}°${units === 'metric' ? 'C' : 'F'}`;
}

/**
 * Format wind speed with proper unit
 * @param mps - Wind speed in meters per second
 * @param units - Unit system to display in
 */
export function fmtWind(mps: number, units: Units): string {
  const speed = units === 'imperial' ? Math.round(mpsToMph(mps)) : Math.round(mpsToKmh(mps));
  return `${speed} ${units === 'metric' ? 'km/h' : 'mph'}`;
}

/**
 * Format visibility with proper unit
 * @param km - Visibility in kilometers
 * @param units - Unit system to display in
 */
export function fmtVisibility(km: number, units: Units): string {
  const visibility = units === 'imperial' ? Math.round(kmToMiles(km)) : Math.round(km);
  return `${visibility} ${units === 'metric' ? 'km' : 'mi'}`;
}

/**
 * Format pressure (stays in hPa for both unit systems)
 * @param hpa - Pressure in hectopascals
 */
export function fmtPressure(hpa: number): string {
  return `${Math.round(hpa)} hPa`;
}

/**
 * Get wind direction abbreviation from degrees
 * @param degrees - Wind direction in degrees
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}

/**
 * Convert weather data between unit systems in memory
 * Used when API doesn't support unit parameter
 */
export interface WeatherDataValues {
  temperature?: number;
  feelsLike?: number;
  windSpeed?: number; // in mps
  visibility?: number; // in km
  high?: number;
  low?: number;
  pressure?: number;
}

export function convertWeatherData(
  data: WeatherDataValues,
  fromUnits: Units,
  toUnits: Units
): WeatherDataValues {
  if (fromUnits === toUnits) return data;

  const converted: WeatherDataValues = { ...data };
  
  // Temperature conversions (assume stored in Celsius)
  if (data.temperature !== undefined) {
    converted.temperature = fromUnits === 'metric' && toUnits === 'imperial' 
      ? cToF(data.temperature) 
      : data.temperature;
  }
  
  if (data.feelsLike !== undefined) {
    converted.feelsLike = fromUnits === 'metric' && toUnits === 'imperial'
      ? cToF(data.feelsLike)
      : data.feelsLike;
  }
  
  if (data.high !== undefined) {
    converted.high = fromUnits === 'metric' && toUnits === 'imperial'
      ? cToF(data.high)
      : data.high;
  }
  
  if (data.low !== undefined) {
    converted.low = fromUnits === 'metric' && toUnits === 'imperial'
      ? cToF(data.low)
      : data.low;
  }

  // Wind speed and visibility are always stored in base units (mps, km)
  // so no conversion needed for storage, only for display

  return converted;
}