// Pip-Boy Style Radiation Meter for Environmental Threat Display
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadiationLevel } from '@/services/weatherService';
import { cn } from '@/lib/utils';

interface PipBoyRadiationMeterProps {
  radiationLevel: RadiationLevel;
  className?: string;
}

export const PipBoyRadiationMeter: React.FC<PipBoyRadiationMeterProps> = ({
  radiationLevel,
  className
}) => {
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const [isGeiger, setIsGeiger] = useState(false);

  // Animate the radiation level change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedLevel(radiationLevel.level);
    }, 300);

    return () => clearTimeout(timer);
  }, [radiationLevel.level]);

  // Geiger counter click effect for high radiation
  useEffect(() => {
    if (radiationLevel.level > 65) {
      const interval = setInterval(() => {
        setIsGeiger(prev => !prev);
      }, 500);

      return () => clearInterval(interval);
    } else {
      setIsGeiger(false);
    }
  }, [radiationLevel.level]);

  const getRadiationColor = () => {
    switch (radiationLevel.category) {
      case 'safe':
        return 'text-primary';
      case 'caution':
        return 'text-yellow-400';
      case 'danger':
        return 'text-red-400';
      default:
        return 'text-primary';
    }
  };

  const getProgressColor = () => {
    switch (radiationLevel.category) {
      case 'safe':
        return 'bg-primary';
      case 'caution':
        return 'bg-yellow-400';
      case 'danger':
        return 'bg-red-400';
      default:
        return 'bg-primary';
    }
  };

  const getRadiationBars = () => {
    const bars = [];
    const segments = 10;
    const activeSegments = Math.ceil((radiationLevel.level / 100) * segments);

    for (let i = 0; i < segments; i++) {
      const isActive = i < activeSegments;
      const intensity = isActive ? Math.min(1, (radiationLevel.level / 100) * 2) : 0.1;
      
      bars.push(
        <div
          key={i}
          className={cn(
            "flex-1 h-6 mx-0.5 rounded-sm transition-all duration-300",
            "border border-primary/30",
            isActive ? getProgressColor() : "bg-primary/10",
            isGeiger && isActive && "animate-pulse"
          )}
          style={{
            opacity: isActive ? intensity : 0.3,
            boxShadow: isActive ? `0 0 8px hsl(var(--${radiationLevel.category === 'danger' ? 'destructive' : radiationLevel.category === 'caution' ? 'ring' : 'primary'}) / 0.4)` : 'none'
          }}
        />
      );
    }
    return bars;
  };

  return (
    <Card className={cn(
      "border-primary/50 bg-background/95 backdrop-blur-sm",
      "font-mono transition-all duration-300",
      isGeiger && "animate-pulse",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-primary tracking-wider">
          <span className="flex items-center gap-2">
            <div className="relative">
              <span className="text-2xl">☢️</span>
              {radiationLevel.category === 'danger' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            RAD DETECTOR
          </span>
          <Badge 
            variant="secondary"
            className={cn(
              "font-mono border-primary/30",
              radiationLevel.category === 'safe' && "bg-green-500/20 text-green-400 border-green-500/30",
              radiationLevel.category === 'caution' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
              radiationLevel.category === 'danger' && "bg-red-500/20 text-red-400 border-red-500/30"
            )}
          >
            {radiationLevel.category.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Radiation Display */}
        <div className="text-center space-y-2">
          <div className={cn(
            "text-6xl font-bold tracking-wider transition-all duration-500",
            getRadiationColor(),
            isGeiger && "animate-pulse"
          )}>
            {radiationLevel.rads}
          </div>
          <div className="text-primary/70 text-sm tracking-wider">
            RADS
          </div>
        </div>

        {/* Radiation Level Bars */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-primary/70">
            <span>THREAT LEVEL</span>
            <span>{radiationLevel.level}%</span>
          </div>
          
          <div className="flex gap-0.5 h-6">
            {getRadiationBars()}
          </div>
          
          <div className="flex justify-between text-xs text-primary/50">
            <span>SAFE</span>
            <span>CAUTION</span>
            <span>DANGER</span>
          </div>
        </div>

        {/* Environmental Threat Breakdown */}
        <div className="space-y-3">
          <div className="text-xs text-primary/70 tracking-wider">
            ENVIRONMENTAL ANALYSIS
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-primary/10 border border-primary/20 rounded p-2 text-center">
              <div className="text-primary font-bold">WEATHER</div>
              <div className="text-primary/70 mt-1">
                {radiationLevel.level <= 30 ? 'CLEAR' : 
                 radiationLevel.level <= 65 ? 'MODERATE' : 'HOSTILE'}
              </div>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded p-2 text-center">
              <div className="text-primary font-bold">AIR QUAL</div>
              <div className="text-primary/70 mt-1">
                {radiationLevel.level <= 30 ? 'CLEAN' :
                 radiationLevel.level <= 65 ? 'MODERATE' : 'TOXIC'}
              </div>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded p-2 text-center">
              <div className="text-primary font-bold">POLLEN</div>
              <div className="text-primary/70 mt-1">
                {radiationLevel.level <= 30 ? 'LOW' :
                 radiationLevel.level <= 65 ? 'MODERATE' : 'HIGH'}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className={cn(
          "p-3 rounded border-l-4 bg-primary/5",
          radiationLevel.category === 'safe' && "border-green-500/50 bg-green-500/10",
          radiationLevel.category === 'caution' && "border-yellow-500/50 bg-yellow-500/10",
          radiationLevel.category === 'danger' && "border-red-500/50 bg-red-500/10 animate-pulse"
        )}>
          <div className={cn(
            "text-xs font-bold tracking-wider mb-1",
            getRadiationColor()
          )}>
            VAULT-TEC ADVISORY
          </div>
          <div className="text-xs text-primary/80 leading-relaxed">
            {radiationLevel.message}
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center justify-between text-xs text-primary/50 border-t border-primary/20 pt-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isGeiger ? "bg-red-400 animate-ping" : "bg-green-400"
            )} />
            <span>DETECTOR STATUS: {isGeiger ? 'ACTIVE' : 'STANDBY'}</span>
          </div>
          <div>
            CALIBRATED: {new Date().toLocaleTimeString([], { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};