import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetHeader, type WidgetHeaderProps } from './WidgetHeader';
import { WidgetActionBar, type WidgetAction } from './WidgetActionBar';
import { cn } from '@/lib/utils';

export interface WidgetShellProps extends Omit<WidgetHeaderProps, 'className'> {
  actions?: WidgetAction[];
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  actionBarClassName?: string;
  isFullWidth?: boolean;
  isFullSpace?: boolean;
  effects?: {
    glow?: boolean;
    scanlines?: boolean;
    particles?: boolean;
  };
}

export const WidgetShell: React.FC<WidgetShellProps> = ({
  title,
  icon,
  onClose,
  onSettings,
  isFullWidth = false,
  isFullSpace = false,
  showTitle = true,
  actions = [],
  children,
  className,
  contentClassName,
  headerClassName,
  actionBarClassName,
  effects = {},
}) => {
  return (
    <Card className={cn(
      "w-full relative group transition-all duration-300",
      // Full space mode for single widget display - takes entire available space
      isFullSpace ? 'h-full flex flex-col' : '',
      // Pip-Boy styling optimized for full space
      "bg-pip-bg-secondary border-pip-border hover:border-pip-border-bright pip-widget-card hover:pip-glow-subtle",
      effects.glow && "shadow-lg shadow-primary/20 pip-glow",
      className
    )}>
      {/* Header */}
      <WidgetHeader
        title={title}
        icon={icon}
        onClose={onClose}
        onSettings={onSettings}
        showTitle={showTitle}
        className={headerClassName}
      />

      {/* Function Bar */}
      {actions.length > 0 && (
        <WidgetActionBar
          actions={actions}
          className={actionBarClassName}
        />
      )}

      {/* Content */}
      <CardContent className={cn(
        "px-4 pb-4 pt-0",
        isFullSpace ? "flex-1 flex flex-col h-0" : "",
        contentClassName
      )}>
        <div className={cn(
          "widget-content-direct",
          isFullSpace ? "h-full flex flex-col flex-1" : ""
        )}>
          {children}
        </div>
      </CardContent>

      {/* Visual Effects */}
      {effects.scanlines && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full opacity-10 bg-gradient-to-b from-transparent via-pip-text-bright to-transparent animate-pulse" 
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
               }} />
        </div>
      )}

      {effects.particles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-primary/20 rounded-full animate-ping animation-delay-300" />
          <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-primary/40 rounded-full animate-ping animation-delay-700" />
        </div>
      )}
    </Card>
  );
};