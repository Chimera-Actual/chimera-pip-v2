import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider, useTheme } from '@/contexts/theme'
import { useAuth } from '@/contexts/AuthContext'

// Mock dependencies
vi.mock('@/contexts/AuthContext')
vi.mock('@/lib/supabaseClient')
vi.mock('@/hooks/use-toast')
vi.mock('@/lib/errors', () => ({
  normalizeError: vi.fn(() => ({ userMessage: 'Test error' })),
}))

const createWrapper = (defaultTheme = {}) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(ThemeProvider, { defaultTheme, children }, children)
  }
}

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const storage = new Map<string, string>()
    localStorage.getItem = vi.fn((key: string) => (storage.has(key) ? storage.get(key)! : null))
    localStorage.setItem = vi.fn((key: string, value: string) => {
      storage.set(key, value)
    })
    localStorage.removeItem = vi.fn((key: string) => {
      storage.delete(key)
    })
    localStorage.clear = vi.fn(() => {
      storage.clear()
    })
    localStorage.key = vi.fn((index: number) => Array.from(storage.keys())[index] ?? null)
    Object.defineProperty(localStorage, 'length', { get: () => storage.size })
  })

  it('should provide default theme values', () => {
    vi.mocked(useAuth).mockReturnValue({ 
      user: null, 
      profile: null,
      updateProfile: vi.fn()
    } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.colorScheme).toBe('green')
    expect(result.current.soundEnabled).toBe(true)
    expect(result.current.glowIntensity).toBe(75)
    expect(result.current.scanLineIntensity).toBe(0)
    expect(result.current.backgroundScanLines).toBe(0)
    expect(result.current.scrollingScanLines).toBe('off')
  })

  it('should load theme from user profile when authenticated', () => {
    const mockProfile = {
      theme_config: {
        colorScheme: 'blue' as const,
        soundEnabled: false,
      }
    }

    vi.mocked(useAuth).mockReturnValue({ 
      user: { id: 'user-1' },
      profile: mockProfile,
      updateProfile: vi.fn()
    } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.colorScheme).toBe('blue')
    expect(result.current.soundEnabled).toBe(false)
  })

  it('should load theme from localStorage for guests', async () => {
    const savedTheme = {
      colorScheme: 'amber',
      soundEnabled: false,
      glowIntensity: 80,
    }

    localStorage.setItem('chimera-pip-theme', JSON.stringify(savedTheme))

    vi.mocked(useAuth).mockReturnValue({ 
      user: null, 
      profile: null,
      updateProfile: vi.fn()
    } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    await waitFor(() => expect(result.current.colorScheme).toBe('amber'))
    expect(result.current.soundEnabled).toBe(false)
    expect(result.current.glowIntensity).toBe(80)
  })

  it('should update color scheme', async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({ error: null })
    
    vi.mocked(useAuth).mockReturnValue({ 
      user: { id: 'user-1' },
      profile: { theme_config: { colorScheme: 'green', soundEnabled: true } },
      updateProfile: mockUpdateProfile
    } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    await act(async () => {
      result.current.setColorScheme('red')
    })

    expect(result.current.colorScheme).toBe('red')
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      theme_config: {
        colorScheme: 'red',
        soundEnabled: true,
        glowIntensity: 75,
        scanLineIntensity: 0,
        backgroundScanLines: 0,
        scrollingScanLines: 'off',
        layoutMode: 'tabbed',
      }
    })
  })

  it('should toggle sound', async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({ error: null })
    
    vi.mocked(useAuth).mockReturnValue({ 
      user: { id: 'user-1' },
      profile: { theme_config: { colorScheme: 'green', soundEnabled: true } },
      updateProfile: mockUpdateProfile
    } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    await act(async () => {
      result.current.toggleSound()
    })

    expect(result.current.soundEnabled).toBe(false)
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      theme_config: {
        colorScheme: 'green',
        soundEnabled: false,
        glowIntensity: 75,
        scanLineIntensity: 0,
        backgroundScanLines: 0,
        scrollingScanLines: 'off',
        layoutMode: 'tabbed',
      }
    })
  })

  it('should save to localStorage for guest users', async () => {
    vi.mocked(useAuth).mockReturnValue({ 
      user: null, 
      profile: null,
      updateProfile: vi.fn()
    } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    await act(async () => {
      result.current.setColorScheme('amber')
    })

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('chimera-pip-theme') || '{}')
      expect(saved.colorScheme).toBe('amber')
    })
  })

  it('should handle profile update errors', async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({ 
      error: new Error('Profile update failed') 
    })
    
    vi.mocked(useAuth).mockReturnValue({ 
      user: { id: 'user-1' },
      profile: { theme_config: { colorScheme: 'green', soundEnabled: true } },
      updateProfile: mockUpdateProfile
    } as any)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    await act(async () => {
      result.current.setColorScheme('red')
    })

    // Theme should still update locally even if save fails
    expect(result.current.colorScheme).toBe('red')
    expect(mockUpdateProfile).toHaveBeenCalled()
  })

  it('should apply theme to document', async () => {
    vi.mocked(useAuth).mockReturnValue({ 
      user: null, 
      profile: null,
      updateProfile: vi.fn()
    } as any)

    const wrapper = createWrapper({ colorScheme: 'blue' })
    renderHook(() => useTheme(), { wrapper })

    // Check that theme is applied to document
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('blue'))
  })
})
