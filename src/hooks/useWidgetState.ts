import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from 'lodash';

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
  const [settings, setSettingsState] = useState<T>(() => {
    const saved = localStorage.getItem(`widget-${widgetId}-settings`);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
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
    () => debounce(async (widgetId: string, updates: any) => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { error: updateError } = await supabase
          .from('user_widgets')
          .update({
            widget_config: updates.widget_config,
            is_collapsed: updates.is_collapsed,
            updated_at: new Date().toISOString()
          })
          .eq('id', widgetId)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Failed to sync widget state:', updateError);
          setError('Failed to save widget settings');
        }
      } catch (err) {
        console.error('Widget sync error:', err);
        setError('Failed to sync widget data');
      } finally {
        setIsLoading(false);
      }
    }, 1000),
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
      return { ...prev, ...result };
    });
  }, []);

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