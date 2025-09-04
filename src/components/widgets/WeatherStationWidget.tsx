import React, { useState, useEffect, memo, useCallback } from 'react';
import { BaseWidget, WeatherStationSettings } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Cloud, Thermometer, Droplets, Zap, Wind } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface WeatherStationWidgetProps {
  widget: BaseWidget;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  radiation: string;
  airQuality: string;
  windSpeed: number;
  location?: string;
  country?: string;
  feelsLike?: number;
  windDirection?: number;
  icon?: string;
  lastUpdated?: Date;
}

// Fetch real weather data from API
const fetchWeatherData = async (location: string, units: string = 'imperial'): Promise<WeatherData> => {
  const { data, error } = await supabase.functions.invoke('weather-api', {
    body: { location, units }
  });

  if (error) {
    console.error('Weather API error:', error);
    throw new Error('Failed to fetch weather data');
  }

  return {
    temperature: data.temperature,
    humidity: data.humidity,
    windSpeed: data.windSpeed,
    condition: data.description,
    radiation: data.radiation,
    airQuality: data.airQuality,
    location: data.location,
    country: data.country,
    feelsLike: data.feelsLike,
    windDirection: data.windDirection,
    icon: data.icon,
    lastUpdated: new Date(data.lastUpdated)
  };
};

const getRadiationColor = (radiation: string): string => {
  switch (radiation) {
    case 'Minimal': return 'text-pip-green-primary';
    case 'Low': return 'text-yellow-500';
    case 'Moderate': return 'text-orange-500';
    case 'High': return 'text-red-500';
    case 'Extreme': return 'text-destructive';
    default: return 'text-pip-text-secondary';
  }
};

const getAirQualityColor = (airQuality: string): string => {
  switch (airQuality) {
    case 'Excellent': return 'text-pip-green-primary';
    case 'Good': return 'text-pip-green-secondary';
    case 'Fair': return 'text-yellow-500';
    case 'Poor': return 'text-orange-500';
    case 'Hazardous': return 'text-destructive';
    default: return 'text-pip-text-secondary';
  }
};

export const WeatherStationWidget: React.FC<WeatherStationWidgetProps> = memo(({ widget }) => {
  const { settings, setSettings, collapsed, setCollapsed, isLoading: hookLoading, error: hookError } = useWidgetState(
    widget.id,
    widget.settings as WeatherStationSettings
  );
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    if (!settings.location) {
      setError('Location not set in widget settings');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeatherData(settings.location, settings.temperatureUnit === 'C' ? 'metric' : 'imperial');
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [settings.location, settings.temperatureUnit]);

  useEffect(() => {
    if (settings.autoRefresh && weatherData) {
      const interval = setInterval(refreshData, settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval, weatherData]);

  const convertTemperature = useCallback((temp: number): number => {
    // Temperature comes from API in the requested unit already
    return temp;
  }, []);

  const temperatureDisplay = weatherData ? convertTemperature(weatherData.temperature) : 0;
  const temperatureUnit = settings.temperatureUnit;

  if (isLoading || hookLoading) {
    return (
      <div className="text-center text-pip-text-muted font-pip-mono py-4">
        Loading weather data...
      </div>
    );
  }

  if (error || hookError) {
    return (
      <div className="text-center text-destructive font-pip-mono py-4">
        Error: {error || hookError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {weatherData ? (
        <>
          {/* Main Temperature Display */}
          <div className="text-center pip-special-stat p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Thermometer className="h-5 w-5 text-pip-green-primary" />
              <span className="text-xs text-pip-text-muted font-pip-mono">TEMPERATURE</span>
            </div>
            <div className="text-3xl font-pip-display font-bold text-primary pip-text-glow">
              {temperatureDisplay.toFixed(1)}°{temperatureUnit}
            </div>
            <div className="text-sm font-pip-mono text-pip-text-secondary mt-1">
              {weatherData.condition}
            </div>
            {weatherData.location && (
              <div className="text-xs text-pip-text-muted mt-1">
                {weatherData.location}{weatherData.country && `, ${weatherData.country}`}
              </div>
            )}
          </div>

          {/* Environmental Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Humidity */}
            <div className="pip-special-stat p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplets className="h-3 w-3 text-pip-green-primary" />
                <span className="text-xs text-pip-text-muted font-pip-mono">HUMIDITY</span>
              </div>
              <div className="text-lg font-pip-display font-bold text-primary">
                {weatherData.humidity.toFixed(0)}%
              </div>
            </div>

            {/* Wind Speed */}
            <div className="pip-special-stat p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Wind className="h-3 w-3 text-pip-green-primary" />
                <span className="text-xs text-pip-text-muted font-pip-mono">WIND</span>
              </div>
              <div className="text-lg font-pip-display font-bold text-primary">
                {weatherData.windSpeed.toFixed(1)} {settings.temperatureUnit === 'C' ? 'm/s' : 'mph'}
              </div>
            </div>
          </div>

          {/* Radiation Level */}
          {settings.showRadiation && (
            <div className="pip-special-stat p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-pip-green-primary" />
                  <span className="text-xs text-pip-text-muted font-pip-mono">RADIATION</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getRadiationColor(weatherData.radiation)} border-current`}
                >
                  {weatherData.radiation}
                </Badge>
              </div>
            </div>
          )}

          {/* Air Quality */}
          {settings.showAirQuality && (
            <div className="pip-special-stat p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-pip-green-primary" />
                  <span className="text-xs text-pip-text-muted font-pip-mono">AIR QUALITY</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getAirQualityColor(weatherData.airQuality)} border-current`}
                >
                  {weatherData.airQuality}
                </Badge>
              </div>
            </div>
          )}

          {/* Status Footer */}
          <div className="text-center text-xs text-pip-text-muted font-pip-mono pt-2 border-t border-pip-border/30">
            Environmental Monitor Online • {weatherData.lastUpdated?.toLocaleTimeString() || 'Loading...'}
          </div>
        </>
      ) : !isLoading && (
        <div className="text-center py-8 text-pip-text-muted">
          <p className="font-pip-mono">Set location in widget settings to view weather data</p>
        </div>
      )}
    </div>
  );
});