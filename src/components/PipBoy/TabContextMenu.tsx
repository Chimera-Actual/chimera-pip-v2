import React, { useEffect, useRef } from 'react';
import { Edit, Copy, Trash2, X, Settings } from 'lucide-react';
import { TabConfiguration } from '@/types/tabManagement';
import { useTabManager } from '@/hooks/useTabManager';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface TabContextMenuProps {
  tab: TabConfiguration;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit?: (tab: TabConfiguration) => void;
}

export const TabContextMenu: React.FC<TabContextMenuProps> = ({
  tab,
  position,
  onClose,
  onEdit
}) => {
  const { deleteTab, duplicateTab } = useTabManager();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleEdit = () => {
    onEdit?.(tab);
    onClose();
  };

  const handleDuplicate = async () => {
    try {
      await duplicateTab(tab.id);
      toast({
        title: 'Tab Duplicated',
        description: `${tab.name} has been duplicated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate tab.',
        variant: 'destructive',
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (tab.isDefault) {
      toast({
        title: 'Cannot Delete',
        description: 'Default Pip-Boy tabs cannot be deleted.',
        variant: 'destructive',
      });
      onClose();
      return;
    }

    try {
      await deleteTab(tab.id);
    } catch (error) {
      // Error is handled in the hook
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 bg-pip-bg-primary/95 backdrop-blur-sm border border-pip-border-bright rounded-md shadow-lg animate-scale-in pip-glow pip-terminal"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="py-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-3 py-2 text-sm font-pip-mono text-pip-text-primary hover:bg-pip-bg-secondary/50 hover:text-pip-green-primary pip-button-glow"
          onClick={handleEdit}
        >
          <Edit className="w-4 h-4 mr-2" />
          EDIT TAB
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-3 py-2 text-sm font-pip-mono text-pip-text-primary hover:bg-pip-bg-secondary/50 hover:text-pip-green-primary pip-button-glow"
          onClick={handleDuplicate}
        >
          <Copy className="w-4 h-4 mr-2" />
          DUPLICATE TAB
        </Button>

        <div className="border-t border-pip-border/30 my-1" />

        {!tab.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-3 py-2 text-sm font-pip-mono hover:bg-destructive/20 text-destructive pip-button-glow"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            DELETE TAB
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-3 py-2 text-sm font-pip-mono text-pip-text-primary hover:bg-pip-bg-secondary/50 hover:text-pip-green-primary pip-button-glow"
          onClick={onClose}
        >
          <X className="w-4 h-4 mr-2" />
          CLOSE
        </Button>
      </div>
    </div>
  );
};