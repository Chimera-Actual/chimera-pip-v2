import { useState } from 'react';
import { useTabsQuery } from './useTabsQuery';
import { TabConfiguration } from '@/types/tabManagement';

/**
 * Tab manager hook that uses React Query for data management
 * This is a wrapper around useTabsQuery to maintain backward compatibility
 * while using the new architecture
 */
export const useTabManager = () => {
  const [activeTab, setActiveTab] = useState<string>('MAIN');
  
  const {
    tabs,
    isLoading,
    error,
    createTab,
    updateTab,
    deleteTab,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTabsQuery();

  // Backward compatibility methods
  const addTab = async (tabData: Omit<TabConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      await createTab(tabData);
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create tab' 
      };
    }
  };

  const updateTabById = async (tabId: string, updates: Partial<TabConfiguration>) => {
    try {
      await updateTab({ tabId, updates });
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update tab' 
      };
    }
  };

  const deleteTabById = async (tabId: string) => {
    try {
      await deleteTab(tabId);
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete tab' 
      };
    }
  };

  const renameTab = async (tabId: string, newName: string) => {
    return updateTabById(tabId, { name: newName });
  };

  const reorderTab = async (tabId: string, newPosition: number) => {
    return updateTabById(tabId, { position: newPosition });
  };

  // Derived state
  const currentTab = tabs.find(tab => tab.name === activeTab || tab.id === activeTab);
  const isTabsLoading = isLoading;
  const tabsError = error?.message || null;

  return {
    // State
    tabs,
    activeTab,
    currentTab,
    isLoading: isTabsLoading,
    isUpdating: isCreating || isUpdating || isDeleting,
    error: tabsError,

    // Actions  
    setActiveTab,
    addTab,
    createTab: addTab,  // Expose createTab for direct access
    updateTab: updateTabById,
    deleteTab: deleteTabById,
    renameTab,
    reorderTab,
    
    // New query-based methods (for components that want to use them directly)
    createTabMutation: createTab,
    updateTabMutation: updateTab,
    deleteTabMutation: deleteTab,
    
    // Additional methods for compatibility
    archiveTab: deleteTabById,
    duplicateTab: async (tabId: string) => {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return { success: false, error: 'Tab not found' };
      
      return addTab({
        name: `${tab.name} Copy`,
        icon: tab.icon,
        description: tab.description,
        color: tab.color,
        position: tabs.length,
        isDefault: false,
        isCustom: true,
      });
    },
  };
};