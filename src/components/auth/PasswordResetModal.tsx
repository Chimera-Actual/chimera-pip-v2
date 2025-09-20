import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Key, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { reportError } from '@/lib/errorReporting';

interface ResetFormData {
  email: string;
}

interface PasswordResetModalProps {
  children: React.ReactNode;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetFormData>();

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        reportError('Reset password error', { component: 'PasswordResetModal', error });
        toast({
          title: 'Error',
          description: 'Failed to send reset email. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reset Email Sent',
          description: 'Check your email for password reset instructions. The link will expire in 1 hour.',
        });
        setOpen(false);
        reset();
      }
    } catch (error) {
      reportError('Reset password error', { component: 'PasswordResetModal', error });
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <Card variant="pip-terminal" className="p-pip-lg border-0">
          {/* Header */}
          <div className="text-center mb-6">
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
              <Label htmlFor="reset-email" className="text-pip-text-primary font-mono">
                REGISTERED EMAIL ADDRESS
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="your.email@chimera-tec.com"
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
        </Card>
      </DialogContent>
    </Dialog>
  );
};