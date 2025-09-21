import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSecurity } from '../useSecurity';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock BroadcastChannel
class MockBroadcastChannel {
  private listeners: Array<(event: MessageEvent) => void> = [];
  
  constructor(public name: string) {}
  
  postMessage(data: any) {
    // Simulate async message delivery
    setTimeout(() => {
      this.listeners.forEach(listener => {
        listener({ data } as MessageEvent);
      });
    }, 0);
  }
  
  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === 'message') {
      this.listeners.push(listener);
    }
  }
  
  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === 'message') {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    }
  }
  
  close() {
    this.listeners = [];
  }
}

// @ts-ignore
global.BroadcastChannel = MockBroadcastChannel;

describe('useSecurity multi-tab detection', () => {
  const mockUser = { id: 'user-123' };
  
  beforeEach(() => {
    (useAuth as any).mockReturnValue({ user: mockUser });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with single tab count', () => {
    const { result } = renderHook(() => useSecurity());
    
    expect(result.current.tabCount).toBe(1);
  });

  it('detects multiple tabs via BroadcastChannel', async () => {
    const { result: result1 } = renderHook(() => useSecurity());
    const { result: result2 } = renderHook(() => useSecurity());
    
    // Wait for async message handling
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    // Both hooks should detect multiple tabs
    expect(result1.current.tabCount).toBeGreaterThan(1);
    expect(result2.current.tabCount).toBeGreaterThan(1);
  });

  it('cleans up BroadcastChannel on unmount', () => {
    const { unmount } = renderHook(() => useSecurity());
    
    // Should not throw error on unmount
    expect(() => unmount()).not.toThrow();
  });
});