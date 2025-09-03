import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Users, Database } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Zap className="h-16 w-16 text-primary pip-text-glow mr-4" />
            <div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-pip-text-bright pip-text-glow">
                CHIMERA-PIP 4000 mk2
              </h1>
              <p className="text-xl text-pip-text-secondary font-mono mt-2">
                CHIMERA-TEC PERSONAL INFORMATION PROCESSOR
              </p>
            </div>
          </div>
          
          <p className="text-lg text-pip-text-primary font-mono max-w-2xl mx-auto mb-8">
            The ultimate personal dashboard combining authentic Fallout 4 Pip-Boy aesthetics 
            with cutting-edge productivity tools. Your gateway to the future of personal computing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="pip-button-glow font-mono text-lg px-8 py-4">
              <Link to="/auth/register">
                JOIN VAULT PROGRAM
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="pip-terminal border-pip-border hover:border-primary font-mono text-lg px-8 py-4"
            >
              <Link to="/auth">
                ACCESS TERMINAL
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="pip-widget p-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4 pip-text-glow" />
            <h3 className="text-xl font-display font-bold text-pip-text-bright mb-3">
              VAULT-GRADE SECURITY
            </h3>
            <p className="text-pip-text-secondary font-mono text-sm">
              Enterprise-level security with Row Level Security policies, 
              encrypted data storage, and comprehensive access controls.
            </p>
          </Card>

          <Card className="pip-widget p-6 text-center">
            <Database className="h-12 w-12 text-primary mx-auto mb-4 pip-text-glow" />
            <h3 className="text-xl font-display font-bold text-pip-text-bright mb-3">
              REAL-TIME SYNC
            </h3>
            <p className="text-pip-text-secondary font-mono text-sm">
              Your vault data syncs instantly across all devices with 
              Supabase real-time subscriptions and offline capabilities.
            </p>
          </Card>

          <Card className="pip-widget p-6 text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4 pip-text-glow" />
            <h3 className="text-xl font-display font-bold text-pip-text-bright mb-3">
              PERSONALIZED EXPERIENCE
            </h3>
            <p className="text-pip-text-secondary font-mono text-sm">
              Create your unique vault identity with S.P.E.C.I.A.L. stats,
              custom themes, and personalized widget configurations.
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="pip-terminal inline-block p-8 border-2 border-pip-border-bright/30">
            <h2 className="text-2xl font-display font-bold text-pip-text-bright mb-4 pip-text-glow">
              READY TO ENTER THE VAULT?
            </h2>
            <p className="text-pip-text-secondary font-mono mb-6 max-w-md">
              Join thousands of vault dwellers already using the most advanced 
              personal information processor in the wasteland.
            </p>
            <Button asChild size="lg" className="pip-button-glow font-mono text-lg px-8 py-4">
              <Link to="/auth/register">
                START YOUR JOURNEY
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};