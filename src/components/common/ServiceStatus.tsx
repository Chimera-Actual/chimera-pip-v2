import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ServiceStatusProps {
  serviceName: string;
  isOnline: boolean;
  lastError?: string;
  showAlert?: boolean;
}

export const ServiceStatus: React.FC<ServiceStatusProps> = ({
  serviceName,
  isOnline,
  lastError,
  showAlert = true
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  if (!showAlert && isOnline) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-pip-primary" />
          ) : (
            <WifiOff className="h-3 w-3 text-orange-400" />
          )}
          <Badge 
            variant={isOnline ? "secondary" : "destructive"}
            className="text-xs font-pip-mono"
          >
            {serviceName} {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Badge>
        </div>
        
        {!isOnline && showAlert && (
          <button
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="text-xs text-pip-text-muted hover:text-pip-text-secondary"
          >
            {showErrorDetails ? 'Hide' : 'Details'}
          </button>
        )}
      </div>

      {!isOnline && showAlert && (
        <Alert className="border-orange-500/30 bg-orange-500/5">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-xs">
            <div className="space-y-1">
              <p>Service temporarily unavailable. Using cached/fallback data.</p>
              {showErrorDetails && lastError && (
                <p className="text-pip-text-muted font-pip-mono text-xs">
                  Error: {lastError}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};