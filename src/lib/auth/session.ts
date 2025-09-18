import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export const handleSessionExpired = () => {
  toast({
    title: 'Session Expired',
    description: 'Your session has expired. Please sign in again.',
    variant: 'destructive',
  });
  
  // Force sign out and redirect to login
  supabase.auth.signOut();
  window.location.href = '/auth';
};

export const setupSessionListener = () => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
      handleSessionExpired();
    }
    
    if (event === 'SIGNED_OUT') {
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
    }
  });
};