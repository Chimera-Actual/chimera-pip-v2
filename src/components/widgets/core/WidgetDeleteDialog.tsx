// Widget Delete Confirmation Dialog - Decomposed from WidgetContainer
import React from 'react';
import { Button } from '@/components/ui/button';

interface WidgetDeleteDialogProps {
  isOpen: boolean;
  widgetTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const WidgetDeleteDialog: React.FC<WidgetDeleteDialogProps> = ({
  isOpen,
  widgetTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-pip-bg-overlay/80 flex items-center justify-center z-[2000]">
      <div className="pip-widget-dialog p-pip-lg max-w-sm mx-4 shadow-pip-glow">
        <h3 className="font-pip-display text-lg font-bold text-pip-text-bright mb-4">
          Confirm Delete
        </h3>
        <p className="font-pip-mono text-sm text-pip-text-dim mb-6">
          Are you sure you want to permanently delete "{widgetTitle}"? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="px-4 py-2 font-pip-mono text-sm hover:bg-pip-green-primary/20"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-4 py-2 font-pip-mono text-sm bg-destructive/20 text-destructive hover:bg-destructive/30"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};