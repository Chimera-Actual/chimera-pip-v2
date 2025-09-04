import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { reportError } from '@/lib/errorReporting';

export interface UserProfile {
  id: string;
  email: string;
  vault_number: number;
  character_name: string | null;
  special_stats: {
    strength: number;
    perception: number;
    endurance: number;
    charisma: number;
    intelligence: number;
    agility: number;
    luck: number;
  };
  level: number;
  experience_points: number;
  karma: number;
  theme_config: {
    colorScheme: 'green' | 'amber' | 'blue' | 'red' | 'white';
    soundEnabled: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: unknown }>;
  refreshProfile: () => Promise<void>;
  // Security features
  attemptCount: number;
  isLocked: boolean;
  lockoutEndTime: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        reportError('Error fetching profile', { component: 'AuthContext' });
        return;
      }

      // Cast JSON fields to proper types
      const profileData: UserProfile = {
        ...data,
        special_stats: data.special_stats as UserProfile['special_stats'],
        theme_config: data.theme_config as UserProfile['theme_config'],
      };

      setProfile(profileData);
    } catch (error) {
      reportError('Profile fetch error', { component: 'AuthContext' });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "ACCESS DENIED",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "VAULT REGISTRATION INITIATED",
          description: "Check your email for verification instructions.",
        });
      }

      return { error };
    } catch (error: unknown) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check if account is locked
    if (isLocked && lockoutEndTime && Date.now() < lockoutEndTime) {
      const remainingTime = Math.ceil((lockoutEndTime - Date.now()) / 1000);
      toast({
        title: "ACCOUNT LOCKED",
        description: `Account locked for ${remainingTime} seconds due to multiple failed attempts.`,
        variant: "destructive",
      });
      return { error: { message: 'Account locked' } as unknown };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Increment attempt count and implement progressive delays
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= 5) {
          const lockoutDuration = Math.min(30 * Math.pow(2, newAttemptCount - 5), 300); // Max 5 minutes
          const lockoutEnd = Date.now() + (lockoutDuration * 1000);
          setIsLocked(true);
          setLockoutEndTime(lockoutEnd);
          
          setTimeout(() => {
            setIsLocked(false);
            setLockoutEndTime(null);
            setAttemptCount(0);
          }, lockoutDuration * 1000);
        }

        toast({
          title: "ACCESS DENIED",
          description: "Invalid credentials. Please verify your access codes.",
          variant: "destructive",
        });
      } else {
        // Reset security counters on successful login
        setAttemptCount(0);
        setIsLocked(false);
        setLockoutEndTime(null);
        
        toast({
          title: "VAULT ACCESS GRANTED",
          description: "Welcome back to the vault!",
        });
      }

      return { error };
    } catch (error: unknown) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast({
        title: "VAULT SEALED",
        description: "You have been logged out safely.",
      });
    } catch (error) {
      reportError('Sign out error', { component: 'AuthContext' });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      return { error: { message: 'Not authenticated' } as unknown };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "UPDATE FAILED",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProfile({ ...profile, ...updates });
        toast({
          title: "PROFILE UPDATED",
          description: "Your vault profile has been updated.",
        });
      }

      return { error };
    } catch (error: unknown) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    attemptCount,
    isLocked,
    lockoutEndTime,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};