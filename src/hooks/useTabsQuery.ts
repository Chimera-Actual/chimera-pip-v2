import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/db';
import { queryKeys } from '@/services/keys';
import { TabConfiguration } from '@/types/tabManagement';
import { toast } from '@/hooks/use-toast';

export const useTabsQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch all tabs
  const tabsQuery = useQuery({
    queryKey: queryKeys.tabs(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const result = await db.getUserData<any>('user_tabs', user.id, {
        order: [{ column: 'position', ascending: true }],
      });
      
      if (!result.success || !result.data) {
        throw new Error(result.error?.userMessage || 'Failed to load tabs');
      }
      
      return result.data.map((tab: any) => ({
        id: tab.id,
        name: tab.name,
        icon: tab.icon,
        description: tab.description || '',
        color: tab.color || undefined,
        position: tab.position,
        isDefault: tab.is_default,
        isCustom: tab.is_custom,
        userId: tab.user_id,
        createdAt: new Date(tab.created_at || ''),
        updatedAt: new Date(tab.updated_at || ''),
      }));
    },
    enabled: !!user?.id,
  });

  // Mutation to create a new tab
  const createTabMutation = useMutation({
    mutationFn: async (tabData: Omit<TabConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const result = await db.insertUserData('user_tabs', user.id, {
        name: tabData.name,
        icon: tabData.icon,
        description: tabData.description,
        color: tabData.color,
        position: tabData.position,
        is_default: tabData.isDefault,
        is_custom: tabData.isCustom,
      });
      
      if (!result.success || !result.data) {
        throw new Error(result.error?.userMessage || 'Failed to create tab');
      }
      
      return result.data;
    },
    onSuccess: (newTab) => {
      // Update query cache optimistically
      queryClient.setQueryData(
        queryKeys.tabs(user?.id || ''),
        (old: TabConfiguration[] = []) => [...old, newTab as TabConfiguration].sort((a, b) => a.position - b.position)
      );
      
      toast({
        title: 'Tab Created',
        description: `Successfully created tab "${(newTab as any).name}"`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create tab',
        variant: 'destructive',
      });
    },
  });

  // Mutation to update a tab
  const updateTabMutation = useMutation({
    mutationFn: async ({ tabId, updates }: { tabId: string; updates: Partial<TabConfiguration> }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const result = await db.update('user_tabs', tabId, updates);
      
      if (!result.success || !result.data) {
        throw new Error(result.error?.userMessage || 'Failed to update tab');
      }
      
      return result.data;
    },
    onMutate: async ({ tabId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tabs(user?.id || '') });
      
      // Snapshot previous value
      const previousTabs = queryClient.getQueryData<TabConfiguration[]>(queryKeys.tabs(user?.id || ''));
      
      // Optimistically update
      queryClient.setQueryData<TabConfiguration[]>(
        queryKeys.tabs(user?.id || ''),
        (old = []) => old.map(tab => 
          tab.id === tabId ? { ...tab, ...updates } : tab
        )
      );
      
      return { previousTabs };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTabs) {
        queryClient.setQueryData(
          queryKeys.tabs(user?.id || ''),
          context.previousTabs
        );
      }
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update tab',
        variant: 'destructive',
      });
    },
    onSuccess: (updatedTab) => {
      toast({
        title: 'Tab Updated',
        description: `Successfully updated tab "${(updatedTab as any).name}"`,
      });
    },
  });

  // Mutation to delete a tab
  const deleteTabMutation = useMutation({
    mutationFn: async (tabId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const result = await db.remove('user_tabs', tabId);
      
      if (!result.success) {
        throw new Error(result.error?.userMessage || 'Failed to delete tab');
      }
      
      return tabId;
    },
    onMutate: async (tabId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tabs(user?.id || '') });
      
      const previousTabs = queryClient.getQueryData<TabConfiguration[]>(queryKeys.tabs(user?.id || ''));
      
      queryClient.setQueryData<TabConfiguration[]>(
        queryKeys.tabs(user?.id || ''),
        (old = []) => old.filter(tab => tab.id !== tabId)
      );
      
      return { previousTabs };
    },
    onError: (error, tabId, context) => {
      if (context?.previousTabs) {
        queryClient.setQueryData(
          queryKeys.tabs(user?.id || ''),
          context.previousTabs
        );
      }
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete tab',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Tab Deleted',
        description: 'Successfully deleted tab',
      });
    },
  });

  return {
    tabs: tabsQuery.data || [],
    isLoading: tabsQuery.isLoading,
    error: tabsQuery.error,
    createTab: createTabMutation.mutate,
    updateTab: updateTabMutation.mutate,
    deleteTab: deleteTabMutation.mutate,
    isCreating: createTabMutation.isPending,
    isUpdating: updateTabMutation.isPending,
    isDeleting: deleteTabMutation.isPending,
  };
};