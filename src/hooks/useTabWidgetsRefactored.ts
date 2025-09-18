import { useWidgetsQuery } from './useWidgetsQuery';
import type { UserWidget } from './useWidgetManager';

/**
 * Refactored tab widgets hook that uses React Query for data management
 * This is a wrapper around useWidgetsQuery to maintain backward compatibility
 * while using the new architecture
 */
export const useTabWidgets = (tabAssignment: string) => {
  const {
    widgets,
    isLoading,
    error,
    addWidget,
    updateWidget,
    deleteWidget,
    reorderWidgets,
    isAdding,
    isUpdating,
    isDeleting,
  } = useWidgetsQuery(tabAssignment);

  // Backward compatibility methods
  const loadWidgets = async () => {
    // With React Query, data is loaded automatically
    // This method is kept for backward compatibility but does nothing
    return Promise.resolve();
  };

  const toggleCollapsed = async (widget: UserWidget) => {
    try {
      await updateWidget({
        widgetId: widget.id,
        updates: { is_collapsed: !widget.is_collapsed }
      });
      return true;
    } catch (error) {
      console.error('Failed to toggle widget collapse:', error);
      return false;
    }
  };

  const toggleVisibility = async (widget: UserWidget) => {
    try {
      await updateWidget({
        widgetId: widget.id,
        updates: { is_archived: !widget.is_archived }
      });
      return true;
    } catch (error) {
      console.error('Failed to toggle widget visibility:', error);
      return false;
    }
  };

  const deleteWidgetById = async (widgetId: string) => {
    try {
      await deleteWidget(widgetId);
      return true;
    } catch (error) {
      console.error('Failed to delete widget:', error);
      return false;
    }
  };

  const updateWidgetById = async (widgetId: string, updates: Partial<UserWidget>) => {
    try {
      await updateWidget({ widgetId, updates });
      return true;
    } catch (error) {
      console.error('Failed to update widget:', error);
      return false;
    }
  };

  const addWidgetToTab = async (widgetType: string, settings?: any) => {
    try {
      await addWidget({ widgetType, settings });
      return { success: true, data: null }; // Note: actual data comes through the query
    } catch (error) {
      console.error('Failed to add widget:', error);
      return { success: false, data: null };
    }
  };

  // Helper methods for local state management (optimistic updates are handled by React Query)
  const updateWidgetLocally = (widgetId: string, updates: Partial<UserWidget>) => {
    // With React Query, optimistic updates are handled automatically
    // This method is kept for backward compatibility but does nothing
    console.warn('updateWidgetLocally is deprecated - optimistic updates are handled automatically');
  };

  const removeWidgetLocally = (widgetId: string) => {
    // With React Query, optimistic updates are handled automatically
    // This method is kept for backward compatibility but does nothing
    console.warn('removeWidgetLocally is deprecated - optimistic updates are handled automatically');
  };

  const addWidgetLocally = (widget: UserWidget) => {
    // With React Query, optimistic updates are handled automatically
    // This method is kept for backward compatibility but does nothing
    console.warn('addWidgetLocally is deprecated - optimistic updates are handled automatically');
  };

  return {
    // State
    widgets,
    isLoading,
    error: error?.message || null,

    // Backward compatibility methods
    loadWidgets,
    toggleCollapsed,
    toggleVisibility,
    deleteWidget: deleteWidgetById,
    updateWidget: updateWidgetById,
    addWidget: addWidgetToTab,

    // Local state helpers (deprecated but kept for compatibility)
    updateWidgetLocally,
    removeWidgetLocally,
    addWidgetLocally,

    // New query-based methods (for components that want to use them directly)
    addWidgetMutation: addWidget,
    updateWidgetMutation: updateWidget,
    deleteWidgetMutation: deleteWidget,
    reorderWidgets,

    // Status flags
    isAdding,
    isUpdating,
    isDeleting,
  };
};