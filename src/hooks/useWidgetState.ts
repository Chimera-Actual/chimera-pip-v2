import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from 'lodash';
import { reportError, reportWarning } from '@/lib/errorReporting';
import { INTERACTION_DELAYS, ERROR_MESSAGES } from '@/lib/constants';

interface WidgetStateHookResult<T> {
  settings: T;
  setSettings: (settings: T | ((prev: T) => T)) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isLoading: boolean;
  error: string | null;
}

export function useWidgetState<T extends Record<string, any>>(
  widgetId: string, 
  defaultSettings: T
): WidgetStateHookResult<T> {
  const { user } = useAuth();
  
  // Migration logic for AI Oracle widgets with legacy settings
  const migrateAiOracleSettings = useCallback((settings: any): T => {
    if (typeof settings === 'object' && settings !== null) {
      // Check if this has legacy AI Oracle settings
      if ('personality' in settings || 'autoGreet' in settings || 'responseSpeed' in settings) {
        // Convert legacy settings to new format
        const migratedSettings = {
          selectedAgentId: undefined,
          fallbackAgentId: undefined,
          instanceOverrides: {
            responseLength: settings.responseSpeed === 'fast' ? 'short' : 
                           settings.responseSpeed === 'slow' ? 'long' : 'medium',
            contextAware: true,
            maxTokens: 1000,
            temperature: 0.7
          },
          conversationSettings: {
            saveHistory: true,
            maxHistoryLength: 50,
            autoSummarize: false
          },
          uiPreferences: {
            showAgentSwitcher: true,
            showTokenUsage: settings.showStatus || false,
            compactMode: false
          }
        };
        
        // Migration applied successfully
        // Legacy AI Oracle settings have been migrated
        return migratedSettings as unknown as T;
      }
    }
    
    return { ...defaultSettings, ...settings } as T;
  }, [defaultSettings]);
  
  const [settings, setSettingsState] = useState<T>(() => {
    const saved = localStorage.getItem(`widget-${widgetId}-settings`);
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        return migrateAiOracleSettings(parsedSettings);
      } catch (error) {
      reportError('Failed to parse saved widget settings', { 
        widgetId,
        component: 'useWidgetState' 
      }, error);
      }
    }
    return defaultSettings;
  });

  const [collapsed, setCollapsedState] = useState(() => {
    const saved = localStorage.getItem(`widget-${widgetId}-collapsed`);
    return saved === 'true';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(`widget-${widgetId}-settings`, JSON.stringify(settings));
  }, [widgetId, settings]);

  useEffect(() => {
    localStorage.setItem(`widget-${widgetId}-collapsed`, collapsed.toString());
  }, [widgetId, collapsed]);

  // Debounced sync to Supabase
  const debouncedSync = useMemo(
    () => debounce(async (widgetId: string, updates: Record<string, unknown>) => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { error: updateError } = await supabase
          .from('user_widgets')
          .update({
            widget_config: updates.widget_config as Record<string, any>,
            is_collapsed: updates.is_collapsed as boolean,
            updated_at: new Date().toISOString()
          })
          .eq('id', widgetId)
          .eq('user_id', user.id);

        if (updateError) {
          reportError(
            ERROR_MESSAGES.WIDGET_SYNC_FAILED,
            {
              widgetId,
              userId: user.id,
              component: 'useWidgetState',
              action: 'debouncedSync'
            },
            updateError
          );
          setError(ERROR_MESSAGES.WIDGET_SYNC_FAILED);
        }
      } catch (err) {
        reportError(
          'Widget sync error',
          {
            widgetId,
            userId: user.id,
            component: 'useWidgetState',
            action: 'debouncedSync'
          },
          err
        );
        setError('Failed to sync widget data');
      } finally {
        setIsLoading(false);
      }
    }, INTERACTION_DELAYS.DEBOUNCE_SYNC),
    [user?.id]
  );

  useEffect(() => {
    if (user?.id) {
      debouncedSync(widgetId, { 
        widget_config: { settings, collapsed },
        is_collapsed: collapsed
      });
    }
  }, [widgetId, settings, collapsed, debouncedSync, user?.id]);

  const setSettings = useCallback((newSettings: T | ((prev: T) => T)) => {
    setSettingsState(prev => {
      const result = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      const merged = { ...prev, ...result };
      
      // Apply migration if this is an update to AI Oracle settings
      return migrateAiOracleSettings(merged);
    });
  }, [migrateAiOracleSettings]);

  const setCollapsed = useCallback((newCollapsed: boolean) => {
    setCollapsedState(newCollapsed);
  }, []);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSync.cancel();
    };
  }, [debouncedSync]);

  return {
    settings,
    setSettings,
    collapsed,
    setCollapsed,
    isLoading,
    error,
  };
}