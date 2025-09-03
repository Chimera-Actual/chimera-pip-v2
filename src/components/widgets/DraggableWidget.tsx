import React, { useState } from 'react';
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

  console.log('🔧 DraggableWidget render:', widget.id, { isDragOverlay });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: widget.id,
    disabled: isDragOverlay
  });

  console.log('🔧 Sortable state:', { 
    id: widget.id, 
    isDragging, 
    transform, 
    disabled: isDragOverlay 
  });

  const { gestureProps } = useGestureHandler({
    onLongPress: () => {
      if (!isDragOverlay) {
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    // Use relative positioning for proper dnd-kit behavior
    width: widget.size?.width || 300,
    height: widget.size?.height || 200,
  };

  console.log('🎨 Widget style:', { 
    id: widget.id, 
    transform: CSS.Transform.toString(transform), 
    isDragging,
    rawTransform: transform 
  });

  const handleToggleCollapse = () => {
    onUpdate(widget.id, { collapsed: !widget.collapsed });
  };

  const handleResize = (size: { width: number; height: number }) => {
    onUpdate(widget.id, { size });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "pip-widget relative rounded-lg overflow-hidden transition-all duration-200",
        isDragging && "shadow-2xl scale-105 rotate-1 z-50 opacity-50",
        isDragOverlay && "shadow-3xl scale-110 rotate-2 z-[1000]",
        viewMode === 'masonry' && "break-inside-avoid mb-4",
        className
      )}
      {...gestureProps}
      onMouseDown={(e) => {
        console.log('🖱️ Widget container mouse down:', widget.id);
      }}
    >
      {/* Widget Header */}
      <div className="widget-header flex items-center justify-between p-3 bg-pip-bg-secondary/50 border-b border-pip-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag Handle */}
          <div
            className="drag-handle flex-shrink-0 p-2 cursor-grab active:cursor-grabbing hover:bg-pip-bg-tertiary rounded transition-colors touch-target select-none"
            {...listeners}
            {...attributes}
            style={{ touchAction: 'none' }}
            onMouseDown={(e) => {
              console.log('🖱️ Mouse down on drag handle:', widget.id);
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              console.log('👆 Touch start on drag handle:', widget.id);
              e.stopPropagation();
            }}
          >
            <Move className="w-4 h-4 text-pip-text-secondary pointer-events-none" />
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

      {/* Loading/Error Overlays */}
      {widget.collapsed && (
        <div className="p-2 text-center text-xs text-pip-text-muted">
          Widget collapsed
        </div>
      )}
    </div>
  );
};