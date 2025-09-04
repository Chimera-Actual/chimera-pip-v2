import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';

export const EmailVerification: React.FC = () => {
  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card variant="pip-terminal" className="p-pip-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Mail className="h-12 w-12 text-primary pip-text-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              VERIFICATION REQUIRED
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              CHIMERA-TEC Confirmation Protocol Initiated
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-center">
            <div className="pip-terminal p-4 border border-pip-border">
              <CheckCircle className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-pip-text-primary font-mono text-sm leading-relaxed">
                Your vault registration application has been submitted successfully.
                Please check your email for verification instructions.
              </p>
            </div>

            <div className="text-pip-text-muted font-mono text-xs space-y-2">
              <p>• Check your inbox and spam folder</p>
              <p>• Click the verification link in the email</p>
              <p>• Complete character creation after verification</p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full pip-button-glow font-mono">
                <Link to="/auth/login">
                  RETURN TO ACCESS TERMINAL
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                asChild 
                className="w-full pip-terminal border-pip-border hover:border-primary font-mono"
              >
                <Link to="/auth/register">
                  REGISTER DIFFERENT ACCOUNT
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};