import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Grid, List, Shuffle, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidgets } from '@/contexts/WidgetContext';
import { useAdvancedDragDrop } from '@/hooks/useAdvancedDragDrop';
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

  const widgets = getWidgetsByTab(tab as any);

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

  // Handle widget operations
  const handleWidgetsReorder = useCallback(async (reorderedWidgets: BaseWidget[]) => {
    // Update positions based on new order
    for (let i = 0; i < reorderedWidgets.length; i++) {
      const widget = reorderedWidgets[i];
      const row = Math.floor(i / gridConfig.columns);
      const col = i % gridConfig.columns;
      const newPosition = {
        x: col * (gridConfig.cellSize.width + gridConfig.gap),
        y: row * (gridConfig.cellSize.height + gridConfig.gap)
      };
      await updateWidget(widget.id, { position: newPosition });
    }
  }, [updateWidget, gridConfig]);

  const handleWidgetMove = useCallback(async (widgetId: string, position: { x: number; y: number }) => {
    await updateWidget(widgetId, { position });
  }, [updateWidget]);

  const handleAddWidget = useCallback(async (type: WidgetType) => {
    const widget = await addWidget(type, tab as any);
    if (widget) {
      setShowAdvancedCatalog(false);
    }
  }, [addWidget, tab]);

  const handleRefresh = useCallback(async () => {
    await refreshWidgets();
  }, [refreshWidgets]);

  // Advanced drag and drop functionality
  const {
    dragState,
    dndContextProps,
    autoArrangeWidgets,
    snapToGrid,
    checkCollision,
    findAvailablePosition
  } = useAdvancedDragDrop(
    widgets,
    handleWidgetsReorder,
    handleWidgetMove,
    gridConfig
  );

  // Auto-arrange widgets function
  const handleAutoArrange = useCallback(async () => {
    const arrangedWidgets = autoArrangeWidgets(widgets);
    for (const widget of arrangedWidgets) {
      if (widget.position) {
        await updateWidget(widget.id, { position: widget.position });
      }
    }
  }, [autoArrangeWidgets, widgets, updateWidget]);

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
        <div className="flex items-center gap-4 p-4 bg-pip-bg-secondary rounded-lg border border-pip-border">
          <div className="w-12 h-12 bg-pip-bg-tertiary rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-primary rounded" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-pip-text-bright truncate">{widget.title}</h3>
            <p className="text-sm text-pip-text-secondary">{widget.type}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => updateWidget(widget.id, { collapsed: !widget.collapsed })}>
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
        onUpdate={updateWidget}
        onDelete={removeWidget}
        className={cn(
          "transition-all duration-200 ease-out",
          dragState.isDragging && dragState.activeId === widget.id && "opacity-50 scale-95",
          isDragOverlay && "rotate-2 shadow-2xl z-50"
        )}
      >
        <WidgetRenderer widget={widget} />
      </DraggableWidget>
    );
  }, [viewMode, dragState, updateWidget, removeWidget]);

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
      {/* Grid Controls */}
      <div className="flex items-center justify-between gap-4 p-4 bg-pip-bg-secondary/30 rounded-lg border border-pip-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-pip-text-secondary uppercase tracking-wide">
            View Mode:
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
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
            disabled={isLoading || widgets.length === 0}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Auto-Arrange
          </Button>
          
          <select
            className="px-3 py-1 text-sm bg-pip-bg-tertiary border border-pip-border rounded text-pip-text-bright"
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

      {/* Widget Grid */}
      <div className="widget-grid-container">
        <DndContext {...dndContextProps}>
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className="widgets-responsive-grid" style={gridStyles}>
              {widgets.map(widget => (
                <div key={widget.id} className="widget-slot">
                  {renderWidget(widget)}
                </div>
              ))}
            </div>
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay>
            {dragState.activeId ? (
              renderWidget(
                widgets.find(w => w.id === dragState.activeId)!,
                true
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Widget Button */}
      <Button
        variant="outline"
        size={isMobile ? "touch-large" : "default"}
        className="w-full h-32 border-2 border-dashed border-pip-border hover:border-primary/50 bg-transparent hover:bg-pip-bg-secondary/30 transition-all duration-200 group"
        disabled={isLoading}
        onClick={() => setShowAdvancedCatalog(true)}
      >
        <div className="flex flex-col items-center gap-2 text-pip-text-muted group-hover:text-primary transition-colors">
          <Plus className="h-8 w-8" />
          <span className="font-pip-mono text-sm">ADD WIDGET</span>
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
          <div className="pip-special-stat p-8 max-w-md mx-auto">
            <div className="text-pip-text-muted font-pip-mono mb-4">
              No widgets in this tab yet
            </div>
            <div className="text-xs text-pip-text-secondary font-pip-mono">
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