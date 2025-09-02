import React, { memo } from 'react';
import { WidgetType, BaseWidget } from '@/types/widgets';
import { CharacterProfileWidget } from './CharacterProfileWidget';
import { SpecialStatsWidget } from './SpecialStatsWidget';
import { SystemMonitorWidget } from './SystemMonitorWidget';
import { WeatherStationWidget } from './WeatherStationWidget';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';

// Widget component registry
export const WidgetComponents: Record<WidgetType, React.ComponentType<{ widget: BaseWidget }>> = {
  'character-profile': CharacterProfileWidget,
  'special-stats': SpecialStatsWidget,
  'system-monitor': SystemMonitorWidget,
  'weather-station': WeatherStationWidget,
  // Placeholder components for widgets not yet implemented
  'achievement-gallery': ({ widget }) => (
    <div className="pip-special-stat p-4 text-center">
      <div className="text-pip-text-muted font-pip-mono">
        Achievement Gallery Widget
        <br />
        Coming Soon
      </div>
    </div>
  ),
  'file-explorer': ({ widget }) => (
    <div className="pip-special-stat p-4 text-center">
      <div className="text-pip-text-muted font-pip-mono">
        File Explorer Widget
        <br />
        Coming Soon
      </div>
    </div>
  ),
  'secure-vault': ({ widget }) => (
    <div className="pip-special-stat p-4 text-center">
      <div className="text-pip-text-muted font-pip-mono">
        Secure Vault Widget
        <br />
        Coming Soon
      </div>
    </div>
  ),
  'news-terminal': ({ widget }) => (
    <div className="pip-special-stat p-4 text-center">
      <div className="text-pip-text-muted font-pip-mono">
        News Terminal Widget
        <br />
        Coming Soon
      </div>
    </div>
  ),
  'audio-player': ({ widget }) => (
    <div className="pip-special-stat p-4 text-center">
      <div className="text-pip-text-muted font-pip-mono">
        Audio Player Widget
        <br />
        Coming Soon
      </div>
    </div>
  ),
  'calendar-mission': ({ widget }) => (
    <div className="pip-special-stat p-4 text-center">
      <div className="text-pip-text-muted font-pip-mono">
        Mission Control Widget
        <br />
        Coming Soon
      </div>
    </div>
  ),
  'ai-oracle': ({ widget }) => (
    <div className="pip-special-stat p-4 text-center">
      <div className="text-pip-text-muted font-pip-mono">
        AI Oracle Widget
        <br />
        Coming Soon
      </div>
    </div>
  ),
};

// Widget renderer component
interface WidgetRendererProps {
  widget: BaseWidget;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = memo(({ widget }) => {
  const Component = WidgetComponents[widget.type];
  
  if (!Component) {
    return (
      <Card className="pip-widget border-destructive/50">
        <CardContent className="p-6 text-center">
          <div className="text-pip-text-muted font-pip-mono">
            Widget type "{widget.type}" not implemented
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <WidgetErrorBoundary widgetId={widget.id} widgetTitle={widget.title}>
      <Component widget={widget} />
    </WidgetErrorBoundary>
  );
});