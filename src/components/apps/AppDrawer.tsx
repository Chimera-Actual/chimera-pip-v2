import React, { useState, useEffect, memo } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppManager } from '@/hooks/useAppManager';
import { UserApp } from '@/types/appManagement';
import { APP_REGISTRY } from '@/config/appRegistry';
import { getIconComponent } from '@/utils/iconMapping';

interface AppDrawerProps {
  activeTab: string;
  onAddApp: () => void;
  onAppSelect: (app: UserApp) => void;
  activeAppId?: string;
}

export const AppDrawer = memo<AppDrawerProps>(({
  activeTab,
  onAddApp,
  onAppSelect,
  activeAppId
}) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
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
    <Sidebar className="w-64 border-r border-pip-border bg-pip-bg-secondary">
      <SidebarHeader className="border-b border-pip-border px-4 py-3">
        {!collapsed && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-pip-text-primary">
              {activeTab} Apps
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onAddApp}
              className="h-6 w-6 p-0 hover:bg-pip-bg-tertiary text-pip-text-secondary hover:text-pip-text-primary"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
        {collapsed && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAddApp}
            className="h-8 w-8 p-0 hover:bg-pip-bg-tertiary text-pip-text-secondary hover:text-pip-text-primary mx-auto"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-pip-text-muted">
              Available Apps
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="p-4 text-center text-pip-text-muted">
                  Loading apps...
                </div>
              ) : apps.length === 0 ? (
                <div className="p-4 text-center text-pip-text-muted">
                  No apps installed
                </div>
              ) : (
                apps.map((app) => {
                  const appDef = getAppDefinition(app.widget_type);
                  if (!appDef) return null;
                  
                  const IconComponent = getIconComponent(appDef.icon);
                  const isActive = app.id === activeAppId;

                  return (
                    <SidebarMenuItem key={app.id}>
                      <SidebarMenuButton
                        asChild
                        className={`
                          cursor-pointer transition-colors
                          ${isActive 
                            ? 'bg-pip-bg-tertiary border-l-2 border-l-pip-green-primary text-pip-text-bright' 
                            : 'hover:bg-pip-bg-tertiary text-pip-text-primary hover:text-pip-text-bright'
                          }
                        `}
                      >
                        <div 
                          onClick={() => onAppSelect(app)}
                          className="flex items-center gap-3 w-full p-2"
                        >
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-sm">{appDef.name}</span>
                              {isActive && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-pip-green-primary/20 border-pip-green-primary text-pip-green-primary"
                                >
                                  Active
                                </Badge>
                              )}
                              <ChevronRight className="h-3 w-3 opacity-50" />
                            </>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
});