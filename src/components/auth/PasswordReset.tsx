import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Key, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ResetFormData {
  email: string;
}

export const PasswordReset: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>();

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="pip-terminal pip-glow border-2 border-pip-border-bright/30 p-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 pip-text-glow" />
              <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow mb-4">
                RESET INSTRUCTIONS SENT
              </h1>
              <p className="text-pip-text-secondary font-mono mb-6">
                Check your email for password reset instructions. The link will expire in 1 hour.
              </p>
              <Button asChild className="w-full pip-button-glow font-mono">
                <Link to="/auth/login">
                  RETURN TO ACCESS TERMINAL
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="pip-terminal pip-glow border-2 border-pip-border-bright/30 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Key className="h-12 w-12 text-primary pip-text-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              ACCESS CODE RESET
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              Request new access codes for your vault account
            </p>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-pip-text-primary font-mono">
                REGISTERED EMAIL ADDRESS
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@vault-tec.com"
                className="pip-terminal border-pip-border focus:border-primary focus:ring-primary font-mono"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-destructive text-sm font-mono">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full pip-button-glow font-mono font-bold text-base py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  PROCESSING REQUEST...
                </>
              ) : (
                'REQUEST NEW ACCESS CODES'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-pip-text-muted font-mono text-sm">
              Remember your access codes?{' '}
              <Link
                to="/auth/login"
                className="text-primary hover:text-pip-green-glow underline"
              >
                Access Terminal
              </Link>
            </p>
            <p className="text-pip-text-muted font-mono text-sm">
              New to Vault-Tec?{' '}
              <Link
                to="/auth/register"
                className="text-primary hover:text-pip-green-glow underline"
              >
                Register for Vault Program
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};