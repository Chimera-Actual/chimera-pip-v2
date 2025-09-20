import React from 'react';
import { MapPin, Thermometer, Droplets, Wind, Eye, Sun, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrentWeather } from '@/services/weatherService';
import { formatTemperature, formatWindSpeed, formatVisibility } from '@/utils/units';
import { cn } from '@/lib/utils';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  isPipBoyMode?: boolean;
  className?: string;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  isPipBoyMode = false,
  className
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTemperatureDisplay = (temp: number, units: string) => {
    return formatTemperature(temp, units as 'metric' | 'imperial');
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      isPipBoyMode && "border-primary/50 bg-background/95 backdrop-blur-sm",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "flex items-center gap-2 text-lg",
          isPipBoyMode && "text-primary font-mono tracking-wider"
        )}>
          <MapPin className="h-5 w-5" />
          <span className="truncate">{weather.location}</span>
          {weather.country && (
            <Badge variant="secondary" className={cn(
              "text-xs",
              isPipBoyMode && "bg-primary/20 text-primary border-primary/30"
            )}>
              {weather.country}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Temperature Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "text-4xl font-bold",
              isPipBoyMode && "font-mono text-primary"
            )}>
              {getTemperatureDisplay(weather.temperature, weather.units)}
            </div>
            <div className="space-y-1">
              <div className={cn(
                "text-sm font-medium capitalize",
                isPipBoyMode && "text-primary"
              )}>
                {weather.description}
              </div>
              <div className={cn(
                "text-xs text-muted-foreground flex items-center gap-1",
                isPipBoyMode && "text-primary/70"
              )}>
                <Thermometer className="h-3 w-3" />
                Feels like {getTemperatureDisplay(weather.feelsLike, weather.units)}
              </div>
            </div>
          </div>
          
          {/* Weather Icon Placeholder */}
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            "bg-primary/10 border border-primary/20",
            isPipBoyMode && "bg-primary/20 border-primary/40"
          )}>
            <Sun className={cn(
              "h-8 w-8",
              isPipBoyMode && "text-primary"
            )} />
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Humidity */}
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-md bg-muted/50",
            isPipBoyMode && "bg-primary/10 border border-primary/20"
          )}>
            <Droplets className={cn(
              "h-4 w-4 text-blue-500",
              isPipBoyMode && "text-primary"
            )} />
            <div className="flex-1">
              <div className={cn(
                "text-xs text-muted-foreground",
                isPipBoyMode && "text-primary/70 font-mono"
              )}>
                Humidity
              </div>
              <div className={cn(
                "text-sm font-medium",
                isPipBoyMode && "text-primary font-mono"
              )}>
                {weather.humidity}%
              </div>
            </div>
          </div>

          {/* Wind */}
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-md bg-muted/50",
            isPipBoyMode && "bg-primary/10 border border-primary/20"
          )}>
            <Wind className={cn(
              "h-4 w-4 text-gray-500",
              isPipBoyMode && "text-primary"
            )} />
            <div className="flex-1">
              <div className={cn(
                "text-xs text-muted-foreground",
                isPipBoyMode && "text-primary/70 font-mono"
              )}>
                Wind
              </div>
               <div className={cn(
                 "text-sm font-medium",
                 isPipBoyMode && "text-primary font-mono"
               )}>
                 {formatWindSpeed(weather.windSpeed, weather.units as 'metric' | 'imperial')} {getWindDirection(weather.windDirection)}
               </div>
            </div>
          </div>

          {/* Visibility */}
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-md bg-muted/50",
            isPipBoyMode && "bg-primary/10 border border-primary/20"
          )}>
            <Eye className={cn(
              "h-4 w-4 text-gray-500",
              isPipBoyMode && "text-primary"
            )} />
            <div className="flex-1">
              <div className={cn(
                "text-xs text-muted-foreground",
                isPipBoyMode && "text-primary/70 font-mono"
              )}>
                Visibility
              </div>
               <div className={cn(
                 "text-sm font-medium",
                 isPipBoyMode && "text-primary font-mono"
               )}>
                 {formatVisibility(weather.visibility, weather.units as 'metric' | 'imperial')}
               </div>
            </div>
          </div>

          {/* UV Index */}
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-md bg-muted/50",
            isPipBoyMode && "bg-primary/10 border border-primary/20"
          )}>
            <Sun className={cn(
              "h-4 w-4 text-orange-500",
              isPipBoyMode && "text-primary"
            )} />
            <div className="flex-1">
              <div className={cn(
                "text-xs text-muted-foreground",
                isPipBoyMode && "text-primary/70 font-mono"
              )}>
                UV Index
              </div>
              <div className={cn(
                "text-sm font-medium",
                isPipBoyMode && "text-primary font-mono"
              )}>
                {weather.uvIndex}
                <span className={cn(
                  "ml-1 text-xs",
                  weather.uvIndex <= 2 ? "text-green-500" :
                  weather.uvIndex <= 5 ? "text-yellow-500" :
                  weather.uvIndex <= 7 ? "text-orange-500" : "text-red-500",
                  isPipBoyMode && "text-primary/70"
                )}>
                  {weather.uvIndex <= 2 ? 'Low' :
                   weather.uvIndex <= 5 ? 'Moderate' :
                   weather.uvIndex <= 7 ? 'High' : 'Very High'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className={cn(
          "pt-2 border-t text-xs text-muted-foreground flex items-center justify-between",
          isPipBoyMode && "border-primary/20 text-primary/70 font-mono"
        )}>
          <div className="flex items-center gap-1">
            <span>Pressure: {weather.pressure} hPa</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated: {formatTime(weather.lastUpdated)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};