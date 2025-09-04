import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from 'lodash';
import { reportError } from '@/lib/errorReporting';
import { INTERACTION_DELAYS, ERROR_MESSAGES } from '@/lib/constants';

export interface ConsistentWidgetState<T = Record<string, any>> {
  settings: T;
  collapsed: boolean;
  isLoading: boolean;
  error: string | null;
  lastSynced: Date | null;
}

export interface WidgetStateActions<T = Record<string, any>> {
  updateSettings: (settings: Partial<T>) => void;
  resetSettings: () => void;
  toggleCollapsed: () => void;
  clearError: () => void;
  forceSync: () => Promise<void>;
}

export interface UseConsistentWidgetStateResult<T = Record<string, any>> 
  extends ConsistentWidgetState<T>, WidgetStateActions<T> {}

/**
 * Consistent widget state management hook with proper error handling,
 * loading states, and automatic synchronization patterns.
 */
export function useConsistentWidgetState<T extends Record<string, any>>(
  widgetId: string,
  defaultSettings: T,
  options: {
    syncToDatabase?: boolean;
    debounceMs?: number;
    retryAttempts?: number;
  } = {}
): UseConsistentWidgetStateResult<T> {
  const { user } = useAuth();
  const {
    syncToDatabase: enableSync = true,
    debounceMs = INTERACTION_DELAYS.DEBOUNCE_SYNC,
    retryAttempts = 3
  } = options;

  // Initialize state from localStorage with fallbacks
  const [state, setState] = useState<ConsistentWidgetState<T>>(() => {
    try {
      const savedSettings = localStorage.getItem(`widget-${widgetId}-settings`);
      const savedCollapsed = localStorage.getItem(`widget-${widgetId}-collapsed`);
      const savedLastSynced = localStorage.getItem(`widget-${widgetId}-lastSynced`);
      
      return {
        settings: savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings,
        collapsed: savedCollapsed === 'true',
        isLoading: false,
        error: null,
        lastSynced: savedLastSynced ? new Date(savedLastSynced) : null
      };
    } catch (error) {
      reportError('Widget state initialization failed', {
        widgetId,
        component: 'useConsistentWidgetState',
        action: 'initialization'
      }, error);
      
      return {
        settings: defaultSettings,
        collapsed: false,
        isLoading: false,
        error: 'Failed to load saved state',
        lastSynced: null
      };
    }
  });

  // Persistent storage effect
  useEffect(() => {
    try {
      localStorage.setItem(`widget-${widgetId}-settings`, JSON.stringify(state.settings));
      localStorage.setItem(`widget-${widgetId}-collapsed`, state.collapsed.toString());
      if (state.lastSynced) {
        localStorage.setItem(`widget-${widgetId}-lastSynced`, state.lastSynced.toISOString());
      }
    } catch (error) {
      reportError('Widget localStorage save failed', {
        widgetId,
        component: 'useConsistentWidgetState',
        action: 'localStorage_save'
      }, error);
    }
  }, [widgetId, state.settings, state.collapsed, state.lastSynced]);

  // Database synchronization with retry logic
  const debouncedSync = useMemo(
    () => debounce(async (widgetId: string, currentState: ConsistentWidgetState<T>) => {
      if (!user?.id || !enableSync) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      let lastError: unknown = null;
      
      for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
          const { error: updateError } = await supabase
            .from('user_widgets')
            .update({
              widget_config: { 
                settings: currentState.settings,
                collapsed: currentState.collapsed 
              },
              is_collapsed: currentState.collapsed,
              updated_at: new Date().toISOString()
            })
            .eq('id', widgetId)
            .eq('user_id', user.id);

          if (updateError) throw updateError;

          // Success - update last synced time
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: null,
            lastSynced: new Date()
          }));
          return;

        } catch (error) {
          lastError = error;
          if (attempt < retryAttempts) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      // All retry attempts failed
      reportError(
        ERROR_MESSAGES.WIDGET_SYNC_FAILED,
        {
          widgetId,
          userId: user.id,
          component: 'useConsistentWidgetState',
          action: 'syncToDatabase',
          metadata: { attempts: retryAttempts }
        },
        lastError
      );

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: `Sync failed after ${retryAttempts} attempts`
      }));

    }, debounceMs),
    [user?.id, enableSync, retryAttempts, debounceMs]
  );

  // Trigger sync when state changes
  useEffect(() => {
    if (user?.id && enableSync) {
      debouncedSync(widgetId, state);
    }
  }, [widgetId, state.settings, state.collapsed, debouncedSync, user?.id, enableSync]);

  // Actions with consistent error handling
  const updateSettings = useCallback((newSettings: Partial<T>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
      error: null // Clear errors on successful update
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setState(prev => ({
      ...prev,
      settings: defaultSettings,
      error: null
    }));
  }, [defaultSettings]);

  const toggleCollapsed = useCallback(() => {
    setState(prev => ({
      ...prev,
      collapsed: !prev.collapsed,
      error: null
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const forceSync = useCallback(async () => {
    if (!user?.id) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await debouncedSync.flush(); // Execute immediately
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Force sync failed' 
      }));
    }
  }, [user?.id, debouncedSync]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSync.cancel();
    };
  }, [debouncedSync]);

  return {
    // State
    settings: state.settings,
    collapsed: state.collapsed,
    isLoading: state.isLoading,
    error: state.error,
    lastSynced: state.lastSynced,
    
    // Actions
    updateSettings,
    resetSettings,
    toggleCollapsed,
    clearError,
    forceSync
  };
}