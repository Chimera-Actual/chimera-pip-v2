import React, { useState, useCallback, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable';
import { Plus, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidgets } from '@/contexts/WidgetContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { PullToRefresh } from '@/components/common/PullToRefresh';
import { DraggableWidget } from './DraggableWidget';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetType, BaseWidget } from '@/types/widgets';
import { cn } from '@/lib/utils';

interface ResponsiveWidgetGridProps {
  tab: string;
  className?: string;
}

type ViewMode = 'grid' | 'list';

export const ResponsiveWidgetGrid: React.FC<ResponsiveWidgetGridProps> = ({ 
  tab, 
  className 
}) => {
  const { 
    getWidgetsByTab, 
    addWidget, 
    removeWidget, 
    updateWidget, 
    refreshWidgets, 
    isLoading 
  } = useWidgets();
  
  const isMobile = useIsMobile();
  const [showAdvancedCatalog, setShowAdvancedCatalog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [draggedWidget, setDraggedWidget] = useState<BaseWidget | null>(null);

  // Get widgets for current tab, sorted by order
  const widgets = getWidgetsByTab(tab as any).sort((a, b) => a.order - b.order);
  
  // Smooth drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Simple drag and drop handlers
  const handleDragStart = useCallback((event: DragEndEvent) => {
    const widget = widgets.find(w => w.id === event.active.id);
    setDraggedWidget(widget || null);
  }, [widgets]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedWidget(null);

    if (active && over && active.id !== over.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
        // Update order for reordered widgets
        for (let i = 0; i < reorderedWidgets.length; i++) {
          await updateWidget(reorderedWidgets[i].id, { 
            order: i 
          });
        }
      }
    }
  }, [widgets, updateWidget]);

  // Widget update handler
  const handleWidgetUpdate = useCallback(async (widgetId: string, updates: Partial<BaseWidget>) => {
    await updateWidget(widgetId, updates);
  }, [updateWidget]);

  const handleDuplicateWidget = useCallback(async (widget: BaseWidget) => {
    const newWidget = await addWidget(widget.type, widget.tabAssignment);
    if (newWidget) {
      await updateWidget(newWidget.id, { 
        settings: widget.settings,
        size: widget.size
      });
    }
  }, [addWidget, updateWidget]);

  const handleAddWidget = useCallback(async (type: WidgetType) => {
    const widget = await addWidget(type, tab as any);
    if (widget) {
      setShowAdvancedCatalog(false);
    }
  }, [addWidget, tab]);

  const handleRefresh = useCallback(async () => {
    await refreshWidgets();
  }, [refreshWidgets]);

  // Render widget based on view mode
  const renderWidget = useCallback((widget: BaseWidget, isDragOverlay = false) => {
    if (viewMode === 'list') {
      return (
        <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg border border-border">
          <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-primary rounded" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{widget.title}</h3>
            <p className="text-sm text-muted-foreground">{widget.type}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => handleWidgetUpdate(widget.id, { collapsed: !widget.collapsed })}>
              {widget.collapsed ? 'Expand' : 'Collapse'}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => removeWidget(widget.id)}>
              Remove
            </Button>
          </div>
        </div>
      );
    }

    return (
      <DraggableWidget
        widget={widget}
        isDragOverlay={isDragOverlay}
        onUpdate={handleWidgetUpdate}
        onDelete={removeWidget}
        onDuplicate={handleDuplicateWidget}
        className={cn(
          "transition-all duration-300 ease-in-out",
          isDragOverlay && "rotate-3 shadow-2xl scale-105 z-50"
        )}
      >
        <WidgetRenderer widget={widget} />
      </DraggableWidget>
    );
  }, [viewMode, handleWidgetUpdate, removeWidget, handleDuplicateWidget]);

  // Container styles based on view mode
  const containerStyles = useMemo(() => {
    if (viewMode === 'list') {
      return {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px'
      };
    }

    // Grid layout (flexbox wrapping)
    return {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '24px',
      alignItems: 'flex-start'
    };
  }, [viewMode]);

  const gridContent = (
    <div className={cn('space-y-6', className)}>
      {/* Layout Controls */}
      <div className="flex items-center justify-between gap-4 p-4 bg-secondary/30 rounded-lg border border-border pip-glow">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-foreground uppercase tracking-wide pip-text-glow">
            View:
          </span>
          
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 border border-border rounded-md bg-secondary/20">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-none border-0 pip-button-glow transition-colors",
                viewMode === 'grid' 
                  ? 'bg-primary/20 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              )}
            >
              <Grid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-none border-0 pip-button-glow transition-colors",
                viewMode === 'list' 
                  ? 'bg-primary/20 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              )}
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Widget Container */}
      <div className="widget-container min-h-[400px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="widgets-layout"
            style={containerStyles}
          >
            <SortableContext 
              items={widgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              {widgets.map((widget) => renderWidget(widget))}
            </SortableContext>
          </div>

          {/* Drag Overlay */}
          <DragOverlay adjustScale={false}>
            {draggedWidget && renderWidget(draggedWidget, true)}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Widget Button */}
      <Button
        variant="outline"
        size={isMobile ? "touch-large" : "default"}
        className="w-full h-32 border-2 border-dashed border-border hover:border-primary/50 bg-transparent hover:bg-secondary/30 transition-all duration-200 group pip-glow"
        disabled={isLoading}
        onClick={() => setShowAdvancedCatalog(true)}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
          <Plus className="h-8 w-8" />
          <span className="font-mono text-sm pip-text-glow">ADD WIDGET</span>
        </div>
      </Button>

      {/* Advanced Widget Catalog */}
      {showAdvancedCatalog && (
        <AdvancedWidgetCatalog
          currentTab={tab}
          onAddWidget={handleAddWidget}
          onClose={() => setShowAdvancedCatalog(false)}
        />
      )}

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-12">
          <div className="p-8 max-w-md mx-auto border border-border rounded-lg bg-secondary/20 pip-glow">
            <div className="text-muted-foreground font-mono mb-4 pip-text-glow">
              No widgets in this tab yet
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Click "ADD WIDGET" above to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Return with pull-to-refresh on mobile
  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh}>
      {gridContent}
    </PullToRefresh>
  ) : (
    gridContent
  );
};