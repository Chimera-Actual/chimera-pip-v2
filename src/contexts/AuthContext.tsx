import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { reportError } from '@/lib/errorReporting';

export interface UserProfile {
  id: string;
  email: string;
  vault_number: number;
  character_name: string | null;
  avatar_url: string | null;
  numeric_id: string | null;  // New field for Quick Access
  quick_access_enabled: boolean;  // New field for Quick Access
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
    glowIntensity: number;
    scanLineIntensity: number;
    backgroundScanLines: number;
    scrollingScanLines: 'off' | 'normal' | 'random';
    layoutMode: 'tabbed' | 'drawer';
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
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  // Quick Access methods
  enrollQuickAccess: (numericId: string, pin: string) => Promise<void>;
  quickUnlockWithIdPin: (numericId: string, pin: string) => Promise<void>;
  disableQuickAccess: (numericId?: string) => Promise<void>;
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
  
  // Use toast hook at top level as required by React
  const { toast } = useToast();
  const fetchingProfileRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingProfileRef.current) return;
    fetchingProfileRef.current = true;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        reportError('Error fetching profile', { component: 'AuthContext', userId });
        return;
      }

      // Handle case where user profile doesn't exist yet
      if (!data) {
        if (import.meta.env.DEV) {
          console.warn('User profile not found, user may need to complete registration');
        }
        return;
      }

      // Cast JSON fields to proper types
      const profileData: UserProfile = {
        ...data,
        special_stats: data.special_stats as UserProfile['special_stats'],
        theme_config: data.theme_config as UserProfile['theme_config'],
      };

      // Only update if profile actually changed (shallow compare)
      setProfile(current => {
        if (!current) return profileData;
        const hasChanged = Object.keys(profileData).some(key => 
          profileData[key as keyof UserProfile] !== current[key as keyof UserProfile]
        );
        return hasChanged ? profileData : current;
      });
    } catch (error) {
      reportError('Profile fetch error', { component: 'AuthContext' });
    } finally {
      fetchingProfileRef.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('🔧 AuthProvider: Starting initialization...');
    
    // Check if Supabase is available
    if (!supabase) {
      console.error('❌ AuthProvider: Supabase client not initialized');
      setLoading(false);
      return;
    }
    
    console.log('✅ AuthProvider: Supabase client available, setting up auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 AuthProvider: User found, fetching profile...');
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          console.log('🚫 AuthProvider: No user, clearing profile...');
          setProfile(null);
        }
        
        setLoading(false);
        console.log('✅ AuthProvider: Loading complete');
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
      toast({
        title: "TRANSMISSION FAILURE",
        description: "Connection lost. Please check your network and retry.",
        variant: "destructive",
      });
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
      toast({
        title: "TRANSMISSION FAILURE",
        description: "Connection lost. Please check your network and retry.",
        variant: "destructive",
      });
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
      console.log('🔄 AuthContext: updateProfile failed - no user or profile');
      return { error: { message: 'Not authenticated' } as unknown };
    }

    console.log('🔄 AuthContext: updateProfile called with updates:', updates);

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('❌ AuthContext: Database update failed:', error);
        toast({
          title: "UPDATE FAILED",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('✅ AuthContext: Database update successful, updating local profile');
        setProfile(prev => prev ? { ...prev, ...updates } : prev);
        toast({
          title: "PROFILE UPDATED",
          description: "Your vault profile has been updated.",
        });
      }

      return { error };
    } catch (error: unknown) {
      console.error('❌ AuthContext: updateProfile exception:', error);
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const enrollQuickAccess = async (numericId: string, pin: string): Promise<void> => {
    if (!user || !session) {
      throw new Error('Must be logged in to enroll Quick Access');
    }

    try {
      // Check if numeric ID is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('numeric_id', numericId)
        .single();

      if (existingUser && existingUser.id !== user.id) {
        throw new Error('Numeric ID is already in use');
      }

      // Update user profile with numeric_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          numeric_id: numericId,
          quick_access_enabled: true 
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      // Encrypt and save session
      const { encryptSession } = await import('@/lib/quickaccess/crypto');
      const { createQuickAccessRecord, saveQuickAccess } = await import('@/lib/quickaccess/vault');
      
      const sessionPayload = {
        refresh_token: session.refresh_token,
        access_token: session.access_token,
        provider: 'supabase' as const,
        user_id: user.id,
        expires_at: session.expires_at
      };

      const encrypted = await encryptSession(pin, sessionPayload);
      const record = createQuickAccessRecord(user.id, numericId, encrypted);
      await saveQuickAccess(record);

      // Update local profile
      if (profile) {
        setProfile({
          ...profile,
          numeric_id: numericId,
          quick_access_enabled: true
        });
      }

      toast({
        title: "Quick Access Enrolled",
        description: "This device is now set up for Quick Access login.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enroll Quick Access';
      toast({
        title: "Enrollment Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const quickUnlockWithIdPin = async (numericId: string, pin: string): Promise<void> => {
    try {
      const { loadQuickAccess, recordToEncryptedData } = await import('@/lib/quickaccess/vault');
      const { decryptSession } = await import('@/lib/quickaccess/crypto');
      const { isLockedOut, getRemainingLockoutTime, formatLockoutTime, recordFailedAttempt, resetLockout } = await import('@/lib/quickaccess/lockout');

      // Check for lockout
      if (isLockedOut(numericId)) {
        const remaining = getRemainingLockoutTime(numericId);
        throw new Error(`Account locked. Try again in ${formatLockoutTime(remaining)}`);
      }

      // Load encrypted record
      const record = await loadQuickAccess(numericId);
      if (!record) {
        throw new Error('Device not enrolled for Quick Access');
      }

      try {
        // Decrypt session
        const encrypted = recordToEncryptedData(record);
        const sessionPayload = await decryptSession(pin, encrypted);

        // Try to restore session
        let sessionResult;
        if (sessionPayload.access_token) {
          sessionResult = await supabase.auth.setSession({
            access_token: sessionPayload.access_token,
            refresh_token: sessionPayload.refresh_token
          });
        } else {
          sessionResult = await supabase.auth.refreshSession({
            refresh_token: sessionPayload.refresh_token
          });
        }

        if (sessionResult.error) {
          throw new Error('Session expired - please log in normally and re-enroll');
        }

        // Success - reset lockout and fetch profile
        resetLockout(numericId);
        setSession(sessionResult.data.session);
        setUser(sessionResult.data.user);
        
        if (sessionResult.data.user) {
          await fetchProfile(sessionResult.data.user.id);
        }

        toast({
          title: "Quick Access Granted",
          description: "Welcome back to the vault!",
        });
      } catch (decryptError) {
        // Record failed attempt
        const lockoutState = recordFailedAttempt(numericId);
        
        if (lockoutState.lockedUntil > Date.now()) {
          const remaining = lockoutState.lockedUntil - Date.now();
          const { formatLockoutTime } = await import('@/lib/quickaccess/lockout');
          throw new Error(`Too many failed attempts. Locked for ${formatLockoutTime(remaining)}`);
        } else {
          const attemptsLeft = 5 - lockoutState.attempts;
          throw new Error(`Incorrect PIN. ${attemptsLeft} attempts remaining`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Quick Access unlock failed';
      throw new Error(message);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to change password');
    }

    try {
      // First verify the current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      // Disable Quick Access on all devices since password changed
      if (profile?.quick_access_enabled) {
        try {
          await disableQuickAccess(profile.numeric_id || undefined);
        } catch (error) {
          // Don't fail the password change if Quick Access disable fails
          console.warn('Failed to disable Quick Access after password change:', error);
        }
      }

      toast({
        title: "PASSWORD UPDATED",
        description: "Your access code has been successfully changed. Quick Access has been disabled on all devices.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      throw new Error(message);
    }
  };

  const disableQuickAccess = async (numericId?: string): Promise<void> => {
    try {
      if (user && profile) {
        // Update database
        const { error } = await supabase
          .from('users')
          .update({ quick_access_enabled: false })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        // Remove local storage
        const { deleteQuickAccess } = await import('@/lib/quickaccess/vault');
        if (numericId || profile.numeric_id) {
          await deleteQuickAccess(numericId || profile.numeric_id!);
        }

        // Update local profile
        setProfile({
          ...profile,
          quick_access_enabled: false
        });

        toast({
          title: "Quick Access Disabled",
          description: "Quick Access has been disabled on this device.",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disable Quick Access';
      toast({
        title: "Disable Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
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
    changePassword,
    enrollQuickAccess,
    quickUnlockWithIdPin,
    disableQuickAccess,
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