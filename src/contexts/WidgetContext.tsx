import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BaseWidget, WidgetType, TabAssignment } from '@/types/widgets';
import { WidgetFactory } from '@/lib/widgetFactory';
import { toast } from '@/hooks/use-toast';

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
        const widgetConfig = widget.widget_config as any;
        const position = widget.position as any;
        const size = widget.size as any;
        
        return {
          id: widget.id,
          type: widget.widget_type as WidgetType,
          title: widgetConfig?.title || WidgetFactory.getDefinition(widget.widget_type as WidgetType).title,
          collapsed: widget.is_collapsed || false,
          position: position || { x: 0, y: 0 },
          size: size || { width: 300, height: 200 },
          tabAssignment: widget.tab_assignment as TabAssignment,
          settings: widgetConfig?.settings || {},
          userId: widget.user_id,
          createdAt: new Date(widget.created_at),
          updatedAt: new Date(widget.updated_at),
        };
      });

      setWidgets(formattedWidgets);
    } catch (err) {
      console.error('Failed to load widgets:', err);
      setError('Failed to load widgets');
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
          },
          position: widget.position,
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
        description: `${widget.title} has been added to your dashboard.`,
      });

      return widget;
    } catch (err) {
      console.error('Failed to add widget:', err);
      toast({
        title: 'Error',
        description: 'Failed to add widget. Please try again.',
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
        description: 'The widget has been removed from your dashboard.',
      });
    } catch (err) {
      console.error('Failed to remove widget:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove widget. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user?.id]);

  // Update a widget
  const updateWidget = useCallback(async (widgetId: string, updates: Partial<BaseWidget>): Promise<void> => {
    if (!user?.id) return;

    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined || updates.settings !== undefined) {
        const currentWidget = widgets.find(w => w.id === widgetId);
        if (currentWidget) {
          dbUpdates.widget_config = {
            title: updates.title || currentWidget.title,
            settings: updates.settings || currentWidget.settings,
          };
        }
      }

      if (updates.position !== undefined) dbUpdates.position = updates.position;
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
      console.error('Failed to update widget:', err);
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