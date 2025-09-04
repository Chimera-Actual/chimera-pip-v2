// Widget Menu Component - Decomposed from WidgetContainer
import React, { useRef, useEffect } from 'react';
import { Archive, Trash2 } from 'lucide-react';

interface WidgetMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export const WidgetMenu: React.FC<WidgetMenuProps> = ({
  isOpen,
  onClose,
  onArchive,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="widget-dropdown-menu absolute right-0 top-full bg-pip-bg/95 border-2 border-pip-green-primary/80 rounded backdrop-blur-sm min-w-[120px] z-[1000] shadow-pip-glow mt-1"
    >
      {onArchive && (
        <button 
          className="menu-item flex items-center gap-2 w-full px-3 py-2 bg-transparent border-none text-pip-green-primary font-pip-mono text-sm cursor-pointer text-left transition-all hover:bg-pip-green-primary/10 hover:shadow-pip-text-glow"
          onClick={() => {
            onArchive();
            onClose();
          }}
        >
          <Archive className="h-4 w-4" />
          Archive
        </button>
      )}
      {onDelete && (
        <button 
          className="menu-item menu-danger flex items-center gap-2 w-full px-3 py-2 bg-transparent border-none text-pip-green-primary font-pip-mono text-sm cursor-pointer text-left transition-all hover:bg-destructive/10 hover:text-destructive hover:shadow-destructive/50"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      )}
    </div>
  );
};