import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWidgets } from '@/contexts/WidgetContext';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetContainer } from './WidgetContainer';
import { WidgetType, BaseWidget, WidgetWidth } from '@/types/widgets';
import { cn } from '@/lib/utils';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { useIsMobile } from '@/hooks/use-mobile';
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
const SortableWidget: React.FC<{ widget: BaseWidget; onUpdate: (id: string, updates: Partial<BaseWidget>) => void; onDelete: (id: string) => void; onToggleWidth: (widget: BaseWidget) => void; isMobile: boolean }> = ({ widget, onUpdate, onDelete, onToggleWidth, isMobile }) => {
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

  const handleResize = () => {
    onToggleWidth(widget);
  };

  const handleMove = () => {
    // For keyboard accessibility, we can use the existing drag handlers
    // The actual drag-and-drop is handled by the sortable context
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        widget.widgetWidth === 'full' ? "col-span-2" : "col-span-1",
        isDragging && "z-50"
      )}
      {...attributes}
    >
      <WidgetContainer
        widgetId={widget.id}
        widgetType={widget.type}
        title={widget.title}
        collapsed={widget.collapsed}
        onToggleCollapse={() => onUpdate(widget.id, { collapsed: !widget.collapsed })}
        onSettingsChange={(settings) => onUpdate(widget.id, { settings })}
        onDelete={() => onDelete(widget.id)}
        onMove={handleMove}
        onResize={!isMobile ? handleResize : undefined}
        className="h-full"
      >
        <div className="widget-content pip-scrollbar">
          <WidgetRenderer widget={widget} />
        </div>
      </WidgetContainer>
      <div
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
    updateWidget
  } = useWidgets();
  
  const [showAdvancedCatalog, setShowAdvancedCatalog] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const widgets = getWidgetsByTab(tab as any).sort((a, b) => a.order - b.order);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddWidget = async (type: WidgetType) => {
    await addWidget(type, tab as any);
    setShowAdvancedCatalog(false);
  };

  const handleUpdateWidget = async (widgetId: string, updates: Partial<BaseWidget>) => {
    await updateWidget(widgetId, updates);
  };

  const handleDeleteWidget = async (widgetId: string) => {
    await removeWidget(widgetId);
  };

  const handleToggleWidth = async (widget: BaseWidget) => {
    const newWidth: WidgetWidth = widget.widgetWidth === 'half' ? 'full' : 'half';
    await handleUpdateWidget(widget.id, { widgetWidth: newWidth });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(widget => widget.id === active.id);
      const newIndex = widgets.findIndex(widget => widget.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newWidgets = arrayMove(widgets, oldIndex, newIndex);
        
        // Update order for all affected widgets
        for (let i = 0; i < newWidgets.length; i++) {
          if (newWidgets[i].order !== i) {
            await handleUpdateWidget(newWidgets[i].id, { order: i });
          }
        }
      }
    }
    
    setActiveId(null);
  };

  const activeWidget = widgets.find(widget => widget.id === activeId);

  const gridContent = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Widget Grid */}
        {widgets.length > 0 ? (
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className={cn(
              "grid gap-4 relative",
              isMobile ? "grid-cols-1" : "grid-cols-2"
            )}>
              {widgets.map(widget => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  onUpdate={handleUpdateWidget}
                  onDelete={handleDeleteWidget}
                  onToggleWidth={handleToggleWidth}
                  isMobile={isMobile}
                />
              ))}
              
              {/* Compact Add Widget Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowAdvancedCatalog(true)}
                      className="absolute -top-10 right-0 h-8 w-8 text-pip-text-primary border-pip-border/30 hover:bg-pip-green-primary/10 hover:border-pip-green-primary/50"
                    >
                      <div className="flex items-center justify-center">
                        <Plus className="h-3 w-3" />
                        <LayoutGrid className="h-3 w-3 -ml-1" />
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Widget</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SortableContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="max-w-md">
              <h3 className="text-lg font-medium text-pip-text-bright mb-2">No widgets yet</h3>
              <p className="text-sm text-pip-text-muted mb-4">
                Add your first widget to get started with your {tab} dashboard
              </p>
              <Button
                onClick={() => setShowAdvancedCatalog(true)}
                className="bg-pip-green-primary hover:bg-pip-green-secondary text-pip-bg-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </div>
          </div>
        )}

        {/* Advanced Widget Catalog Modal */}
        {showAdvancedCatalog && (
          <AdvancedWidgetCatalog
            onClose={() => setShowAdvancedCatalog(false)}
            onAddWidget={handleAddWidget}
            currentTab={tab as any}
          />
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeWidget ? (
            <div className="bg-pip-bg-overlay/80 backdrop-blur-sm border border-pip-border-bright rounded-lg p-3 transform rotate-3 shadow-2xl pip-glow">
              <div className="flex items-center gap-2 opacity-75">
                <div className="w-4 h-4 bg-pip-green-primary rounded-full animate-pulse" />
                <span className="text-sm text-pip-text-bright font-bold">{activeWidget.title}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );

  // Mobile view
  if (isMobile) {
    return (
      <div className={cn("p-4", className)}>
        {gridContent}
      </div>
    );
  }

  return (
    <div className={cn("p-4", className)}>
      {gridContent}
    </div>
  );
};