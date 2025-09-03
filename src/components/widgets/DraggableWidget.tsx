import React, { useState, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MoreVertical, 
  Move, 
  ChevronUp, 
  ChevronDown,
  CornerDownRight
} from 'lucide-react';
import { BaseWidget } from '@/types/widgets';
import { WidgetSettingsModal } from './WidgetSettingsModalPortal';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  widget: BaseWidget;
  isDragOverlay?: boolean;
  children: React.ReactNode;
  onUpdate: (updates: Partial<BaseWidget>) => void;
  onDelete: (widgetId: string) => void;
  onDuplicate?: (widget: BaseWidget) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  isDragOverlay = false,
  children,
  onUpdate,
  onDelete,
  onDuplicate,
  className,
  style: externalStyle,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ width: number; height: number; mouseX: number; mouseY: number } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({
    id: widget.id,
    disabled: isDragOverlay,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  });

  const handleToggleCollapse = () => {
    onUpdate({ collapsed: !widget.collapsed });
  };

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeStartRef.current = {
      width: widget.gridPosition.width,
      height: widget.gridPosition.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.mouseX;
      const deltaY = e.clientY - resizeStartRef.current.mouseY;
      
      // Convert pixel delta to grid cells (60px per cell + 16px gap)
      const cellSize = 60 + 16;
      const widthDelta = Math.round(deltaX / cellSize);
      const heightDelta = Math.round(deltaY / cellSize);
      
      const newWidth = Math.max(1, Math.min(8, resizeStartRef.current.width + widthDelta));
      const newHeight = Math.max(1, Math.min(6, resizeStartRef.current.height + heightDelta));

      if (newWidth !== widget.gridPosition.width || newHeight !== widget.gridPosition.height) {
        onUpdate({
          gridPosition: {
            ...widget.gridPosition,
            width: newWidth,
            height: newHeight,
          }
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [widget.gridPosition, onUpdate]);

  const style: React.CSSProperties = {
    ...externalStyle,
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (widgetRef) {
          widgetRef.current = node;
        }
      }}
      style={style}
      className={cn(
        // Base styles
        "pip-widget relative rounded-lg overflow-hidden flex flex-col",
        "transform-gpu will-change-transform",
        "bg-pip-bg-primary border border-pip-border",
        "transition-all duration-300 ease-out",
        
        // Drop zone visual feedback
        isOver && !isDragging && "ring-2 ring-primary/50 shadow-lg shadow-primary/20 scale-[1.02]",
        
        // Dragging states
        isDragging && [
          "shadow-2xl shadow-primary/30",
          "scale-105 rotate-1 z-50",
          "opacity-60 blur-[1px]"
        ],
        
        // Drag overlay specific
        isDragOverlay && [
          "shadow-3xl shadow-primary/40", 
          "scale-110 rotate-3 z-[1000]",
          "opacity-95"
        ],
        
        className
      )}
      {...attributes}
    >
      {/* Widget Header */}
      <div className="widget-header flex items-center justify-between p-3 bg-pip-bg-secondary/50 border-b border-pip-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Smooth Drag Handle */}
          <div
            className={cn(
              "drag-handle flex-shrink-0 p-2 rounded transition-all duration-200",
              "cursor-grab active:cursor-grabbing select-none touch-target",
              "hover:bg-pip-bg-tertiary hover:scale-110",
              "active:scale-95 active:bg-primary/20",
              isDragging && "bg-primary/30 scale-110"
            )}
            {...listeners}
            style={{ touchAction: 'none' }}
          >
            <Move className={cn(
              "w-4 h-4 pointer-events-none transition-colors duration-200",
              isDragging ? "text-primary" : "text-pip-text-secondary"
            )} />
          </div>
          
          <h3 className="text-sm font-semibold text-pip-text-bright uppercase tracking-wide truncate">
            {widget.title}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {/* Collapse Button */}
          <button
            className="widget-control-button p-2 text-pip-text-secondary hover:text-pip-text-bright hover:bg-pip-bg-tertiary rounded transition-colors touch-target"
            onClick={handleToggleCollapse}
            aria-label={widget.collapsed ? 'Expand widget' : 'Collapse widget'}
          >
            {widget.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Direct Settings Access */}
          <button
            className="widget-control-button p-2 text-pip-text-secondary hover:text-pip-text-bright hover:bg-pip-bg-tertiary rounded transition-colors touch-target"
            onClick={() => setShowSettings(true)}
            aria-label="Widget settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Widget Content */}
      {!widget.collapsed && (
        <div className="widget-content flex-1 min-h-0 flex flex-col">
          <div className="flex-1 p-4 overflow-auto">
            {children}
          </div>
        </div>
      )}

      {/* Collapsed State */}
      {widget.collapsed && (
        <div className="px-4 py-2 text-center text-xs text-pip-text-muted bg-pip-bg-secondary/10 border-t border-pip-border/50 cursor-pointer"
             onClick={handleToggleCollapse}>
          Click to expand widget
        </div>
      )}

      {/* Resize Handle */}
      {!widget.collapsed && !isDragOverlay && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-10",
            "bg-pip-bg-tertiary border border-pip-border rounded-tl-lg",
            "hover:bg-primary/20 hover:border-primary/50 transition-all duration-200",
            "flex items-center justify-center group",
            isResizing && "bg-primary/30 border-primary"
          )}
          onMouseDown={handleResizeStart}
        >
          <CornerDownRight className={cn(
            "w-3 h-3 text-pip-text-muted group-hover:text-primary transition-colors",
            isResizing && "text-primary"
          )} />
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <WidgetSettingsModal
          widgetId={widget.id}
          widgetType={widget.type}
          widgetTitle={widget.title}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsChange={(newSettings) => {
            onUpdate({ settings: newSettings as any });
          }}
          onDelete={() => onDelete(widget.id)}
          onDuplicate={onDuplicate ? () => onDuplicate(widget) : undefined}
        />
      )}
    </div>
  );
};