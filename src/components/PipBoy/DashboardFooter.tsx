import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardFooter: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate connection monitoring
    const connectionInterval = setInterval(() => {
      setConnectionStatus(navigator.onLine ? 'connected' : 'disconnected');
    }, 5000);

    // Update last sync time occasionally
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        setLastSync(new Date());
      }
    }, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(connectionInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    });
  };

  return (
    <footer className="dashboard-footer border-t border-pip-border bg-pip-bg-secondary/50 backdrop-blur-sm">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Left Side - Connection Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="pip-icon-sm text-pip-green-primary" />
            ) : (
              <WifiOff className="pip-icon-sm text-destructive" />
            )}
            <span className="text-xs font-pip-mono text-pip-text-secondary uppercase">
              {connectionStatus}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="pip-icon-sm text-pip-text-muted" />
            <span className="text-xs font-pip-mono text-pip-text-muted">
              Last Sync: {formatTime(lastSync)}
            </span>
          </div>
        </div>

        {/* Center - User Info */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-pip-mono text-pip-text-secondary">
            User: {user?.email?.substring(0, user.email.indexOf('@')).toUpperCase() || 'DWELLER'}
          </span>
        </div>

        {/* Right Side - System Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="pip-icon-sm text-pip-text-muted" />
            <span className="text-xs font-pip-mono text-pip-text-secondary">
              {formatDate(currentTime)}
            </span>
          </div>
          
          <div className="text-sm font-pip-display font-semibold text-pip-text-bright pip-text-glow">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </footer>
  );
};