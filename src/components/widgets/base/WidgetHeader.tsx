import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WidgetHeaderProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClose?: () => void;
  onSettings?: () => void;
  className?: string;
  showTitle?: boolean;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  icon: Icon,
  onClose,
  onSettings,
  className,
  showTitle = true,
}) => {
  
  return (
    <CardHeader className={cn(
      "pb-3 px-4 pt-4 border-b border-pip-border",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left: Icon + Title */}
        {showTitle && (
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className="h-4 w-4 text-pip-primary" />
            )}
            <CardTitle className="text-pip-text-primary font-pip-display text-sm font-semibold">
              {title}
            </CardTitle>
          </div>
        )}
        
        {/* Right: Essential Controls Only */}
        <div className="flex items-center gap-1">
          {/* Settings */}
          {onSettings && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 text-pip-text-muted hover:text-pip-text-primary hover:bg-pip-bg-tertiary"
              onClick={onSettings}
              title="Widget Settings"
            >
              <Settings className="h-3 w-3" />
            </Button>
          )}
          
          {/* Close */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 text-pip-text-muted hover:text-destructive hover:bg-pip-bg-tertiary"
              onClick={onClose}
              title="Remove widget"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
};