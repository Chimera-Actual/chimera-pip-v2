import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  isDirty?: boolean;
  isLoading?: boolean;
  showSaveButton?: boolean;
  showResetButton?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSave,
  onReset,
  isDirty = false,
  isLoading = false,
  showSaveButton = true,
  showResetButton = true,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-pip-text-bright font-pip-display">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-pip-text-muted font-pip-mono">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {children}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-pip-border/30">
          {showResetButton && onReset && (
            <Button
              variant="outline" 
              onClick={onReset}
              disabled={isLoading}
              className="text-pip-text-muted"
            >
              Reset
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {showSaveButton && onSave && (
            <Button 
              onClick={onSave} 
              disabled={!isDirty || isLoading}
              className="bg-pip-accent text-pip-accent-foreground hover:bg-pip-accent/90"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};