import React, { useState, useEffect, memo, useCallback } from 'react';
import { BaseWidget, SystemMonitorSettings } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cpu, HardDrive, Wifi, Database } from 'lucide-react';

interface SystemMonitorWidgetProps {
  widget: BaseWidget;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
}

const metricIcons = {
  cpu: Cpu,
  memory: Database,
  network: Wifi,
  storage: HardDrive,
};

const metricLabels = {
  cpu: 'CPU',
  memory: 'MEMORY',
  network: 'NETWORK',
  storage: 'STORAGE',
};

// Simulate system monitoring data
const generateSystemMetrics = (): SystemMetrics => ({
  cpu: Math.random() * 100,
  memory: Math.random() * 100,
  network: Math.random() * 100,
  storage: 65 + Math.random() * 20, // Storage tends to be more stable
});

export const SystemMonitorWidget: React.FC<SystemMonitorWidgetProps> = memo(({ widget }) => {
  const { settings, setSettings, collapsed, setCollapsed, isLoading, error } = useWidgetState(
    widget.id,
    widget.settings as SystemMonitorSettings
  );
  
  const [metrics, setMetrics] = useState<SystemMetrics>(generateSystemMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateSystemMetrics());
    }, settings.refreshRate);

    return () => clearInterval(interval);
  }, [settings.refreshRate]);

  const getStatusColor = useCallback((value: number, threshold: number): string => {
    if (value >= threshold) return 'text-destructive';
    if (value >= threshold * 0.7) return 'text-yellow-500';
    return 'text-pip-green-primary';
  }, []);

  const getStatusBadge = useCallback((value: number, threshold: number): { label: string; variant: 'default' | 'destructive' | 'secondary' } => {
    if (value >= threshold) return { label: 'CRITICAL', variant: 'destructive' };
    if (value >= threshold * 0.8) return { label: 'WARNING', variant: 'secondary' };
    return { label: 'NORMAL', variant: 'default' };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 space-y-3">
        {settings.monitoredMetrics.map((metricKey) => {
          const value = metrics[metricKey];
          const threshold = settings.alertThresholds[metricKey];
          const Icon = metricIcons[metricKey];
          const label = metricLabels[metricKey];
          const status = getStatusBadge(value, threshold);
          
          return (
            <div key={metricKey} className="metric-row pip-special-stat p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-pip-green-primary" />
                  <span className="text-xs text-pip-text-muted font-pip-mono">
                    {label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-pip-display font-bold ${getStatusColor(value, threshold)}`}>
                    {value.toFixed(1)}%
                  </span>
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                </div>
              </div>
              
              {settings.showGraphs && (
                <Progress 
                  value={value} 
                  className="h-2"
                />
              )}
            </div>
          );
        })}
        
        {/* System Status Summary */}
        <div className="mt-4 p-3 rounded border border-pip-border/50 bg-pip-bg-tertiary/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-pip-text-muted font-pip-mono">
              SYSTEM STATUS
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pip-green-primary animate-pulse" />
              <span className="text-sm font-pip-display font-bold text-pip-green-primary">
                ONLINE
              </span>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-pip-text-secondary font-pip-mono">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
});