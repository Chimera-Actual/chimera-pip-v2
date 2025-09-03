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
import { useAdvancedDragDrop } from '@/hooks/useAdvancedDragDrop';

interface ResponsiveWidgetGridProps {
  tab: string;
  className?: string;
}

type ViewMode = 'grid' | 'list' | 'masonry';
type GridDensity = 'comfortable' | 'compact' | 'dense';

const GRID_CONFIGS = {
  mobile: {
    comfortable: { columns: 1, gap: 16, cellSize: 320 },
    compact: { columns: 1, gap: 12, cellSize: 300 },
    dense: { columns: 1, gap: 8, cellSize: 280 }
  },
  tablet: {
    comfortable: { columns: 2, gap: 20, cellSize: 280 },
    compact: { columns: 2, gap: 16, cellSize: 260 },
    dense: { columns: 3, gap: 12, cellSize: 240 }
  },
  desktop: {
    comfortable: { columns: 3, gap: 24, cellSize: 300 },
    compact: { columns: 4, gap: 20, cellSize: 280 },
    dense: { columns: 5, gap: 16, cellSize: 260 }
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

  const baseConfig = GRID_CONFIGS[deviceType][gridDensity];
  const gridConfig = useMemo(() => ({
    ...baseConfig,
    containerWidth,
    rows: Math.ceil(sortedWidgets.length / baseConfig.columns) + 5
  }), [baseConfig, containerWidth, sortedWidgets.length]);

  // Grid-based drag and drop system
  const onWidgetsReorder = useCallback(async (widgets: BaseWidget[]) => {
    try {
      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];
        await updateWidget(widget.id, { 
          position: { x: i * 50, y: 0 } // Simple positioning for now
        });
      }
    } catch (error) {
      console.error('Error during reordering:', error);
    }
  }, [updateWidget]);

  const onWidgetMove = useCallback(async (widgetId: string, position: { x: number; y: number }) => {
    try {
      await updateWidget(widgetId, { position });
    } catch (error) {
      console.error('Error during widget move:', error);
    }
  }, [updateWidget]);

  const {
    dragState,
    handleDragStart,
    handleDragEnd,
    autoArrangeWidgets,
    gridSystem,
    dndContextProps
  } = useAdvancedDragDrop(
    sortedWidgets,
    onWidgetsReorder,
    onWidgetMove,
    gridConfig
  );

  // Set dragged widget for overlay
  const handleDragStartProxy = useCallback((event: DragEndEvent) => {
    const widget = sortedWidgets.find(w => w.id === event.active.id);
    setDraggedWidget(widget || null);
    handleDragStart(event);
  }, [sortedWidgets, handleDragStart]);

  const handleDragEndProxy = useCallback(async (event: DragEndEvent) => {
    setDraggedWidget(null);
    handleDragEnd(event);
  }, [handleDragEnd]);

  // Auto-arrange using grid system
  const handleAutoArrange = useCallback(async () => {
    if (sortedWidgets.length === 0) return;
    
    console.log('🔄 Auto-arranging widgets with grid system...');
    
    try {
      const arrangedWidgets = autoArrangeWidgets(sortedWidgets);
      
      // Update all widget positions
      for (const widget of arrangedWidgets) {
        if (widget.position) {
          await updateWidget(widget.id, { 
            position: widget.position,
            size: widget.size 
          });
        }
      }
      
      console.log('✅ Auto-arrangement complete');
      
    } catch (error) {
      console.error('❌ Error during auto-arrangement:', error);
    }
  }, [sortedWidgets, autoArrangeWidgets, updateWidget]);

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

  // Grid styles for absolute positioning system
  const gridStyles = useMemo(() => {
    if (viewMode === 'list') {
      return {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: `${gridConfig.gap}px`
      };
    }

    return {
      position: 'relative' as const,
      width: '100%',
      minHeight: `${(gridConfig.rows * gridConfig.cellSize) + ((gridConfig.rows - 1) * gridConfig.gap)}px`
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => gridSystem.setShowGrid(!gridSystem.showGrid)}
              className={`flex items-center gap-2 ${gridSystem.showGrid ? 'bg-pip-green-primary/20' : ''}`}
            >
              <Grid className="h-4 w-4" />
              Grid
            </Button>
          </div>
          
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

        {/* Grid-Based Widget System */}
        <div className="widget-grid-container relative min-h-[600px]">
          <DndContext {...dndContextProps}>
            <div
              className="widgets-responsive-grid relative"
              style={gridStyles}
            >
              {/* Grid Overlay */}
              {gridSystem.showGrid && viewMode !== 'list' && (
                <div className="absolute inset-0 pointer-events-none z-0">
                  {/* Vertical Grid Lines */}
                  {gridSystem.getGridLines.vertical.map((x, index) => (
                    <div
                      key={`v-${index}`}
                      className="absolute h-full border-l border-pip-border/30"
                      style={{ left: `${x}px` }}
                    />
                  ))}
                  {/* Horizontal Grid Lines */}
                  {gridSystem.getGridLines.horizontal.map((y, index) => (
                    <div
                      key={`h-${index}`}
                      className="absolute w-full border-t border-pip-border/30"
                      style={{ top: `${y}px` }}
                    />
                  ))}
                </div>
              )}
              
              <SortableContext 
                items={sortedWidgets.map(w => w.id)}
                strategy={rectSortingStrategy}
              >
                {sortedWidgets.map((widget) => (
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
              </SortableContext>
            </div>

            {/* Drag Overlay */}
            <DragOverlay
              adjustScale={false}
              style={{ cursor: 'grabbing' }}
            >
              {draggedWidget && (
                <div className={cn(
                  "transform-gpu opacity-95 rotate-3 scale-110",
                  "shadow-2xl shadow-primary/20",
                  "transition-all duration-200 ease-out"
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
              )}
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