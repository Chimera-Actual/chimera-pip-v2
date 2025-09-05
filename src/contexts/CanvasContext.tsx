import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { BaseWidget, WidgetType, TabAssignment } from '@/types/widgets';
import { useWidgets } from './WidgetContext';
import { toast } from '@/hooks/use-toast';

interface CanvasState {
  optimisticWidgets: Record<string, BaseWidget[]>; // Keyed by tab
  pendingOperations: Set<string>;
  lastSyncTime: Record<string, number>;
}

interface CanvasContextType {
  // State
  getCanvasWidgets: (tab: TabAssignment) => BaseWidget[];
  isPending: (widgetId: string) => boolean;
  canvasState: CanvasState; // Expose canvas state for dependency tracking
  
  // Optimistic operations
  optimisticReorder: (tab: TabAssignment, fromIndex: number, toIndex: number) => Promise<boolean>;
  optimisticAdd: (tab: TabAssignment, widgetType: WidgetType) => Promise<BaseWidget | null>;
  optimisticUpdate: (widgetId: string, updates: Partial<BaseWidget>) => Promise<boolean>;
  optimisticDelete: (widgetId: string) => Promise<boolean>;
  optimisticArchive: (widgetId: string) => Promise<boolean>;
  
  // Manual sync
  syncToDatabase: (tab: TabAssignment) => Promise<void>;
  rollbackChanges: (tab: TabAssignment) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

interface CanvasProviderProps {
  children: React.ReactNode;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const { 
    widgets: dbWidgets, 
    getWidgetsByTab, 
    addWidget, 
    updateWidget, 
    removeWidget, 
    archiveWidget,
    updateMultipleWidgets 
  } = useWidgets();
  
  const [canvasState, setCanvasState] = useState<CanvasState>({
    optimisticWidgets: {},
    pendingOperations: new Set(),
    lastSyncTime: {},
  });
  
  const syncTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const rollbackTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Auto-sync to database with debouncing
  const debouncedSync = useCallback((tab: TabAssignment, delay = 1000) => {
    // Clear existing timeout for this tab
    if (syncTimeoutRef.current[tab]) {
      clearTimeout(syncTimeoutRef.current[tab]);
    }

    // Set new timeout
    syncTimeoutRef.current[tab] = setTimeout(async () => {
      await syncToDatabase(tab);
    }, delay);
  }, []);

  // Get widgets for a tab (optimistic if available, otherwise from database)
  const getCanvasWidgets = useCallback((tab: TabAssignment): BaseWidget[] => {
    const optimistic = canvasState.optimisticWidgets[tab];
    if (optimistic) {
      // Sort by order/display_order
      return optimistic.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return getWidgetsByTab(tab);
  }, [canvasState.optimisticWidgets, getWidgetsByTab]);

  // Check if a widget operation is pending
  const isPending = useCallback((widgetId: string): boolean => {
    return canvasState.pendingOperations.has(widgetId);
  }, [canvasState.pendingOperations]);

  // Set optimistic state
  const setOptimisticWidgets = useCallback((tab: TabAssignment, widgets: BaseWidget[]) => {
    setCanvasState(prev => ({
      ...prev,
      optimisticWidgets: {
        ...prev.optimisticWidgets,
        [tab]: widgets,
      },
    }));
  }, []);

  // Add pending operation
  const addPendingOperation = useCallback((widgetId: string) => {
    setCanvasState(prev => ({
      ...prev,
      pendingOperations: new Set([...prev.pendingOperations, widgetId]),
    }));
  }, []);

  // Remove pending operation
  const removePendingOperation = useCallback((widgetId: string) => {
    setCanvasState(prev => {
      const newPending = new Set(prev.pendingOperations);
      newPending.delete(widgetId);
      return {
        ...prev,
        pendingOperations: newPending,
      };
    });
  }, []);

  // Optimistic reorder
  const optimisticReorder = useCallback(async (
    tab: TabAssignment, 
    fromIndex: number, 
    toIndex: number
  ): Promise<boolean> => {
    try {
      const currentWidgets = getCanvasWidgets(tab);
      const newWidgets = [...currentWidgets];
      
      // Move widget
      const [movedWidget] = newWidgets.splice(fromIndex, 1);
      newWidgets.splice(toIndex, 0, movedWidget);
      
      // Update display_order values with gaps
      const updatedWidgets = newWidgets.map((widget, index) => ({
        ...widget,
        order: index * 100,
      }));
      
      // Set optimistic state immediately
      setOptimisticWidgets(tab, updatedWidgets);
      
      // Schedule database sync
      debouncedSync(tab);
      
      return true;
    } catch (error) {
      console.error('Optimistic reorder failed:', error);
      return false;
    }
  }, [getCanvasWidgets, setOptimisticWidgets, debouncedSync]);

  // Optimistic add
  const optimisticAdd = useCallback(async (
    tab: TabAssignment, 
    widgetType: WidgetType
  ): Promise<BaseWidget | null> => {
    try {
      // Add widget to database immediately (this is fast)
      const newWidget = await addWidget(widgetType, tab);
      
      if (!newWidget) {
        throw new Error('Failed to create widget');
      }

      // Update optimistic state
      const currentWidgets = getCanvasWidgets(tab);
      const updatedWidgets = [...currentWidgets, newWidget];
      setOptimisticWidgets(tab, updatedWidgets);
      
      return newWidget;
    } catch (error) {
      console.error('Optimistic add failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to add widget. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [addWidget, getCanvasWidgets, setOptimisticWidgets]);

  // Optimistic update
  const optimisticUpdate = useCallback(async (
    widgetId: string, 
    updates: Partial<BaseWidget>
  ): Promise<boolean> => {
    try {
      addPendingOperation(widgetId);
      
      // Find the widget in optimistic state or database
      let targetTab: TabAssignment | null = null;
      let currentWidgets: BaseWidget[] = [];
      
      // Check each tab for the widget
      const tabs: TabAssignment[] = ['STAT', 'INV', 'DATA', 'MAP', 'RADIO'];
      for (const tab of tabs) {
        const widgets = getCanvasWidgets(tab);
        if (widgets.some(w => w.id === widgetId)) {
          targetTab = tab;
          currentWidgets = widgets;
          break;
        }
      }
      
      if (!targetTab) {
        throw new Error('Widget not found');
      }
      
      // Update optimistic state immediately
      const updatedWidgets = currentWidgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      );
      setOptimisticWidgets(targetTab, updatedWidgets);
      
      // Update database in background
      setTimeout(async () => {
        try {
          await updateWidget(widgetId, updates);
          removePendingOperation(widgetId);
        } catch (error) {
          console.error('Database update failed:', error);
          // Rollback optimistic state
          rollbackChanges(targetTab);
          removePendingOperation(widgetId);
          toast({
            title: 'Update Failed',
            description: 'Widget changes could not be saved. Reverting changes.',
            variant: 'destructive',
          });
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Optimistic update failed:', error);
      removePendingOperation(widgetId);
      return false;
    }
  }, [addPendingOperation, removePendingOperation, getCanvasWidgets, setOptimisticWidgets, updateWidget]);

  // Optimistic delete
  const optimisticDelete = useCallback(async (widgetId: string): Promise<boolean> => {
    try {
      addPendingOperation(widgetId);
      
      // Find and remove from optimistic state
      let targetTab: TabAssignment | null = null;
      const tabs: TabAssignment[] = ['STAT', 'INV', 'DATA', 'MAP', 'RADIO'];
      
      for (const tab of tabs) {
        const widgets = getCanvasWidgets(tab);
        const widgetExists = widgets.some(w => w.id === widgetId);
        
        if (widgetExists) {
          targetTab = tab;
          const updatedWidgets = widgets.filter(w => w.id !== widgetId);
          setOptimisticWidgets(tab, updatedWidgets);
          break;
        }
      }
      
      if (!targetTab) {
        throw new Error('Widget not found');
      }
      
      // Delete from database in background
      setTimeout(async () => {
        try {
          await removeWidget(widgetId);
          removePendingOperation(widgetId);
        } catch (error) {
          console.error('Database delete failed:', error);
          rollbackChanges(targetTab);
          removePendingOperation(widgetId);
          toast({
            title: 'Delete Failed',
            description: 'Widget could not be deleted. Reverting changes.',
            variant: 'destructive',
          });
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Optimistic delete failed:', error);
      removePendingOperation(widgetId);
      return false;
    }
  }, [addPendingOperation, removePendingOperation, getCanvasWidgets, setOptimisticWidgets, removeWidget]);

  // Optimistic archive
  const optimisticArchive = useCallback(async (widgetId: string): Promise<boolean> => {
    try {
      addPendingOperation(widgetId);
      
      // Find and remove from optimistic state (archived widgets don't show in canvas)
      let targetTab: TabAssignment | null = null;
      const tabs: TabAssignment[] = ['STAT', 'INV', 'DATA', 'MAP', 'RADIO'];
      
      for (const tab of tabs) {
        const widgets = getCanvasWidgets(tab);
        const widgetExists = widgets.some(w => w.id === widgetId);
        
        if (widgetExists) {
          targetTab = tab;
          const updatedWidgets = widgets.filter(w => w.id !== widgetId);
          setOptimisticWidgets(tab, updatedWidgets);
          break;
        }
      }
      
      if (!targetTab) {
        throw new Error('Widget not found');
      }
      
      // Archive in database in background
      setTimeout(async () => {
        try {
          await archiveWidget(widgetId);
          removePendingOperation(widgetId);
        } catch (error) {
          console.error('Database archive failed:', error);
          rollbackChanges(targetTab);
          removePendingOperation(widgetId);
          toast({
            title: 'Archive Failed',
            description: 'Widget could not be archived. Reverting changes.',
            variant: 'destructive',
          });
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Optimistic archive failed:', error);
      removePendingOperation(widgetId);
      return false;
    }
  }, [addPendingOperation, removePendingOperation, getCanvasWidgets, setOptimisticWidgets, archiveWidget]);

  // Sync optimistic state to database
  const syncToDatabase = useCallback(async (tab: TabAssignment): Promise<void> => {
    try {
      const optimisticWidgets = canvasState.optimisticWidgets[tab];
      if (!optimisticWidgets) {
        return; // Nothing to sync
      }

      // Build update operations for widgets that have changed order
      const dbWidgets = getWidgetsByTab(tab);
      const updates: Array<{id: string; updates: Partial<BaseWidget>}> = [];

      optimisticWidgets.forEach((optimisticWidget) => {
        const dbWidget = dbWidgets.find(w => w.id === optimisticWidget.id);
        if (dbWidget && dbWidget.order !== optimisticWidget.order) {
          updates.push({
            id: optimisticWidget.id,
            updates: { order: optimisticWidget.order },
          });
        }
      });

      if (updates.length > 0) {
        await updateMultipleWidgets(updates);
      }

      // Clear optimistic state for this tab after successful sync
      setCanvasState(prev => {
        const newOptimistic = { ...prev.optimisticWidgets };
        delete newOptimistic[tab];
        return {
          ...prev,
          optimisticWidgets: newOptimistic,
          lastSyncTime: {
            ...prev.lastSyncTime,
            [tab]: Date.now(),
          },
        };
      });

    } catch (error) {
      console.error('Failed to sync to database:', error);
      toast({
        title: 'Sync Failed',
        description: 'Could not save widget positions. Changes may be lost.',
        variant: 'destructive',
      });
    }
  }, [canvasState.optimisticWidgets, getWidgetsByTab, updateMultipleWidgets]);

  // Rollback changes
  const rollbackChanges = useCallback((tab: TabAssignment) => {
    setCanvasState(prev => {
      const newOptimistic = { ...prev.optimisticWidgets };
      delete newOptimistic[tab];
      return {
        ...prev,
        optimisticWidgets: newOptimistic,
      };
    });
    
    toast({
      title: 'Changes Reverted',
      description: 'Widget positions have been restored to the last saved state.',
    });
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(syncTimeoutRef.current).forEach(clearTimeout);
      Object.values(rollbackTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  const contextValue: CanvasContextType = {
    getCanvasWidgets,
    isPending,
    optimisticReorder,
    optimisticAdd,
    optimisticUpdate,
    optimisticDelete,
    optimisticArchive,
    syncToDatabase,
    rollbackChanges,
    canvasState, // Expose canvas state for dependency tracking
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};