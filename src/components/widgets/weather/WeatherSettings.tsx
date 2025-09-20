import React from 'react';
import { SettingsToggle, SettingsSelect, SettingsSlider } from '@/components/ui/SettingsControls';
import { PrimarySettingsGroup, SecondarySettingsGroup } from '@/components/ui/SettingsGroupEnhanced';
import type { WeatherDashboardSettings } from '../WeatherDashboardWidget';

interface WeatherSettingsProps {
  settings: WeatherDashboardSettings;
  onSettingsChange: (key: keyof WeatherDashboardSettings, value: any) => void;
}

export const WeatherSettings: React.FC<WeatherSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="space-y-6">
      <PrimarySettingsGroup
        title="Display Options"
        description="Configure what weather information to show"
      >
        <SettingsToggle
          label="Current Weather"
          description="Show current weather conditions"
          checked={settings.showCurrentWeather}
          onCheckedChange={(checked) => onSettingsChange('showCurrentWeather', checked)}
        />
        <SettingsToggle
          label="5-Day Forecast"
          description="Show extended weather forecast"
          checked={settings.showForecast}
          onCheckedChange={(checked) => onSettingsChange('showForecast', checked)}
        />
        <SettingsToggle
          label="Air Quality"
          description="Show air quality index and pollutants"
          checked={settings.showAirQuality}
          onCheckedChange={(checked) => onSettingsChange('showAirQuality', checked)}
        />
        <SettingsToggle
          label="Pollen Levels"
          description="Show pollen count and allergen information"
          checked={settings.showPollen}
          onCheckedChange={(checked) => onSettingsChange('showPollen', checked)}
        />
        <SettingsToggle
          label="Show Radiation Meter"
          description="Display environmental radiation meter"
          checked={settings.showRadiation}
          onCheckedChange={(checked) => onSettingsChange('showRadiation', checked)}
        />
      </PrimarySettingsGroup>

      <SecondarySettingsGroup
        title="Weather Preferences"
        description="Configure weather data preferences"
      >
        <SettingsSelect
          label="Temperature Units"
          description="Choose between metric and imperial units"
          value={settings.units}
          onChange={(value) => onSettingsChange('units', value)}
          options={[
            { value: 'metric', label: 'Metric (°C, km/h, km)' },
            { value: 'imperial', label: 'Imperial (°F, mph, mi)' }
          ]}
        />
        <SettingsToggle
          label="Use GPS at Startup"
          description="Automatically use your current location when widget loads"
          checked={settings.useGPS}
          onCheckedChange={(checked) => onSettingsChange('useGPS', checked)}
        />
        <SettingsToggle
          label="Auto Refresh"
          description="Automatically refresh weather data"
          checked={settings.autoRefresh}
          onCheckedChange={(checked) => onSettingsChange('autoRefresh', checked)}
        />
        {settings.autoRefresh && (
          <SettingsSlider
            label="Refresh Interval"
            description="How often to refresh weather data"
            value={settings.refreshInterval}
            onChange={(value) => onSettingsChange('refreshInterval', value)}
            min={5}
            max={60}
            step={5}
            unit=" minutes"
            showValue
          />
        )}
      </SecondarySettingsGroup>
    </div>
  );
};