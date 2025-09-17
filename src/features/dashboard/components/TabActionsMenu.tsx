import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Pencil, Archive, Trash2, Plus } from 'lucide-react';

interface TabActionsMenuProps {
  onShowTabEditor: () => void;
  onArchiveTab: () => void;
  onShowDeleteConfirm: () => void;
  onShowWidgetSelector: () => void;
  isDefaultTab: boolean;
}

export const TabActionsMenu = ({
  onShowTabEditor,
  onArchiveTab,
  onShowDeleteConfirm,
  onShowWidgetSelector,
  isDefaultTab
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 transition-all duration-200 font-pip-mono text-xs border border-pip-border hover:border-primary hover:bg-pip-bg-secondary/50"
          title="Tab Settings"
        >
          <Settings className="pip-icon-sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onShowTabEditor}>
          <Pencil className="pip-icon-sm" />
          Tab Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onShowWidgetSelector}>
          <Plus className="pip-icon-sm" />
          Add Widget
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onArchiveTab}
          disabled={isDefaultTab}
        >
          <Archive className="pip-icon-sm" />
          Archive Tab
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onShowDeleteConfirm}
          disabled={isDefaultTab}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="pip-icon-sm" />
          Delete Tab
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};