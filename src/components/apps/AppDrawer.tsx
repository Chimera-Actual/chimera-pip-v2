import React, { useState, useEffect, memo } from 'react';
import { Plus } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
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
    <Sidebar className={`border-r border-pip-border bg-pip-bg-secondary ${collapsed ? 'w-16' : 'w-64'}`}>
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {isLoading ? (
                <div className={`p-4 text-center text-pip-text-muted ${collapsed ? 'p-2' : ''}`}>
                  {!collapsed && "Loading apps..."}
                </div>
              ) : apps.length === 0 ? (
                <div className={`p-4 text-center text-pip-text-muted ${collapsed ? 'p-2' : ''}`}>
                  {!collapsed && "No apps installed"}
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
                        onClick={() => onAppSelect(app)}
                        className={`
                          w-full transition-all duration-200 
                          ${collapsed ? 'h-12 px-3 justify-center' : 'h-10 px-3 justify-start'}
                          ${isActive 
                            ? 'bg-pip-green-primary/20 border-l-2 border-l-pip-green-primary text-pip-green-primary' 
                            : 'hover:bg-pip-bg-tertiary text-pip-text-primary hover:text-pip-text-bright'
                          }
                        `}
                      >
                        <IconComponent className={`flex-shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                        {!collapsed && (
                          <span className="flex-1 text-left text-sm font-medium ml-3">
                            {appDef.name}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-pip-border p-2">
        <Button
          onClick={onAddApp}
          variant="ghost"
          className={`
            w-full transition-all duration-200 border border-dashed border-pip-border
            hover:border-pip-green-primary hover:bg-pip-green-primary/10 hover:text-pip-green-primary
            text-pip-text-secondary
            ${collapsed ? 'h-12 px-0 justify-center' : 'h-10 px-3 justify-start'}
          `}
        >
          <Plus className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
          {!collapsed && (
            <span className="ml-2 text-sm font-medium">ADD APP</span>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
});