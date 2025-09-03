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
import { Plus, Grid, List, Shuffle, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidgets } from '@/contexts/WidgetContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { PullToRefresh } from '@/components/common/PullToRefresh';
import { DraggableWidget } from './DraggableWidget';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetType, BaseWidget } from '@/types/widgets';
import { SimpleDragTest } from './SimpleDragTest';
import { cn } from '@/lib/utils';

interface ResponsiveWidgetGridProps {
  tab: string;
  className?: string;
}

type ViewMode = 'grid' | 'list' | 'masonry';
type GridDensity = 'comfortable' | 'compact' | 'dense';

const GRID_CONFIGS = {
  mobile: {
    comfortable: { columns: 1, gap: 16, cellSize: { width: 320, height: 200 } },
    compact: { columns: 1, gap: 12, cellSize: { width: 320, height: 180 } },
    dense: { columns: 1, gap: 8, cellSize: { width: 320, height: 160 } }
  },
  tablet: {
    comfortable: { columns: 2, gap: 20, cellSize: { width: 350, height: 220 } },
    compact: { columns: 2, gap: 16, cellSize: { width: 320, height: 200 } },
    dense: { columns: 3, gap: 12, cellSize: { width: 280, height: 180 } }
  },
  desktop: {
    comfortable: { columns: 3, gap: 24, cellSize: { width: 400, height: 250 } },
    compact: { columns: 4, gap: 20, cellSize: { width: 350, height: 220 } },
    dense: { columns: 5, gap: 16, cellSize: { width: 300, height: 200 } }
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [gridDensity, setGridDensity] = useState<GridDensity>('comfortable');
  const [containerWidth, setContainerWidth] = useState(1200);
  const [draggedWidget, setDraggedWidget] = useState<BaseWidget | null>(null);

  // Sort widgets by position for consistent display
  const widgets = getWidgetsByTab(tab as any);
  const sortedWidgets = useMemo(() => {
    return [...widgets].sort((a, b) => {
      const aPos = a.position?.x ?? 999;
      const bPos = b.position?.x ?? 999;
      return aPos - bPos;
    });
  }, [widgets]);

  // Smooth drag sensors with better activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Determine current device and grid config
  const deviceType = useMemo(() => {
    if (isMobile) return 'mobile';
    if (containerWidth < 1024) return 'tablet';
    return 'desktop';
  }, [isMobile, containerWidth]);

  const gridConfig = useMemo(() => ({
    ...GRID_CONFIGS[deviceType][gridDensity],
    containerWidth
  }), [deviceType, gridDensity, containerWidth]);

  // Smooth drag start handler
  const handleDragStart = useCallback((event: DragEndEvent) => {
    const widget = sortedWidgets.find(w => w.id === event.active.id);
    setDraggedWidget(widget || null);
  }, [sortedWidgets]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    setDraggedWidget(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedWidgets.findIndex((widget) => widget.id === active.id);
    const newIndex = sortedWidgets.findIndex((widget) => widget.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    try {
      const reorderedWidgets = arrayMove(sortedWidgets, oldIndex, newIndex);
      
      // Update positions smoothly
      for (let i = 0; i < reorderedWidgets.length; i++) {
        const widget = reorderedWidgets[i];
        await updateWidget(widget.id, { 
          position: { x: i, y: 0 }
        });
      }
    } catch (error) {
      console.error('Error during reordering:', error);
    }
  }, [sortedWidgets, updateWidget]);

  // Auto-arrange widgets to optimize space usage  
  const handleAutoArrange = useCallback(async () => {
    if (sortedWidgets.length === 0) return;
    
    console.log('🔄 Auto-arranging widgets...');
    
    try {
      // Simple grid packing algorithm
      const { columns } = gridConfig;
      const positions: { [key: string]: { x: number; y: number } } = {};
      
      // Sort widgets by area (larger first for better packing)
      const sortedBySize = [...sortedWidgets].sort((a, b) => {
        const aArea = (a.size?.width || 300) * (a.size?.height || 200);
        const bArea = (b.size?.width || 300) * (b.size?.height || 200);
        return bArea - aArea;
      });
      
      let currentRow = 0;
      let currentCol = 0;
      let rowHeight = 0;
      
      for (const widget of sortedBySize) {
        const widgetWidth = widget.size?.width || 300;
        const widgetHeight = widget.size?.height || 200;
        
        // Calculate grid cells occupied
        const cellsWide = Math.ceil(widgetWidth / (gridConfig.cellSize.width + gridConfig.gap));
        const cellsHigh = Math.ceil(widgetHeight / (gridConfig.cellSize.height + gridConfig.gap));
        
        // Check if widget fits in current row
        if (currentCol + cellsWide > columns) {
          // Move to next row
          currentRow += Math.max(1, rowHeight);
          currentCol = 0;
          rowHeight = 0;
        }
        
        // Place widget
        positions[widget.id] = { x: currentCol, y: currentRow };
        
        // Update position for next widget
        currentCol += cellsWide;
        rowHeight = Math.max(rowHeight, cellsHigh);
      }
      
      // Update all widget positions
      for (const widget of sortedWidgets) {
        const newPosition = positions[widget.id];
        if (newPosition) {
          await updateWidget(widget.id, { position: newPosition });
        }
      }
      
      console.log('✅ Auto-arrangement complete');
      
    } catch (error) {
      console.error('❌ Error during auto-arrangement:', error);
    }
  }, [sortedWidgets, gridConfig, updateWidget]);

  // Enhanced widget update with auto-reflow
  const handleWidgetUpdate = useCallback(async (widgetId: string, updates: Partial<BaseWidget>) => {
    const oldWidget = sortedWidgets.find(w => w.id === widgetId);
    const sizeChanged = updates.size && oldWidget?.size && 
      (updates.size.width !== oldWidget.size.width || updates.size.height !== oldWidget.size.height);
    
    // Update the widget first
    await updateWidget(widgetId, updates);
    
    // If size changed, trigger auto-arrangement after a short delay
    if (sizeChanged) {
      setTimeout(() => {
        handleAutoArrange();
      }, 300);
    }
  }, [sortedWidgets, updateWidget, handleAutoArrange]);

  const handleDuplicateWidget = useCallback(async (widget: BaseWidget) => {
    const newWidget = await addWidget(widget.type, widget.tabAssignment);
    if (newWidget) {
      const newPosition = {
        x: (widget.position?.x || 0) + 20,
        y: (widget.position?.y || 0) + 20
      };
      await updateWidget(newWidget.id, { 
        position: newPosition,
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
        viewMode={viewMode}
        onUpdate={handleWidgetUpdate}
        onDelete={removeWidget}
        onDuplicate={handleDuplicateWidget}
        className={cn(
          "transition-all duration-300 ease-in-out",
          "hover:shadow-lg hover:scale-[1.02]",
          isDragOverlay && "rotate-3 shadow-2xl scale-105 z-50"
        )}
      >
        <WidgetRenderer widget={widget} />
      </DraggableWidget>
    );
  }, [viewMode, handleWidgetUpdate, removeWidget, handleDuplicateWidget]);

  // Grid styles based on configuration
  const gridStyles = useMemo(() => {
    if (viewMode === 'list') {
      return {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: `${gridConfig.gap}px`
      };
    }

    if (viewMode === 'masonry') {
      return {
        columnCount: gridConfig.columns,
        columnGap: `${gridConfig.gap}px`,
        columnFill: 'balance' as const
      };
    }

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
      gap: `${gridConfig.gap}px`,
      alignItems: 'start'
    };
  }, [viewMode, gridConfig]);

  const gridContent = (
    <div className={cn('space-y-6', className)}>
      {/* Simple Drag Test - Temporary */}
      <div className="p-4 bg-pip-bg-secondary/30 rounded-lg border border-pip-border">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide pip-text-glow mb-4">
          🧪 DRAG TEST - If this works, the issue is in our widget setup
        </h3>
        <SimpleDragTest />
      </div>

      {/* Grid Controls */}
      <div className="flex items-center justify-between gap-4 p-4 bg-secondary/30 rounded-lg border border-border pip-glow">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground uppercase tracking-wide pip-text-glow">
            View Mode:
          </span>
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
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoArrange}
            disabled={isLoading || sortedWidgets.length === 0}
            className="pip-button-glow border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Auto-Arrange
          </Button>
          
          <select
            className="px-3 py-1 text-sm bg-secondary border border-border rounded text-foreground pip-glow focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={gridDensity}
            onChange={(e) => setGridDensity(e.target.value as GridDensity)}
            disabled={viewMode === 'list'}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
            <option value="dense">Dense</option>
          </select>
        </div>
      </div>

        {/* Widget Grid - Simplified like working test */}
        <div className="widget-grid-container relative min-h-[600px]">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sortedWidgets.map(w => w.id)} 
              strategy={rectSortingStrategy}
            >
              <div 
                className="widgets-responsive-grid grid" 
                style={gridStyles}
              >
                {sortedWidgets.map((widget, index) => (
                  <DraggableWidget
                    key={widget.id}
                    widget={widget}
                    isDragOverlay={false}
                    viewMode={viewMode}
                    onUpdate={handleWidgetUpdate}
                    onDelete={removeWidget}
                    onDuplicate={handleDuplicateWidget}
                    className={cn(
                      "transition-all duration-300 ease-in-out",
                      "hover:shadow-lg hover:scale-[1.02] hover:z-10"
                    )}
                  >
                    <WidgetRenderer widget={widget} />
                  </DraggableWidget>
                ))}
              </div>
            </SortableContext>

            {/* Smooth Drag Overlay */}
            <DragOverlay
              adjustScale={false}
              style={{
                cursor: 'grabbing',
              }}
            >
              {draggedWidget ? (
                <div className={cn(
                  "transform-gpu",
                  "opacity-95 rotate-3 scale-110",
                  "shadow-2xl shadow-primary/20",
                  "transition-all duration-200 ease-out",
                  "animate-pulse"
                )}>
                  <DraggableWidget
                    widget={draggedWidget}
                    isDragOverlay={true}
                    viewMode={viewMode}
                    onUpdate={handleWidgetUpdate}
                    onDelete={removeWidget}
                    onDuplicate={handleDuplicateWidget}
                    className="pointer-events-none"
                  >
                    <WidgetRenderer widget={draggedWidget} />
                  </DraggableWidget>
                </div>
              ) : null}
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
      {sortedWidgets.length === 0 && (
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