import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Terminal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

export const VaultLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    const { error } = await signIn(data.email, data.password);
    
    if (!error) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card variant="pip-terminal" className="p-pip-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Terminal className="h-12 w-12 text-primary pip-text-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              VAULT ACCESS TERMINAL
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              Enter your security credentials to access the vault
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-pip-text-primary font-mono">
                EMAIL ADDRESS
              </Label>
              <Input
                id="email"
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-pip-text-primary font-mono">
                ACCESS CODE
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your access code"
                className="pip-terminal border-pip-border focus:border-primary focus:ring-primary font-mono"
                {...register('password', {
                  required: 'Access code is required',
                  minLength: {
                    value: 6,
                    message: 'Access code must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="text-destructive text-sm font-mono">
                  {errors.password.message}
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
                  ACCESSING VAULT...
                </>
              ) : (
                'ACCESS VAULT'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-pip-text-muted font-mono text-sm">
              New to CHIMERA-TEC?{' '}
              <Link
                to="/auth/register"
                className="text-primary hover:text-pip-green-glow underline"
              >
                Register for Vault Program
              </Link>
            </p>
            <p className="text-pip-text-muted font-mono text-sm">
              <Link
                to="/auth/reset"
                className="text-pip-text-secondary hover:text-primary underline"
              >
                Request New Access Codes
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};