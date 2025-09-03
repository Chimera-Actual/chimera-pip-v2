import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable';
import { Plus, Grid, List, Shuffle, ToggleLeft, ToggleRight } from 'lucide-react';
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

type ViewMode = 'free' | 'grid' | 'list';
type LayoutMode = 'free' | 'grid';

const LAYOUT_CONFIGS = {
  mobile: {
    free: { gap: 16, minWidth: 280, maxCols: 1, cellWidth: 320, cellHeight: 240, columns: 1 },
    grid: { gap: 16, cellWidth: 320, cellHeight: 240, columns: 1, minWidth: 320, maxCols: 1 }
  },
  tablet: {
    free: { gap: 20, minWidth: 300, maxCols: 2, cellWidth: 300, cellHeight: 240, columns: 2 },
    grid: { gap: 20, cellWidth: 300, cellHeight: 240, columns: 2, minWidth: 300, maxCols: 2 }
  },
  desktop: {
    free: { gap: 24, minWidth: 320, maxCols: 3, cellWidth: 320, cellHeight: 240, columns: 3 },
    grid: { gap: 24, cellWidth: 320, cellHeight: 240, columns: 3, minWidth: 320, maxCols: 3 }
  }
};

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
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('free');
  const [viewMode, setViewMode] = useState<ViewMode>('free');
  const [containerWidth, setContainerWidth] = useState(1200);
  const [draggedWidget, setDraggedWidget] = useState<BaseWidget | null>(null);

  // Get widgets for current tab
  const widgets = getWidgetsByTab(tab as any);
  
  // Smooth drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Determine current device type
  const deviceType = useMemo(() => {
    if (isMobile) return 'mobile';
    if (containerWidth < 1024) return 'tablet';
    return 'desktop';
  }, [isMobile, containerWidth]);

  // Get layout configuration
  const layoutConfig = LAYOUT_CONFIGS[deviceType][layoutMode];

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
        // Update positions for reordered widgets
        for (let i = 0; i < reorderedWidgets.length; i++) {
          await updateWidget(reorderedWidgets[i].id, { 
            position: { x: i * 20, y: 0 } 
          });
        }
      }
    }
  }, [widgets, updateWidget]);

  // Auto-arrange widgets in clean rows
  const handleAutoArrange = useCallback(async () => {
    if (widgets.length === 0) return;
    
    const widgetsPerRow = layoutMode === 'grid' ? layoutConfig.columns : Math.floor(containerWidth / (layoutConfig.minWidth || 300));
    
    for (let i = 0; i < widgets.length; i++) {
      const row = Math.floor(i / widgetsPerRow);
      const col = i % widgetsPerRow;
      
      await updateWidget(widgets[i].id, {
        position: {
          x: col * ((layoutConfig.cellWidth || 300) + layoutConfig.gap),
          y: row * ((layoutConfig.cellHeight || 240) + layoutConfig.gap)
        }
      });
    }
  }, [widgets, layoutMode, layoutConfig, containerWidth, updateWidget]);

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

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.widget-grid-container');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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
        layoutMode={layoutMode}
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
  }, [viewMode, layoutMode, handleWidgetUpdate, removeWidget, handleDuplicateWidget]);

  // Container styles based on layout mode
  const containerStyles = useMemo(() => {
    if (viewMode === 'list') {
      return {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: `${layoutConfig.gap}px`
      };
    }

    if (layoutMode === 'grid') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${layoutConfig.columns}, 1fr)`,
        gap: `${layoutConfig.gap}px`,
        alignItems: 'start'
      };
    }

    // Free layout (flexbox wrapping)
    return {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: `${layoutConfig.gap}px`,
      alignItems: 'flex-start'
    };
  }, [viewMode, layoutMode, layoutConfig]);

  const gridContent = (
    <div className={cn('space-y-6', className)}>
      {/* Layout Controls */}
      <div className="flex items-center justify-between gap-4 p-4 bg-secondary/30 rounded-lg border border-border pip-glow">
        <div className="flex items-center gap-4">
          {/* Layout Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground uppercase tracking-wide pip-text-glow">
              Layout:
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setLayoutMode(layoutMode === 'free' ? 'grid' : 'free');
                setViewMode(layoutMode === 'free' ? 'grid' : 'free');
              }}
              className="flex items-center gap-2 hover:bg-primary/20"
            >
              {layoutMode === 'free' ? (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  Free
                </>
              ) : (
                <>
                  <ToggleRight className="h-4 w-4" />
                  Grid
                </>
              )}
            </Button>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 border border-border rounded-md bg-secondary/20">
            <Button
              size="sm"
              variant={viewMode === 'free' ? 'default' : 'ghost'}
              onClick={() => {
                setViewMode('free');
                setLayoutMode('free');
              }}
              className={cn(
                "rounded-none border-0 pip-button-glow transition-colors",
                viewMode === 'free' 
                  ? 'bg-primary/20 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              )}
            >
              <Grid className="w-4 h-4" />
              Free
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline" 
            size="sm"
            onClick={handleAutoArrange}
            className="flex items-center gap-2 hover:bg-pip-green-primary/20"
          >
            <Shuffle className="h-4 w-4" />
            Auto Arrange
          </Button>
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
              strategy={rectSortingStrategy}
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