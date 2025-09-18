import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { UserWidget } from './useWidgetManager';

interface TabWidgetsState {
  widgets: UserWidget[];
  isLoading: boolean;
  error: string | null;
}

// Shared hook for managing widget state per tab with optimistic updates
export const useTabWidgets = (tabAssignment: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<TabWidgetsState>({
    widgets: [],
    isLoading: false,
    error: null,
  });

  // Load widgets for the current tab
  const loadWidgets = useCallback(async () => {
    if (!user || !tabAssignment) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_assignment', tabAssignment)
        .eq('is_archived', false)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        widgets: data || [],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading widgets:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load widgets',
        isLoading: false,
      }));
    }
  }, [user, tabAssignment]);

  // Initial load
  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  // Optimistic update helpers
  const updateWidgetLocally = useCallback((widgetId: string, updates: Partial<UserWidget>) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
    }));
  }, []);

  const removeWidgetLocally = useCallback((widgetId: string) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId),
    }));
  }, []);

  const addWidgetLocally = useCallback((widget: UserWidget) => {
    setState(prev => ({
      ...prev,
      widgets: [...prev.widgets, widget].sort((a, b) => a.display_order - b.display_order),
    }));
  }, []);

  // Optimized widget operations with rollback capability
  const toggleCollapsed = useCallback(async (widget: UserWidget) => {
    if (!user) return false;

    const newCollapsedState = !widget.is_collapsed;
    
    // Optimistic update
    updateWidgetLocally(widget.id, { is_collapsed: newCollapsedState });

    try {
      const { error } = await supabase
        .from('user_widgets')
        .update({ is_collapsed: newCollapsedState })
        .eq('id', widget.id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      // Rollback on error
      updateWidgetLocally(widget.id, { is_collapsed: widget.is_collapsed });
      console.error('Error toggling widget collapse:', error);
      toast({
        title: "Error",
        description: "Failed to update widget",
        variant: "destructive",
      });
      return false;
    }
  }, [user, updateWidgetLocally, toast]);

  const toggleVisibility = useCallback(async (widget: UserWidget) => {
    if (!user) return false;

    // For visibility, we'll use is_archived as the toggle mechanism
    const newArchivedState = !widget.is_archived;
    
    // Optimistic update - if archiving, remove from list; if unarchiving, won't show until reload
    if (newArchivedState) {
      removeWidgetLocally(widget.id);
    }

    try {
      const { error } = await supabase
        .from('user_widgets')
        .update({ is_archived: newArchivedState })
        .eq('id', widget.id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      // Rollback on error
      if (newArchivedState) {
        addWidgetLocally(widget);
      }
      console.error('Error toggling widget visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update widget visibility",
        variant: "destructive",
      });
      return false;
    }
  }, [user, removeWidgetLocally, addWidgetLocally, toast]);

  const deleteWidget = useCallback(async (widgetId: string) => {
    if (!user) return false;

    const widgetToDelete = state.widgets.find(w => w.id === widgetId);
    if (!widgetToDelete) return false;

    // Optimistic update
    removeWidgetLocally(widgetId);

    try {
      const { error } = await supabase
        .from('user_widgets')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Widget Removed",
        description: "Successfully removed widget",
      });
      return true;
    } catch (error) {
      // Rollback on error
      addWidgetLocally(widgetToDelete);
      console.error('Error deleting widget:', error);
      toast({
        title: "Error",
        description: "Failed to remove widget",
        variant: "destructive",
      });
      return false;
    }
  }, [user, state.widgets, removeWidgetLocally, addWidgetLocally, toast]);

  const updateWidget = useCallback(async (widgetId: string, updates: Partial<UserWidget>) => {
    if (!user) return false;

    const originalWidget = state.widgets.find(w => w.id === widgetId);
    if (!originalWidget) return false;

    // Optimistic update
    updateWidgetLocally(widgetId, updates);

    try {
      const { error } = await supabase
        .from('user_widgets')
        .update(updates)
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      // Rollback on error
      updateWidgetLocally(widgetId, originalWidget);
      console.error('Error updating widget:', error);
      toast({
        title: "Error",
        description: "Failed to update widget",
        variant: "destructive",
      });
      return false;
    }
  }, [user, state.widgets, updateWidgetLocally, toast]);

  const addWidget = useCallback(async (
    widgetType: string,
    settings: any = {}
  ): Promise<UserWidget | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .insert({
          user_id: user.id,
          widget_type: widgetType,
          tab_assignment: tabAssignment,
          widget_config: settings,
          widget_width: 'half',
          display_order: 0, // Will be auto-assigned by trigger
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      addWidgetLocally(data);

      toast({
        title: "Widget Added",
        description: `Successfully added ${widgetType} widget`,
      });

      return data;
    } catch (error) {
      console.error('Error adding widget:', error);
      toast({
        title: "Error",
        description: "Failed to add widget",
        variant: "destructive",
      });
      return null;
    }
  }, [user, tabAssignment, addWidgetLocally, toast]);

  return {
    widgets: state.widgets,
    isLoading: state.isLoading,
    error: state.error,
    loadWidgets,
    toggleCollapsed,
    toggleVisibility,
    deleteWidget,
    updateWidget,
    addWidget,
    // Direct state manipulation helpers for advanced use cases
    updateWidgetLocally,
    removeWidgetLocally,
    addWidgetLocally,
  };
};