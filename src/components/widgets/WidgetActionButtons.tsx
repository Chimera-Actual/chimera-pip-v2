import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WidgetActionButtonsProps {
  onSettings?: () => void;
  additionalActions?: React.ReactNode;
  className?: string;
  showSettingsButton?: boolean;
}

export const WidgetActionButtons: React.FC<WidgetActionButtonsProps> = ({
  onSettings,
  additionalActions,
  className,
  showSettingsButton = true,
}) => {
  return (
    <div className={cn("flex items-center gap-2 ml-auto", className)}>
      {additionalActions}
      
      {showSettingsButton && onSettings && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 bg-background/80 hover:bg-background border border-border/50"
          onClick={onSettings}
          title="Widget Settings"
        >
          <Settings className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};