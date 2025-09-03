import React, { memo } from 'react';
import { WidgetType, BaseWidget } from '@/types/widgets';
import { CharacterProfileWidget } from './CharacterProfileWidget';
import { SpecialStatsWidget } from './SpecialStatsWidget';
import { SystemMonitorWidget } from './SystemMonitorWidget';
import { WeatherStationWidget } from './WeatherStationWidget';
import { NewsTerminalWidget } from './NewsTerminalWidget';
import { FileExplorerWidget } from './FileExplorerWidget';
import { AudioPlayerWidget } from './AudioPlayerWidget';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { AchievementGalleryWidget } from './AchievementGalleryWidget';
import { SecureVaultWidget } from './SecureVaultWidget';
import { MissionCalendarWidget } from './MissionCalendarWidget';

// Widget component registry
export const WidgetComponents: Record<WidgetType, React.ComponentType<{ widget: BaseWidget }>> = {
  'character-profile': CharacterProfileWidget,
  'special-stats': SpecialStatsWidget,
  'system-monitor': SystemMonitorWidget,
  'weather-station': WeatherStationWidget,
  'news-terminal': NewsTerminalWidget,
  'file-explorer': FileExplorerWidget,
  'audio-player': AudioPlayerWidget,
  'achievement-gallery': AchievementGalleryWidget,
  'secure-vault': SecureVaultWidget, 
  'calendar-mission': MissionCalendarWidget,
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