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
  const [isUpdating, setIsUpdating] = useState(false);

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

      // Ensure a MAIN tab exists; if not, shift positions and create it
      const hasMain = formattedTabs.some(t => t.name === 'MAIN');

      if (!hasMain) {
        // Shift positions up by 1 to make room for MAIN at 0
        try {
          await Promise.all(
            formattedTabs.map(tab =>
              supabase
                .from('user_tabs')
                .update({ position: tab.position + 1, updated_at: new Date().toISOString() })
                .eq('id', tab.id)
                .eq('user_id', user.id)
            )
          );
        } catch (e) {
          console.warn('Failed to shift tab positions for MAIN insertion', e);
        }

        // Insert MAIN tab at position 0
        const { data: mainData, error: insertMainError } = await supabase
          .from('user_tabs')
          .insert({
            user_id: user.id,
            name: 'MAIN',
            icon: 'TerminalIcon',
            description: 'Main user interface',
            color: null,
            position: 0,
            is_default: true,
            is_custom: false,
          })
          .select()
          .single();

        if (insertMainError) {
          throw insertMainError;
        }

        const mainTab: TabConfiguration = {
          id: mainData.id,
          name: mainData.name,
          icon: mainData.icon,
          description: mainData.description || 'Main user interface',
          color: mainData.color || undefined,
          position: mainData.position,
          isDefault: mainData.is_default,
          isCustom: mainData.is_custom,
          userId: mainData.user_id,
          createdAt: new Date(mainData.created_at),
          updatedAt: new Date(mainData.updated_at),
        };

        const shiftedTabs = formattedTabs.map(t => ({ ...t, position: t.position + 1 }));
        const newTabs = [mainTab, ...shiftedTabs].sort((a, b) => a.position - b.position);
        setTabs(newTabs);
        setActiveTab('MAIN');
      } else {
        setTabs(formattedTabs);

        // Validate and set active tab - but skip during updates to prevent unwanted navigation
        if (!isUpdating) {
          const currentTab = formattedTabs.find(t => t.name === activeTab);
          
          if (!currentTab) {
            // Current active tab doesn't exist, find best alternative
            const mainTab = formattedTabs.find(t => t.name === 'MAIN');
            const firstTab = formattedTabs[0];
            
            if (mainTab) {
              setActiveTab('MAIN');
            } else if (firstTab) {
              setActiveTab(firstTab.name);
            }
            
            console.warn(`Active tab "${activeTab}" not found, switched to ${mainTab ? 'MAIN' : firstTab?.name || 'none'}`);
          }
        }
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
  }, [user?.id, isUpdating]);

  // Create a new tab - Production-ready with comprehensive validation
  const createTab = useCallback(async (tabData: Partial<TabConfiguration>): Promise<TabConfiguration | null> => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create tabs.',
        variant: 'destructive',
      });
      return null;
    }

    // Validate tab data
    const { validateTabCreation } = await import('@/utils/validation/tabValidation');
    const validation = validateTabCreation(
      {
        name: tabData.name || 'New Tab',
        description: tabData.description
      },
      {
        existingTabs: tabs.map(t => ({ name: t.name, isDefault: t.isDefault, id: t.id })),
        isEditing: false
      }
    );

    if (!validation.isValid) {
      toast({
        title: 'Validation Error',
        description: validation.errors[0],
        variant: 'destructive',
      });
      return null;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Tab creation warnings:', validation.warnings);
    }

    try {
      const newTab: Omit<TabConfiguration, 'id' | 'createdAt' | 'updatedAt'> = {
        name: (tabData.name || 'New Tab').trim(),
        icon: tabData.icon || 'FolderIcon',
        description: (tabData.description || 'Custom tab').trim(),
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
      
      // Handle specific error types
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (errorMessage.includes('unique constraint')) {
        toast({
          title: 'Duplicate Tab Name',
          description: 'A tab with this name already exists.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('reserved')) {
        toast({
          title: 'Reserved Name',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Creation Failed',
          description: 'Failed to create tab. Please try again.',
          variant: 'destructive',
        });
      }
      return null;
    }
  }, [user?.id, tabs]);

  // Update a tab - Production-ready with validation and cascading updates
  const updateTab = useCallback(async (tabId: string, updates: Partial<TabConfiguration>): Promise<void> => {
    if (!user?.id) return;

    const currentTab = tabs.find(t => t.id === tabId);
    if (!currentTab) {
      toast({
        title: 'Error',
        description: 'Tab not found.',
        variant: 'destructive',
      });
      return;
    }

    // Validate updates if name is being changed
    if (updates.name !== undefined && updates.name !== currentTab.name) {
      const { validateTabName } = await import('@/utils/validation/tabValidation');
      const validation = validateTabName(updates.name, {
        existingTabs: tabs.map(t => ({ name: t.name, isDefault: t.isDefault, id: t.id })),
        isEditing: true,
        currentTabId: tabId
      });

      if (!validation.isValid) {
        toast({
          title: 'Validation Error',
          description: validation.errors[0],
          variant: 'destructive',
        });
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Tab name warnings:', validation.warnings);
      }
    }

    // Store old name for activeTab sync
    const oldName = currentTab.name;
    const newName = updates.name;

    try {
      // Set updating flag to prevent loadTabs validation from interfering
      setIsUpdating(true);

      // Update activeTab immediately if the renamed tab is currently active
      if (newName && activeTab === oldName) {
        setActiveTab(newName);
      }

      // Prepare database updates
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.position !== undefined) dbUpdates.position = updates.position;

      // Optimistic update for immediate UI feedback
      const optimisticTabs = tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, ...updates, updatedAt: new Date() }
          : tab
      ).sort((a, b) => a.position - b.position);

      setTabs(optimisticTabs);

      // Perform database update - triggers will handle cascading updates
      const { error: updateError } = await supabase
        .from('user_tabs')
        .update(dbUpdates)
        .eq('id', tabId)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Tab Updated',
        description: newName && newName !== oldName 
          ? `Tab renamed from "${oldName}" to "${newName}". All widgets updated automatically.`
          : 'Tab has been updated successfully.',
      });
    } catch (err) {
      console.error('Failed to update tab:', err);
      
      // Rollback optimistic update
      setTabs(tabs);
      if (newName && activeTab === newName) {
        setActiveTab(oldName);
      }

      // Handle specific error types
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (errorMessage.includes('unique constraint')) {
        toast({
          title: 'Duplicate Tab Name',
          description: 'A tab with this name already exists.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('reserved')) {
        toast({
          title: 'Reserved Name',
          description: errorMessage,
          variant: 'destructive',
        });
      } else if (errorMessage.includes('default tabs')) {
        toast({
          title: 'Cannot Rename Default Tab',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Update Failed',
          description: 'Failed to update tab. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      // Clear updating flag
      setIsUpdating(false);
    }
  }, [user?.id, tabs, activeTab]);

  // Delete a tab - Production-ready with validation and proper cleanup
  const deleteTab = useCallback(async (tabId: string): Promise<void> => {
    if (!user?.id) return;

    // Validate deletion
    const { validateTabDeletion } = await import('@/utils/validation/tabValidation');
    const validation = validateTabDeletion(
      tabId,
      tabs.map(t => ({ id: t.id, isDefault: t.isDefault, name: t.name }))
    );

    if (!validation.isValid) {
      toast({
        title: 'Cannot Delete Tab',
        description: validation.errors[0],
        variant: 'destructive',
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Tab deletion warnings:', validation.warnings);
    }

    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    try {
      // Check for widgets before deletion
      const { data: widgetData } = await supabase
        .from('user_widgets')
        .select('id')
        .eq('tab_assignment', tab.name)
        .eq('user_id', user.id);

      const widgetCount = widgetData?.length || 0;

      // Move widgets to default tab before deleting
      if (widgetCount > 0) {
        await supabase
          .from('user_widgets')
          .update({ 
            tab_assignment: 'INV',
            updated_at: new Date().toISOString()
          })
          .eq('tab_assignment', tab.name)
          .eq('user_id', user.id);
      }

      // Delete the tab
      const { error: deleteError } = await supabase
        .from('user_tabs')
        .delete()
        .eq('id', tabId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      const remainingTabs = tabs.filter(t => t.id !== tabId);
      setTabs(remainingTabs);

      // Update active tab if necessary
      if (activeTab === tab.name && remainingTabs.length > 0) {
        const newActiveTab = remainingTabs.find(t => t.name === 'MAIN') || remainingTabs[0];
        setActiveTab(newActiveTab.name);
      }

      toast({
        title: 'Tab Deleted',
        description: widgetCount > 0 
          ? `${tab.name} tab deleted. ${widgetCount} widget${widgetCount === 1 ? '' : 's'} moved to INV tab.`
          : `${tab.name} tab has been deleted.`,
      });
    } catch (err) {
      console.error('Failed to delete tab:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: 'Delete Failed',
        description: errorMessage.includes('foreign key') 
          ? 'Cannot delete tab: widgets are still attached.'
          : 'Failed to delete tab. Please try again.',
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
    tabs: [...tabs].sort((a, b) => a.position - b.position),
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