import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWidgetsQuery } from '@/hooks/useWidgetsQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as authModule from '@/contexts/AuthContext';
import * as realtimeModule from '@/lib/realtime/subscribeToTable';
import React from 'react';

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock realtime helper
vi.mock('@/lib/realtime/subscribeToTable', () => ({
  subscribeToTable: vi.fn(),
}));

// Mock supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

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
  const mockUseAuth = authModule.useAuth as any;
  const mockSubscribeToTable = realtimeModule.subscribeToTable as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' }
    });
    
    // Mock unsubscribe function
    const mockUnsubscribe = vi.fn();
    mockSubscribeToTable.mockReturnValue(mockUnsubscribe);
  });

  it('should setup realtime subscription', () => {
    const wrapper = createWrapper();
    renderHook(() => useWidgetsQuery('MAIN'), { wrapper });

    expect(mockSubscribeToTable).toHaveBeenCalledWith(
      'user_widgets',
      'tab_assignment=eq.MAIN&user_id=eq.test-user-id',
      expect.objectContaining({
        onInsert: expect.any(Function),
        onUpdate: expect.any(Function),
        onDelete: expect.any(Function),
      })
    );
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockSubscribeToTable.mockReturnValue(mockUnsubscribe);
    
    const wrapper = createWrapper();
    const { unmount } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
    
    unmount();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle multiple mount/unmount cycles without duplicate subscriptions', () => {
    const mockUnsubscribe = vi.fn();
    mockSubscribeToTable.mockReturnValue(mockUnsubscribe);
    
    const wrapper = createWrapper();
    
    // Mount and unmount multiple times
    for (let i = 0; i < 5; i++) {
      const { unmount } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
      unmount();
    }
    
    // Should have created 5 subscriptions and cleaned up all 5
    expect(mockSubscribeToTable).toHaveBeenCalledTimes(5);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(5);
  });

  it('should create separate subscriptions for different tab assignments', () => {
    const mockUnsubscribe = vi.fn();
    mockSubscribeToTable.mockReturnValue(mockUnsubscribe);
    
    const wrapper = createWrapper();
    
    const { unmount: unmount1 } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
    const { unmount: unmount2 } = renderHook(() => useWidgetsQuery('INVENTORY'), { wrapper });
    
    expect(mockSubscribeToTable).toHaveBeenNthCalledWith(1,
      'user_widgets',
      'tab_assignment=eq.MAIN&user_id=eq.test-user-id',
      expect.any(Object)
    );
    expect(mockSubscribeToTable).toHaveBeenNthCalledWith(2,
      'user_widgets', 
      'tab_assignment=eq.INVENTORY&user_id=eq.test-user-id',
      expect.any(Object)
    );
    
    unmount1();
    unmount2();
    
    expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
  });

  it('should not create subscription when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null });
    
    const wrapper = createWrapper();
    renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
    
    expect(mockSubscribeToTable).not.toHaveBeenCalled();
  });
});