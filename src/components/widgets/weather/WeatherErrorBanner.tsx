import React from 'react';
import { AlertTriangle, Key, MapPin, RefreshCw, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type WeatherErrorType = 
  | 'api_key_missing'
  | 'geolocation_denied' 
  | 'quota_exceeded'
  | 'network_error'
  | 'unknown_error';

interface WeatherErrorBannerProps {
  error: string;
  errorType?: WeatherErrorType;
  onRetry?: () => void;
  onOpenSettings?: () => void;
  retryDisabled?: boolean;
  isPipBoyMode?: boolean;
  className?: string;
}

export const WeatherErrorBanner: React.FC<WeatherErrorBannerProps> = ({
  error,
  errorType,
  onRetry,
  onOpenSettings,
  retryDisabled = false,
  isPipBoyMode = false,
  className
}) => {
  const getErrorConfig = (type?: WeatherErrorType) => {
    switch (type) {
      case 'api_key_missing':
        return {
          icon: Key,
          title: 'API Key Required',
          description: 'Google Maps API key is required for location services.',
          action: onOpenSettings ? (
            <Button 
              size="sm" 
              onClick={onOpenSettings}
              className={cn(
                isPipBoyMode && "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              <Settings className="h-4 w-4 mr-2" />
              Open Settings
            </Button>
          ) : null
        };
        
      case 'geolocation_denied':
        return {
          icon: MapPin,
          title: 'Location Access Denied',
          description: 'Unable to access your location. Please search for a city instead.',
          action: null
        };
        
      case 'quota_exceeded':
      case 'network_error':
        return {
          icon: RefreshCw,
          title: type === 'quota_exceeded' ? 'Quota Exceeded' : 'Network Error',
          description: type === 'quota_exceeded' 
            ? 'API quota exceeded. Please try again later.'
            : 'Network connection failed. Check your internet connection.',
          action: onRetry ? (
            <Button 
              size="sm" 
              onClick={onRetry}
              disabled={retryDisabled}
              className={cn(
                isPipBoyMode && "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", retryDisabled && "animate-spin")} />
              {retryDisabled ? 'Retrying...' : 'Retry'}
            </Button>
          ) : null
        };
        
      default:
        return {
          icon: AlertTriangle,
          title: 'Weather Error',
          description: error || 'An unexpected error occurred while loading weather data.',
          action: onRetry ? (
            <Button 
              size="sm" 
              onClick={onRetry}
              disabled={retryDisabled}
              className={cn(
                isPipBoyMode && "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", retryDisabled && "animate-spin")} />
              {retryDisabled ? 'Retrying...' : 'Try Again'}
            </Button>
          ) : null
        };
    }
  };

  const config = getErrorConfig(errorType);
  const Icon = config.icon;

  return (
    <Alert className={cn(
      "border-destructive/50 text-destructive",
      isPipBoyMode && "border-primary/50 bg-primary/5 text-primary",
      className
    )}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-medium mb-1">{config.title}</div>
          <div className="text-sm opacity-90">{config.description}</div>
        </div>
        {config.action && (
          <div className="ml-4 flex-shrink-0">
            {config.action}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Helper function to determine error type from error message
export const getErrorType = (error: string): WeatherErrorType => {
  const lowerError = error.toLowerCase();
  
  if (lowerError.includes('api key') || lowerError.includes('not configured')) {
    return 'api_key_missing';
  }
  
  if (lowerError.includes('permission denied') || lowerError.includes('user denied')) {
    return 'geolocation_denied';
  }
  
  if (lowerError.includes('quota') || lowerError.includes('limit exceeded')) {
    return 'quota_exceeded';
  }
  
  if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
    return 'network_error';
  }
  
  return 'unknown_error';
};