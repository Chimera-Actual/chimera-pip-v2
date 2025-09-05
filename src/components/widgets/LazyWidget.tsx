import { lazy, Suspense, ComponentType } from 'react';
import { BaseWidget } from '@/types/widgets';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Map of widget types to their lazy-loaded components
const widgetComponents: Record<string, ComponentType<any>> = {
  'character-profile': lazy(() => import('./CharacterProfileWidget').then(m => ({ 
    default: m.default || m.CharacterProfileWidget 
  }))),
  'weather-station': lazy(() => import('./WeatherStationWidget').then(m => ({ 
    default: m.default || m.WeatherStationWidget 
  }))),
  'ai-oracle': lazy(() => import('./AiOracleWidget').then(m => ({ 
    default: m.default || m.AiOracleWidget 
  }))),
  'news-terminal': lazy(() => import('./NewsTerminalWidget').then(m => ({ 
    default: m.default || m.NewsTerminalWidget 
  }))),
  'secure-vault': lazy(() => import('./SecureVaultWidget').then(m => ({ 
    default: m.default || m.SecureVaultWidget 
  }))),
  'cryptocurrency': lazy(() => import('./CryptocurrencyWidget').then(m => ({ 
    default: m.default || m.CryptocurrencyWidget 
  }))),
  'achievement-gallery': lazy(() => import('./AchievementGalleryWidget').then(m => ({ 
    default: m.default || m.AchievementGalleryWidget 
  }))),
  'system-diagnostics': lazy(() => import('./SystemDiagnosticsWidget').then(m => ({ 
    default: m.default || m.SystemDiagnosticsWidget 
  }))),
  'music-player': lazy(() => import('./MusicPlayerWidget').then(m => ({ 
    default: m.default || m.MusicPlayerWidget 
  }))),
  'notepad': lazy(() => import('./NotepadWidget').then(m => ({ 
    default: m.default || m.NotepadWidget 
  }))),
  'countdown-timer': lazy(() => import('./CountdownTimerWidget').then(m => ({ 
    default: m.default || m.CountdownTimerWidget 
  }))),
  'clock': lazy(() => import('./ClockWidget').then(m => ({ 
    default: m.default || m.ClockWidget 
  }))),
  'memory-game': lazy(() => import('./MemoryGameWidget').then(m => ({ 
    default: m.default || m.MemoryGameWidget 
  }))),
  'mini-journal': lazy(() => import('./MiniJournalWidget').then(m => ({ 
    default: m.default || m.MiniJournalWidget 
  }))),
  'reaction-game': lazy(() => import('./ReactionGameWidget').then(m => ({ 
    default: m.default || m.ReactionGameWidget 
  }))),
  'stock-ticker': lazy(() => import('./StockTickerWidget').then(m => ({ 
    default: m.default || m.StockTickerWidget 
  }))),
  'task-manager': lazy(() => import('./TaskManagerWidget').then(m => ({ 
    default: m.default || m.TaskManagerWidget 
  }))),
  'terminal': lazy(() => import('./TerminalWidget').then(m => ({ 
    default: m.default || m.TerminalWidget 
  }))),
  'world-clock': lazy(() => import('./WorldClockWidget').then(m => ({ 
    default: m.default || m.WorldClockWidget 
  }))),
};

interface LazyWidgetProps {
  widget: BaseWidget;
}

export const LazyWidget: React.FC<LazyWidgetProps> = ({ widget }) => {
  const WidgetComponent = widgetComponents[widget.type];

  if (!WidgetComponent) {
    return (
      <div className="p-4 text-center text-pip-text-secondary">
        Widget type "{widget.type}" not found
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="sm" text={`Loading ${widget.name}...`} />
        </div>
      }
    >
      <WidgetComponent widget={widget} />
    </Suspense>
  );
};