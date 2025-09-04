// Supabase API Service - Centralized database operations
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from './types';
import { errorHandler } from './errorHandler';

class SupabaseApiService {
  // Generic query method with any typing for flexibility
  async query<T = any>(
    table: string,
    options: {
      select?: string;
      eq?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    } = {}
  ): Promise<ApiResponse<T[]>> {
    try {
      let query: any = supabase.from(table as any);

      if (options.select) {
        query = query.select(options.select);
      } else {
        query = query.select('*');
      }

      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data as T[],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { table, options });
    }
  }

  // Insert data  
  async insert<T = any>(table: string, data: any): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table as any)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { table, data });
    }
  }

  // Update data
  async update<T = any>(table: string, id: string, updates: any): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: result as T,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { table, id, updates });
    }
  }

  // Delete data
  async delete(table: string, id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await (supabase as any)
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { table, id });
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;

      return {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { operation: 'getCurrentUser' });
    }
  }

  // Call Supabase Edge Function
  async callFunction<T>(functionName: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) throw error;

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { function: functionName, payload });
    }
  }
}

export const supabaseApi = new SupabaseApiService();