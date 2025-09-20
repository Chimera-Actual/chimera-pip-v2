import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWidgetsQuery } from '@/hooks/useWidgetsQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as supabaseModule from '@/integrations/supabase/client';
import * as authModule from '@/contexts/AuthContext';
import React from 'react';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  
  return TestWrapper;
};

describe('useWidgetsQuery subscription cleanup', () => {
  const mockSupabase = supabaseModule.supabase as any;
  const mockUseAuth = authModule.useAuth as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.channel.mockReturnValue(mockChannel);
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' }
    });
    
    // Mock successful query
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    };
    mockSupabase.from.mockReturnValue(mockQuery);
  });

  it('should setup realtime subscription', () => {
    const wrapper = createWrapper();
    renderHook(() => useWidgetsQuery('MAIN'), { wrapper });

    expect(mockSupabase.channel).toHaveBeenCalledWith('widgets:MAIN:test-user-id');
    expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_widgets',
      filter: 'tab_assignment=eq.MAIN',
    }, expect.any(Function));
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should cleanup subscription on unmount', () => {
    const wrapper = createWrapper();
    const { unmount } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
    
    unmount();
    
    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('should handle multiple mount/unmount cycles without duplicate subscriptions', () => {
    const wrapper = createWrapper();
    
    // Mount and unmount multiple times
    for (let i = 0; i < 5; i++) {
      const { unmount } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
      unmount();
    }
    
    // Should have created 5 channels and cleaned up all 5
    expect(mockSupabase.channel).toHaveBeenCalledTimes(5);
    expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(5);
  });

  it('should create separate channels for different tab assignments', () => {
    const wrapper = createWrapper();
    
    const { unmount: unmount1 } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
    const { unmount: unmount2 } = renderHook(() => useWidgetsQuery('INVENTORY'), { wrapper });
    
    expect(mockSupabase.channel).toHaveBeenCalledWith('widgets:MAIN:test-user-id');
    expect(mockSupabase.channel).toHaveBeenCalledWith('widgets:INVENTORY:test-user-id');
    
    unmount1();
    unmount2();
    
    expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(2);
  });

  it('should not create subscription when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null });
    
    const wrapper = createWrapper();
    renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
    
    expect(mockSupabase.channel).not.toHaveBeenCalled();
  });
});