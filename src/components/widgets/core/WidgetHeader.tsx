// Widget Header Component - Decomposed from WidgetContainer
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  Settings, 
  MoreHorizontal, 
  ArrowLeftRight,
  Edit3,
  Check,
  X,
  Folder
} from 'lucide-react';

interface WidgetHeaderProps {
  widgetId: string;
  widgetType: string;
  title: string;
  customIcon?: string;
  widgetWidth?: 'half' | 'full';
  collapsed: boolean;
  isLoading?: boolean;
  onToggleCollapse: () => void;
  onTitleChange?: (newTitle: string) => void;
  onToggleWidth?: () => void;
  onOpenSettings?: () => void;
  onOpenMenu?: () => void;
  dragHandleProps?: any;
  className?: string;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  widgetId,
  widgetType,
  title,
  customIcon,
  widgetWidth = 'half',
  collapsed,
  isLoading = false,
  onToggleCollapse,
  onTitleChange,
  onToggleWidth,
  onOpenSettings,
  onOpenMenu,
  dragHandleProps,
  className = '',
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  // Widget icon mapping
  const getWidgetIcon = () => {
    const iconMap: Record<string, any> = {
      'character-profile': Folder,
      'special-stats': Folder,
      'system-monitor': Folder,
      'weather-station': Folder,
      'achievement-gallery': Folder,
      'file-explorer': Folder,
      'secure-vault': Folder,
      'news-terminal': Folder,
      'audio-player': Folder,
      'calendar-mission': Folder,
      'ai-oracle': Folder,
      'cryptocurrency': Folder,
      'terminal': Folder,
    };
    
    return iconMap[customIcon || widgetType] || Folder;
  };

  const handleTitleSave = () => {
    if (tempTitle.trim() && tempTitle !== title) {
      onTitleChange?.(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  React.useEffect(() => {
    setTempTitle(title);
  }, [title]);

  const IconComponent = getWidgetIcon();

  return (
    <div className={cn(
      "widget-header flex items-center justify-between px-2 py-1 border-b border-pip-border/20 h-12 bg-gradient-to-r from-pip-green-primary/10 to-transparent",
      className
    )}>
      {/* Left side - Icon (drag handle), title, and loading indicator */}
      <div className="widget-title-left flex items-center gap-3 flex-1 min-w-0">
        {/* Widget Icon as Drag Handle */}
        <div
          className={cn(
            "widget-icon-drag-handle flex items-center justify-center w-8 h-8 rounded-md bg-pip-green-primary/20 border border-pip-green-primary/30 transition-all duration-200",
            dragHandleProps ? "cursor-grab active:cursor-grabbing hover:bg-pip-green-primary/30 hover:scale-105" : ""
          )}
          {...dragHandleProps}
          title="Drag to move widget"
        >
          <IconComponent className="h-4 w-4 text-pip-green-primary" />
        </div>
        
        {/* Widget Title - Editable */}
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                className="h-6 text-sm font-pip-display font-bold tracking-wider uppercase text-pip-text-bright bg-pip-bg-secondary/50 border-pip-border focus:border-pip-green-primary"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6 hover:bg-pip-green-primary/20"
                onClick={handleTitleSave}
              >
                <Check className="h-3 w-3 text-pip-green-primary" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6 hover:bg-destructive/20"
                onClick={handleTitleCancel}
              >
                <X className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="widget-title font-pip-display text-sm font-bold tracking-wider uppercase text-pip-text-bright pip-text-glow truncate">
                {title}
              </h3>
              {onTitleChange && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-5 w-5 opacity-0 group-hover:opacity-100 hover:bg-pip-green-primary/20 transition-all"
                  onClick={() => setIsEditingTitle(true)}
                  title="Edit title"
                >
                  <Edit3 className="h-3 w-3 text-pip-green-primary" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {isLoading && (
          <div className="h-2 w-2 rounded-full bg-pip-green-primary animate-pulse flex-shrink-0" />
        )}
      </div>
      
      {/* Right side - Control buttons */}
      <div className="widget-title-controls flex items-center gap-1 flex-shrink-0">
        {/* Width Toggle */}
        {onToggleWidth && (
          <Button
            variant="ghost"
            size="sm"
            className="widget-width-toggle p-1 h-auto hover:bg-pip-green-primary/20 transition-colors opacity-60 hover:opacity-100"
            onClick={onToggleWidth}
            aria-label={`Toggle width (currently ${widgetWidth})`}
            title={`Toggle Width (${widgetWidth})`}
          >
            <ArrowLeftRight className="h-4 w-4 text-pip-green-primary" />
          </Button>
        )}
        
        {/* Collapse/Expand */}
        <Button
          variant="ghost"
          size="sm"
          className="widget-collapse p-1 h-auto hover:bg-pip-green-primary/20 transition-colors"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand widget' : 'Collapse widget'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronDown className={cn(
            "h-4 w-4 text-pip-green-primary transition-transform duration-200",
            collapsed && "rotate-[-90deg]"
          )} />
        </Button>
        
        {/* Settings */}
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="sm"
            className="widget-settings p-1 h-auto hover:bg-pip-green-primary/20 transition-colors opacity-60 hover:opacity-100"
            onClick={onOpenSettings}
            aria-label="Widget settings"
            title="Widget Settings"
          >
            <Settings className="h-4 w-4 text-pip-green-primary" />
          </Button>
        )}
        
        {/* More Options */}
        {onOpenMenu && (
          <Button
            variant="ghost"
            size="sm"
            className="widget-delete p-1 h-auto hover:bg-pip-green-primary/20 transition-colors opacity-60 hover:opacity-100"
            onClick={onOpenMenu}
            aria-label="More options"
            title="More Options"
          >
            <MoreHorizontal className="h-4 w-4 text-pip-green-primary" />
          </Button>
        )}
      </div>
    </div>
  );
};