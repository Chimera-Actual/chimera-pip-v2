import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  normalizeSupabaseError, 
  getCurrentUser, 
  querySingle, 
  queryUserData,
  insertUserData,
  updateUserData,
  deleteUserData 
} from '../supabaseHelpers';
import * as supabaseModule from '../supabaseClient';

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

const mockSupabase = supabaseModule.supabase as any;

describe('supabaseHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeSupabaseError', () => {
    it('should normalize PostgreSQL errors with codes', () => {
      const pgError = {
        message: 'Unique constraint violation',
        code: '23505',
        details: 'Key already exists',
      };

      const result = normalizeSupabaseError(pgError);
      
      expect(result).toEqual({
        message: 'Unique constraint violation',
        code: '23505',
        details: { details: 'Key already exists' },
        userMessage: 'This item already exists. Please try a different name.',
      });
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');
      
      const result = normalizeSupabaseError(error);
      
      expect(result).toEqual({
        message: 'Generic error',
        userMessage: 'An unexpected error occurred. Please try again.',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = { id: '123', email: 'test@test.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      const result = await getCurrentUser();
      
      expect(result).toBe(mockUser);
    });

    it('should throw normalized error when auth fails', async () => {
      const authError = { message: 'Invalid token' };
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: authError 
      });

      await expect(getCurrentUser()).rejects.toEqual({
        message: 'Invalid token',
        userMessage: 'An unexpected error occurred. Please try again.',
      });
    });
  });

  describe('querySingle', () => {
    it('should return single row when found', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        match: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await querySingle('test_table', { id: '1' });
      
      expect(result).toBe(mockData);
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.match).toHaveBeenCalledWith({ id: '1' });
    });

    it('should return null when no row found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        match: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await querySingle('test_table', { id: 'nonexistent' });
      
      expect(result).toBeNull();
    });
  });

  describe('queryUserData', () => {
    it('should query user-scoped data', async () => {
      const mockUser = { id: 'user123' };
      const mockData = [{ id: '1', name: 'Test', user_id: 'user123' }];
      
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        match: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await queryUserData('test_table', { active: true });
      
      expect(result).toBe(mockData);
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user123');
      expect(mockQuery.match).toHaveBeenCalledWith({ active: true });
    });
  });

  describe('insertUserData', () => {
    it('should insert data with user_id', async () => {
      const mockUser = { id: 'user123' };
      const insertData = { name: 'Test' };
      const mockResult = { id: '1', name: 'Test', user_id: 'user123' };
      
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await insertUserData('test_table', insertData);
      
      expect(result).toBe(mockResult);
      expect(mockQuery.insert).toHaveBeenCalledWith({ 
        ...insertData, 
        user_id: 'user123' 
      });
    });
  });

  describe('updateUserData', () => {
    it('should update user-scoped data', async () => {
      const mockUser = { id: 'user123' };
      const updateData = { name: 'Updated' };
      const mockResult = { id: '1', name: 'Updated', user_id: 'user123' };
      
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await updateUserData('test_table', '1', updateData);
      
      expect(result).toBe(mockResult);
      expect(mockQuery.update).toHaveBeenCalledWith(updateData);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user123');
    });
  });

  describe('deleteUserData', () => {
    it('should delete user-scoped data', async () => {
      const mockUser = { id: 'user123' };
      
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });

      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      await deleteUserData('test_table', '1');
      
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user123');
    });
  });
});