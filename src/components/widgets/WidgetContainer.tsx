import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WidgetSettingsModal } from './WidgetSettingsModal';
import { GripVertical, ChevronDown, Settings, MoreHorizontal, Archive, Trash2 } from 'lucide-react';

interface WidgetContainerProps {
  widgetId: string;
  widgetType: string;
  title: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSettingsChange?: (settings: Record<string, string | number | boolean | string[]>) => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onMove?: () => void;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widgetId,
  widgetType,
  title,
  collapsed,
  onToggleCollapse,
  onSettingsChange,
  onDelete,
  onArchive,
  onMove,
  className = '',
  children,
  isLoading = false,
  error = null
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      ref={containerRef}
      className={cn(
        'widget-container pip-terminal pip-glow border-2 border-pip-border-bright/30 backdrop-blur-sm transition-all duration-200 relative',
        collapsed ? 'h-12' : 'min-h-[200px]',
        isLoading && 'opacity-60',
        error && 'border-destructive/50',
        className
      )}
      data-widget-id={widgetId}
    >
      {/* Widget Header */}
      <div className="widget-header flex items-center justify-between px-2 py-1 border-b border-pip-border/20 h-12 bg-gradient-to-r from-pip-green-primary/10 to-transparent">
        {/* Left side - Move handle and title */}
        <div className="widget-title-left flex items-center gap-3">
          {onMove && (
            <Button
              variant="ghost"
              size="sm"
              className="widget-move p-1 h-auto hover:bg-pip-green-primary/20 transition-colors opacity-60 hover:opacity-100"
              onClick={onMove}
              aria-label="Move widget"
              title="Move Widget"
            >
              <GripVertical className="h-4 w-4 text-pip-green-primary" />
            </Button>
          )}
          
          <h3 className="widget-title font-pip-display text-sm font-bold tracking-wider uppercase text-pip-text-bright pip-text-glow">
            {title}
          </h3>
          
          {isLoading && (
            <div className="h-2 w-2 rounded-full bg-pip-green-primary animate-pulse" />
          )}
        </div>
        
        {/* Right side - Control buttons */}
        <div className="widget-title-controls flex items-center gap-1">
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
        collapsed ? 'h-0 p-0' : 'p-4 h-auto max-h-96 overflow-y-auto'
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