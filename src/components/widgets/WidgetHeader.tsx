import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Settings, Minimize2, Maximize2, GripVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface WidgetHeaderProps {
  title: string;
  isEditing: boolean;
  collapsed: boolean;
  widgetWidth: 'normal' | 'full';
  onEditTitle: () => void;
  onToggleCollapse: () => void;
  onToggleWidth: () => void;
  onSettings: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  isEditing,
  collapsed,
  widgetWidth,
  onEditTitle,
  onToggleCollapse,
  onToggleWidth,
  onSettings,
  onArchive,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-pip-border">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-pip-text-muted cursor-grab" />
        <h3 
          className="font-semibold text-pip-text-primary cursor-pointer hover:text-pip-text-bright"
          onClick={onEditTitle}
        >
          {title}
        </h3>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 hover:bg-pip-bg-secondary"
        >
          {collapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-pip-bg-secondary"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleWidth}>
              {widgetWidth === 'full' ? 'Normal Width' : 'Full Width'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};