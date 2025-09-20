import React from 'react';
import { Calendar, CloudRain, Wind, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastDay } from '@/services/weatherService';
import { fmtTemp, fmtWind, type Units } from '@/utils/weatherFormatters';
import { cn } from '@/lib/utils';

interface ForecastCardProps {
  forecast: ForecastDay[];
  units: Units;
  isPipBoyMode?: boolean;
  className?: string;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  units,
  isPipBoyMode = false,
  className
}) => {
  const formatDate = (dateString: string, isToday = false) => {
    const date = new Date(dateString);
    if (isToday) return 'Today';
    
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeatherIcon = (iconType: string, size = 'h-8 w-8') => {
    if (iconType && iconType !== 'partly-cloudy') {
      return (
        <img 
          src={`https://openweathermap.org/img/wn/${iconType}@2x.png`}
          alt="Weather icon"
          className={cn(size, "object-contain")}
        />
      );
    }
    
    // Fallback icons for cases where Google icon mapping doesn't work
    const iconClass = cn(size, isPipBoyMode && "text-primary");
    
    switch (iconType) {
      case 'sunny':
        return <div className={cn(iconClass, "bg-yellow-500 rounded-full")} />;
      case 'cloudy':
        return <div className={cn(iconClass, "bg-gray-400 rounded-lg")} />;
      case 'rainy':
        return <CloudRain className={iconClass} />;
      case 'stormy':
        return <div className={cn(iconClass, "bg-purple-600 rounded-lg")} />;
      case 'partly-cloudy':
      default:
        return <div className={cn(iconClass, "bg-blue-400 rounded-full")} />;
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      isPipBoyMode && "border-primary/50 bg-background/95 backdrop-blur-sm",
      className
    )}>
      <CardHeader>
        <CardTitle className={cn(
          "flex items-center gap-2 text-lg",
          isPipBoyMode && "text-primary font-mono tracking-wider"
        )}>
          <Calendar className="h-5 w-5" />
          5-Day Forecast
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {forecast.map((day, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors",
                "hover:bg-muted/50",
                isPipBoyMode && "bg-primary/5 border border-primary/20 hover:bg-primary/10"
              )}
            >
              {/* Date */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium text-sm",
                  isPipBoyMode && "text-primary font-mono"
                )}>
                  {formatDate(day.date, index === 0)}
                </div>
                <div className={cn(
                  "text-xs text-muted-foreground capitalize",
                  isPipBoyMode && "text-primary/70"
                )}>
                  {day.description}
                </div>
              </div>

              {/* Weather Icon */}
              <div className="flex-shrink-0 mx-4">
                {getWeatherIcon(day.icon, 'h-10 w-10')}
              </div>

              {/* Temperature Range */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={cn(
                  "text-sm font-bold",
                  isPipBoyMode && "text-primary font-mono"
                )}>
                  {fmtTemp(day.high, units)}
                </div>
                <div className={cn(
                  "text-xs text-muted-foreground",
                  isPipBoyMode && "text-primary/50"
                )}>
                  /
                </div>
                <div className={cn(
                  "text-sm text-muted-foreground",
                  isPipBoyMode && "text-primary/70 font-mono"
                )}>
                  {fmtTemp(day.low, units)}
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                {/* Precipitation */}
                {day.precipitation > 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs text-muted-foreground",
                    isPipBoyMode && "text-primary/70"
                  )}>
                    <CloudRain className="h-3 w-3" />
                    <span>{day.precipitation}%</span>
                  </div>
                )}

                {/* Wind */}
                 <div className={cn(
                   "flex items-center gap-1 text-xs text-muted-foreground",
                   isPipBoyMode && "text-primary/70"
                 )}>
                   <Wind className="h-3 w-3" />
                   <span>{fmtWind(day.windSpeed, units)}</span>
                 </div>

                {/* Humidity */}
                <div className={cn(
                  "flex items-center gap-1 text-xs text-muted-foreground",
                  isPipBoyMode && "text-primary/70"
                )}>
                  <Droplets className="h-3 w-3" />
                  <span>{day.humidity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={cn(
          "mt-4 pt-3 border-t text-xs text-muted-foreground text-center",
          isPipBoyMode && "border-primary/20 text-primary/70 font-mono"
        )}>
          Weather forecast updates every 6 hours
        </div>
      </CardContent>
    </Card>
  );
};