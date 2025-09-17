import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TabConfiguration } from '@/types/tabManagement';
import { toast } from '@/hooks/use-toast';

export const useTabManager = () => {
  const { user } = useAuth();
  const [tabs, setTabs] = useState<TabConfiguration[]>([]);
  const [activeTab, setActiveTab] = useState<string>('MAIN');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tabs from database
  const loadTabs = useCallback(async () => {
    if (!user?.id) {
      setTabs([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_tabs')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const formattedTabs: TabConfiguration[] = (data || []).map(tab => ({
        id: tab.id,
        name: tab.name,
        icon: tab.icon,
        description: tab.description || '',
        color: tab.color || undefined,
        position: tab.position,
        isDefault: tab.is_default,
        isCustom: tab.is_custom,
        userId: tab.user_id,
        createdAt: new Date(tab.created_at),
        updatedAt: new Date(tab.updated_at),
      }));

      setTabs(formattedTabs);

      // Set active tab to MAIN if it exists, otherwise first tab if current active tab doesn't exist
      const mainTab = formattedTabs.find(t => t.name === 'MAIN');
      const currentTab = formattedTabs.find(t => t.name === activeTab);
      
      if (mainTab && !currentTab) {
        setActiveTab('MAIN');
      } else if (formattedTabs.length > 0 && !currentTab) {
        setActiveTab(formattedTabs[0].name);
      }
    } catch (err) {
      console.error('Failed to load tabs:', err);
      setError('Failed to load tabs');
      toast({
        title: 'Error',
        description: 'Failed to load your tabs. Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, activeTab]);

  // Create a new tab
  const createTab = useCallback(async (tabData: Partial<TabConfiguration>): Promise<TabConfiguration | null> => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create tabs.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const newTab: Omit<TabConfiguration, 'id' | 'createdAt' | 'updatedAt'> = {
        name: tabData.name || 'New Tab',
        icon: tabData.icon || 'FolderIcon',
        description: tabData.description || 'Custom tab',
        color: tabData.color,
        position: tabData.position ?? tabs.length,
        isDefault: false,
        isCustom: true,
        userId: user.id,
      };

      const { data, error: insertError } = await supabase
        .from('user_tabs')
        .insert({
          user_id: newTab.userId,
          name: newTab.name,
          icon: newTab.icon,
          description: newTab.description,
          color: newTab.color,
          position: newTab.position,
          is_default: newTab.isDefault,
          is_custom: newTab.isCustom,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const createdTab: TabConfiguration = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        description: data.description || '',
        color: data.color || undefined,
        position: data.position,
        isDefault: data.is_default,
        isCustom: data.is_custom,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setTabs(prev => [...prev, createdTab].sort((a, b) => a.position - b.position));

      toast({
        title: 'Tab Created',
        description: `${createdTab.name} tab has been created successfully.`,
      });

      return createdTab;
    } catch (err) {
      console.error('Failed to create tab:', err);
      toast({
        title: 'Error',
        description: 'Failed to create tab. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user?.id, tabs.length]);

  // Update a tab
  const updateTab = useCallback(async (tabId: string, updates: Partial<TabConfiguration>): Promise<void> => {
    if (!user?.id) return;

    try {
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.position !== undefined) dbUpdates.position = updates.position;

      const { error: updateError } = await supabase
        .from('user_tabs')
        .update(dbUpdates)
        .eq('id', tabId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      setTabs(prev => prev.map(tab =>
        tab.id === tabId
          ? { ...tab, ...updates, updatedAt: new Date() }
          : tab
      ).sort((a, b) => a.position - b.position));

      toast({
        title: 'Tab Updated',
        description: 'Tab has been updated successfully.',
      });
    } catch (err) {
      console.error('Failed to update tab:', err);
      toast({
        title: 'Error',
        description: 'Failed to update tab. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user?.id]);

  // Delete a tab
  const deleteTab = useCallback(async (tabId: string): Promise<void> => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isDefault) {
      toast({
        title: 'Error',
        description: 'Cannot delete default Pip-Boy tabs.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) return;

    try {
      // Move widgets to default tab before deleting
      await supabase
        .from('user_widgets')
        .update({ tab_assignment: 'INV' })
        .eq('tab_assignment', tab?.name)
        .eq('user_id', user.id);

      const { error: deleteError } = await supabase
        .from('user_tabs')
        .delete()
        .eq('id', tabId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setTabs(prev => prev.filter(t => t.id !== tabId));

      if (activeTab === tab?.name) {
        const remainingTabs = tabs.filter(t => t.id !== tabId);
        if (remainingTabs.length > 0) {
          setActiveTab(remainingTabs[0].name);
        }
      }

      toast({
        title: 'Tab Deleted',
        description: `${tab?.name} tab has been deleted. Widgets moved to INV tab.`,
      });
    } catch (err) {
      console.error('Failed to delete tab:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete tab. Please try again.',
        variant: 'destructive',
      });
    }
  }, [tabs, user?.id, activeTab]);

  // Reorder tabs
  const reorderTabs = useCallback(async (newOrder: TabConfiguration[]): Promise<void> => {
    if (!user?.id) return;

    try {
      const reorderedTabs = newOrder.map((tab, index) => ({
        ...tab,
        position: index,
        updatedAt: new Date()
      }));

      // Batch update positions
      const updates = reorderedTabs.map(tab =>
        supabase
          .from('user_tabs')
          .update({ position: tab.position })
          .eq('id', tab.id)
          .eq('user_id', user.id)
      );

      await Promise.all(updates);
      setTabs(reorderedTabs);

      toast({
        title: 'Tabs Reordered',
        description: 'Tab order has been updated successfully.',
      });
    } catch (err) {
      console.error('Failed to reorder tabs:', err);
      toast({
        title: 'Error',
        description: 'Failed to reorder tabs. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user?.id]);

  // Archive a tab
  const archiveTab = useCallback(async (tabId: string): Promise<void> => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isDefault) {
      toast({
        title: 'Error',
        description: 'Cannot archive default Pip-Boy tabs.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) return;

    try {
      // Move widgets to default tab before archiving
      await supabase
        .from('user_widgets')
        .update({ tab_assignment: 'INV' })
        .eq('tab_assignment', tab?.name)
        .eq('user_id', user.id);

      const { error: updateError } = await supabase
        .from('user_tabs')
        .update({ 
          name: `${tab?.name} (Archived)`,
          updated_at: new Date().toISOString()
        })
        .eq('id', tabId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      setTabs(prev => prev.filter(t => t.id !== tabId));

      if (activeTab === tab?.name) {
        const remainingTabs = tabs.filter(t => t.id !== tabId);
        if (remainingTabs.length > 0) {
          setActiveTab(remainingTabs[0].name);
        }
      }

      toast({
        title: 'Tab Archived',
        description: `${tab?.name} tab has been archived. Widgets moved to INV tab.`,
      });
    } catch (err) {
      console.error('Failed to archive tab:', err);
      toast({
        title: 'Error',
        description: 'Failed to archive tab. Please try again.',
        variant: 'destructive',
      });
    }
  }, [tabs, user?.id, activeTab]);

  // Duplicate a tab
  const duplicateTab = useCallback(async (tabId: string): Promise<TabConfiguration | null> => {
    const originalTab = tabs.find(t => t.id === tabId);
    if (!originalTab) return null;

    return createTab({
      name: `${originalTab.name} Copy`,
      icon: originalTab.icon,
      description: originalTab.description,
      color: originalTab.color,
    });
  }, [tabs, createTab]);

  // Load tabs when user changes
  useEffect(() => {
    loadTabs();
  }, [loadTabs]);

  return {
    tabs: tabs.sort((a, b) => a.position - b.position),
    activeTab,
    setActiveTab,
    isLoading,
    error,
    createTab,
    updateTab,
    deleteTab,
    archiveTab,
    reorderTabs,
    duplicateTab,
    refreshTabs: loadTabs,
  };
};