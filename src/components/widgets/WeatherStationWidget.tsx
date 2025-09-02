import React, { useState, useEffect, memo, useCallback } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { BaseWidget, WeatherStationSettings } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Cloud, Thermometer, Droplets, Zap, Wind } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

// Simulate environmental monitoring data
const generateWeatherData = (): WeatherData => ({
  temperature: 65 + Math.random() * 20, // 65-85°F
  condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Fog'][Math.floor(Math.random() * 4)],
  humidity: 30 + Math.random() * 40, // 30-70%
  radiation: ['Minimal', 'Low', 'Moderate'][Math.floor(Math.random() * 3)],
  airQuality: ['Excellent', 'Good', 'Fair', 'Poor'][Math.floor(Math.random() * 4)],
  windSpeed: Math.random() * 15, // 0-15 mph
});

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
  const { settings, setSettings, collapsed, setCollapsed, isLoading, error } = useWidgetState(
    widget.id,
    widget.settings as WeatherStationSettings
  );
  
  const [weatherData, setWeatherData] = useState<WeatherData>(generateWeatherData());

  useEffect(() => {
    if (settings.autoRefresh) {
      const interval = setInterval(() => {
        setWeatherData(generateWeatherData());
      }, settings.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval]);

  const convertTemperature = useCallback((tempF: number): number => {
    return settings.temperatureUnit === 'C' ? (tempF - 32) * 5/9 : tempF;
  }, [settings.temperatureUnit]);

  const temperatureDisplay = convertTemperature(weatherData.temperature);
  const temperatureUnit = settings.temperatureUnit;

  return (
    <WidgetContainer
      widgetId={widget.id}
      widgetType={widget.type}
      title={widget.title}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      onSettingsChange={setSettings}
      isLoading={isLoading}
      error={error}
    >
      <div className="space-y-4">
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
              {weatherData.windSpeed.toFixed(1)} mph
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
          Environmental Monitor Online • {new Date().toLocaleTimeString()}
        </div>
      </div>
    </WidgetContainer>
  );
});