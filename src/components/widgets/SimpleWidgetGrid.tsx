import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WidgetContainer } from './WidgetContainer';
import { WidgetRenderer } from './WidgetRegistry';
import { BaseWidget, WidgetType, WidgetWidth } from '@/types/widgets';
import { useWidgets } from '@/contexts/WidgetContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { Plus, LayoutGrid, ArrowLeftRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SimpleWidgetGridProps {
  tab: string;
  className?: string;
}

// Sortable Widget Component
const SortableWidget: React.FC<{ widget: BaseWidget; onUpdate: (id: string, updates: Partial<BaseWidget>) => void; onDelete: (id: string) => void; onArchive: (id: string) => void; onToggleWidth: (widget: BaseWidget) => void; isMobile: boolean }> = ({ widget, onUpdate, onDelete, onArchive, onToggleWidth, isMobile }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        widget.widgetWidth === 'full' ? 'col-span-2' : 'col-span-1'
      )}
    >
      <WidgetContainer
        widgetId={widget.id}
        onUpdate={onUpdate}
        onDelete={() => onDelete(widget.id)}
        onArchive={() => onArchive(widget.id)}
        onToggleWidth={() => onToggleWidth(widget)}
        isMobile={isMobile}
      >
        <WidgetRenderer widget={widget} />
      </WidgetContainer>
      
      {/* Drag handle - positioned in top-left corner */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-8 w-6 h-6 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export const SimpleWidgetGrid: React.FC<SimpleWidgetGridProps> = ({ tab, className = '' }) => {
  const { 
    getWidgetsByTab, 
    addWidget, 
    removeWidget, 
    archiveWidget,
    updateWidget
  } = useWidgets();
  
  // Performance monitoring
  const { markRenderStart, markRenderEnd, trackMemoryUsage } = usePerformanceMonitor('SimpleWidgetGrid');
  
  // Track render performance
  React.useLayoutEffect(() => {
    markRenderStart();
    return markRenderEnd;
  });

  // Track memory usage on widget count changes
  const allWidgets = getWidgetsByTab(tab as any);
  React.useEffect(() => {
    if (allWidgets.length > 10) { // Monitor memory when many widgets
      trackMemoryUsage();
    }
  }, [allWidgets.length, trackMemoryUsage]);

  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  
  // Get widgets for current tab
  const widgets = allWidgets;

  const handleAddWidget = useCallback((widgetType: WidgetType) => {
    addWidget(widgetType, tab as any);
    setShowAddWidget(false);
  }, [addWidget, tab]);

  const handleDelete = useCallback((widgetId: string) => {
    removeWidget(widgetId);
  }, [removeWidget]);

  const handleArchive = useCallback((widgetId: string) => {
    archiveWidget(widgetId);
  }, [archiveWidget]);

  const handleUpdate = useCallback((widgetId: string, updates: Partial<BaseWidget>) => {
    updateWidget(widgetId, updates);
  }, [updateWidget]);

  const handleToggleWidth = useCallback((widget: BaseWidget) => {
    const newWidth: WidgetWidth = widget.widgetWidth === 'full' ? 'half' : 'full';
    updateWidget(widget.id, { widgetWidth: newWidth });
  }, [updateWidget]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over?.id);
      
      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
      
      // Update positions
      reorderedWidgets.forEach((widget, index) => {
        updateWidget(widget.id, { order: index });
      });
    }
    
    setActiveId(null);
  };

  const activeWidget = widgets.find(w => w.id === activeId);

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className={cn(
            'grid gap-4 auto-rows-max',
            isMobile ? 'grid-cols-1' : 'grid-cols-2'
          )}>
            {widgets.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <LayoutGrid className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No widgets in this tab</h3>
                  <p className="text-muted-foreground mb-4">Add your first widget to get started</p>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => setShowAddWidget(true)}
                          className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          <LayoutGrid className="w-4 h-4 mr-2" />
                          Add Widget
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add a new widget to this tab</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ) : (
              <>
                {widgets.map((widget) => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onToggleWidth={handleToggleWidth}
                    isMobile={isMobile}
                  />
                ))}
                
                <div className="col-span-1 flex items-center justify-center">
                  <Button
                    onClick={() => setShowAddWidget(true)}
                    variant="outline"
                    className="w-full h-24 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  >
                    <Plus className="w-6 h-6 text-primary" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeWidget ? (
            <div className={cn(
              "bg-background border border-border rounded-lg shadow-lg opacity-80",
              activeWidget.widgetWidth === 'full' ? 'w-full' : 'w-1/2'
            )}>
              <WidgetContainer
                widgetId={activeWidget.id}
                onUpdate={handleUpdate}
                onDelete={() => handleDelete(activeWidget.id)}
                onArchive={() => handleArchive(activeWidget.id)}
                onToggleWidth={() => handleToggleWidth(activeWidget)}
                isMobile={isMobile}
              >
                <WidgetRenderer widget={activeWidget} />
              </WidgetContainer>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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