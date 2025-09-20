import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePresence } from '@/hooks/usePresence';
import * as supabaseModule from '@/lib/supabaseClient';
import * as authModule from '@/contexts/AuthContext';

// Mock supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
};

describe('usePresence', () => {
  const mockSupabase = supabaseModule.supabase as any;
  const mockUseAuth = authModule.useAuth as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.channel.mockReturnValue(mockChannel);
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' }
    });
    
    // Mock successful presence query
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    };
    mockSupabase.from.mockReturnValue(mockQuery);
  });

  it('should setup realtime subscription on mount', () => {
    renderHook(() => usePresence());

    expect(mockSupabase.channel).toHaveBeenCalledWith('presence-changes');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_presence'
      },
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should cleanup subscription on unmount', () => {
    const { unmount } = renderHook(() => usePresence());
    
    unmount();
    
    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('should not create duplicate subscriptions on multiple mounts', () => {
    const { unmount: unmount1 } = renderHook(() => usePresence());
    const { unmount: unmount2 } = renderHook(() => usePresence());
    const { unmount: unmount3 } = renderHook(() => usePresence());

    // Should have 3 separate channel calls (one per mount)
    expect(mockSupabase.channel).toHaveBeenCalledTimes(3);
    
    unmount1();
    unmount2();
    unmount3();
    
    // Should cleanup all 3 channels
    expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(3);
  });
});