import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Shield, Grid3X3, Fingerprint, ArrowLeft } from 'lucide-react';

export const AuthMethodSelector: React.FC = () => {
  const authMethods = [
    {
      id: 'email',
      title: 'Email & Password',
      description: 'Traditional vault access credentials',
      icon: Mail,
      path: '/auth/login',
      available: true,
    },
    {
      id: 'pin',
      title: '6-Digit PIN',
      description: 'Secure numeric authentication',
      icon: Shield,
      path: '/auth/pin',
      available: true,
    },
    {
      id: 'pattern',
      title: 'Pattern Lock',
      description: 'Gesture-based security pattern',
      icon: Grid3X3,
      path: '/auth/pattern',
      available: true,
    },
    {
      id: 'biometric',
      title: 'Biometric Access',
      description: 'Fingerprint, Face ID, or Windows Hello',
      icon: Fingerprint,
      path: '/auth/biometric',
      available: window.PublicKeyCredential !== undefined,
    },
  ];

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="pip-terminal pip-glow border-2 border-pip-border-bright/30 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-pip-text-bright pip-text-glow mb-4">
              VAULT ACCESS TERMINAL
            </h1>
            <p className="text-pip-text-secondary font-mono text-sm">
              Select your preferred authentication method
            </p>
          </div>

          {/* Authentication Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {authMethods.map((method) => {
              const IconComponent = method.icon;
              
              return (
                <Link
                  key={method.id}
                  to={method.path}
                  className={`group ${!method.available ? 'pointer-events-none' : ''}`}
                >
                  <Card className={`pip-terminal border-2 p-6 transition-all duration-300 hover:border-primary hover:bg-primary/10 ${
                    method.available 
                      ? 'border-pip-border cursor-pointer' 
                      : 'border-pip-border/50 opacity-50'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full border-2 ${
                        method.available 
                          ? 'border-primary bg-primary/20 text-primary group-hover:bg-primary group-hover:text-black' 
                          : 'border-pip-border bg-pip-bg-secondary text-pip-text-muted'
                      } transition-all duration-300`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-display font-bold text-lg mb-2 ${
                          method.available ? 'text-pip-text-bright' : 'text-pip-text-muted'
                        }`}>
                          {method.title}
                        </h3>
                        <p className={`font-mono text-sm ${
                          method.available ? 'text-pip-text-secondary' : 'text-pip-text-muted'
                        }`}>
                          {method.description}
                        </p>
                        
                        {!method.available && (
                          <p className="text-destructive font-mono text-xs mt-2">
                            Not available on this device
                          </p>
                        )}
                      </div>
                      
                      {method.available && (
                        <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowLeft className="h-5 w-5 rotate-180" />
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="border-t border-pip-border pt-6">
              <p className="text-pip-text-muted font-mono text-sm mb-4">
                New to Vault-Tec?
              </p>
              <Link to="/auth/register">
                <Button 
                  variant="outline" 
                  className="pip-terminal border-pip-border hover:border-primary hover:bg-primary/20 font-mono"
                >
                  Register for Vault Program
                </Button>
              </Link>
            </div>
            
            <div className="pt-4">
              <Link to="/welcome">
                <Button 
                  variant="ghost" 
                  className="text-pip-text-muted hover:text-primary font-mono text-sm"
                >
                  ← Back to Welcome
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};