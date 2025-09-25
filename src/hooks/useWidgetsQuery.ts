import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { subscribeToTable } from '@/lib/realtime/subscribeToTable';
import { queryKeys } from '@/services/keys';
import { toast } from '@/hooks/use-toast';
import { normalizeError } from '@/lib/errors';
import type { UserWidget } from './useWidgetManager';

// Debounced mutation for reordering operations
let reorderTimeout: NodeJS.Timeout | null = null;

export const useWidgetsQuery = (tabAssignment: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch widgets for a specific tab
  const widgetsQuery = useQuery({
    queryKey: queryKeys.widgets(tabAssignment, user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_assignment', tabAssignment)
        .eq('is_archived', false)
        .order('display_order', { ascending: true });

      if (error) {
        const normalizedError = normalizeError(error, 'useWidgetsQuery');
        throw new Error(normalizedError.userMessage);
      }

      return data || [];
    },
    enabled: !!user?.id && !!tabAssignment,
  });

  // Realtime subscription using new helper to prevent leaks
  React.useEffect(() => {
    if (!user?.id || !tabAssignment) return;

    let debounceTimeout: NodeJS.Timeout;
    
    const unsubscribe = subscribeToTable<UserWidget>(
      'user_widgets',
      `tab_assignment=eq.${tabAssignment}&user_id=eq.${user.id}`,
      {
        onInsert: (newWidget) => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            queryClient.setQueryData<UserWidget[]>(
              queryKeys.widgets(tabAssignment, user.id),
              (prev = []) => [...prev, newWidget].sort((a, b) => a.display_order - b.display_order)
            );
          }, 100);
        },
        onUpdate: (updatedWidget) => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            queryClient.setQueryData<UserWidget[]>(
              queryKeys.widgets(tabAssignment, user.id),
              (prev = []) => prev.map(w => w.id === updatedWidget.id ? updatedWidget : w)
            );
          }, 100);
        },
        onDelete: (deletedWidget) => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            queryClient.setQueryData<UserWidget[]>(
              queryKeys.widgets(tabAssignment, user.id),
              (prev = []) => prev.filter(w => w.id !== deletedWidget.id)
            );
          }, 100);
        }
      }
    );

    return () => {
      clearTimeout(debounceTimeout);
      unsubscribe();
    };
  }, [user?.id, tabAssignment, queryClient]);

  // Mutation to add a widget
  const addWidgetMutation = useMutation({
    mutationFn: async ({ widgetType, settings }: { widgetType: string; settings?: any }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_widgets')
        .insert({
          user_id: user.id,
          widget_type: widgetType,
          tab_assignment: tabAssignment,
          widget_config: settings || {},
          widget_width: 'half',
          display_order: 0, // Auto-assigned by trigger
        })
        .select()
        .single();

      if (error) {
        const normalizedError = normalizeError(error, 'addWidget');
        throw new Error(normalizedError.userMessage);
      }

      return data;
    },
    onSuccess: (data) => {
      // Immediately update cache with the new widget
      queryClient.setQueryData<UserWidget[]>(
        queryKeys.widgets(tabAssignment, user?.id || ''),
        (prev = []) => [...prev, data].sort((a, b) => a.display_order - b.display_order)
      );
      
      toast({
        title: 'Widget Added',
        description: 'Successfully added widget',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add widget',
        variant: 'destructive',
      });
    },
  });

  // Mutation to update a widget
  const updateWidgetMutation = useMutation({
    mutationFn: async ({ widgetId, updates }: { widgetId: string; updates: Partial<UserWidget> }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_widgets')
        .update(updates)
        .eq('id', widgetId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        const normalizedError = normalizeError(error, 'updateWidget');
        throw new Error(normalizedError.userMessage);
      }

      return data;
    },
    onMutate: async ({ widgetId, updates }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.widgets(tabAssignment, user?.id || '') 
      });

      const previousWidgets = queryClient.getQueryData<UserWidget[]>(
        queryKeys.widgets(tabAssignment, user?.id || '')
      );

      queryClient.setQueryData<UserWidget[]>(
        queryKeys.widgets(tabAssignment, user?.id || ''),
        (old = []) => old.map(w => w.id === widgetId ? { ...w, ...updates } : w)
      );

      return { previousWidgets };
    },
    onError: (error, variables, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(
          queryKeys.widgets(tabAssignment, user?.id || ''),
          context.previousWidgets
        );
      }
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update widget',
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete a widget
  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_widgets')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (error) {
        const normalizedError = normalizeError(error, 'deleteWidget');
        throw new Error(normalizedError.userMessage);
      }

      return widgetId;
    },
    onMutate: async (widgetId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.widgets(tabAssignment, user?.id || '') 
      });

      const previousWidgets = queryClient.getQueryData<UserWidget[]>(
        queryKeys.widgets(tabAssignment, user?.id || '')
      );

      queryClient.setQueryData<UserWidget[]>(
        queryKeys.widgets(tabAssignment, user?.id || ''),
        (old = []) => old.filter(w => w.id !== widgetId)
      );

      return { previousWidgets };
    },
    onError: (error, widgetId, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(
          queryKeys.widgets(tabAssignment, user?.id || ''),
          context.previousWidgets
        );
      }
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete widget',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Widget Removed',
        description: 'Successfully removed widget',
      });
    },
  });

  // Debounced reorder function
  const reorderWidgets = (reorderedWidgets: UserWidget[]) => {
    if (reorderTimeout) {
      clearTimeout(reorderTimeout);
    }

    // Optimistic update
    queryClient.setQueryData(
      queryKeys.widgets(tabAssignment, user?.id || ''),
      reorderedWidgets
    );

    reorderTimeout = setTimeout(async () => {
      if (!user?.id) return;

      try {
        // Batch update display orders
        const updates = reorderedWidgets.map((widget, index) => ({
          id: widget.id,
          display_order: (index + 1) * 100, // Give space between items
        }));

        for (const update of updates) {
          await supabase
            .from('user_widgets')
            .update({ display_order: update.display_order })
            .eq('id', update.id)
            .eq('user_id', user.id);
        }
      } catch (error) {
        console.error('Error reordering widgets:', error);
        // Refetch to get correct order
        queryClient.invalidateQueries({
          queryKey: queryKeys.widgets(tabAssignment, user.id),
        });
      }
    }, 300);
  };

  // Active widget management
  const setActiveWidget = React.useCallback((widgetId: string) => {
    const widgets = widgetsQuery.data || [];
    widgets.forEach(widget => {
      if (widget.id === widgetId) {
        updateWidgetMutation.mutate({ widgetId: widget.id, updates: { display_order: 1 } });
      } else {
        updateWidgetMutation.mutate({ widgetId: widget.id, updates: { display_order: 999 } });
      }
    });
  }, [widgetsQuery.data, updateWidgetMutation]);

  const activeWidget = React.useMemo(() => {
    const widgets = widgetsQuery.data || [];
    return widgets.length > 0 ? widgets.reduce((prev, current) => 
      prev.display_order < current.display_order ? prev : current
    ) : null;
  }, [widgetsQuery.data]);

  return {
    widgets: widgetsQuery.data || [],
    activeWidget,
    setActiveWidget,
    isLoading: widgetsQuery.isLoading,
    error: widgetsQuery.error,
    addWidget: addWidgetMutation.mutate,
    updateWidget: updateWidgetMutation.mutate,
    deleteWidget: deleteWidgetMutation.mutate,
    reorderWidgets,
    isAdding: addWidgetMutation.isPending,
    isUpdating: updateWidgetMutation.isPending,
    isDeleting: deleteWidgetMutation.isPending,
  };
};