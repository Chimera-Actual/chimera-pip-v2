import React, { useState, useRef } from 'react';
import { ChevronDown, Settings, Trash2, Grip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  widgetId: string;
  title: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSettingsChange?: (settings: any) => void;
  onDelete?: () => void;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widgetId,
  title,
  collapsed,
  onToggleCollapse,
  onSettingsChange,
  onDelete,
  onMove,
  onResize,
  className = '',
  children,
  isLoading = false,
  error = null
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'widget-container pip-terminal pip-glow border-2 border-pip-border-bright/30 backdrop-blur-sm transition-all duration-200',
        collapsed ? 'h-12' : 'min-h-[200px]',
        isResizing && 'select-none',
        isLoading && 'opacity-60',
        error && 'border-destructive/50',
        className
      )}
      data-widget-id={widgetId}
    >
      {/* Widget Header */}
      <div className="widget-header flex items-center justify-between px-4 py-2 border-b border-pip-border/20 h-12 bg-gradient-to-r from-pip-green-primary/10 to-transparent">
        <div className="widget-title-section flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="collapse-button p-1 h-auto hover:bg-pip-green-primary/20 transition-colors"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand widget' : 'Collapse widget'}
          >
            <ChevronDown 
              className={cn(
                'h-4 w-4 text-pip-green-primary transition-transform duration-200',
                collapsed ? '-rotate-90' : 'rotate-0'
              )} 
            />
          </Button>
          
          <h3 className="widget-title font-pip-display text-sm font-bold tracking-wider uppercase text-pip-text-bright pip-text-glow">
            {title}
          </h3>
          
          {isLoading && (
            <div className="h-2 w-2 rounded-full bg-pip-green-primary animate-pulse" />
          )}
        </div>
        
        <div className="widget-controls flex items-center gap-1">
          {onMove && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto hover:bg-pip-green-primary/20 transition-colors opacity-60 hover:opacity-100"
              aria-label="Move widget"
            >
              <Grip className="h-4 w-4 text-pip-green-primary" />
            </Button>
          )}
          
          {onSettingsChange && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto hover:bg-pip-green-primary/20 transition-colors opacity-60 hover:opacity-100"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Widget settings"
            >
              <Settings className="h-4 w-4 text-pip-green-primary" />
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto hover:bg-destructive/20 transition-colors opacity-60 hover:opacity-100"
              onClick={onDelete}
              aria-label="Delete widget"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className={cn(
        'widget-content transition-all duration-200 overflow-hidden',
        collapsed ? 'h-0 p-0' : 'p-4 h-auto'
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

      {/* Resize Handles */}
      {!collapsed && onResize && (
        <>
          {/* Right resize handle */}
          <div 
            className="resize-handle resize-handle-right absolute right-0 top-12 bottom-0 w-2 cursor-e-resize opacity-0 hover:opacity-100 transition-opacity bg-pip-green-primary/20 hover:bg-pip-green-primary/40"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              // Resize logic would go here
            }}
          />
          
          {/* Bottom resize handle */}
          <div 
            className="resize-handle resize-handle-bottom absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 hover:opacity-100 transition-opacity bg-pip-green-primary/20 hover:bg-pip-green-primary/40"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              // Resize logic would go here
            }}
          />
          
          {/* Corner resize handle */}
          <div 
            className="resize-handle resize-handle-corner absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity bg-pip-green-primary/40 hover:bg-pip-green-primary/60"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              // Resize logic would go here
            }}
          />
        </>
      )}
    </div>
  );
};