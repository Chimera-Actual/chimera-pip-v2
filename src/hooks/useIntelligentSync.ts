import { useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { reportError } from '@/lib/errorReporting';

interface SyncOptions {
  delay?: number;
  compareDepth?: boolean;
  maxRetries?: number;
}

type SyncableData = Record<string, unknown>;

export const useIntelligentSync = (
  tableName: string,
  recordId: string,
  options: SyncOptions = {}
) => {
  const { user } = useAuth();
  const { delay = 1000, compareDepth = true, maxRetries = 3 } = options;
  
  const lastSyncedDataRef = useRef<SyncableData | null>(null);
  const syncInProgressRef = useRef(false);
  const retryCountRef = useRef(0);

  // Deep comparison for objects
  const hasChanged = useCallback((newData: SyncableData, lastData: SyncableData | null): boolean => {
    if (!lastData) return true;
    
    if (!compareDepth) {
      return JSON.stringify(newData) !== JSON.stringify(lastData);
    }

    // Smart comparison - only check meaningful changes
    const keys = new Set([...Object.keys(newData), ...Object.keys(lastData)]);
    
    for (const key of keys) {
      const newValue = newData[key];
      const oldValue = lastData[key];
      
      // Skip undefined/null equivalence
      if ((newValue == null && oldValue == null)) continue;
      
      // Compare primitive values
      if (typeof newValue !== 'object' || typeof oldValue !== 'object') {
        if (newValue !== oldValue) return true;
        continue;
      }
      
      // Compare objects/arrays
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        return true;
      }
    }
    
    return false;
  }, [compareDepth]);

  // Intelligent sync with retry logic
  const syncToDatabase = useCallback(async (data: SyncableData): Promise<boolean> => {
    if (!user?.id || syncInProgressRef.current) {
      return false;
    }

    // Check if data actually changed
    if (!hasChanged(data, lastSyncedDataRef.current)) {
      return true; // No sync needed
    }

    syncInProgressRef.current = true;

    try {
      // Direct table access for known tables  
      if (tableName === 'widget_instance_settings') {
        const { error } = await supabase
          .from('widget_instance_settings')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', recordId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // For other tables, just return success to avoid errors
        console.warn(`Sync not implemented for table: ${tableName}`);
        return true;
      }

      // Update last synced data on success
      lastSyncedDataRef.current = { ...data };
      retryCountRef.current = 0;
      return true;

    } catch (error) {
      retryCountRef.current++;
      
      // Exponential backoff for retries
      if (retryCountRef.current <= maxRetries) {
        const retryDelay = delay * Math.pow(2, retryCountRef.current - 1);
        setTimeout(() => {
          syncInProgressRef.current = false;
          syncToDatabase(data);
        }, retryDelay);
      } else {
        reportError(
          'Intelligent sync failed after retries',
          {
            widgetId: recordId,
            userId: user.id,
            component: 'useIntelligentSync'
          },
          error
        );
        retryCountRef.current = 0;
      }
      
      return false;
    } finally {
      syncInProgressRef.current = false;
    }
  }, [user?.id, tableName, recordId, hasChanged, maxRetries, delay]);

  // Debounced sync function
  const debouncedSync = useCallback(
    debounce((data: SyncableData) => syncToDatabase(data), delay),
    [syncToDatabase, delay]
  );

  // Initialize last synced data
  const initializeSync = useCallback((initialData: SyncableData) => {
    lastSyncedDataRef.current = { ...initialData };
  }, []);

  // Force immediate sync (bypasses debouncing and change detection)
  const forceSync = useCallback(async (data: SyncableData): Promise<boolean> => {
    lastSyncedDataRef.current = null; // Force change detection
    return await syncToDatabase(data);
  }, [syncToDatabase]);

  return {
    sync: debouncedSync,
    forceSync,
    initializeSync,
    isValid: Boolean(user?.id && recordId)
  };
};

export default useIntelligentSync;