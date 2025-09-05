import { lazy, Suspense, ComponentType } from 'react';
import { BaseWidget } from '@/types/widgets';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Map of widget types to their lazy-loaded components
const widgetComponents: Record<string, ComponentType<any>> = {
  'character-profile': lazy(() => import('./CharacterProfileWidget').then(m => ({ 
    default: m.CharacterProfileWidget 
  }))),
  'weather-station': lazy(() => import('./WeatherStationWidget').then(m => ({ 
    default: m.WeatherStationWidget 
  }))),
  'ai-oracle': lazy(() => import('./AiOracleWidget').then(m => ({ 
    default: m.AiOracleWidget 
  }))),
  'news-terminal': lazy(() => import('./NewsTerminalWidget').then(m => ({ 
    default: m.NewsTerminalWidget 
  }))),
  'secure-vault': lazy(() => import('./SecureVaultWidget').then(m => ({ 
    default: m.SecureVaultWidget 
  }))),
  'cryptocurrency': lazy(() => import('./CryptocurrencyWidget').then(m => ({ 
    default: m.CryptocurrencyWidget 
  }))),
  'achievement-gallery': lazy(() => import('./AchievementGalleryWidget').then(m => ({ 
    default: m.AchievementGalleryWidget 
  }))),
  'terminal': lazy(() => import('./TerminalWidget').then(m => ({ 
    default: m.TerminalWidget 
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
          <LoadingSpinner size="sm" text={`Loading ${widget.title}...`} />
        </div>
      }
    >
      <WidgetComponent widget={widget} />
    </Suspense>
  );
};