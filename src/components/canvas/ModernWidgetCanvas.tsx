import React, { useState, useRef, useCallback, useMemo } from 'react';
import { BaseWidget, WidgetType } from '@/types/widgets';
import { WidgetContainer } from '@/components/widgets/WidgetContainer';
import { WidgetRenderer } from '@/components/widgets/WidgetRegistry';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { useCanvas } from '@/contexts/CanvasContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export interface ModernWidgetCanvasProps {
  tab: string;
  className?: string;
}

interface DragState {
  isDragging: boolean;
  draggedWidget: BaseWidget | null;
  dragOverIndex: number | null;
  dragStartIndex: number | null;
}

export const ModernWidgetCanvas: React.FC<ModernWidgetCanvasProps> = ({ 
  tab, 
  className = '' 
}) => {
  const { 
    getCanvasWidgets, 
    optimisticAdd, 
    optimisticUpdate, 
    optimisticDelete, 
    optimisticArchive,
    optimisticReorder 
  } = useCanvas();
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedWidget: null,
    dragOverIndex: null,
    dragStartIndex: null,
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Get widgets for current tab, sorted by display_order
  const widgets = useMemo(() => {
    return getCanvasWidgets(tab as any).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [getCanvasWidgets, tab]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, widget: BaseWidget, index: number) => {
    setDragState({
      isDragging: true,
      draggedWidget: widget,
      dragOverIndex: null,
      dragStartIndex: index,
    });

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widget.id);
    
    // Add visual feedback to drag image
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    setDragState({
      isDragging: false,
      draggedWidget: null,
      dragOverIndex: null,
      dragStartIndex: null,
    });
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      dragOverIndex: index,
    }));
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    const { draggedWidget, dragStartIndex } = dragState;
    
    if (!draggedWidget || dragStartIndex === null || dragStartIndex === dropIndex) {
      return;
    }

    try {
      const success = await optimisticReorder(tab as any, dragStartIndex, dropIndex);
      
      if (success) {
        toast({
          title: 'Widget Moved',
          description: `Moved "${draggedWidget.title}" to position ${dropIndex + 1}`,
        });
      } else {
        throw new Error('Reorder operation failed');
      }
    } catch (error) {
      console.error('Failed to reorder widgets:', error);
      toast({
        title: 'Error',
        description: 'Failed to move widget. Please try again.',
        variant: 'destructive',
      });
    }
  }, [dragState, tab, optimisticReorder]);

  // Handle widget actions
  const handleAddWidget = useCallback(async (widgetType: WidgetType) => {
    try {
      const newWidget = await optimisticAdd(tab as any, widgetType);
      setShowAddWidget(false);
      toast({
        title: 'Widget Added',
        description: 'New widget has been added to your dashboard.',
      });
    } catch (error) {
      console.error('Failed to add widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to add widget. Please try again.',
        variant: 'destructive',
      });
    }
  }, [optimisticAdd, tab]);

  const handleUpdateWidget = useCallback(async (widgetId: string, updates: Partial<BaseWidget>) => {
    try {
      await optimisticUpdate(widgetId, updates);
    } catch (error) {
      console.error('Failed to update widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to update widget. Please try again.',
        variant: 'destructive',
      });
    }
  }, [optimisticUpdate]);

  const handleDeleteWidget = useCallback(async (widgetId: string) => {
    try {
      await optimisticDelete(widgetId);
      toast({
        title: 'Widget Deleted',
        description: 'Widget has been permanently removed.',
      });
    } catch (error) {
      console.error('Failed to delete widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete widget. Please try again.',
        variant: 'destructive',
      });
    }
  }, [optimisticDelete]);

  const handleArchiveWidget = useCallback(async (widgetId: string) => {
    try {
      await optimisticArchive(widgetId);
      toast({
        title: 'Widget Archived',
        description: 'Widget has been moved to archive.',
      });
    } catch (error) {
      console.error('Failed to archive widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive widget. Please try again.',
        variant: 'destructive',
      });
    }
  }, [optimisticArchive]);

  const handleToggleWidth = useCallback(async (widgetId: string, currentWidth: 'half' | 'full') => {
    const newWidth = currentWidth === 'half' ? 'full' : 'half';
    await handleUpdateWidget(widgetId, { widgetWidth: newWidth });
  }, [handleUpdateWidget]);

  // Render drag placeholder
  const renderDragPlaceholder = useCallback((index: number) => {
    if (dragState.dragOverIndex !== index || !dragState.isDragging) {
      return null;
    }

    return (
      <div className="col-span-full h-2 bg-pip-green-primary/30 rounded-lg border-2 border-dashed border-pip-green-primary animate-pulse" />
    );
  }, [dragState]);

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Canvas Container */}
      <div 
        ref={canvasRef}
        className={cn(
          'grid gap-4 auto-rows-max transition-all duration-200 relative',
          isMobile ? 'grid-cols-1' : 'grid-cols-2',
          dragState.isDragging && 'select-none'
        )}
      >
        {widgets.length === 0 ? (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-pip-green-primary/30 rounded-lg bg-pip-bg/20">
            <div className="text-center space-y-4">
              <Plus className="w-12 h-12 text-pip-green-primary/60 mx-auto" />
              <div>
                <h3 className="text-lg font-pip-mono text-pip-green-primary font-semibold">
                  No Widgets Yet
                </h3>
                <p className="text-pip-green-primary/70 mt-2">
                  Add your first widget to get started with your dashboard.
                </p>
              </div>
              <button
                onClick={() => setShowAddWidget(true)}
                className="px-6 py-2 bg-pip-green-primary text-pip-bg font-pip-mono rounded-lg hover:bg-pip-green-primary/80 transition-colors"
              >
                Add Widget
              </button>
            </div>
          </div>
        ) : (
          // Render widgets
          widgets.map((widget, index) => (
            <React.Fragment key={widget.id}>
              {renderDragPlaceholder(index)}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, widget, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  'transition-all duration-200 cursor-move',
                  widget.widgetWidth === 'full' && !isMobile && 'col-span-2',
                  dragState.isDragging && dragState.draggedWidget?.id === widget.id && 'opacity-50 transform scale-95',
                  dragState.dragOverIndex === index && 'transform scale-105'
                )}
              >
                <WidgetContainer
                  widgetId={widget.id}
                  widgetType={widget.type}
                  title={widget.title}
                  customIcon={widget.customIcon}
                  widgetWidth={widget.widgetWidth}
                  collapsed={widget.collapsed}
                  onToggleCollapse={() => {
                    handleUpdateWidget(widget.id, { collapsed: !widget.collapsed });
                  }}
                  onSettingsChange={(settings) => {
                    handleUpdateWidget(widget.id, { settings });
                  }}
                  onTitleChange={(title) => {
                    handleUpdateWidget(widget.id, { title });
                  }}
                  onIconChange={(customIcon) => {
                    handleUpdateWidget(widget.id, { customIcon });
                  }}
                  onToggleWidth={() => {
                    handleToggleWidth(widget.id, widget.widgetWidth);
                  }}
                  onDelete={() => {
                    handleDeleteWidget(widget.id);
                  }}
                  onArchive={() => {
                    handleArchiveWidget(widget.id);
                  }}
                  onMove={null} // Drag-and-drop is handled directly by the canvas
                  className="h-full"
                >
                  <WidgetRenderer widget={widget} />
                </WidgetContainer>
              </div>
              {index === widgets.length - 1 && renderDragPlaceholder(index + 1)}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Add Widget Button - Only shown when widgets exist */}
      {widgets.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pip-green-primary/20 text-pip-green-primary border border-pip-green-primary/30 rounded-lg hover:bg-pip-green-primary/30 transition-colors font-pip-mono"
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </button>
        </div>
      )}

      {/* Widget Catalog Modal */}
      {showAddWidget && (
        <AdvancedWidgetCatalog
          onClose={() => setShowAddWidget(false)}
          onAddWidget={handleAddWidget}
          currentTab={tab}
        />
      )}
    </div>
  );
};