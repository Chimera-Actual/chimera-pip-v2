import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { changePassword } = useAuth();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PasswordFormData>();
  
  const newPassword = watch('newPassword');
  
  const validatePasswordStrength = (password: string): boolean => {
    return (
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^a-zA-Z0-9]/.test(password)
    );
  };

  const onSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: 'PASSWORD MISMATCH',
        description: 'New passwords do not match. Please verify your entries.',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePasswordStrength(data.newPassword)) {
      toast({
        title: 'WEAK PASSWORD',
        description: 'Password does not meet security requirements.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast({
        title: 'PASSWORD UPDATED',
        description: 'Your access code has been successfully changed.',
      });
      reset();
      onClose();
    } catch (error: any) {
      toast({
        title: 'UPDATE FAILED',
        description: error.message || 'Failed to update password. Please verify your current password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-pip-surface border-pip-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-pip-text-bright font-mono uppercase">
            <Shield className="h-5 w-5 text-pip-accent pip-text-glow" />
            Change Access Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="border-pip-accent/20 bg-pip-accent/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm font-mono">
              Changing your password will require re-enrollment for Quick Access on all devices.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-pip-text-primary font-mono text-sm">
                CURRENT ACCESS CODE
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className="pip-terminal border-pip-border focus:border-pip-accent font-mono pr-10"
                  {...register('currentPassword', {
                    required: 'Current password is required',
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-pip-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-pip-text-muted" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-destructive text-xs font-mono">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-pip-text-primary font-mono text-sm">
                NEW ACCESS CODE
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="pip-terminal border-pip-border focus:border-pip-accent font-mono pr-10"
                  {...register('newPassword', {
                    required: 'New password is required',
                    validate: (value) =>
                      validatePasswordStrength(value) || 'Password does not meet security requirements',
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-pip-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-pip-text-muted" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-destructive text-xs font-mono">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-pip-text-primary font-mono text-sm">
                CONFIRM NEW ACCESS CODE
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="pip-terminal border-pip-border focus:border-pip-accent font-mono pr-10"
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match',
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-pip-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-pip-text-muted" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs font-mono">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {newPassword && newPassword.length > 0 && (
              <div className="space-y-2 p-3 bg-pip-surface rounded border border-pip-border">
                <p className="text-pip-text-secondary font-mono text-xs">
                  SECURITY REQUIREMENTS:
                </p>
                <div className="space-y-1 text-xs font-mono">
                  <div className={`${newPassword.length >= 12 ? 'text-pip-green' : 'text-pip-text-muted'}`}>
                    ✓ Minimum 12 characters
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
                  <div className={`${/[^a-zA-Z0-9]/.test(newPassword) ? 'text-pip-green' : 'text-pip-text-muted'}`}>
                    ✓ Special character
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="font-mono"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="pip-button-glow font-mono font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    UPDATING...
                  </>
                ) : (
                  'CHANGE PASSWORD'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};