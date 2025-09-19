// Weather Dashboard Widget - Main Component
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  Settings, 
  MapPin, 
  RefreshCw, 
  Maximize2,
  Navigation,
  AlertTriangle
} from 'lucide-react';
import { WidgetShell } from './base/WidgetShell';
import type { WidgetAction } from './base/WidgetActionBar';
import { LocationSearchInput } from './weather/LocationSearchInput';
import { CurrentWeatherCard } from './weather/CurrentWeatherCard';
import { ForecastCard } from './weather/ForecastCard';
import { AirQualityPanel } from './weather/AirQualityPanel';
import { PollenPanel } from './weather/PollenPanel';
import { PipBoyRadiationMeter } from './weather/PipBoyRadiationMeter';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { SettingsToggle, SettingsSelect, SettingsSlider } from '@/components/ui/SettingsControls';
import { PrimarySettingsGroup, SecondarySettingsGroup } from '@/components/ui/SettingsGroupEnhanced';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useGeolocation } from '@/hooks/useGeolocation';
import { WeatherLocation } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface WeatherDashboardSettings {
  title?: string;
  showCurrentWeather: boolean;
  showForecast: boolean;
  showAirQuality: boolean;
  showPollen: boolean;
  showRadiation: boolean;
  units: 'metric' | 'imperial';
  autoRefresh: boolean;
  refreshInterval: number;
  useGPS: boolean;
  fullScreenMode: boolean;
}

interface WeatherDashboardWidgetProps {
  title?: string;
  settings: WeatherDashboardSettings;
  onSettingsChange: (settings: WeatherDashboardSettings) => void;
  widgetId?: string;
  widget?: any;
  onRemove?: () => void;
  onToggleCollapse?: () => void;
  onToggleFullWidth?: () => void;
  onOpenSettings?: () => void;
}

export const WeatherDashboardWidget: React.FC<WeatherDashboardWidgetProps> = ({
  title = "Weather Dashboard",
  settings,
  onSettingsChange,
  widgetId,
  widget,
  onRemove,
  onToggleCollapse,
  onToggleFullWidth,
  onOpenSettings
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const { toast } = useToast();

  // Weather data management
  const {
    weatherData,
    currentLocation,
    radiationLevel,
    loading,
    error,
    loadWeatherForLocation,
    refreshWeather,
    updateSettings: updateWeatherSettings,
    canRefresh,
    isStale
  } = useWeatherData({
    autoLoad: false,
    refreshInterval: settings.refreshInterval
  });

  // Geolocation management
  const {
    location: gpsLocation,
    loading: gpsLoading,
    error: gpsError,
    requestLocation,
    clearLocation
  } = useGeolocation({
    fallbackToIP: true
  });

  // Update weather service settings when widget settings change
  useEffect(() => {
    updateWeatherSettings({
      units: settings.units,
      autoRefresh: settings.autoRefresh,
      refreshInterval: settings.refreshInterval,
      showRadiation: settings.showRadiation
    });
  }, [settings.units, settings.autoRefresh, settings.refreshInterval, settings.showRadiation, updateWeatherSettings]);

  // Auto-load GPS location if enabled
  useEffect(() => {
    if (settings.useGPS && !currentLocation && !loading) {
      handleGetCurrentLocation();
    }
  }, [settings.useGPS]);

  // Handle GPS location request
  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const location = await requestLocation();
      await loadWeatherForLocation(location);
      toast({
        title: "Location Found",
        description: `Weather loaded for ${location.displayName}`,
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Unable to get your location",
        variant: "destructive"
      });
    }
  }, [requestLocation, loadWeatherForLocation, toast]);

  // Handle location selection from search
  const handleLocationSelect = useCallback(async (location: WeatherLocation) => {
    try {
      await loadWeatherForLocation(location);
      toast({
        title: "Location Updated", 
        description: `Weather loaded for ${location.displayName}`,
      });
    } catch (error) {
      toast({
        title: "Weather Error",
        description: "Unable to load weather data for this location",
        variant: "destructive"
      });
    }
  }, [loadWeatherForLocation, toast]);

  // Handle settings change
  const handleSettingsChange = useCallback((key: keyof WeatherDashboardSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  }, [settings, onSettingsChange]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!canRefresh) return;
    
    try {
      await refreshWeather();
      toast({
        title: "Weather Updated",
        description: "Latest weather data loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh weather data",
        variant: "destructive"
      });
    }
  }, [canRefresh, refreshWeather, toast]);

  // Function Bar actions - all business functionality
  const actions: WidgetAction[] = [
    {
      type: 'input',
      id: 'search',
      placeholder: 'Search for a city or ZIP code...',
      value: '', // This will be handled by LocationSearchInput component
      onChange: () => {}, // Handled internally by LocationSearchInput
      icon: MapPin,
    },
    {
      type: 'button',
      id: 'gps',
      label: 'Use current location',
      onClick: handleGetCurrentLocation,
      disabled: gpsLoading,
      icon: Navigation,
    },
    {
      type: 'button',
      id: 'refresh',
      label: 'Refresh weather',
      onClick: handleRefresh,
      disabled: !canRefresh,
      icon: RefreshCw,
    },
    {
      type: 'toggle',
      id: 'units',
      label: settings.units === 'metric' ? '°C' : '°F',
      on: settings.units === 'metric',
      onChange: (isMetric) => handleSettingsChange('units', isMetric ? 'metric' : 'imperial'),
    },
    {
      type: 'button',
      id: 'fullscreen',
      label: 'Full screen',
      onClick: () => setShowFullScreen(true),
      icon: Maximize2,
    },
    {
      type: 'menu',
      id: 'settings',
      icon: Settings,
      items: [
        {
          id: 'widget-settings',
          label: 'Widget Settings',
          onClick: () => setShowSettings(true),
          icon: Settings,
        },
      ],
    },
  ];

  // Main content renderer
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center py-8 text-center">
          <div className="space-y-2">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={!canRefresh}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (!currentLocation) {
      return (
        <div className="space-y-4 p-4">
          <div className="text-center space-y-2">
            <Cloud className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Search for a location or use GPS to get started
            </p>
          </div>
          
          <LocationSearchInput
            onLocationSelect={handleLocationSelect}
            placeholder="Search for a city or ZIP code..."
          />
          
          <div className="text-center">
            <Button
              onClick={handleGetCurrentLocation}
              disabled={gpsLoading}
            >
              <Navigation className="h-4 w-4 mr-2" />
              {gpsLoading ? 'Getting location...' : 'Use Current Location'}
            </Button>
          </div>
        </div>
      );
    }

    if (loading && !weatherData) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="space-y-2 text-center">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading weather data...
            </p>
          </div>
        </div>
      );
    }

    if (!weatherData) return null;

    return (
      <div className="space-y-4">
        {/* Location badge and status indicators */}
        {/* Status indicators */}
        {isStale && (
          <div className="flex justify-end">
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Stale
            </Badge>
          </div>
        )}

        {/* Location Search - Now integrated in content area */}
        <LocationSearchInput
          onLocationSelect={handleLocationSelect}
          currentLocation={currentLocation}
          placeholder="Search for a city or ZIP code..."
        />

        {/* Weather Content */}
        {weatherData && (
          <div className="space-y-4">
            {settings.showRadiation && radiationLevel && (
              <PipBoyRadiationMeter radiationLevel={radiationLevel} />
            )}
            
            {settings.showCurrentWeather && (
              <CurrentWeatherCard 
                weather={weatherData.current} 
              />
            )}
            
            {settings.showForecast && weatherData.forecast && (
              <ForecastCard 
                forecast={weatherData.forecast} 
                units={settings.units}
              />
            )}
            
            {settings.showAirQuality && weatherData.airQuality && (
              <AirQualityPanel 
                airQuality={weatherData.airQuality}
              />
            )}
            
            {settings.showPollen && weatherData.pollen && (
              <PollenPanel 
                pollen={weatherData.pollen}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <WidgetShell
        title={title}
        icon={Cloud}
        actions={actions}
        onCollapse={onToggleCollapse}
        onClose={onRemove}
        onToggleFullWidth={onToggleFullWidth}
        isFullWidth={widget?.widget_width === 'full'}
        isCollapsed={widget?.collapsed}
      >
        {renderContent()}
      </WidgetShell>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Weather Dashboard Settings"
      >
        <div className="space-y-6">
          <PrimarySettingsGroup
            title="Display Options"
            description="Configure what weather information to show"
          >
            <SettingsToggle
              label="Current Weather"
              description="Show current weather conditions"
              checked={settings.showCurrentWeather}
              onCheckedChange={(checked) => handleSettingsChange('showCurrentWeather', checked)}
            />
            <SettingsToggle
              label="5-Day Forecast"
              description="Show extended weather forecast"
              checked={settings.showForecast}
              onCheckedChange={(checked) => handleSettingsChange('showForecast', checked)}
            />
            <SettingsToggle
              label="Air Quality"
              description="Show air quality index and pollutants"
              checked={settings.showAirQuality}
              onCheckedChange={(checked) => handleSettingsChange('showAirQuality', checked)}
            />
            <SettingsToggle
              label="Pollen Levels"
              description="Show pollen count and allergen information"
              checked={settings.showPollen}
              onCheckedChange={(checked) => handleSettingsChange('showPollen', checked)}
            />
            <SettingsToggle
              label="Show Radiation Meter"
              description="Display environmental radiation meter"
              checked={settings.showRadiation}
              onCheckedChange={(checked) => handleSettingsChange('showRadiation', checked)}
            />
          </PrimarySettingsGroup>

          <SecondarySettingsGroup
            title="Weather Settings"
            description="Configure weather data preferences"
          >
            <SettingsSelect
              label="Temperature Units"
              description="Choose between metric and imperial units"
              value={settings.units}
              onChange={(value) => handleSettingsChange('units', value)}
              options={[
                { value: 'metric', label: 'Metric (°C, km/h, km)' },
                { value: 'imperial', label: 'Imperial (°F, mph, mi)' }
              ]}
            />
            <SettingsToggle
              label="Use GPS Location"
              description="Automatically use your current location"
              checked={settings.useGPS}
              onCheckedChange={(checked) => handleSettingsChange('useGPS', checked)}
            />
            <SettingsToggle
              label="Auto Refresh"
              description="Automatically refresh weather data"
              checked={settings.autoRefresh}
              onCheckedChange={(checked) => handleSettingsChange('autoRefresh', checked)}
            />
            {settings.autoRefresh && (
              <SettingsSlider
                label="Refresh Interval"
                description="How often to refresh weather data"
                value={settings.refreshInterval}
                onChange={(value) => handleSettingsChange('refreshInterval', value)}
                min={5}
                max={60}
                step={5}
                unit=" minutes"
                showValue
              />
            )}
          </SecondarySettingsGroup>
        </div>
      </SettingsModal>

      {/* Full Screen Modal */}
      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Weather Dashboard - Full Screen
              {currentLocation && (
                <Badge variant="secondary">
                  {currentLocation.displayName}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {weatherData && (
              <>
                {settings.showRadiation && radiationLevel && (
                  <PipBoyRadiationMeter radiationLevel={radiationLevel} />
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {settings.showCurrentWeather && (
                    <CurrentWeatherCard 
                      weather={weatherData.current} 
                    />
                  )}
                  
                  {settings.showForecast && weatherData.forecast && (
                    <ForecastCard 
                      forecast={weatherData.forecast}
                      units={settings.units}
                    />
                  )}
                  
                  {settings.showAirQuality && weatherData.airQuality && (
                    <AirQualityPanel 
                      airQuality={weatherData.airQuality}
                    />
                  )}
                  
                  {settings.showPollen && weatherData.pollen && (
                    <PollenPanel 
                      pollen={weatherData.pollen}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};