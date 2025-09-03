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
  const widgetRef = useRef<HTMLDivElement>(null);

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

  const style: React.CSSProperties = {
    ...externalStyle,
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
    touchAction: 'none',
    minHeight: widget.collapsed ? 'auto' : '160px',
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
        <div className="widget-content flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="p-4">
              {children}
            </div>
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