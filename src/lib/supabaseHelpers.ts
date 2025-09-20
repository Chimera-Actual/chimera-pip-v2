// Supabase Helper Functions - Consolidated patterns for consistent usage
import { supabase } from '@/lib/supabaseClient';
import { normalizeError, AppError } from '@/lib/errors';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Supabase-specific error normalizer
 */
export const normalizeSupabaseError = (error: PostgrestError | Error | unknown, context?: string): AppError => {
  return normalizeError(error, context || 'Database');
};

/**
 * Get authenticated user with error handling
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw normalizeSupabaseError(error, 'Authentication');
  }
  
  return user;
};

/**
 * Execute query with user authentication check
 */
export const queryWithAuth = async <T>(
  queryFn: (userId: string) => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw normalizeSupabaseError(new Error('User not authenticated'), 'Authentication');
  }
  
  const { data, error } = await queryFn(user.id);
  
  if (error) {
    throw normalizeSupabaseError(error);
  }
  
  if (!data) {
    throw normalizeSupabaseError(new Error('No data returned'), 'Query');
  }
  
  return data;
};

/**
 * Safe single row query (uses maybeSingle to avoid errors on no results)
 */
export const querySingle = async <T>(
  table: string,
  filter: Record<string, any>,
  select = '*'
): Promise<T | null> => {
  const { data, error } = await supabase
    .from(table as any)
    .select(select)
    .match(filter)
    .maybeSingle();
  
  if (error) {
    throw normalizeSupabaseError(error, `Query ${table}`);
  }
  
  return data as T | null;
};

/**
 * User-scoped query helper
 */
export const queryUserData = async <T>(
  table: string,
  additionalFilter: Record<string, any> = {},
  select = '*'
): Promise<T[]> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw normalizeSupabaseError(new Error('User not authenticated'), 'Authentication');
  }
  
  const { data, error } = await supabase
    .from(table as any)
    .select(select)
    .eq('user_id', user.id)
    .match(additionalFilter);
  
  if (error) {
    throw normalizeSupabaseError(error, `Query ${table}`);
  }
  
  return (data || []) as T[];
};

/**
 * User-scoped insert helper
 */
export const insertUserData = async <T>(
  table: string,
  data: Omit<T, 'user_id'>,
  select = '*'
): Promise<T> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw normalizeSupabaseError(new Error('User not authenticated'), 'Authentication');
  }
  
  const { data: result, error } = await supabase
    .from(table as any)
    .insert({ ...data, user_id: user.id })
    .select(select)
    .single();
  
  if (error) {
    throw normalizeSupabaseError(error, `Insert ${table}`);
  }
  
  return result as T;
};

/**
 * User-scoped update helper
 */
export const updateUserData = async <T>(
  table: string,
  id: string,
  data: Partial<T>,
  select = '*'
): Promise<T> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw normalizeSupabaseError(new Error('User not authenticated'), 'Authentication');
  }
  
  const { data: result, error } = await supabase
    .from(table as any)
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select(select)
    .single();
  
  if (error) {
    throw normalizeSupabaseError(error, `Update ${table}`);
  }
  
  return result as T;
};

/**
 * User-scoped delete helper
 */
export const deleteUserData = async (
  table: string,
  id: string
): Promise<void> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw normalizeSupabaseError(new Error('User not authenticated'), 'Authentication');
  }
  
  const { error } = await supabase
    .from(table as any)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) {
    throw normalizeSupabaseError(error, `Delete ${table}`);
  }
};

/**
 * Subscribe to realtime changes with automatic cleanup
 */
export const subscribeToTable = <T>(
  table: string,
  callback: (payload: any) => void,
  filter?: Record<string, string>
) => {
  const filterStr = filter 
    ? Object.entries(filter).map(([key, value]) => `${key}=eq.${value}`).join('&')
    : undefined;
    
  const channel = supabase
    .channel(`realtime-${table}-${Date.now()}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table,
        filter: filterStr 
      }, 
      callback
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};

/**
 * Execute operation with automatic retry on transient errors
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors or client errors
      if (error instanceof Error && 
          (error.message.includes('JWT') || 
           error.message.includes('401') || 
           error.message.includes('403'))) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
};