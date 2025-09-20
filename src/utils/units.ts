// Unit conversion utilities for weather data

// Temperature conversions
export const cToF = (c: number): number => (c * 9) / 5 + 32;
export const fToC = (f: number): number => (f - 32) * 5 / 9;

// Wind speed conversions
export const mpsToMph = (mps: number): number => mps * 2.236936;
export const mpsToKmh = (mps: number): number => mps * 3.6;
export const kmhToMph = (kmh: number): number => kmh * 0.621371;
export const mphToKmh = (mph: number): number => mph * 1.609344;

// Distance conversions
export const kmToMiles = (km: number): number => km * 0.621371;
export const milesToKm = (miles: number): number => miles * 1.609344;

// Pressure conversions
export const hpaToInHg = (hpa: number): number => hpa * 0.02953;
export const inHgToHpa = (inHg: number): number => inHg * 33.8639;

// Generic unit conversion function
export function convertValue(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  if (fromUnit === toUnit) return value;

  // Temperature conversions
  if (fromUnit === 'celsius' && toUnit === 'fahrenheit') return cToF(value);
  if (fromUnit === 'fahrenheit' && toUnit === 'celsius') return fToC(value);
  if (fromUnit === 'metric' && toUnit === 'imperial') return cToF(value);
  if (fromUnit === 'imperial' && toUnit === 'metric') return fToC(value);

  // Wind speed conversions
  if (fromUnit === 'mps' && toUnit === 'mph') return mpsToMph(value);
  if (fromUnit === 'mps' && toUnit === 'kmh') return mpsToKmh(value);
  if (fromUnit === 'kmh' && toUnit === 'mph') return kmhToMph(value);
  if (fromUnit === 'mph' && toUnit === 'kmh') return mphToKmh(value);

  // Distance conversions
  if (fromUnit === 'km' && toUnit === 'miles') return kmToMiles(value);
  if (fromUnit === 'miles' && toUnit === 'km') return milesToKm(value);

  // Pressure conversions
  if (fromUnit === 'hpa' && toUnit === 'inHg') return hpaToInHg(value);
  if (fromUnit === 'inHg' && toUnit === 'hpa') return inHgToHpa(value);

  return value;
}

// Convert weather data between unit systems
export interface WeatherValues {
  temperature?: number;
  feelsLike?: number;
  windSpeed?: number;
  visibility?: number;
  high?: number;
  low?: number;
  pressure?: number;
}

export function convertWeatherValues(
  values: WeatherValues,
  fromUnits: 'metric' | 'imperial',
  toUnits: 'metric' | 'imperial'
): WeatherValues {
  if (fromUnits === toUnits) return values;

  const converted: WeatherValues = {};

  // Temperature values
  if (values.temperature !== undefined) {
    converted.temperature = convertValue(values.temperature, fromUnits, toUnits);
  }
  if (values.feelsLike !== undefined) {
    converted.feelsLike = convertValue(values.feelsLike, fromUnits, toUnits);
  }
  if (values.high !== undefined) {
    converted.high = convertValue(values.high, fromUnits, toUnits);
  }
  if (values.low !== undefined) {
    converted.low = convertValue(values.low, fromUnits, toUnits);
  }

  // Wind speed (metric: km/h, imperial: mph)
  if (values.windSpeed !== undefined) {
    if (fromUnits === 'metric' && toUnits === 'imperial') {
      converted.windSpeed = kmhToMph(values.windSpeed);
    } else if (fromUnits === 'imperial' && toUnits === 'metric') {
      converted.windSpeed = mphToKmh(values.windSpeed);
    } else {
      converted.windSpeed = values.windSpeed;
    }
  }

  // Visibility (metric: km, imperial: miles)
  if (values.visibility !== undefined) {
    if (fromUnits === 'metric' && toUnits === 'imperial') {
      converted.visibility = kmToMiles(values.visibility);
    } else if (fromUnits === 'imperial' && toUnits === 'metric') {
      converted.visibility = milesToKm(values.visibility);
    } else {
      converted.visibility = values.visibility;
    }
  }

  // Pressure (keep same for now, but could add conversion)
  if (values.pressure !== undefined) {
    converted.pressure = values.pressure;
  }

  return converted;
}

// Format temperature with unit
export function formatTemperature(temp: number, units: 'metric' | 'imperial'): string {
  const rounded = Math.round(temp);
  return `${rounded}°${units === 'metric' ? 'C' : 'F'}`;
}

// Format wind speed with unit
export function formatWindSpeed(speed: number, units: 'metric' | 'imperial'): string {
  const rounded = Math.round(speed * 10) / 10;
  return `${rounded} ${units === 'metric' ? 'km/h' : 'mph'}`;
}

// Format visibility with unit
export function formatVisibility(visibility: number, units: 'metric' | 'imperial'): string {
  const rounded = Math.round(visibility * 10) / 10;
  return `${rounded} ${units === 'metric' ? 'km' : 'mi'}`;
}
