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
import { PlaceSearch } from './weather/PlaceSearch';
import { CurrentWeatherCard } from './weather/CurrentWeatherCard';
import { ForecastCard } from './weather/ForecastCard';
import { AirQualityPanel } from './weather/AirQualityPanel';
import { PollenPanel } from './weather/PollenPanel';
import { PipBoyRadiationMeter } from './weather/PipBoyRadiationMeter';
import { WidgetSettingsSheet } from './base/WidgetSettingsSheet';
import { WeatherSettings } from './weather/WeatherSettings';
import { useWeatherData } from '@/hooks/useWeatherData';
import { weatherService, WeatherLocation } from '@/services/weatherService';
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
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

  // Update weather service settings when widget settings change
  useEffect(() => {
    updateWeatherSettings({
      units: settings.units,
      autoRefresh: settings.autoRefresh,
      refreshInterval: settings.refreshInterval,
      showRadiation: settings.showRadiation
    });
  }, [settings.units, settings.autoRefresh, settings.refreshInterval, settings.showRadiation, updateWeatherSettings]);

  // Refresh weather data when units change
  useEffect(() => {
    if (weatherData && currentLocation && !loading) {
      refreshWeather();
    }
  }, [settings.units]); // Only depend on units change

  // Auto-load GPS location if enabled
  useEffect(() => {
    if (settings.useGPS && !currentLocation && !loading) {
      handleGetCurrentLocation();
    }
  }, [settings.useGPS]);

  // Handle GPS location request using Google APIs
  const handleGetCurrentLocation = useCallback(async () => {
    if (isGettingLocation) return;
    
    setIsGettingLocation(true);
    try {
      const location = await weatherService.getCurrentLocation();
      await loadWeatherForLocation(location);
      toast({
        title: "Location Found",
        description: `Weather loaded for ${location.displayName}`,
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Unable to get your location",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  }, [isGettingLocation, loadWeatherForLocation, toast]);

  // Handle location selection from Places search
  const handleLocationSelect = useCallback(async (place: any) => {
    try {
      const location: WeatherLocation = {
        lat: place.latlng.lat,
        lng: place.latlng.lng,
        city: place.name || place.description.split(',')[0] || 'Unknown',
        country: place.formattedAddress?.split(',').pop()?.trim() || 'Unknown',
        displayName: place.description || place.formattedAddress || 'Unknown Location'
      };
      
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
       type: 'button',
       id: 'gps',
       label: 'Use current location',
       onClick: handleGetCurrentLocation,
       disabled: isGettingLocation,
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
       type: 'button',
       id: 'settings',
       label: 'Settings',
       onClick: () => setShowSettings(true),
       icon: Settings,
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
          
          <PlaceSearch
            onPlaceSelect={handleLocationSelect}
            placeholder="Search for a city or ZIP code..."
            userLocation={currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : undefined}
          />
          
          <div className="text-center">
            <Button
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
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
      <div className="space-y-4 p-4">
        {/* Status indicators */}
        {isStale && (
          <div className="flex justify-end">
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Stale
            </Badge>
          </div>
        )}

        {/* Weather Content */}
        {weatherData && (
          <div className="space-y-4">
            {settings.showRadiation && radiationLevel && (
              <PipBoyRadiationMeter radiationLevel={radiationLevel} />
            )}
            
            {settings.showCurrentWeather && (
              <CurrentWeatherCard 
                weather={weatherData.current}
                units={settings.units}
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

      {/* Settings Sheet */}
      <WidgetSettingsSheet
        open={showSettings}
        onOpenChange={setShowSettings}
        title="Weather Dashboard Settings"
        description="Configure your weather dashboard preferences and location services"
      >
        <WeatherSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </WidgetSettingsSheet>

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
                      units={settings.units}
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