import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { WidgetSettingsModal } from './WidgetSettingsModal';
import { 
  GripVertical, 
  ChevronDown, 
  Settings, 
  MoreHorizontal, 
  Archive, 
  Trash2,
  Edit3,
  Check,
  X,
  ArrowLeftRight,
  Folder,
  BarChart3,
  Monitor,
  Cloud,
  Trophy,
  FileText,
  Shield,
  Music,
  Calendar,
  MessageCircle,
  DollarSign,
  Terminal as TerminalIcon
} from 'lucide-react';

interface WidgetContainerProps {
  widgetId: string;
  widgetType: string;
  title: string;
  customIcon?: string;
  widgetWidth?: 'half' | 'full';
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSettingsChange?: (settings: Record<string, string | number | boolean | string[]>) => void;
  onTitleChange?: (newTitle: string) => void;
  onIconChange?: (newIcon: string) => void;
  onToggleWidth?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onMove?: () => void;
  dragHandleProps?: any;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widgetId,
  widgetType,
  title,
  customIcon,
  widgetWidth = 'half',
  collapsed,
  onToggleCollapse,
  onSettingsChange,
  onTitleChange,
  onIconChange,
  onToggleWidth,
  onDelete,
  onArchive,
  onMove,
  dragHandleProps,
  className = '',
  children,
  isLoading = false,
  error = null
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const containerRef = useRef<HTMLDivElement>(null);

  // Widget icon mapping
  const getWidgetIcon = useCallback((iconName?: string, widgetType?: string) => {
    const iconMap: Record<string, any> = {
      'character-profile': Folder,
      'special-stats': BarChart3,
      'system-monitor': Monitor,
      'weather-station': Cloud,
      'achievement-gallery': Trophy,
      'file-explorer': Folder,
      'secure-vault': Shield,
      'news-terminal': FileText,
      'audio-player': Music,
      'calendar-mission': Calendar,
      'ai-oracle': MessageCircle,
      'cryptocurrency': DollarSign,
      'terminal': TerminalIcon,
      
      // Custom icons
      'folder': Folder,
      'bar-chart-3': BarChart3,
      'monitor': Monitor,
      'cloud': Cloud,
      'trophy': Trophy,
      'shield': Shield,
      'file-text': FileText,
      'music': Music,
      'calendar': Calendar,
      'message-circle': MessageCircle,
      'dollar-sign': DollarSign,
      'settings': Settings,
      'archive': Archive,
      'grip-vertical': GripVertical
    };
    
    return iconMap[iconName || widgetType || 'folder'] || Folder;
  }, []);

  // Handle title editing
  const handleTitleSave = useCallback(() => {
    if (tempTitle.trim() && tempTitle !== title) {
      onTitleChange?.(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  }, [tempTitle, title, onTitleChange]);

  const handleTitleCancel = useCallback(() => {
    setTempTitle(title);
    setIsEditingTitle(false);
  }, [title]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  }, [handleTitleSave, handleTitleCancel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Update temp title when title changes
  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  const IconComponent = getWidgetIcon(customIcon, widgetType);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'widget-container pip-terminal pip-glow border-2 border-pip-border-bright/30 backdrop-blur-sm transition-all duration-200 relative',
        collapsed ? 'h-[50px]' : 'min-h-[200px]',
        isLoading && 'opacity-60',
        error && 'border-destructive/50',
        className
      )}
      data-widget-id={widgetId}
    >
      {/* Widget Header */}
      <div className="widget-header flex items-center justify-between px-2 py-1 border-b border-pip-border/20 h-12 bg-gradient-to-r from-pip-green-primary/10 to-transparent">
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
          {onSettingsChange && (
            <Button
              variant="ghost"
              size="sm"
              className="widget-settings p-1 h-auto hover:bg-pip-green-primary/20 transition-colors opacity-60 hover:opacity-100"
              onClick={() => setShowSettings(true)}
              aria-label="Widget settings"
              title="Widget Settings"
            >
              <Settings className="h-4 w-4 text-pip-green-primary" />
            </Button>
          )}
          
          {/* More Options */}
          {(onDelete || onArchive) && (
            <div className="widget-menu-container relative">
              <Button
                variant="ghost"
                size="sm"
                className="widget-delete p-1 h-auto hover:bg-pip-green-primary/20 transition-colors opacity-60 hover:opacity-100"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="More options"
                title="More Options"
              >
                <MoreHorizontal className="h-4 w-4 text-pip-green-primary" />
              </Button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="widget-dropdown-menu absolute right-0 top-full bg-pip-bg/95 border-2 border-pip-green-primary/80 rounded backdrop-blur-sm min-w-[120px] z-[1000] shadow-pip-glow mt-1">
                  {onArchive && (
                    <button 
                      className="menu-item flex items-center gap-2 w-full px-3 py-2 bg-transparent border-none text-pip-green-primary font-pip-mono text-sm cursor-pointer text-left transition-all hover:bg-pip-green-primary/10 hover:shadow-pip-text-glow"
                      onClick={() => {
                        onArchive();
                        setShowDropdown(false);
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
                        setShowDeleteConfirm(true);
                        setShowDropdown(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-pip-bg-overlay/80 flex items-center justify-center z-[2000]">
          <div className="pip-widget-dialog p-pip-lg max-w-sm mx-4 shadow-pip-glow">
            <h3 className="font-pip-display text-lg font-bold text-pip-text-bright mb-4">
              Confirm Delete
            </h3>
            <p className="font-pip-mono text-sm text-pip-text-dim mb-6">
              Are you sure you want to permanently delete "{title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="px-4 py-2 font-pip-mono text-sm hover:bg-pip-green-primary/20"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-4 py-2 font-pip-mono text-sm bg-destructive/20 text-destructive hover:bg-destructive/30"
                onClick={() => {
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={cn(
        'widget-content transition-all duration-200 overflow-hidden pip-scrollbar',
        collapsed ? 'h-0 p-0' : 'p-2 h-auto max-h-96 overflow-y-auto'
      )}>
        {!collapsed && (
          <>
            {error && (
              <div className="mb-3 p-2 rounded border border-destructive/30 bg-destructive/10 text-destructive text-xs font-pip-mono">
                {error}
              </div>
            )}
            {children}
          </>
        )}
      </div>

      {/* Widget Settings Modal */}
      <WidgetSettingsModal
        widgetId={widgetId}
        widgetType={widgetType}
        widgetTitle={title}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={(newSettings) => {
          onSettingsChange?.(newSettings);
        }}
      />
    </div>
  );
};