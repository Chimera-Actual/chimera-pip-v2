import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface WeatherSkeletonProps {
  isPipBoyMode?: boolean;
  className?: string;
}

export const CurrentWeatherSkeleton: React.FC<WeatherSkeletonProps> = ({
  isPipBoyMode = false,
  className
}) => {
  return (
    <Card className={cn(
      "transition-all duration-300",
      isPipBoyMode && "border-primary/50 bg-background/95 backdrop-blur-sm",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Temperature Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="w-16 h-16 rounded-full" />
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={cn(
              "flex items-center gap-2 p-2 rounded-md bg-muted/50",
              isPipBoyMode && "bg-primary/10 border border-primary/20"
            )}>
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Details */}
        <div className="pt-2 border-t flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export const ForecastSkeleton: React.FC<WeatherSkeletonProps> = ({
  isPipBoyMode = false,
  className
}) => {
  return (
    <Card className={cn(
      "transition-all duration-300",
      isPipBoyMode && "border-primary/50 bg-background/95 backdrop-blur-sm",
      className
    )}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                isPipBoyMode ? "bg-primary/5 border border-primary/20" : "bg-muted/20"
              )}
            >
              {/* Date */}
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>

              {/* Weather Icon */}
              <Skeleton className="h-10 w-10 rounded mx-4" />

              {/* Temperature Range */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Skeleton className="h-4 w-8" />
                <span className="text-muted-foreground">/</span>
                <Skeleton className="h-4 w-8" />
              </div>

              {/* Additional Info */}
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-3 border-t text-center">
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
};