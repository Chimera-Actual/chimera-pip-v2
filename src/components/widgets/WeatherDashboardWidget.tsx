// Weather Dashboard Widget - Main Component
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  Settings, 
  MapPin, 
  RefreshCw, 
  Maximize2, 
  RadioIcon,
  Navigation,
  AlertTriangle
} from 'lucide-react';
import { WidgetTemplate } from './WidgetTemplate';
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
  pipBoyMode: boolean;
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

  // Widget header actions
  const headerActions = (
    <div className="flex items-center gap-2">
      {currentLocation && (
        <Badge variant="secondary" className={cn(
          "text-xs",
          settings.pipBoyMode && "bg-primary/20 text-primary border-primary/30"
        )}>
          <MapPin className="h-3 w-3 mr-1" />
          {currentLocation.city}
        </Badge>
      )}
      
      {isStale && (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Stale
        </Badge>
      )}
    </div>
  );

  // Widget specific actions
  const widgetSpecificActions = (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleGetCurrentLocation}
        disabled={gpsLoading}
        className={cn(
          "h-8 w-8 p-0",
          settings.pipBoyMode && "text-primary hover:bg-primary/20"
        )}
        title="Get current location"
      >
        <Navigation className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleRefresh}
        disabled={!canRefresh}
        className={cn(
          "h-8 w-8 p-0",
          settings.pipBoyMode && "text-primary hover:bg-primary/20"
        )}
        title="Refresh weather"
      >
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowFullScreen(true)}
        className={cn(
          "h-8 w-8 p-0",
          settings.pipBoyMode && "text-primary hover:bg-primary/20"
        )}
        title="Full screen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowSettings(true)}
        className={cn(
          "h-8 w-8 p-0",
          settings.pipBoyMode && "text-primary hover:bg-primary/20"
        )}
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );

  // Main content renderer
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center py-8 text-center">
          <div className="space-y-2">
            <AlertTriangle className={cn(
              "h-12 w-12 mx-auto text-destructive",
              settings.pipBoyMode && "text-primary"
            )} />
            <p className={cn(
              "text-sm text-muted-foreground",
              settings.pipBoyMode && "text-primary/70 font-mono"
            )}>
              {error}
            </p>
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={!canRefresh}
              className={settings.pipBoyMode ? "bg-primary/20 text-primary border-primary/30" : ""}
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
          <div className={cn(
            "text-center space-y-2",
            settings.pipBoyMode && "text-primary"
          )}>
            <Cloud className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className={cn(
              "text-sm text-muted-foreground",
              settings.pipBoyMode && "text-primary/70 font-mono"
            )}>
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
              className={settings.pipBoyMode ? "bg-primary/20 text-primary border-primary/30" : ""}
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
            <p className={cn(
              "text-sm text-muted-foreground",
              settings.pipBoyMode && "text-primary/70 font-mono"
            )}>
              Loading weather data...
            </p>
          </div>
        </div>
      );
    }

    if (!weatherData) return null;

    return (
      <div className="space-y-4">
        {/* Location Search */}
        <LocationSearchInput
          onLocationSelect={handleLocationSelect}
          currentLocation={currentLocation}
          placeholder="Search for a city or ZIP code..."
        />

        {/* Pip-Boy Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <RadioIcon className={cn(
              "h-4 w-4",
              settings.pipBoyMode && "text-primary"
            )} />
            <span className={cn(
              "text-sm font-medium",
              settings.pipBoyMode && "text-primary font-mono"
            )}>
              Pip-Boy Mode
            </span>
          </div>
          <Switch
            checked={settings.pipBoyMode}
            onCheckedChange={(checked) => handleSettingsChange('pipBoyMode', checked)}
          />
        </div>

        {/* Weather Content */}
        {settings.pipBoyMode && settings.showRadiation && radiationLevel ? (
          <div className="space-y-4">
            <PipBoyRadiationMeter radiationLevel={radiationLevel} />
            
            {settings.showCurrentWeather && (
              <CurrentWeatherCard 
                weather={weatherData.current} 
                isPipBoyMode={true}
              />
            )}
          </div>
        ) : (
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="air">Air Quality</TabsTrigger>
              <TabsTrigger value="pollen">Pollen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4">
              {settings.showCurrentWeather && (
                <CurrentWeatherCard 
                  weather={weatherData.current} 
                  isPipBoyMode={settings.pipBoyMode}
                />
              )}
            </TabsContent>
            
            <TabsContent value="forecast" className="space-y-4">
              {settings.showForecast && (
                <ForecastCard 
                  forecast={weatherData.forecast}
                  units={settings.units}
                  isPipBoyMode={settings.pipBoyMode}
                />
              )}
            </TabsContent>
            
            <TabsContent value="air" className="space-y-4">
              {settings.showAirQuality && (
                <AirQualityPanel 
                  airQuality={weatherData.airQuality}
                  isPipBoyMode={settings.pipBoyMode}
                />
              )}
            </TabsContent>
            
            <TabsContent value="pollen" className="space-y-4">
              {settings.showPollen && (
                <PollenPanel 
                  pollen={weatherData.pollen}
                  isPipBoyMode={settings.pipBoyMode}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  };

  return (
    <>
      <WidgetTemplate
        title={title}
        widgetId={widgetId}
        icon={Cloud}
        headerActions={headerActions}
        widgetSpecificActions={widgetSpecificActions}
        widget={widget}
        onRemove={onRemove}
        onToggleCollapse={onToggleCollapse}
        onToggleFullWidth={onToggleFullWidth}
        onOpenSettings={() => setShowSettings(true)}
        className={cn(
          settings.pipBoyMode && "border-primary/50 bg-background/95"
        )}
      >
        {renderContent()}
      </WidgetTemplate>

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

          <SecondarySettingsGroup
            title="Pip-Boy Mode"
            description="Fallout-themed radiation detector display"
          >
            <SettingsToggle
              label="Enable Pip-Boy Mode"
              description="Transform weather data into radiation readings"
              checked={settings.pipBoyMode}
              onCheckedChange={(checked) => handleSettingsChange('pipBoyMode', checked)}
            />
            {settings.pipBoyMode && (
              <SettingsToggle
                label="Show Radiation Meter"
                description="Display environmental threat gauge"
                checked={settings.showRadiation}
                onCheckedChange={(checked) => handleSettingsChange('showRadiation', checked)}
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
                {settings.pipBoyMode && radiationLevel && (
                  <PipBoyRadiationMeter radiationLevel={radiationLevel} />
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {settings.showCurrentWeather && (
                    <CurrentWeatherCard 
                      weather={weatherData.current} 
                      isPipBoyMode={settings.pipBoyMode}
                    />
                  )}
                  
                  {settings.showForecast && (
                    <ForecastCard 
                      forecast={weatherData.forecast}
                      units={settings.units}
                      isPipBoyMode={settings.pipBoyMode}
                    />
                  )}
                  
                  {settings.showAirQuality && (
                    <AirQualityPanel 
                      airQuality={weatherData.airQuality}
                      isPipBoyMode={settings.pipBoyMode}
                    />
                  )}
                  
                  {settings.showPollen && (
                    <PollenPanel 
                      pollen={weatherData.pollen}
                      isPipBoyMode={settings.pipBoyMode}
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