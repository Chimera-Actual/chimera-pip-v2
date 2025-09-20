import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWeatherData } from '@/hooks/useWeatherData';
import * as weatherService from '@/services/weatherService';

// Mock the weather service
vi.mock('@/services/weatherService', () => ({
  weatherService: {
    getCompleteWeatherData: vi.fn(),
    getCurrentLocation: vi.fn(),
    calculateRadiationLevel: vi.fn(),
    saveRecentLocation: vi.fn(),
    getRecentLocations: vi.fn(),
    clearRecentLocations: vi.fn(),
  }
}));

// Mock localStorage service
vi.mock('@/services/storage', () => ({
  localStorageService: {
    get: vi.fn(() => ({
      units: 'metric',
      autoRefresh: true,
      refreshInterval: 10,
      showRadiation: false
    })),
    set: vi.fn(),
    remove: vi.fn(),
  }
}));

const mockWeatherData = {
  current: {
    location: 'Test City',
    country: 'US',
    temperature: 22,
    feelsLike: 25,
    humidity: 65,
    pressure: 1013,
    windSpeed: 15,
    windDirection: 180,
    visibility: 10,
    uvIndex: 6,
    description: 'Partly cloudy',
    icon: '02d',
    lastUpdated: new Date().toISOString(),
    units: 'metric'
  },
  forecast: [],
  airQuality: {
    aqi: 50,
    category: 'Good',
    color: '#22c55e',
    description: 'Air quality is good',
    pm25: 12,
    pm10: 20,
    ozone: 80,
    no2: 15,
    so2: 5,
    co: 100
  },
  pollen: {
    overall: 2,
    tree: 1,
    grass: 2,
    weed: 1,
    category: 'Low',
    color: '#22c55e',
    description: 'Low pollen levels'
  },
  location: {
    lat: 40.7128,
    lng: -74.0060,
    city: 'Test City',
    country: 'US',
    displayName: 'Test City, US'
  }
};

const mockRadiationLevel = {
  level: 25,
  category: 'safe' as const,
  color: '#22c55e',
  message: 'All Clear',
  rads: 150
};

describe('useWeatherData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API responses
    (weatherService.weatherService.getCompleteWeatherData as any).mockResolvedValue(mockWeatherData);
    (weatherService.weatherService.calculateRadiationLevel as any).mockReturnValue(mockRadiationLevel);
    (weatherService.weatherService.getRecentLocations as any).mockReturnValue([]);
  });

  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useWeatherData());

    expect(result.current.settings).toEqual({
      units: 'metric',
      autoRefresh: true,
      refreshInterval: 10,
      showRadiation: false
    });
    expect(result.current.meterType).toBe('combined');
    expect(result.current.loading).toBe(false);
    expect(result.current.weatherData).toBeNull();
  });

  it('should load weather data for location', async () => {
    const { result } = renderHook(() => useWeatherData());
    const testLocation = mockWeatherData.location;

    await act(async () => {
      await result.current.loadWeatherForLocation(testLocation);
    });

    expect(weatherService.weatherService.getCompleteWeatherData).toHaveBeenCalledWith(
      testLocation,
      'metric'
    );
    expect(result.current.weatherData).toEqual(mockWeatherData);
    expect(result.current.currentLocation).toEqual(testLocation);
  });

  it('should toggle meter type correctly', () => {
    const { result } = renderHook(() => useWeatherData());

    expect(result.current.meterType).toBe('combined');

    act(() => {
      result.current.setMeterType('air');
    });
    expect(result.current.meterType).toBe('air');

    act(() => {
      result.current.setMeterType('pollen');
    });
    expect(result.current.meterType).toBe('pollen');
  });

  it('should return air quality radiation level when meter type is air', async () => {
    const { result } = renderHook(() => useWeatherData());
    
    // Load weather data first
    await act(async () => {
      await result.current.loadWeatherForLocation(mockWeatherData.location);
    });

    // Switch to air quality mode
    act(() => {
      result.current.setMeterType('air');
    });

    const radiationLevel = result.current.radiationLevel;
    expect(radiationLevel).not.toBeNull();
    expect(radiationLevel?.rads).toBe(50); // Should match AQI value
    expect(radiationLevel?.message).toContain('AQI: 50');
  });

  it('should return pollen radiation level when meter type is pollen', async () => {
    const { result } = renderHook(() => useWeatherData());
    
    // Load weather data first
    await act(async () => {
      await result.current.loadWeatherForLocation(mockWeatherData.location);
    });

    // Switch to pollen mode
    act(() => {
      result.current.setMeterType('pollen');
    });

    const radiationLevel = result.current.radiationLevel;
    expect(radiationLevel).not.toBeNull();
    expect(radiationLevel?.rads).toBe(40); // Should be pollen level * 20
    expect(radiationLevel?.message).toContain('Pollen: Low');
  });

  it('should detect offline status', () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    const { result } = renderHook(() => useWeatherData());
    expect(result.current.isOffline).toBe(true);

    // Reset to online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  it('should handle API errors gracefully', async () => {
    const { result } = renderHook(() => useWeatherData());
    
    // Mock API error
    (weatherService.weatherService.getCompleteWeatherData as any).mockRejectedValue(
      new Error('API key not configured')
    );

    await act(async () => {
      try {
        await result.current.loadWeatherForLocation(mockWeatherData.location);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.weatherData).toBeNull();
  });

  it('should refresh weather data', async () => {
    const { result } = renderHook(() => useWeatherData());
    
    // Load initial data
    await act(async () => {
      await result.current.loadWeatherForLocation(mockWeatherData.location);
    });

    // Refresh data
    await act(async () => {
      await result.current.refreshWeather();
    });

    expect(weatherService.weatherService.getCompleteWeatherData).toHaveBeenCalledTimes(2);
  });
});