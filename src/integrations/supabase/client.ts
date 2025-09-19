// This file re-exports the supabase client from the centralized client setup.
// This maintains backward compatibility while using environment-based credentials.
import type { Database } from './types';

// Re-export the properly configured supabase client
export { supabase } from '@/lib/supabaseClient';

// Export Database type for convenience
export type { Database };