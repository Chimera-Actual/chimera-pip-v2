import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, X, Minimize2, Maximize2, GripVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface WidgetHeaderProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  onCollapse?: () => void;
  onClose?: () => void;
  onToggleFullWidth?: () => void;
  dragHandle?: boolean;
  isCollapsed?: boolean;
  isFullWidth?: boolean;
  className?: string;
  showTitle?: boolean;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  icon: Icon,
  onCollapse,
  onClose,
  onToggleFullWidth,
  dragHandle = false,
  isCollapsed = false,
  isFullWidth = false,
  className,
  showTitle = true,
}) => {
  const hasOverflowActions = onToggleFullWidth;
  
  return (
    <CardHeader className={cn(
      "pb-3 px-4 pt-4 border-b border-pip-border",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left: Icon + Title */}
        {showTitle && (
          <div className="flex items-center gap-2">
            {dragHandle && (
              <GripVertical className="h-4 w-4 text-pip-text-muted cursor-grab" />
            )}
            {Icon && (
              <Icon className="h-4 w-4 text-pip-primary" />
            )}
            <CardTitle className="text-pip-text-primary font-pip-display text-sm font-semibold">
              {title}
            </CardTitle>
          </div>
        )}
        
        {/* Right: Chrome Controls Only */}
        <div className="flex items-center gap-1">
          {/* Collapse/Expand */}
          {onCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 text-pip-text-muted hover:text-pip-text-primary hover:bg-pip-bg-tertiary"
              onClick={onCollapse}
              title={isCollapsed ? "Expand widget" : "Collapse widget"}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          )}
          
          {/* Overflow Menu for Rare Chrome Actions */}
          {hasOverflowActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 text-pip-text-muted hover:text-pip-text-primary hover:bg-pip-bg-tertiary"
                  title="More options"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onToggleFullWidth && (
                  <DropdownMenuItem onClick={onToggleFullWidth}>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    {isFullWidth ? 'Normal Width' : 'Full Width'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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