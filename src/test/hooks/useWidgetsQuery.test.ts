import React from 'react'
import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWidgetsQuery } from '@/hooks/useWidgetsQuery'
import { useAuth } from '@/contexts/AuthContext'
import * as supabaseModule from '@/lib/supabaseClient'

// Mock dependencies
vi.mock('@/contexts/AuthContext')
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  }
}))
vi.mock('@/hooks/use-toast')
vi.mock('@/lib/errors', () => ({
  normalizeError: vi.fn((error) => ({ userMessage: error.message || 'Error' }))
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// Mock channel for realtime subscription
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
}

describe('useWidgetsQuery', () => {
  const mockSupabase = supabaseModule.supabase as any

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.channel.mockReturnValue(mockChannel)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch widgets when user is authenticated', async () => {
    const mockUser = { id: 'user-1' }
    const mockWidgets = [
      {
        id: 'widget-1',
        widget_type: 'test-widget',
        tab_assignment: 'MAIN',
        user_id: 'user-1',
        display_order: 100,
        is_collapsed: false,
        is_archived: false,
        widget_config: {},
        widget_width: 'half',
      },
    ]

    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any)
    
    // Create a proper query chain mock
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockWidgets, error: null })
    }
    
    // Setup the chain: select -> eq -> eq -> eq -> order
    mockQuery.select.mockReturnValue(mockQuery)
    mockQuery.eq.mockReturnValue(mockQuery)
    
    mockSupabase.from.mockReturnValue(mockQuery)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper })

    // Wait for initial load
    await vi.waitFor(() => {
      expect(result.current.widgets).toHaveLength(1)
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('user_widgets')
    expect(mockQuery.select).toHaveBeenCalledWith('*')
    expect(result.current.widgets[0].id).toBe('widget-1')
  })

  it('should not fetch widgets when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper })

    expect(result.current.widgets).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should set up realtime subscription and cleanup on unmount', () => {
    const mockUser = { id: 'user-1' }
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any)

    // Mock the query to return empty data
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }
    
    mockQuery.select.mockReturnValue(mockQuery)
    mockQuery.eq.mockReturnValue(mockQuery)
    mockSupabase.from.mockReturnValue(mockQuery)

    const wrapper = createWrapper()
    const { unmount } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper })

    expect(mockSupabase.channel).toHaveBeenCalledWith('widgets:MAIN:user-1')
    expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_widgets',
      filter: 'tab_assignment=eq.MAIN',
    }, expect.any(Function))
    expect(mockChannel.subscribe).toHaveBeenCalled()

    // Test cleanup
    unmount()
    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel)
  })

  it('should handle add widget mutation', async () => {
    const mockUser = { id: 'user-1' }
    const newWidget = {
      id: 'widget-2',
      widget_type: 'new-widget',
      tab_assignment: 'MAIN',
      user_id: 'user-1',
    }

    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any)
    
    // Mock initial query
    const mockSelectQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }
    
    // Mock insert mutation
    const mockInsertQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: newWidget, error: null })
    }
    
    mockSelectQuery.select.mockReturnValue(mockSelectQuery)
    mockSelectQuery.eq.mockReturnValue(mockSelectQuery)
    mockInsertQuery.insert.mockReturnValue(mockInsertQuery)
    mockInsertQuery.select.mockReturnValue(mockInsertQuery)

    // Return different mocks based on the operation context
    let callCount = 0
    mockSupabase.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? mockSelectQuery : mockInsertQuery
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper })

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Test add widget
    result.current.addWidget({ widgetType: 'new-widget', settings: {} })

    await vi.waitFor(() => {
      expect(result.current.isAdding).toBe(false)
    })

    expect(mockInsertQuery.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      widget_type: 'new-widget',
      tab_assignment: 'MAIN',
      widget_config: {},
      widget_width: 'half',
      display_order: 0,
    })
  })

  it('should handle errors gracefully', async () => {
    const mockUser = { id: 'user-1' }
    
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any)
    
    // Mock query to return error
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })
    }
    
    mockQuery.select.mockReturnValue(mockQuery)
    mockQuery.eq.mockReturnValue(mockQuery)
    mockSupabase.from.mockReturnValue(mockQuery)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper })

    await vi.waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.widgets).toEqual([])
  })
})