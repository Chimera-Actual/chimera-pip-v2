import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { reportError } from '@/lib/errorReporting';

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

type PagePhase = 'verifying' | 'form' | 'success' | 'error';

// Check if we have recovery parameters in URL (for timeout fallback)
const hasRecoveryParams = () => {
  const url = window.location.href;
  return url.includes('access_token') || url.includes('refresh_token') || url.includes('code');
};

export const ResetPasswordPage: React.FC = () => {
  const [phase, setPhase] = useState<PagePhase>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordFormData>();
  
  const newPassword = watch('newPassword');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Clear any timeout since we got the event
        if (timeoutId) clearTimeout(timeoutId);
        
        // Clear sensitive URL parameters
        window.history.replaceState(null, '', '/auth/reset-password');
        setPhase('form');
      }
    });

    // Fallback timeout in case the event doesn't fire or user visits directly
    timeoutId = setTimeout(() => {
      if (hasRecoveryParams()) {
        // If we have recovery params but no event after timeout, show error
        setError('Password reset link processing failed. Please try requesting a new reset link.');
      } else {
        // User visited directly without recovery link
        setError('No password reset link detected. Please use the link from your email.');
      }
      setPhase('error');
    }, 10000); // 10 second timeout

    // Check if user visited the page directly (no recovery params)
    if (!hasRecoveryParams()) {
      clearTimeout(timeoutId);
      setError('Please use the password reset link from your email to access this page.');
      setPhase('error');
    }

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const onSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        throw error;
      }

      setPhase('success');
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated. You can now sign in with your new password.',
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (err: any) {
      reportError('Password update failed', { error: err });
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const VerifyingCard = () => (
    <Card variant="pip-terminal" className="p-pip-lg">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="h-12 w-12 text-primary pip-text-glow animate-spin" />
        </div>
        <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow mb-2">
          PROCESSING RECOVERY LINK
        </h1>
        <p className="text-pip-text-secondary font-mono text-sm">
          Establishing secure connection with recovery tokens...
        </p>
      </div>
    </Card>
  );

  const ErrorCard = () => (
    <Card variant="pip-terminal" className="p-pip-lg">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive pip-text-glow" />
        </div>
        <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow mb-2">
          LINK INVALID OR EXPIRED
        </h1>
        <p className="text-pip-text-secondary font-mono text-sm mb-6">
          {error || 'The password reset link is invalid or has expired. Please request a new one.'}
        </p>
        <Button
          onClick={() => navigate('/auth/login')}
          className="pip-button-glow font-mono font-bold"
        >
          RETURN TO VAULT LOGIN
        </Button>
      </div>
    </Card>
  );

  const SuccessCard = () => (
    <Card variant="pip-terminal" className="p-pip-lg">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-pip-green pip-text-glow" />
        </div>
        <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow mb-2">
          PASSWORD UPDATED SUCCESSFULLY
        </h1>
        <p className="text-pip-text-secondary font-mono text-sm mb-4">
          Your new access codes have been saved to the vault system.
        </p>
        <p className="text-pip-text-muted font-mono text-xs">
          Redirecting to login terminal in a moment...
        </p>
      </div>
    </Card>
  );

  const PasswordForm = () => (
    <Card variant="pip-terminal" className="p-pip-lg">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-primary pip-text-glow" />
        </div>
        <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
          SET NEW ACCESS CODE
        </h1>
        <p className="text-pip-text-secondary mt-2 font-mono text-sm">
          Enter your new vault access credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-pip-text-primary font-mono">
            NEW ACCESS CODE
          </Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter new access code"
            className="pip-terminal border-pip-border focus:border-primary focus:ring-primary font-mono"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
          />
          {errors.newPassword && (
            <p className="text-destructive text-sm font-mono">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-pip-text-primary font-mono">
            CONFIRM ACCESS CODE
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new access code"
            className="pip-terminal border-pip-border focus:border-primary focus:ring-primary font-mono"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === newPassword || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-sm font-mono">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {newPassword && newPassword.length > 0 && (
          <div className="space-y-2">
            <p className="text-pip-text-secondary font-mono text-xs">
              ACCESS CODE STRENGTH:
            </p>
            <div className="space-y-1 text-xs font-mono">
              <div className={`${newPassword.length >= 8 ? 'text-pip-green' : 'text-pip-text-muted'}`}>
                ✓ Minimum 8 characters
              </div>
              <div className={`${/[A-Z]/.test(newPassword) ? 'text-pip-green' : 'text-pip-text-muted'}`}>
                ✓ Uppercase letter
              </div>
              <div className={`${/[a-z]/.test(newPassword) ? 'text-pip-green' : 'text-pip-text-muted'}`}>
                ✓ Lowercase letter
              </div>
              <div className={`${/[0-9]/.test(newPassword) ? 'text-pip-green' : 'text-pip-text-muted'}`}>
                ✓ Number
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full pip-button-glow font-mono font-bold text-base py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              UPDATING ACCESS CODE...
            </>
          ) : (
            'SET NEW ACCESS CODE'
          )}
        </Button>
      </form>
    </Card>
  );

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {phase === 'verifying' && <VerifyingCard />}
        {phase === 'error' && <ErrorCard />}
        {phase === 'form' && <PasswordForm />}
        {phase === 'success' && <SuccessCard />}
      </div>
    </div>
  );
};