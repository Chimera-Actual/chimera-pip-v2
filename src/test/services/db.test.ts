import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/services/db'
import * as supabaseModule from '@/lib/supabaseClient'

// Mock supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  }
}))

vi.mock('@/lib/errors', () => ({
  normalizeError: vi.fn((error) => ({
    message: error.message,
    userMessage: error.message || 'An error occurred',
  }))
}))

describe('Database Service', () => {
  const mockSupabase = supabaseModule.supabase as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOne', () => {
    it('should fetch a single record by id', async () => {
      const mockData = { id: '1', name: 'Test Item' }
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await db.getOne('test_table', '1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(mockSupabase.from).toHaveBeenCalledWith('test_table')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
    })

    it('should handle errors', async () => {
      const mockError = { message: 'Database error' }
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockRejectedValue(mockError)
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await db.getOne('test_table', '1')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.data).toBe(null)
    })

    it('should apply additional filters', async () => {
      const mockData = { id: '1', name: 'Test Item', user_id: 'user-1' }
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      await db.getOne('test_table', '1', {
        filters: { user_id: 'user-1' }
      })

      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-1')
    })
  })

  describe('getMany', () => {
    it('should fetch multiple records with filters and ordering', async () => {
      const mockData = [
        { id: '1', name: 'Item 1', position: 1 },
        { id: '2', name: 'Item 2', position: 2 }
      ]
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await db.getMany('test_table', {
        filters: { active: true },
        order: [{ column: 'position', ascending: true }],
        limit: 10
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(mockQuery.eq).toHaveBeenCalledWith('active', true)
      expect(mockQuery.order).toHaveBeenCalledWith('position', { ascending: true })
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
    })
  })

  describe('insert', () => {
    it('should insert a new record', async () => {
      const insertData = { name: 'New Item', description: 'Test' }
      const mockResult = { id: '1', ...insertData, created_at: '2024-01-01' }
      
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await db.insert('test_table', insertData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResult)
      expect(mockQuery.insert).toHaveBeenCalledWith(insertData)
    })
  })

  describe('update', () => {
    it('should update a record by id', async () => {
      const updateData = { name: 'Updated Item' }
      const mockResult = { id: '1', name: 'Updated Item' }
      
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await db.update('test_table', '1', updateData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResult)
      expect(mockQuery.update).toHaveBeenCalledWith(updateData)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
    })
  })

  describe('remove', () => {
    it('should delete a record by id', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await db.remove('test_table', '1')

      expect(result.success).toBe(true)
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
    })
  })

  describe('getUserData', () => {
    it('should fetch user-specific data', async () => {
      const mockData = [{ id: '1', user_id: 'user-1', name: 'User Item' }]
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await db.getUserData('test_table', 'user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-1')
    })
  })

  describe('insertUserData', () => {
    it('should insert data with user_id', async () => {
      const insertData = { name: 'User Item' }
      const mockResult = { id: '1', user_id: 'user-1', name: 'User Item' }
      
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await db.insertUserData('test_table', 'user-1', insertData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResult)
      expect(mockQuery.insert).toHaveBeenCalledWith({
        ...insertData,
        user_id: 'user-1'
      })
    })
  })
})