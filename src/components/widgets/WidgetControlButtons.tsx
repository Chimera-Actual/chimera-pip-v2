import React from 'react';
import { X, Maximize2, Minimize2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserWidget } from '@/hooks/useWidgetManager';

interface WidgetControlButtonsProps {
  widget: UserWidget;
  onClose: () => void;
  onToggleCollapse: () => void;
  onSettings: () => void;
}

export const WidgetControlButtons: React.FC<WidgetControlButtonsProps> = ({
  widget,
  onClose,
  onToggleCollapse,
  onSettings,
}) => {
  return (
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        variant="ghost"
        size="icon"
        className="widget-control-button h-6 w-6 p-0 bg-background/80 hover:bg-background border border-border/50"
        onClick={onSettings}
        title="Widget Settings"
      >
        <Settings className="h-3 w-3" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="widget-control-button h-6 w-6 p-0 bg-background/80 hover:bg-background border border-border/50"
        onClick={onToggleCollapse}
        title={widget.is_collapsed ? "Expand Widget" : "Collapse Widget"}
      >
        {widget.is_collapsed ? (
          <Maximize2 className="h-3 w-3" />
        ) : (
          <Minimize2 className="h-3 w-3" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="widget-control-button h-6 w-6 p-0 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20"
        onClick={onClose}
        title="Remove Widget"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};