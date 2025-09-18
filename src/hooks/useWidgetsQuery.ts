import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
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

  // Realtime subscription for this tab's widgets
  React.useEffect(() => {
    if (!user?.id || !tabAssignment) return;

    const channel = supabase
      .channel(`widgets:${tabAssignment}:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_widgets',
        filter: `tab_assignment=eq.${tabAssignment}`,
      }, (payload) => {
        queryClient.setQueryData<UserWidget[]>(
          queryKeys.widgets(tabAssignment, user.id),
          (prev = []) => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...prev, payload.new as UserWidget].sort((a, b) => a.display_order - b.display_order);
              case 'UPDATE':
                return prev.map(w => w.id === payload.new.id ? payload.new as UserWidget : w);
              case 'DELETE':
                return prev.filter(w => w.id !== payload.old.id);
              default:
                return prev;
            }
          }
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
    onSuccess: () => {
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

  return {
    widgets: widgetsQuery.data || [],
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