import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BaseWidget, WidgetType, TabAssignment, WidgetConfigDB, GridPositionDB, SizeDB } from '@/types/widgets';
import { WidgetFactory } from '@/lib/widgetFactory';
import { toast } from '@/hooks/use-toast';
import { reportError, reportWarning } from '@/lib/errorReporting';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import { enforceSquareConstraint, validateAndConstrainPosition } from '@/lib/gridValidation';

interface WidgetContextType {
  widgets: BaseWidget[];
  isLoading: boolean;
  error: string | null;
  addWidget: (type: WidgetType, tabAssignment?: TabAssignment) => Promise<BaseWidget | null>;
  removeWidget: (widgetId: string) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<BaseWidget>) => Promise<void>;
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
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const formattedWidgets: BaseWidget[] = (data || []).map(widget => {
        try {
          const widgetConfig = widget.widget_config as unknown as WidgetConfigDB;
          const gridPosition = widget.grid_position as unknown as GridPositionDB;
          const size = widget.size as unknown as SizeDB;
          const widgetType = widget.widget_type as WidgetType;
          
          // Validate widget type exists
          const definition = WidgetFactory.getDefinition(widgetType);
          
          return {
            id: widget.id,
            type: widgetType,
            title: widgetConfig?.title || definition.title,
            collapsed: widget.is_collapsed || false,
            gridPosition: gridPosition || { row: 0, col: 0, width: 2, height: 2 },
            size: size || { width: 300, height: 200 },
            tabAssignment: widget.tab_assignment as TabAssignment,
            settings: widgetConfig?.settings || definition.defaultSettings,
            userId: widget.user_id,
            createdAt: new Date(widget.created_at),
            updatedAt: new Date(widget.updated_at),
          };
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

      setWidgets(formattedWidgets);
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

  // Add a new widget
  const addWidget = useCallback(async (type: WidgetType, tabAssignment?: TabAssignment): Promise<BaseWidget | null> => {
    if (!user?.id) {
      toast({
        title: 'Error', 
        description: 'You must be logged in to add widgets.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const widget = WidgetFactory.createWidget(type, user.id, tabAssignment);

      // Ensure square constraint
      widget.gridPosition = enforceSquareConstraint(widget.gridPosition);

      // Find a suitable position for the new widget
      const tabWidgets = getWidgetsByTab(widget.tabAssignment);
      let position = { 
        col: 0, 
        row: 0, 
        width: widget.gridPosition.width, 
        height: widget.gridPosition.height 
      };
      
      // Simple positioning: find first available spot (36 columns max for desktop)
      let placed = false;
      for (let row = 0; row < 50 && !placed; row++) {
        for (let col = 0; col <= 36 - position.width && !placed; col++) {
          const testPosition = { ...position, col, row };
          const hasCollision = tabWidgets.some(widget => {
            const wp = widget.gridPosition;
            return !(
              testPosition.col >= wp.col + wp.width ||
              testPosition.col + testPosition.width <= wp.col ||
              testPosition.row >= wp.row + wp.height ||
              testPosition.row + testPosition.height <= wp.row
            );
          });
          if (!hasCollision) {
            position = testPosition;
            placed = true;
          }
        }
      }

      widget.gridPosition = validateAndConstrainPosition(position, 36);

      const { data, error: insertError } = await supabase
        .from('user_widgets')
        .insert({
          id: widget.id,
          user_id: user.id,
          widget_type: widget.type,
          tab_assignment: widget.tabAssignment,
          widget_config: {
            title: widget.title,
            settings: widget.settings
          } as any,
          grid_position: widget.gridPosition as any,
          size: widget.size,
          is_collapsed: widget.collapsed,
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
  }, [user?.id]);

  // Remove a widget
  const removeWidget = useCallback(async (widgetId: string): Promise<void> => {
    if (!user?.id) return;

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

  // Update a widget
  const updateWidget = useCallback(async (widgetId: string, updates: Partial<BaseWidget>): Promise<void> => {
    if (!user?.id) return;

    try {
      const currentWidget = widgets.find(w => w.id === widgetId);
      if (!currentWidget) {
        throw new Error('Widget not found');
      }

      // Validate and constrain gridPosition if provided
      if (updates.gridPosition) {
        // Enforce square constraint
        updates.gridPosition = enforceSquareConstraint(updates.gridPosition);
        updates.gridPosition = validateAndConstrainPosition(updates.gridPosition, 36);
        
        const tabWidgets = getWidgetsByTab(currentWidget.tabAssignment)
          .filter(w => w.id !== widgetId);
        
        const hasCollision = tabWidgets.some(widget => {
          const wp = widget.gridPosition;
          const up = updates.gridPosition!;
          return !(
            up.col >= wp.col + wp.width ||
            up.col + up.width <= wp.col ||
            up.row >= wp.row + wp.height ||
            up.row + up.height <= wp.row
          );
        });

        if (hasCollision) {
          throw new Error('Widget position would overlap with existing widget');
        }
      }

      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined || updates.settings !== undefined) {
        dbUpdates.widget_config = {
          title: updates.title || currentWidget.title,
          settings: updates.settings || currentWidget.settings,
        };
      }

      if (updates.gridPosition !== undefined) dbUpdates.grid_position = updates.gridPosition;
      if (updates.size !== undefined) dbUpdates.size = updates.size;
      if (updates.collapsed !== undefined) dbUpdates.is_collapsed = updates.collapsed;
      if (updates.tabAssignment !== undefined) dbUpdates.tab_assignment = updates.tabAssignment;

      const { error: updateError } = await supabase
        .from('user_widgets')
        .update(dbUpdates)
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, ...updates, updatedAt: new Date() }
          : widget
      ));
    } catch (err) {
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
        description: 'Failed to update widget. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user?.id, widgets]);

  // Get widgets by tab
  const getWidgetsByTab = useCallback((tab: TabAssignment): BaseWidget[] => {
    return widgets.filter(widget => widget.tabAssignment === tab);
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
    isLoading,
    error,
    addWidget,
    removeWidget,
    updateWidget,
    getWidgetsByTab,
    refreshWidgets,
  };

  return (
    <WidgetContext.Provider value={contextValue}>
      {children}
    </WidgetContext.Provider>
  );
};