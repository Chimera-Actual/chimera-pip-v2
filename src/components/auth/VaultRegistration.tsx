import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Shield, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export const VaultRegistration: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>();

  const password = watch('password', '');

  // Password strength calculation
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getSecurityLevel = (strength: number): string => {
    if (strength < 25) return 'INSUFFICIENT';
    if (strength < 50) return 'LOW';
    if (strength < 75) return 'MODERATE';
    return 'HIGH';
  };

  const passwordStrength = getPasswordStrength(password);
  const securityLevel = getSecurityLevel(passwordStrength);

  const passwordRequirements = [
    { test: password.length >= 8, label: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
    { test: /[0-9]/.test(password), label: 'Number' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'Special character' },
  ];

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    
    const { error } = await signUp(data.email, data.password);
    
    if (!error) {
      navigate('/auth/verify');
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
              <Shield className="h-12 w-12 text-primary pip-text-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              CHIMERA-TEC REGISTRATION
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              Join the Vault Program for a brighter tomorrow
            </p>
          </div>

          {/* Registration Form */}
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
                placeholder="Create your access code"
                className="pip-terminal border-pip-border focus:border-primary focus:ring-primary font-mono"
                {...register('password', {
                  required: 'Access code is required',
                  minLength: {
                    value: 8,
                    message: 'Access code must be at least 8 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="text-destructive text-sm font-mono">
                  {errors.password.message}
                </p>
              )}
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-pip-text-secondary">
                      SECURITY CLEARANCE LEVEL
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      passwordStrength >= 75 ? 'text-primary' : 
                      passwordStrength >= 50 ? 'text-yellow-500' : 'text-destructive'
                    }`}>
                      {securityLevel}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                  
                  {/* Requirements Checklist */}
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        {req.test ? (
                          <Check className="h-3 w-3 text-primary" />
                        ) : (
                          <X className="h-3 w-3 text-pip-text-muted" />
                        )}
                        <span className={`font-mono ${req.test ? 'text-primary' : 'text-pip-text-muted'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-pip-text-primary font-mono">
                CONFIRM ACCESS CODE
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your access code"
                className="pip-terminal border-pip-border focus:border-primary focus:ring-primary font-mono"
                {...register('confirmPassword', {
                  required: 'Please confirm your access code',
                  validate: (value) =>
                    value === password || 'Access codes do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm font-mono">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || passwordStrength < 50}
              className="w-full pip-button-glow font-mono font-bold text-base py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  PROCESSING APPLICATION...
                </>
              ) : (
                'JOIN VAULT PROGRAM'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-pip-text-muted font-mono text-sm">
              Already have a vault access?{' '}
              <Link
                to="/auth/login"
                className="text-primary hover:text-pip-green-glow underline"
              >
                Access Terminal
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};