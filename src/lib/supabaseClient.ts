import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Runtime validation with clear error messages (development only)
if (import.meta.env.DEV) {
  if (!supabaseUrl) {
    throw new Error(
      'VITE_SUPABASE_URL is required. Please add it to your .env file.\n' +
      'Example: VITE_SUPABASE_URL="https://your-project.supabase.co"'
    );
  }
  
  if (!supabaseAnonKey) {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY is required. Please add it to your .env file.\n' +
      'Example: VITE_SUPABASE_ANON_KEY="your_supabase_anon_key_here"'
    );
  }
} else {
  // Production fallback check
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});