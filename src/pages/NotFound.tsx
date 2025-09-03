import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Zap } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center pip-scanlines bg-pip-bg-primary">
      <Card className="pip-terminal pip-glow border-2 border-pip-border-bright/30 p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* CHIMERA-TEC Logo */}
          <div className="flex items-center justify-center space-x-3">
            <Zap className="h-12 w-12 text-primary pip-text-glow animate-pip-flicker" />
            <div>
              <h1 className="text-2xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
                CHIMERA-TEC
              </h1>
              <p className="text-xs text-pip-text-secondary font-pip-mono">
                SYSTEM ERROR
              </p>
            </div>
          </div>

          {/* Error Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-16 w-16 text-destructive pip-text-glow" />
            </div>
            
            <div>
              <h2 className="text-4xl font-pip-display font-bold text-destructive pip-text-glow mb-2">
                ERROR 404
              </h2>
              <p className="text-lg font-pip-mono text-pip-text-bright mb-1">
                LOCATION NOT FOUND
              </p>
              <p className="text-sm text-pip-text-muted font-pip-mono">
                The requested area is outside the mapped territory
              </p>
            </div>

            <div className="p-3 bg-pip-bg-secondary/50 border border-pip-border rounded">
              <p className="text-xs font-pip-mono text-pip-text-muted">
                PATH: {location.pathname}
              </p>
              <p className="text-xs font-pip-mono text-pip-text-muted">
                RECOMMENDATION: Return to safe zone
              </p>
            </div>
          </div>

          {/* Return Button */}
          <Button 
            onClick={() => window.location.href = "/"}
            className="w-full font-pip-display pip-button-glow"
            variant="default"
          >
            <Home className="h-4 w-4 mr-2" />
            RETURN TO VAULT
          </Button>

          {/* System Info */}
          <div className="text-xs font-pip-mono text-pip-text-muted space-y-1">
            <p>CHIMERA-PIP 4000 mk2 v2.1.7</p>
            <p>ERROR LOGGED TO SYSTEM TERMINAL</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
