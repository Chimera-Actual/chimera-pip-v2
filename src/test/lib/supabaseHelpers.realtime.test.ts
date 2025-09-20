import { describe, expect, it, vi, beforeEach } from 'vitest';
import { subscribeToTable } from '@/lib/supabaseHelpers';
import * as supabaseModule from '@/integrations/supabase/client';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
};

describe('supabaseHelpers realtime subscription', () => {
  const mockSupabase = supabaseModule.supabase as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.channel.mockReturnValue(mockChannel);
    
    // Mock crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn(() => 'mock-uuid-123'),
      },
    });
  });

  it('should create subscription with unique channel ID', () => {
    const callback = vi.fn();
    
    subscribeToTable('test_table', callback);
    
    expect(mockSupabase.channel).toHaveBeenCalledWith('realtime-test_table-mock-uuid-123');
    expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'test_table',
      filter: undefined,
    }, callback);
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should create subscription with filter', () => {
    const callback = vi.fn();
    const filter = { user_id: 'user-123', status: 'active' };
    
    subscribeToTable('test_table', callback, filter);
    
    expect(mockChannel.on).toHaveBeenCalledWith('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'test_table',
      filter: 'user_id=eq.user-123&status=eq.active',
    }, callback);
  });

  it('should return subscription object with unsubscribe method', () => {
    const callback = vi.fn();
    
    const subscription = subscribeToTable('test_table', callback);
    
    expect(subscription).toHaveProperty('channel', mockChannel);
    expect(subscription).toHaveProperty('unsubscribe');
    expect(typeof subscription.unsubscribe).toBe('function');
  });

  it('should cleanup subscription when unsubscribe is called', () => {
    const callback = vi.fn();
    
    const subscription = subscribeToTable('test_table', callback);
    subscription.unsubscribe();
    
    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('should create unique channel IDs for multiple subscriptions', () => {
    const callback = vi.fn();
    
    // Mock different UUIDs for each call
    (global.crypto.randomUUID as any)
      .mockReturnValueOnce('uuid-1')
      .mockReturnValueOnce('uuid-2');
    
    subscribeToTable('table1', callback);
    subscribeToTable('table2', callback);
    
    expect(mockSupabase.channel).toHaveBeenCalledWith('realtime-table1-uuid-1');
    expect(mockSupabase.channel).toHaveBeenCalledWith('realtime-table2-uuid-2');
  });
});