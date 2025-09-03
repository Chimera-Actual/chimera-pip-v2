import React, { useState, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MoreVertical, 
  Move, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { BaseWidget } from '@/types/widgets';
import { WidgetSettingsModal } from './WidgetSettingsModalPortal';
import { useGestureHandler } from '@/hooks/useGestureHandler';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  widget: BaseWidget;
  isDragOverlay?: boolean;
  viewMode: 'grid' | 'list' | 'masonry';
  children: React.ReactNode;
  onUpdate: (widgetId: string, updates: Partial<BaseWidget>) => void;
  onDelete: (widgetId: string) => void;
  onDuplicate?: (widget: BaseWidget) => void;
  className?: string;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  isDragOverlay = false,
  viewMode,
  children,
  onUpdate,
  onDelete,
  onDuplicate,
  className
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: string;
  } | null>(null);

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
    onUpdate(widget.id, { collapsed: !widget.collapsed });
  };

  const handleResize = (size: { width: number; height: number }) => {
    onUpdate(widget.id, { size });
  };

  // Resize functionality
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (isDragOverlay) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      direction
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = direction.includes('e') && direction.includes('s') ? 'se-resize' : 
                                 direction.includes('e') ? 'e-resize' : 's-resize';
    document.body.style.userSelect = 'none';
  }, [isDragOverlay]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeStartRef.current || !widgetRef.current) return;

    const { startX, startY, startWidth, startHeight, direction } = resizeStartRef.current;
    
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (direction.includes('e')) {
      newWidth = Math.max(200, startWidth + (e.clientX - startX));
    }
    if (direction.includes('s')) {
      newHeight = Math.max(150, startHeight + (e.clientY - startY));
    }

    // Apply size immediately for smooth resizing
    widgetRef.current.style.width = `${newWidth}px`;
    widgetRef.current.style.height = `${newHeight}px`;
  }, []);

  const handleResizeEnd = useCallback(() => {
    if (!resizeStartRef.current || !widgetRef.current) return;

    const rect = widgetRef.current.getBoundingClientRect();
    const newSize = {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };

    // Update the widget size in the parent
    onUpdate(widget.id, { size: newSize });

    // Cleanup
    setIsResizing(false);
    resizeStartRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [onUpdate, widget.id]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : isResizing ? 999 : 1,
    ...(viewMode === 'grid' ? {
      position: 'absolute',
      left: widget.position?.x || 0,
      top: widget.position?.y || 0,
      width: widget.size?.width || 300,
      height: widget.size?.height || 200,
    } : {
      width: widget.size?.width || 300,
      height: widget.size?.height || 200,
    }),
    touchAction: 'none',
    // Add subtle border when in grid mode for better visual feedback
    ...(viewMode === 'grid' ? {
      border: '1px solid hsl(var(--pip-border) / 0.3)',
    } : {})
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
        "pip-widget relative rounded-lg overflow-hidden",
        "transform-gpu will-change-transform",
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
        
        // Resizing state
        isResizing && "transition-none select-none",
        
        // View mode adjustments
        viewMode === 'masonry' && "break-inside-avoid mb-4",
        
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
        <div className="widget-content">
          {children}
        </div>
      )}


      {/* Comprehensive Settings Modal */}
      {showSettings && (
        <WidgetSettingsModal
          widgetId={widget.id}
          widgetType={widget.type}
          widgetTitle={widget.title}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsChange={(newSettings) => {
            console.log('Settings changed:', newSettings);
            onUpdate(widget.id, { settings: newSettings as any });
          }}
          onDelete={() => onDelete(widget.id)}
          onDuplicate={onDuplicate ? () => onDuplicate(widget) : undefined}
          onResize={(newSize) => {
            console.log('Resize requested:', newSize);
            onUpdate(widget.id, { size: newSize });
          }}
          currentSize={widget.size}
        />
      )}

      {/* Resize Handles */}
      {!widget.collapsed && !isDragOverlay && !isDragging && (
        <>
          {/* Right Edge Handle */}
          <div
            className="absolute right-0 top-8 bottom-8 w-1 cursor-e-resize opacity-0 hover:opacity-100 transition-opacity bg-primary/30 hover:bg-primary/60"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            style={{ touchAction: 'none' }}
          />
          
          {/* Bottom Edge Handle */}
          <div
            className="absolute bottom-0 left-8 right-8 h-1 cursor-s-resize opacity-0 hover:opacity-100 transition-opacity bg-primary/30 hover:bg-primary/60"
            onMouseDown={(e) => handleResizeStart(e, 's')}
            style={{ touchAction: 'none' }}
          />
          
          {/* Corner Handle (most important for user experience) */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-all duration-200 bg-primary/50 hover:bg-primary/80 hover:scale-110"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            style={{ 
              touchAction: 'none',
              clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
            }}
          />
          
          {/* Corner Visual Indicator */}
          <div className="absolute bottom-1 right-1 w-2 h-2 pointer-events-none opacity-30">
            <div className="w-full h-px bg-pip-text-secondary mb-px"></div>
            <div className="w-full h-px bg-pip-text-secondary"></div>
          </div>
        </>
      )}

      {/* Loading/Error Overlays */}
      {widget.collapsed && (
        <div className="p-2 text-center text-xs text-pip-text-muted">
          Widget collapsed
        </div>
      )}
    </div>
  );
};