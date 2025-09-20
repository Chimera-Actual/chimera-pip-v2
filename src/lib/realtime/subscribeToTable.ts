import { supabase } from '../supabaseClient';

export function subscribeToTable<T>(
  table: string,
  filter: string,
  handlers: { 
    onInsert?: (payload: T) => void; 
    onUpdate?: (payload: T) => void; 
    onDelete?: (payload: T) => void;
  },
) {
  const channel = supabase.channel(`rt-${crypto.randomUUID()}`);
  
  channel.on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table, 
    filter 
  }, (payload) => {
    if (payload.eventType === 'INSERT') {
      handlers.onInsert?.(payload.new as T);
    } else if (payload.eventType === 'UPDATE') {
      handlers.onUpdate?.(payload.new as T);
    } else if (payload.eventType === 'DELETE') {
      handlers.onDelete?.(payload.old as T);
    }
  }).subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}