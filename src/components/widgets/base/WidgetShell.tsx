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
  effects?: {
    glow?: boolean;
    scanlines?: boolean;
    particles?: boolean;
  };
}

export const WidgetShell: React.FC<WidgetShellProps> = ({
  title,
  icon,
  onCollapse,
  onClose,
  onToggleFullWidth,
  dragHandle = false,
  isCollapsed = false,
  isFullWidth = false,
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
      // Grid layout support
      isFullWidth ? 'col-span-2' : 'col-span-1',
      // Pip-Boy styling
      "bg-pip-bg-secondary border-pip-border hover:border-pip-border-bright pip-widget-card hover:pip-glow-subtle",
      effects.glow && "shadow-lg shadow-primary/20 pip-glow",
      isCollapsed && "min-h-[80px]",
      className
    )}>
      {/* Header */}
      <WidgetHeader
        title={title}
        icon={icon}
        onCollapse={onCollapse}
        onClose={onClose}
        onToggleFullWidth={onToggleFullWidth}
        dragHandle={dragHandle}
        isCollapsed={isCollapsed}
        isFullWidth={isFullWidth}
        showTitle={showTitle}
        className={headerClassName}
      />

      {/* Function Bar */}
      {!isCollapsed && actions.length > 0 && (
        <WidgetActionBar
          actions={actions}
          className={actionBarClassName}
        />
      )}

      {/* Content */}
      <CardContent className={cn(
        isCollapsed ? "p-4" : "px-4 pb-4 pt-0",
        contentClassName
      )}>
        {isCollapsed ? (
          <div className="flex items-center justify-center py-2">
            <span className="text-pip-text-muted text-xs font-pip-mono">
              Widget collapsed - click to expand
            </span>
          </div>
        ) : (
          <div className="widget-content-direct">
            {children}
          </div>
        )}
      </CardContent>

      {/* Visual Effects */}
      {!isCollapsed && effects.scanlines && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full opacity-10 bg-gradient-to-b from-transparent via-pip-text-bright to-transparent animate-pulse" 
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
               }} />
        </div>
      )}

      {!isCollapsed && effects.particles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-primary/20 rounded-full animate-ping animation-delay-300" />
          <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-primary/40 rounded-full animate-ping animation-delay-700" />
        </div>
      )}
    </Card>
  );
};