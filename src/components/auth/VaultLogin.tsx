import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Terminal, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { QuickAccessLogin } from './QuickAccessLogin';
import { useToast } from '@/hooks/use-toast';

interface LoginFormData {
  email: string;
  password: string;
}

export const VaultLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [quickAccessLoading, setQuickAccessLoading] = useState(false);
  const [quickAccessError, setQuickAccessError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('chimera:last-login-tab') || 'standard';
  });
  
  const { signIn, quickUnlockWithIdPin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Remember last used tab
  useEffect(() => {
    localStorage.setItem('chimera:last-login-tab', activeTab);
  }, [activeTab]);

  const onStandardSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    const { error } = await signIn(data.email, data.password);
    
    if (!error) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const onQuickAccessSubmit = async (numericId: string, pin: string) => {
    setQuickAccessLoading(true);
    setQuickAccessError(null);
    
    try {
      await quickUnlockWithIdPin(numericId, pin);
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Quick access unlock failed';
      setQuickAccessError(errorMessage);
      
      // Show toast for specific error types
      if (errorMessage.includes('not found') || errorMessage.includes('not enrolled')) {
        toast({
          title: 'Device Not Enrolled',
          description: 'This device is not set up for Quick Access. Please use standard login and set up Quick Access in Settings.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('revoked') || errorMessage.includes('expired')) {
        toast({
          title: 'Session Expired',
          description: 'Your saved session has expired. Please log in normally and re-enroll Quick Access.',
          variant: 'destructive',
        });
      }
    } finally {
      setQuickAccessLoading(false);
    }
  };

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card variant="pip-terminal" className="p-pip-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Terminal className="h-12 w-12 text-primary pip-text-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              VAULT ACCESS TERMINAL
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              Choose your preferred access method
            </p>
          </div>

          {/* Login Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="standard" className="font-mono text-sm">
                <User className="h-4 w-4 mr-2" />
                Standard
              </TabsTrigger>
              <TabsTrigger value="quick" className="font-mono text-sm">
                <Shield className="h-4 w-4 mr-2" />
                Quick Access
              </TabsTrigger>
            </TabsList>

            {/* Standard Login */}
            <TabsContent value="standard" className="space-y-6 mt-0">
              <div className="text-center mb-4">
                <p className="text-pip-text-secondary font-mono text-sm">
                  Enter your security credentials to access the vault
                </p>
              </div>

              <form onSubmit={handleSubmit(onStandardSubmit)} className="space-y-6">
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
            </TabsContent>

            {/* Quick Access Login */}
            <TabsContent value="quick" className="mt-0">
              <QuickAccessLogin
                onSubmit={onQuickAccessSubmit}
                loading={quickAccessLoading}
                error={quickAccessError}
                onSwitchToStandard={() => setActiveTab('standard')}
              />
            </TabsContent>
          </Tabs>

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