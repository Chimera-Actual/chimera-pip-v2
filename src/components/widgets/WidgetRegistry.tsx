import React, { memo, Suspense, lazy } from 'react';
import { WidgetType, BaseWidget } from '@/types/widgets';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Lazy load all widget components for better performance
const CharacterProfileWidget = lazy(() => import('./CharacterProfileWidget').then(m => ({ default: m.CharacterProfileWidget })));
const SpecialStatsWidget = lazy(() => import('./SpecialStatsWidget').then(m => ({ default: m.SpecialStatsWidget })));
const SystemMonitorWidget = lazy(() => import('./SystemMonitorWidget').then(m => ({ default: m.SystemMonitorWidget })));
const WeatherStationWidget = lazy(() => import('./WeatherStationWidget').then(m => ({ default: m.WeatherStationWidget })));
const NewsTerminalWidget = lazy(() => import('./NewsTerminalWidget').then(m => ({ default: m.NewsTerminalWidget })));
const FileExplorerWidget = lazy(() => import('./FileExplorerWidget').then(m => ({ default: m.FileExplorerWidget })));
const AudioPlayerWidget = lazy(() => import('./AudioPlayerWidget').then(m => ({ default: m.AudioPlayerWidget })));
const AchievementGalleryWidget = lazy(() => import('./AchievementGalleryWidget').then(m => ({ default: m.AchievementGalleryWidget })));
const SecureVaultWidget = lazy(() => import('./SecureVaultWidget').then(m => ({ default: m.SecureVaultWidget })));
const MissionCalendarWidget = lazy(() => import('./MissionCalendarWidget').then(m => ({ default: m.MissionCalendarWidget })));
const AiOracleWidget = lazy(() => import('./AiOracleWidget').then(m => ({ default: m.AiOracleWidget })));
const CryptocurrencyWidget = lazy(() => import('./CryptocurrencyWidget').then(m => ({ default: m.CryptocurrencyWidget })));
const TerminalWidget = lazy(() => import('./TerminalWidget').then(m => ({ default: m.TerminalWidget })));

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
  'ai-oracle': AiOracleWidget,
  'cryptocurrency': CryptocurrencyWidget,
  'terminal': TerminalWidget,
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
      <Suspense fallback={
        <Card className="pip-widget">
          <CardContent className="p-6 flex items-center justify-center">
            <LoadingSpinner size="sm" text="Loading widget..." />
          </CardContent>
        </Card>
      }>
        <Component widget={widget} />
      </Suspense>
    </WidgetErrorBoundary>
  );
});