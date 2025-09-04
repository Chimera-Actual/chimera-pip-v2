import { supabase } from '@/integrations/supabase/client';
import { ApiResponse, QueryOptions, MutationOptions } from './types';
import { apiCache } from './cache';
import { createApiError, handleApiError } from './errorHandler';

interface SimpleQueryConfig {
  table: string;
  select?: string;
  filter?: Record<string, any>;
  single?: boolean;
}

class SupabaseService {
  // Simplified query method with caching
  async query<T>(
    config: SimpleQueryConfig,
    options: QueryOptions = {}
  ): Promise<ApiResponse<T>> {
    const cacheKey = options.cache?.key || `${config.table}:${JSON.stringify(config)}`;
    
    // Check cache first
    if (options.cache && apiCache.has(cacheKey)) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        return {
          data: cachedData,
          error: null,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }
    }

    try {
      let query = supabase.from(config.table as any).select(config.select || '*');

      // Apply filters
      if (config.filter) {
        Object.entries(config.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Execute query
      const { data, error } = config.single 
        ? await query.single()
        : await query;

      if (error) {
        throw createApiError(error.message, 'SUPABASE_ERROR', { config });
      }

      // Cache successful response
      if (options.cache && data) {
        apiCache.set(cacheKey, data, options.cache);
      }

      return {
        data: data as T,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Simplified insert method
  async insert<T>(table: string, data: any): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table as any)
        .insert(data)
        .select();

      if (error) {
        throw createApiError(error.message, 'SUPABASE_INSERT_ERROR');
      }

      return {
        data: result as T,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Real-time subscription helper
  subscribeToChanges<T>(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    let subscription = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter 
        }, 
        callback
      )
      .subscribe();

    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      }
    };
  }

  // User-specific query (automatically adds user filter)
  async userQuery<T>(
    config: Omit<SimpleQueryConfig, 'filter'> & { 
      filter?: Record<string, any> 
    },
    options: QueryOptions = {}
  ): Promise<ApiResponse<T>> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null as T,
        error: 'User not authenticated',
        success: false,
        timestamp: new Date().toISOString(),
      };
    }

    const userConfig: SimpleQueryConfig = {
      ...config,
      filter: {
        user_id: user.id,
        ...config.filter,
      },
    };

    return this.query<T>(userConfig, options);
  }

  // User-specific insert (automatically adds user_id)
  async userInsert<T>(table: string, data: any): Promise<ApiResponse<T>> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null as T,
        error: 'User not authenticated',
        success: false,
        timestamp: new Date().toISOString(),
      };
    }

    return this.insert<T>(table, { ...data, user_id: user.id });
  }
}

export const supabaseService = new SupabaseService();