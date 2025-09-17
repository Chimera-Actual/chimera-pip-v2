import React, { useState, useEffect, memo } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppManager } from '@/hooks/useAppManager';
import { UserApp } from '@/types/appManagement';
import { APP_REGISTRY } from '@/config/appRegistry';
import { getIconComponent } from '@/utils/iconMapping';

interface SimpleAppDrawerProps {
  activeTab: string;
  onAddApp: () => void;
  onAppSelect: (app: UserApp) => void;
  activeAppId?: string;
}

export const SimpleAppDrawer = memo<SimpleAppDrawerProps>(({
  activeTab,
  onAddApp,
  onAppSelect,
  activeAppId
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { getTabApps, isLoading } = useAppManager();
  const [apps, setApps] = useState<UserApp[]>([]);

  useEffect(() => {
    const loadApps = async () => {
      const tabApps = await getTabApps(activeTab);
      setApps(tabApps);
    };

    if (activeTab) {
      loadApps();
    }
  }, [activeTab, getTabApps]);

  const getAppDefinition = (appId: string) => {
    return APP_REGISTRY.find(app => app.id === appId);
  };

  return (
    <div className={`
      h-full border-r border-pip-border bg-pip-bg-secondary flex flex-col transition-all duration-300
      ${isCollapsed ? 'w-12' : 'w-64'}
    `}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-pip-border">
        {!isCollapsed && (
          <h3 className="text-sm font-pip-mono text-pip-text-primary font-semibold">APPS</h3>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-6 w-6 text-pip-text-secondary hover:text-pip-text-primary"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      </div>

      {/* App List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className={`text-center text-pip-text-muted ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {!isCollapsed && <div className="text-xs">Loading...</div>}
          </div>
        ) : apps.length === 0 ? (
          <div className={`text-center text-pip-text-muted ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {!isCollapsed && <div className="text-xs">No apps</div>}
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {apps.map((app) => {
              const appDef = getAppDefinition(app.widget_type);
              if (!appDef) return null;
              
              const IconComponent = getIconComponent(appDef.icon);
              const isActive = app.id === activeAppId;

              return (
                <Button
                  key={app.id}
                  variant="ghost"
                  onClick={() => onAppSelect(app)}
                  className={`
                    w-full transition-all duration-200 
                    ${isCollapsed ? 'h-10 px-0 justify-center' : 'h-9 px-3 justify-start'}
                    ${isActive 
                      ? 'bg-pip-green-primary/20 border-l-2 border-l-pip-green-primary text-pip-green-primary' 
                      : 'hover:bg-pip-bg-tertiary text-pip-text-primary hover:text-pip-text-bright'
                    }
                  `}
                >
                  <IconComponent className={`flex-shrink-0 ${isCollapsed ? 'h-4 w-4' : 'h-4 w-4'}`} />
                  {!isCollapsed && (
                    <span className="flex-1 text-left text-xs font-medium ml-3">
                      {appDef.name}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add App Button */}
      <div className="border-t border-pip-border p-2">
        <Button
          onClick={onAddApp}
          variant="ghost"
          className={`
            w-full transition-all duration-200 border border-dashed border-pip-border
            hover:border-pip-green-primary hover:bg-pip-green-primary/10 hover:text-pip-green-primary
            text-pip-text-secondary
            ${isCollapsed ? 'h-10 px-0 justify-center' : 'h-9 px-3 justify-start'}
          `}
        >
          <Plus className={`${isCollapsed ? 'h-4 w-4' : 'h-4 w-4'}`} />
          {!isCollapsed && (
            <span className="ml-2 text-xs font-medium">ADD APP</span>
          )}
        </Button>
      </div>
    </div>
  );
});