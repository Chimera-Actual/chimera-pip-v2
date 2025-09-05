import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BaseWidget, WidgetType, TabAssignment, WidgetConfigDB, WidgetWidth } from '@/types/widgets';
import { WidgetFactory } from '@/lib/widgetFactory';
import { toast } from '@/hooks/use-toast';
import { reportError, reportWarning } from '@/lib/errorReporting';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
// Removed grid validation imports - using simple ordering now

export interface WidgetContextType {
  widgets: BaseWidget[];
  archivedWidgets: BaseWidget[];
  isLoading: boolean;
  error: string | null;
  addWidget: (type: WidgetType, tabAssignment?: TabAssignment) => Promise<BaseWidget | null>;
  removeWidget: (widgetId: string) => Promise<void>;
  archiveWidget: (widgetId: string) => Promise<void>;
  restoreWidget: (widgetId: string) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<BaseWidget>) => Promise<void>;
  updateMultipleWidgets: (widgetUpdates: Array<{id: string; updates: Partial<BaseWidget>}>) => Promise<void>;
  getWidgetsByTab: (tab: TabAssignment) => BaseWidget[];
  refreshWidgets: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const useWidgets = (): WidgetContextType => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
};

interface WidgetProviderProps {
  children: React.ReactNode;
}

export const WidgetProvider: React.FC<WidgetProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<BaseWidget[]>([]);
  const [archivedWidgets, setArchivedWidgets] = useState<BaseWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load widgets from Supabase
  const loadWidgets = useCallback(async () => {
    if (!user?.id) {
      setWidgets([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('order_position', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const allWidgets: BaseWidget[] = (data || []).map(widget => {
        try {
          const widgetConfig = widget.widget_config as unknown as WidgetConfigDB;
          const widgetType = widget.widget_type as WidgetType;
          
          // Validate widget type exists
          const definition = WidgetFactory.getDefinition(widgetType);
          
          return {
            id: widget.id,
            type: widgetType,
            title: widgetConfig?.title || definition.title,
            customIcon: widgetConfig?.customIcon || undefined,
            collapsed: widget.is_collapsed || false,
            archived: widget.is_archived || false,
            order: widget.order_position || 0,
            widgetWidth: (widget.widget_width as WidgetWidth) || 'half',
            tabAssignment: widget.tab_assignment as TabAssignment,
            settings: widgetConfig?.settings || definition.defaultSettings,
            userId: widget.user_id,
            createdAt: new Date(widget.created_at || Date.now()),
            updatedAt: new Date(widget.updated_at || Date.now()),
          } as BaseWidget;
        } catch (widgetError) {
          reportWarning(
            'Failed to parse widget data',
            { 
              widgetId: widget.id, 
              userId: user.id,
              component: 'WidgetContext',
              action: 'loadWidgets'
            }
          );
          return null;
        }
      }).filter((widget): widget is BaseWidget => widget !== null);

      // Separate active and archived widgets
      const activeWidgets = allWidgets.filter(w => !w.archived);
      const archived = allWidgets.filter(w => w.archived);
      
      setWidgets(activeWidgets);
      setArchivedWidgets(archived);
    } catch (err) {
      reportError(
        ERROR_MESSAGES.WIDGET_LOAD_FAILED,
        { 
          userId: user?.id,
          component: 'WidgetContext',
          action: 'loadWidgets'
        },
        err
      );
      setError(ERROR_MESSAGES.WIDGET_LOAD_FAILED);
      toast({
        title: 'Error',
        description: 'Failed to load your widgets. Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Helper function to get default widget icon
  const getDefaultWidgetIcon = useCallback((widgetType: WidgetType): string => {
    const iconMap: Record<WidgetType, string> = {
      'character-profile': 'folder',
      'special-stats': 'bar-chart-3',
      'system-monitor': 'monitor',
      'weather-station': 'cloud',
      'achievement-gallery': 'trophy',
      'file-explorer': 'folder',
      'secure-vault': 'shield',
      'news-terminal': 'file-text',
      'audio-player': 'music',
      'calendar-mission': 'calendar',
      'ai-oracle': 'message-circle',
      'cryptocurrency': 'dollar-sign',
      'terminal': 'terminal'
    };
    return iconMap[widgetType] || 'folder';
  }, []);

  // Add a new widget
  const addWidget = useCallback(async (type: WidgetType, tabAssignment?: TabAssignment): Promise<BaseWidget | null> => {
    if (!user?.id) {
      toast({
        title: 'Authentication Required', 
        description: 'Please log in to add widgets to your vault.',
        variant: 'destructive',
      });
      return null;
    }

    // Double-check authentication before database operation
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || currentUser.id !== user.id) {
      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const widget = WidgetFactory.createWidget(type, user.id, tabAssignment);

      // Find next order position for new widget in this tab
      const existingWidgets = widgets.filter(w => w.tabAssignment === widget.tabAssignment);
      const nextOrder = Math.max(...existingWidgets.map(w => w.order), -1) + 1;
      widget.order = nextOrder;

      const { data, error: insertError } = await supabase
        .from('user_widgets')
        .insert({
          id: widget.id,
          user_id: user.id,
          widget_type: widget.type,
          tab_assignment: widget.tabAssignment,
          widget_config: {
            title: widget.title,
            customIcon: getDefaultWidgetIcon(widget.type),
            settings: widget.settings
          } as any,
          order_position: widget.order,
          widget_width: widget.widgetWidth,
          is_collapsed: widget.collapsed,
          is_archived: widget.archived,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setWidgets(prev => [...prev, widget]);
      
      toast({
        title: 'Widget Added',
        description: SUCCESS_MESSAGES.WIDGET_ADDED,
      });

      return widget;
    } catch (err) {
      reportError(
        ERROR_MESSAGES.WIDGET_ADD_FAILED,
        {
          userId: user.id,
          component: 'WidgetContext',
          action: 'addWidget',
          metadata: { widgetType: type, tabAssignment }
        },
        err
      );
      toast({
        title: 'Error',
        description: ERROR_MESSAGES.WIDGET_ADD_FAILED,
        variant: 'destructive',
      });
      return null;
    }
  }, [user?.id, widgets, getDefaultWidgetIcon]);

  // Remove a widget
  const removeWidget = useCallback(async (widgetId: string): Promise<void> => {
    if (!user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to remove widgets.',
        variant: 'destructive',
      });
      return;
    }

    // Verify authentication before database operation
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || currentUser.id !== user.id) {
      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('user_widgets')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setWidgets(prev => prev.filter(w => w.id !== widgetId));
      
      toast({
        title: 'Widget Removed',
        description: SUCCESS_MESSAGES.WIDGET_REMOVED,
      });
    } catch (err) {
      reportError(
        ERROR_MESSAGES.WIDGET_DELETE_FAILED,
        {
          widgetId,
          userId: user.id,
          component: 'WidgetContext',
          action: 'removeWidget'
        },
        err
      );
      toast({
        title: 'Error',
        description: ERROR_MESSAGES.WIDGET_DELETE_FAILED,
        variant: 'destructive',
      });
    }
  }, [user?.id]);

  // Update a widget with optimistic updates
  const updateWidget = useCallback(async (widgetId: string, updates: Partial<BaseWidget>): Promise<void> => {
    if (!user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to update widgets.',
        variant: 'destructive',
      });
      return;
    }

    // Verify current authentication state
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || currentUser.id !== user.id) {
      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue.',
        variant: 'destructive',
      });
      return;
    }

    const currentWidget = widgets.find(w => w.id === widgetId) || archivedWidgets.find(w => w.id === widgetId);
    if (!currentWidget) {
      toast({
        title: 'Error',
        description: 'Widget not found.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic update - update UI immediately
      const optimisticUpdate = { ...updates, updatedAt: new Date() };
      
      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, ...optimisticUpdate }
          : widget
      ));
      
      setArchivedWidgets(prev => prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, ...optimisticUpdate }
          : widget
      ));

      // Prepare database updates
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined || updates.settings !== undefined || updates.customIcon !== undefined) {
        dbUpdates.widget_config = {
          title: updates.title || currentWidget.title,
          customIcon: updates.customIcon !== undefined ? updates.customIcon : currentWidget.customIcon,
          settings: updates.settings || currentWidget.settings,
        };
      }

      if (updates.order !== undefined) dbUpdates.order_position = updates.order;
      if (updates.widgetWidth !== undefined) dbUpdates.widget_width = updates.widgetWidth;
      if (updates.collapsed !== undefined) dbUpdates.is_collapsed = updates.collapsed;
      if (updates.archived !== undefined) dbUpdates.is_archived = updates.archived;
      if (updates.tabAssignment !== undefined) dbUpdates.tab_assignment = updates.tabAssignment;

      // Update database
      const { error: updateError } = await supabase
        .from('user_widgets')
        .update(dbUpdates)
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      // Rollback optimistic update on error
      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId 
          ? currentWidget 
          : widget
      ));
      
      setArchivedWidgets(prev => prev.map(widget => 
        widget.id === widgetId 
          ? currentWidget 
          : widget
      ));

      reportError(
        'Failed to update widget',
        {
          widgetId,
          userId: user.id,
          component: 'WidgetContext',
          action: 'updateWidget',
          metadata: { updates }
        },
        err
      );
      toast({
        title: 'Error',
        description: 'Failed to update widget. Changes have been reverted.',
        variant: 'destructive',
      });
      throw err; // Re-throw so calling code knows the update failed
    }
  }, [user?.id, widgets, archivedWidgets]);

  // Batch update multiple widgets (for reordering)
  const updateMultipleWidgets = useCallback(async (widgetUpdates: Array<{id: string; updates: Partial<BaseWidget>}>): Promise<void> => {
    if (!user?.id || widgetUpdates.length === 0) {
      if (!user?.id) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to reorder widgets.',
          variant: 'destructive',
        });
      }
      return;
    }

    // Double-check authentication for batch operations
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || currentUser.id !== user.id) {
      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue.',
        variant: 'destructive',
      });
      return;
    }

    // Store original widgets for rollback
    const originalWidgets = [...widgets];
    const originalArchivedWidgets = [...archivedWidgets];

    try {
      // Optimistic update - update UI immediately
      const updatesMap = new Map(widgetUpdates.map(({id, updates}) => [id, updates]));
      
      setWidgets(prev => prev.map(widget => {
        const update = updatesMap.get(widget.id);
        return update ? { ...widget, ...update, updatedAt: new Date() } : widget;
      }));
      
      setArchivedWidgets(prev => prev.map(widget => {
        const update = updatesMap.get(widget.id);
        return update ? { ...widget, ...update, updatedAt: new Date() } : widget;
      }));

      // Prepare batch database updates
      const dbUpdates = widgetUpdates.map(({id, updates}) => {
        const currentWidget = originalWidgets.find(w => w.id === id) || originalArchivedWidgets.find(w => w.id === id);
        if (!currentWidget) return null;

        const dbUpdate: any = {
          id,
          user_id: user.id, // Always include user_id for RLS compliance
          updated_at: new Date().toISOString(),
        };

        if (updates.title !== undefined || updates.settings !== undefined || updates.customIcon !== undefined) {
          dbUpdate.widget_config = {
            title: updates.title || currentWidget.title,
            customIcon: updates.customIcon !== undefined ? updates.customIcon : currentWidget.customIcon,
            settings: updates.settings || currentWidget.settings,
          };
        }

        if (updates.order !== undefined) dbUpdate.order_position = updates.order;
        if (updates.widgetWidth !== undefined) dbUpdate.widget_width = updates.widgetWidth;
        if (updates.collapsed !== undefined) dbUpdate.is_collapsed = updates.collapsed;
        if (updates.archived !== undefined) dbUpdate.is_archived = updates.archived;
        if (updates.tabAssignment !== undefined) dbUpdate.tab_assignment = updates.tabAssignment;

        return dbUpdate;
      }).filter(Boolean);

      if (dbUpdates.length === 0) return;

      // Use proper UPDATE operations instead of upsert to avoid RLS violations
      // Since we're only updating existing widgets, we don't need upsert behavior
      const updatePromises = dbUpdates.map(async (update) => {
        const { error } = await supabase
          .from('user_widgets')
          .update(update)
          .eq('id', update.id)
          .eq('user_id', user.id); // Double-check ownership in WHERE clause
        
        if (error) throw error;
        return update;
      });

      await Promise.all(updatePromises);
    } catch (err) {
      // Rollback optimistic updates on error
      setWidgets(originalWidgets);
      setArchivedWidgets(originalArchivedWidgets);

      reportError(
        'Failed to update multiple widgets',
        {
          userId: user.id,
          component: 'WidgetContext',
          action: 'updateMultipleWidgets',
          metadata: { widgetCount: widgetUpdates.length }
        },
        err
      );
      toast({
        title: 'Error',
        description: 'Failed to reorder widgets. Changes have been reverted.',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user?.id, widgets, archivedWidgets]);

  // Archive a widget
  const archiveWidget = useCallback(async (widgetId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) return;

      await updateWidget(widgetId, { archived: true });
      
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
      setArchivedWidgets(prev => [...prev, { ...widget, archived: true, updatedAt: new Date() }]);
      
      toast({
        title: 'Widget Archived',
        description: 'Widget moved to archive. You can restore it later.',
      });
    } catch (err) {
      reportError(
        'Failed to archive widget',
        {
          widgetId,
          userId: user.id,
          component: 'WidgetContext',
          action: 'archiveWidget'
        },
        err
      );
    }
  }, [user?.id, widgets, updateWidget]);

  // Restore a widget from archive
  const restoreWidget = useCallback(async (widgetId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      const widget = archivedWidgets.find(w => w.id === widgetId);
      if (!widget) return;

      await updateWidget(widgetId, { archived: false });
      
      setArchivedWidgets(prev => prev.filter(w => w.id !== widgetId));
      setWidgets(prev => [...prev, { ...widget, archived: false, updatedAt: new Date() }]);
      
      toast({
        title: 'Widget Restored',
        description: 'Widget restored from archive.',
      });
    } catch (err) {
      reportError(
        'Failed to restore widget',
        {
          widgetId,
          userId: user.id,
          component: 'WidgetContext',
          action: 'restoreWidget'
        },
        err
      );
    }
  }, [user?.id, archivedWidgets, updateWidget]);

  // Get widgets by tab (active widgets only)
  const getWidgetsByTab = useCallback((tab: TabAssignment): BaseWidget[] => {
    return widgets.filter(widget => widget.tabAssignment === tab && !widget.archived);
  }, [widgets]);

  // Refresh widgets
  const refreshWidgets = useCallback(async (): Promise<void> => {
    await loadWidgets();
  }, [loadWidgets]);

  // Load widgets when user changes
  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  const contextValue: WidgetContextType = {
    widgets,
    archivedWidgets,
    isLoading,
    error,
    addWidget,
    removeWidget,
    archiveWidget,
    restoreWidget,
    updateWidget,
    updateMultipleWidgets,
    getWidgetsByTab,
    refreshWidgets,
  };

  return (
    <WidgetContext.Provider value={contextValue}>
      {children}
    </WidgetContext.Provider>
  );
};