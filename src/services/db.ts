import { supabase } from '@/lib/supabaseClient';
import { normalizeError, AppError } from '@/lib/errors';
import { z } from 'zod';

// Generic database service with type safety
export interface DbResult<T> {
  data: T | null;
  error: AppError | null;
  success: boolean;
}

export interface QueryParams {
  select?: string;
  filters?: Record<string, any>;
  order?: { column: string; ascending?: boolean }[];
  limit?: number;
  single?: boolean;
}

class DatabaseService {
  // Generic get one record
  async getOne<T>(
    table: string, 
    id: string, 
    params: Omit<QueryParams, 'single'> = {}
  ): Promise<DbResult<T>> {
    try {
      let query = supabase
        .from(table as any)
        .select(params.select || '*')
        .eq('id', id);

      // Apply additional filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw error;
      }

      return {
        data: data as T,
        error: null,
        success: true,
      };
    } catch (error) {
      const normalizedError = normalizeError(error, `getOne(${table})`);
      return {
        data: null,
        error: normalizedError,
        success: false,
      };
    }
  }

  // Generic get many records
  async getMany<T>(
    table: string, 
    params: QueryParams = {}
  ): Promise<DbResult<T[]>> {
    try {
      let query = supabase
        .from(table as any)
        .select(params.select || '*');

      // Apply filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (params.order) {
        params.order.forEach(({ column, ascending = true }) => {
          query = query.order(column, { ascending });
        });
      }

      // Apply limit
      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        data: (data as T[]) || [],
        error: null,
        success: true,
      };
    } catch (error) {
      const normalizedError = normalizeError(error, `getMany(${table})`);
      return {
        data: null,
        error: normalizedError,
        success: false,
      };
    }
  }

  // Generic insert
  async insert<T>(
    table: string,
    data: Record<string, any>,
    select = '*'
  ): Promise<DbResult<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table as any)
        .insert(data)
        .select(select)
        .single();

      if (error) {
        throw error;
      }

      return {
        data: result as T,
        error: null,
        success: true,
      };
    } catch (error) {
      const normalizedError = normalizeError(error, `insert(${table})`);
      return {
        data: null,
        error: normalizedError,
        success: false,
      };
    }
  }

  // Generic update
  async update<T>(
    table: string,
    id: string,
    updates: Record<string, any>,
    select = '*'
  ): Promise<DbResult<T>> {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .update(updates)
        .eq('id', id)
        .select(select)
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as T,
        error: null,
        success: true,
      };
    } catch (error) {
      const normalizedError = normalizeError(error, `update(${table})`);
      return {
        data: null,
        error: normalizedError,
        success: false,
      };
    }
  }

  // Generic delete
  async remove(table: string, id: string): Promise<DbResult<void>> {
    try {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      const normalizedError = normalizeError(error, `remove(${table})`);
      return {
        data: null,
        error: normalizedError,
        success: false,
      };
    }
  }

  // User-scoped queries (automatically adds user filter)
  async getUserData<T>(
    table: string,
    userId: string,
    params: QueryParams = {}
  ): Promise<DbResult<T[]>> {
    return this.getMany<T>(table, {
      ...params,
      filters: {
        user_id: userId,
        ...params.filters,
      },
    });
  }

  // User-scoped insert (automatically adds user_id)
  async insertUserData<T>(
    table: string,
    userId: string,
    data: Record<string, any>,
    select = '*'
  ): Promise<DbResult<T>> {
    return this.insert<T>(table, { ...data, user_id: userId }, select);
  }
}

export const db = new DatabaseService();

// Validation schemas for critical tables
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  vault_number: z.number().int().positive(),
  character_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  special_stats: z.object({
    strength: z.number().int().min(1).max(10),
    perception: z.number().int().min(1).max(10),
    endurance: z.number().int().min(1).max(10),
    charisma: z.number().int().min(1).max(10),
    intelligence: z.number().int().min(1).max(10),
    agility: z.number().int().min(1).max(10),
    luck: z.number().int().min(1).max(10),
  }),
  level: z.number().int().positive(),
  experience_points: z.number().int().min(0),
  karma: z.number().int(),
  theme_config: z.object({
    colorScheme: z.enum(['green', 'amber', 'blue', 'red', 'white']),
    soundEnabled: z.boolean(),
  }),
});

export const tabConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  icon: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
  position: z.number().int().min(0),
  isDefault: z.boolean(),
  isCustom: z.boolean(),
  userId: z.string().uuid(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type TabConfig = z.infer<typeof tabConfigSchema>;