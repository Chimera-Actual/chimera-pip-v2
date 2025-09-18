import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'default' | 'large' | 'full';
  onSave?: () => void;
  onReset?: () => void;
  saveLabel?: string;
  resetLabel?: string;
  showSaveButton?: boolean;
  showResetButton?: boolean;
  isDirty?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  default: 'max-w-2xl',
  large: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]'
};

export const BaseSettingsModal: React.FC<BaseSettingsModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'default',
  onSave,
  onReset,
  saveLabel = 'SAVE CHANGES',
  resetLabel = 'RESET',
  showSaveButton = true,
  showResetButton = true,
  isDirty = false,
  isLoading = false,
  children,
  className
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
        <DialogContent 
        className={cn(
          sizeClasses[size],
          'bg-pip-bg-primary/95 backdrop-blur-sm border border-pip-border-bright pip-glow pip-terminal overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 flex flex-col max-h-[90vh]',
          className
        )}
      >
        <DialogHeader className="border-b border-pip-border/30 pb-4">
          <DialogTitle className="text-2xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-pip-text-muted font-pip-mono">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          {children}
        </ScrollArea>

        {(showSaveButton || showResetButton) && (
          <div className="flex items-center justify-between pt-4 border-t border-pip-border/30 flex-shrink-0">
            {showResetButton ? (
              <Button
                variant="outline"
                onClick={onReset}
                disabled={isLoading}
                className="font-pip-mono text-xs border-pip-border text-pip-text-secondary hover:text-primary"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {resetLabel}
              </Button>
            ) : <div />}
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="font-pip-mono text-xs text-pip-text-secondary hover:text-primary"
              >
                CANCEL
              </Button>
              {showSaveButton && (
                <Button
                  onClick={onSave}
                  disabled={isLoading || !isDirty}
                  className={cn(
                    'font-pip-mono text-xs bg-primary/20 border-primary text-primary hover:bg-primary/30 pip-button-glow',
                    isDirty && 'animate-pulse'
                  )}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveLabel}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};