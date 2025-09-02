import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MoreVertical, 
  Move, 
  Settings, 
  X, 
  ChevronUp, 
  ChevronDown,
  Maximize2,
  Minimize2 
} from 'lucide-react';
import { BaseWidget } from '@/types/widgets';
import { WidgetSettingsModal } from './WidgetSettingsModal';
import { useGestureHandler } from '@/hooks/useGestureHandler';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  widget: BaseWidget;
  isDragOverlay?: boolean;
  viewMode: 'grid' | 'list' | 'masonry';
  children: React.ReactNode;
  onUpdate: (widgetId: string, updates: Partial<BaseWidget>) => void;
  onDelete: (widgetId: string) => void;
  className?: string;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  isDragOverlay = false,
  viewMode,
  children,
  onUpdate,
  onDelete,
  className
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

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

  const { gestureProps } = useGestureHandler({
    onLongPress: () => {
      if (!isDragOverlay) {
        setShowContextMenu(true);
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
  };

  const handleToggleCollapse = () => {
    onUpdate(widget.id, { collapsed: !widget.collapsed });
    setShowContextMenu(false);
  };

  const handleDelete = () => {
    onDelete(widget.id);
    setShowContextMenu(false);
  };

  const handleResize = (direction: 'expand' | 'shrink') => {
    const currentWidth = widget.size?.width || 300;
    const currentHeight = widget.size?.height || 200;
    
    const newSize = direction === 'expand' 
      ? { width: currentWidth * 1.2, height: currentHeight * 1.2 }
      : { width: currentWidth * 0.8, height: currentHeight * 0.8 };

    // Constrain to reasonable limits
    newSize.width = Math.max(200, Math.min(800, newSize.width));
    newSize.height = Math.max(150, Math.min(600, newSize.height));

    onUpdate(widget.id, { size: newSize });
    setShowContextMenu(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "pip-widget relative rounded-lg overflow-hidden transition-all duration-200",
        isDragging && "shadow-2xl scale-105 rotate-1",
        isDragOverlay && "shadow-3xl scale-110 rotate-2 z-50",
        viewMode === 'masonry' && "break-inside-avoid mb-4",
        className
      )}
      {...gestureProps}
      {...attributes}
    >
      {/* Widget Header */}
      <div className="widget-header flex items-center justify-between p-3 bg-pip-bg-secondary/50 border-b border-pip-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag Handle */}
          <div
            className="drag-handle flex-shrink-0 p-1 cursor-grab active:cursor-grabbing hover:bg-pip-bg-tertiary rounded transition-colors touch-target"
            {...listeners}
          >
            <Move className="w-4 h-4 text-pip-text-secondary" />
          </div>
          
          <h3 className="text-sm font-semibold text-pip-text-bright uppercase tracking-wide truncate">
            {widget.title}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Actions */}
          <button
            className="widget-control-button p-2 text-pip-text-secondary hover:text-pip-text-bright hover:bg-pip-bg-tertiary rounded transition-colors touch-target"
            onClick={handleToggleCollapse}
            aria-label={widget.collapsed ? 'Expand widget' : 'Collapse widget'}
          >
            {widget.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Context Menu Button */}
          <button
            className="widget-control-button p-2 text-pip-text-secondary hover:text-pip-text-bright hover:bg-pip-bg-tertiary rounded transition-colors touch-target"
            onClick={() => setShowContextMenu(!showContextMenu)}
            aria-label="Widget options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div className="absolute top-full right-2 mt-2 w-48 bg-pip-bg-secondary border border-pip-border rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="py-2">
            <button
              className="w-full px-4 py-2 text-left text-sm text-pip-text-secondary hover:bg-pip-bg-tertiary hover:text-pip-text-bright flex items-center gap-3 touch-target"
              onClick={() => {
                setShowSettings(true);
                setShowContextMenu(false);
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            <button
              className="w-full px-4 py-2 text-left text-sm text-pip-text-secondary hover:bg-pip-bg-tertiary hover:text-pip-text-bright flex items-center gap-3 touch-target"
              onClick={() => handleResize('expand')}
            >
              <Maximize2 className="w-4 h-4" />
              Expand Size
            </button>
            
            <button
              className="w-full px-4 py-2 text-left text-sm text-pip-text-secondary hover:bg-pip-bg-tertiary hover:text-pip-text-bright flex items-center gap-3 touch-target"
              onClick={() => handleResize('shrink')}
            >
              <Minimize2 className="w-4 h-4" />
              Shrink Size
            </button>
            
            <div className="border-t border-pip-border my-1" />
            
            <button
              className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/20 flex items-center gap-3 touch-target"
              onClick={handleDelete}
            >
              <X className="w-4 h-4" />
              Remove Widget
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for context menu */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(false)}
        />
      )}

      {/* Widget Content */}
      {!widget.collapsed && (
        <div className="widget-content">
          {children}
        </div>
      )}

      {/* Resize Handles - Desktop only */}
      {!widget.collapsed && viewMode === 'grid' && (
        <>
          {/* Corner resize handle */}
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize hover:bg-primary/20 transition-colors hidden md:block"
            onMouseDown={() => setIsResizing(true)}
            onMouseUp={() => setIsResizing(false)}
          >
            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-pip-border" />
          </div>

          {/* Edge resize handles */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-2 cursor-s-resize hover:bg-primary/20 transition-colors hidden md:block" />
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-6 cursor-e-resize hover:bg-primary/20 transition-colors hidden md:block" />
        </>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <WidgetSettingsModal
          widgetId={widget.id}
          widgetType={widget.type}
          widgetTitle={widget.title}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsChange={(settings) => onUpdate(widget.id, { settings: settings as any })}
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