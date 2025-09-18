// Air Quality Index Display Panel  
import React from 'react';
import { Wind, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AirQuality } from '@/services/weatherService';
import { cn } from '@/lib/utils';

interface AirQualityPanelProps {
  airQuality: AirQuality;
  isPipBoyMode?: boolean;
  className?: string;
}

export const AirQualityPanel: React.FC<AirQualityPanelProps> = ({
  airQuality,
  isPipBoyMode = false,
  className
}) => {
  const getAQIIcon = () => {
    if (airQuality.aqi <= 50) {
      return <CheckCircle className={cn("h-5 w-5 text-green-500", isPipBoyMode && "text-primary")} />;
    } else if (airQuality.aqi <= 100) {
      return <AlertCircle className={cn("h-5 w-5 text-yellow-500", isPipBoyMode && "text-primary")} />;
    } else {
      return <AlertTriangle className={cn("h-5 w-5 text-red-500", isPipBoyMode && "text-primary")} />;
    }
  };

  const getAQIColor = () => {
    if (isPipBoyMode) return "primary";
    
    if (airQuality.aqi <= 50) return "green";
    else if (airQuality.aqi <= 100) return "yellow";
    else if (airQuality.aqi <= 150) return "orange";
    else return "red";
  };

  const pollutants = [
    { name: 'PM2.5', value: airQuality.pm25, unit: 'μg/m³', max: 50 },
    { name: 'PM10', value: airQuality.pm10, unit: 'μg/m³', max: 100 },
    { name: 'O₃', value: airQuality.ozone, unit: 'μg/m³', max: 120 },
    { name: 'NO₂', value: airQuality.no2, unit: 'μg/m³', max: 80 },
    { name: 'SO₂', value: airQuality.so2, unit: 'μg/m³', max: 60 },
    { name: 'CO', value: airQuality.co, unit: 'μg/m³', max: 300 }
  ];

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
          <Wind className="h-5 w-5" />
          Air Quality
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main AQI Display */}
        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg",
          "bg-muted/50",
          isPipBoyMode && "bg-primary/10 border border-primary/20"
        )}>
          <div className="flex items-center gap-3">
            {getAQIIcon()}
            <div>
              <div className={cn(
                "text-2xl font-bold",
                isPipBoyMode && "text-primary font-mono"
              )}>
                {airQuality.aqi}
              </div>
              <div className={cn(
                "text-sm text-muted-foreground",
                isPipBoyMode && "text-primary/70 font-mono"
              )}>
                AQI
              </div>
            </div>
          </div>

          <div className="text-right">
            <Badge 
              variant="secondary"
              className={cn(
                "mb-1",
                isPipBoyMode && "bg-primary/20 text-primary border-primary/30"
              )}
            >
              {airQuality.category}
            </Badge>
            <div className={cn(
              "text-xs text-muted-foreground",
              isPipBoyMode && "text-primary/70"
            )}>
              {airQuality.description}
            </div>
          </div>
        </div>

        {/* AQI Progress Bar */}
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between text-sm",
            isPipBoyMode && "text-primary/70 font-mono"
          )}>
            <span>Air Quality Level</span>
            <span>{airQuality.aqi}/300</span>
          </div>
          <Progress 
            value={(airQuality.aqi / 300) * 100} 
            className={cn(
              "h-2",
              isPipBoyMode && "bg-primary/20"
            )}
          />
          <div className={cn(
            "flex justify-between text-xs text-muted-foreground",
            isPipBoyMode && "text-primary/50 font-mono"
          )}>
            <span>Good</span>
            <span>Moderate</span>
            <span>Unhealthy</span>
            <span>Hazardous</span>
          </div>
        </div>

        {/* Pollutant Details */}
        <div className="space-y-3">
          <div className={cn(
            "text-sm font-medium",
            isPipBoyMode && "text-primary font-mono"
          )}>
            Pollutant Breakdown
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {pollutants.map((pollutant) => (
              <div
                key={pollutant.name}
                className={cn(
                  "p-3 rounded-md bg-muted/30",
                  isPipBoyMode && "bg-primary/5 border border-primary/20"
                )}
              >
                <div className={cn(
                  "text-xs font-medium mb-1",
                  isPipBoyMode && "text-primary font-mono"
                )}>
                  {pollutant.name}
                </div>
                <div className={cn(
                  "text-sm font-bold",
                  isPipBoyMode && "text-primary font-mono"
                )}>
                  {pollutant.value}
                  <span className={cn(
                    "text-xs font-normal ml-1 text-muted-foreground",
                    isPipBoyMode && "text-primary/70"
                  )}>
                    {pollutant.unit}
                  </span>
                </div>
                
                {/* Mini progress bar for each pollutant */}
                <div className="mt-1">
                  <Progress 
                    value={Math.min((pollutant.value / pollutant.max) * 100, 100)} 
                    className={cn(
                      "h-1",
                      isPipBoyMode && "bg-primary/20"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Recommendations */}
        <div className={cn(
          "p-3 rounded-lg bg-muted/30 border-l-4",
          airQuality.aqi <= 50 ? "border-green-500" :
          airQuality.aqi <= 100 ? "border-yellow-500" :
          airQuality.aqi <= 150 ? "border-orange-500" : "border-red-500",
          isPipBoyMode && "bg-primary/5 border-primary/50"
        )}>
          <div className={cn(
            "text-xs font-medium mb-1",
            isPipBoyMode && "text-primary font-mono"
          )}>
            Health Advisory
          </div>
          <div className={cn(
            "text-xs text-muted-foreground",
            isPipBoyMode && "text-primary/70"
          )}>
            {airQuality.aqi <= 50 
              ? "Air quality is good. Perfect for outdoor activities."
              : airQuality.aqi <= 100
              ? "Air quality is acceptable. Sensitive individuals may experience minor issues."
              : airQuality.aqi <= 150
              ? "Sensitive groups should limit prolonged outdoor activities."
              : "Everyone should avoid prolonged outdoor activities."
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};