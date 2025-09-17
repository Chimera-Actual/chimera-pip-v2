import React, { memo } from 'react';
import { UserApp } from '@/types/appManagement';
import { APP_REGISTRY } from '@/config/appRegistry';

// Import app components
import { StatApp } from './StatApp';
import { InvApp } from './InvApp';
import { DataApp } from './DataApp';
import { MapApp } from './MapApp';
import { RadioApp } from './RadioApp';

interface AppRendererProps {
  app: UserApp | null;
  className?: string;
}

const APP_COMPONENTS: Record<string, React.ComponentType<any>> = {
  StatApp,
  InvApp,
  DataApp,
  MapApp,
  RadioApp,
};

export const AppRenderer = memo<AppRendererProps>(({ app, className }) => {
  if (!app) {
    return (
      <div className={`flex items-center justify-center h-full ${className || ''}`}>
        <div className="text-center text-pip-text-muted">
          <p className="text-lg mb-2">No Active App</p>
          <p className="text-sm">Select an app from the drawer to get started</p>
        </div>
      </div>
    );
  }

  const appDefinition = APP_REGISTRY.find(def => def.id === app.widget_type);
  if (!appDefinition) {
    return (
      <div className={`flex items-center justify-center h-full ${className || ''}`}>
        <div className="text-center text-pip-text-muted">
          <p className="text-lg mb-2">App Not Found</p>
          <p className="text-sm">The selected app is not available</p>
        </div>
      </div>
    );
  }

  const AppComponent = APP_COMPONENTS[appDefinition.component];
  if (!AppComponent) {
    return (
      <div className={`flex items-center justify-center h-full ${className || ''}`}>
        <div className="text-center text-pip-text-muted">
          <p className="text-lg mb-2">Component Not Found</p>
          <p className="text-sm">App component "{appDefinition.component}" is not implemented</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className || ''}`}>
      <AppComponent settings={app.widget_config || {}} />
    </div>
  );
});