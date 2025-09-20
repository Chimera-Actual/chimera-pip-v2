import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeatherDashboardWidget } from '@/components/widgets/WeatherDashboardWidget';
import * as useWeatherDataHook from '@/hooks/useWeatherData';

// Mock the useWeatherData hook
const mockUseWeatherData = {
  weatherData: null,
  currentLocation: null,
  radiationLevel: null,
  settings: {
    units: 'metric' as const,
    autoRefresh: true,
    refreshInterval: 10,
    showRadiation: false
  },
  meterType: 'combined' as const,
  loading: false,
  error: null,
  lastUpdated: null,
  retryState: { isRetrying: false, retryCount: 0, nextRetryIn: 0 },
  loadWeatherForLocation: vi.fn(),
  refreshWeather: vi.fn(),
  updateSettings: vi.fn(),
  setDefaultLocation: vi.fn(),
  clearCache: vi.fn(),
  setMeterType: vi.fn(),
  getCachedWeather: vi.fn(),
  getRecentLocations: vi.fn(() => []),
  convertTemperature: vi.fn((temp) => temp),
  isStale: false,
  canRefresh: true,
  isOffline: false
};

vi.mock('@/hooks/useWeatherData', () => ({
  useWeatherData: vi.fn(() => mockUseWeatherData)
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

const defaultSettings = {
  title: 'Weather Dashboard',
  showCurrentWeather: true,
  showForecast: true,
  showAirQuality: true,
  showPollen: true,
  showRadiation: true,
  units: 'metric' as const,
  autoRefresh: true,
  refreshInterval: 10,
  useGPS: false,
  fullScreenMode: false
};

const mockProps = {
  settings: defaultSettings,
  onSettingsChange: vi.fn(),
  widgetId: 'test-widget',
  widget: { collapsed: false, widget_width: 'default' },
  onRemove: vi.fn(),
  onToggleCollapse: vi.fn(),
  onToggleFullWidth: vi.fn(),
  onOpenSettings: vi.fn()
};

describe('WeatherDashboardWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockUseWeatherData, {
      weatherData: null,
      currentLocation: null,
      radiationLevel: null,
      loading: false,
      error: null,
      isOffline: false,
      isStale: false,
      meterType: 'combined'
    });
  });

  it('should render initial state with location search', () => {
    render(<WeatherDashboardWidget {...mockProps} />);
    
    expect(screen.getByText('Search for a location or use GPS to get started')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for a city or ZIP code...')).toBeInTheDocument();
    expect(screen.getByText('Use Current Location')).toBeInTheDocument();
  });

  it('should show API key error when API key is missing', () => {
    const errorMock = {
      ...mockUseWeatherData,
      error: 'Google Maps API key not configured'
    };
    
    vi.mocked(useWeatherDataHook.useWeatherData).mockReturnValue(errorMock);
    
    render(<WeatherDashboardWidget {...mockProps} />);
    
    expect(screen.getByText('API Key Required')).toBeInTheDocument();
    expect(screen.getByText('Open Settings')).toBeInTheDocument();
  });

  it('should show offline indicator when offline', () => {
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

    const offlineMock = {
      ...mockUseWeatherData,
      weatherData: mockWeatherData,
      currentLocation: mockWeatherData.location,
      isOffline: true
    };
    
    vi.mocked(useWeatherDataHook.useWeatherData).mockReturnValue(offlineMock);
    
    render(<WeatherDashboardWidget {...mockProps} />);
    
    expect(screen.getByText('OFFLINE – DATA STALE')).toBeInTheDocument();
  });
});