import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTabsQuery } from '@/hooks/useTabsQuery'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/services/db'

// Mock dependencies
vi.mock('@/contexts/AuthContext')
vi.mock('@/services/db')
vi.mock('@/hooks/use-toast')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: any }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useTabsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch tabs when user is authenticated', async () => {
    const mockUser = { id: 'user-1' }
    const mockTabs = [
      {
        id: 'tab-1',
        name: 'Test Tab',
        icon: 'folder',
        position: 0,
        isDefault: true,
        isCustom: false,
        userId: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any)
    vi.mocked(db.getUserData).mockResolvedValue({
      success: true,
      data: mockTabs,
      error: null,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTabsQuery(), { wrapper })

    await waitFor(() => {
      expect(result.current.tabs).toHaveLength(1)
    })

    expect(db.getUserData).toHaveBeenCalledWith('user_tabs', 'user-1', {
      order: [{ column: 'position', ascending: true }],
    })
    expect(result.current.tabs[0].name).toBe('Test Tab')
  })

  it('should not fetch tabs when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTabsQuery(), { wrapper })

    expect(result.current.tabs).toEqual([])
    expect(db.getUserData).not.toHaveBeenCalled()
  })

  it('should handle create tab mutation with optimistic updates', async () => {
    const mockUser = { id: 'user-1' }
    const newTab = {
      name: 'New Tab',
      icon: 'plus',
      position: 1,
      isDefault: false,
      isCustom: true,
    }

    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any)
    vi.mocked(db.getUserData).mockResolvedValue({
      success: true,
      data: [],
      error: null,
    })
    vi.mocked(db.insertUserData).mockResolvedValue({
      success: true,
      data: { id: 'new-tab-1', ...newTab },
      error: null,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTabsQuery(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    result.current.createTab(newTab)

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false)
    })

    expect(db.insertUserData).toHaveBeenCalledWith('user_tabs', 'user-1', {
      name: newTab.name,
      icon: newTab.icon,
      description: newTab.description,
      color: newTab.color,
      position: newTab.position,
      is_default: newTab.isDefault,
      is_custom: newTab.isCustom,
    })
  })

  it('should handle errors gracefully', async () => {
    const mockUser = { id: 'user-1' }
    
    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any)
    vi.mocked(db.getUserData).mockResolvedValue({
      success: false,
      data: null,
      error: { message: 'DB Error', userMessage: 'Failed to load tabs' },
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTabsQuery(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.tabs).toEqual([])
    expect(result.current.error?.message).toContain('Failed to load tabs')
  })
})