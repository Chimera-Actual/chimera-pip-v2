import React, { Suspense, lazy, memo } from 'react';
import { BaseWidget } from '@/types/widgets';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Lazy-loaded widget components for better performance
export const LazyCharacterProfileWidget = lazy(() => 
  import('@/components/widgets/CharacterProfileWidget').then(module => ({ 
    default: module.CharacterProfileWidget 
  }))
);

export const LazySpecialStatsWidget = lazy(() => 
  import('@/components/widgets/SpecialStatsWidget').then(module => ({ 
    default: module.SpecialStatsWidget 
  }))
);

export const LazySystemMonitorWidget = lazy(() => 
  import('@/components/widgets/SystemMonitorWidget').then(module => ({ 
    default: module.SystemMonitorWidget 
  }))
);

export const LazyWeatherStationWidget = lazy(() => 
  import('@/components/widgets/WeatherStationWidget').then(module => ({ 
    default: module.WeatherStationWidget 
  }))
);

export const LazyAdvancedWidgetCatalog = lazy(() => 
  import('@/components/tabManagement/AdvancedWidgetCatalog').then(module => ({ 
    default: module.AdvancedWidgetCatalog 
  }))
);

// Higher-order component for wrapping lazy widgets with loading states
interface LazyWidgetWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWidgetWrapper: React.FC<LazyWidgetWrapperProps> = memo(({ 
  children, 
  fallback 
}) => (
  <Suspense 
    fallback={
      fallback || (
        <div className="pip-widget flex items-center justify-center h-32">
          <LoadingSpinner size="sm" text="LOADING WIDGET..." />
        </div>
      )
    }
  >
    {children}
  </Suspense>
));

// Lazy widget renderer for performance optimization
interface LazyWidgetRendererProps {
  widget: BaseWidget;
  priority?: 'high' | 'normal' | 'low';
}

export const LazyWidgetRenderer: React.FC<LazyWidgetRendererProps> = memo(({ 
  widget, 
  priority = 'normal' 
}) => {
  const loadingFallback = (
    <div className="pip-widget border-pip-border animate-pulse">
      <div className="h-12 bg-pip-bg-secondary/30 rounded-t" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-pip-bg-secondary/30 rounded w-3/4" />
        <div className="h-4 bg-pip-bg-secondary/30 rounded w-1/2" />
        <div className="h-4 bg-pip-bg-secondary/30 rounded w-5/6" />
      </div>
    </div>
  );

  const renderWidget = () => {
    switch (widget.type) {
      case 'character-profile':
        return (
          <LazyWidgetWrapper fallback={loadingFallback}>
            <LazyCharacterProfileWidget widget={widget} />
          </LazyWidgetWrapper>
        );
      case 'special-stats':
        return (
          <LazyWidgetWrapper fallback={loadingFallback}>
            <LazySpecialStatsWidget widget={widget} />
          </LazyWidgetWrapper>
        );
      case 'system-monitor':
        return (
          <LazyWidgetWrapper fallback={loadingFallback}>
            <LazySystemMonitorWidget widget={widget} />
          </LazyWidgetWrapper>
        );
      case 'weather-station':
        return (
          <LazyWidgetWrapper fallback={loadingFallback}>
            <LazyWeatherStationWidget widget={widget} />
          </LazyWidgetWrapper>
        );
      default:
        return (
          <div className="pip-widget p-4 text-center">
            <div className="text-pip-text-muted font-pip-mono">
              {widget.type} Widget - Coming Soon
            </div>
          </div>
        );
    }
  };

  return renderWidget();
});