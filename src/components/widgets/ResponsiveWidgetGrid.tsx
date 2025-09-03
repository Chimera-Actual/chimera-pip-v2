import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragMoveEvent, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Plus, RefreshCw, Grid3X3 } from 'lucide-react';
import { BaseWidget, GridPosition } from '@/types/widgets';
import { useWidgets } from '@/contexts/WidgetContext';
import { Button } from '@/components/ui/button';
import { DraggableWidget } from './DraggableWidget';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { PullToRefresh } from '@/components/common/PullToRefresh';
import { useGridLayout } from '@/hooks/useGridLayout';
import { GridDropOverlay } from './GridDropOverlay';
import { useIsMobile } from '@/hooks/use-mobile';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetType } from '@/types/widgets';

interface ResponsiveWidgetGridProps {
  tab: string;
  className?: string;
}

export const ResponsiveWidgetGrid: React.FC<ResponsiveWidgetGridProps> = ({ tab, className = '' }) => {
  const { 
    getWidgetsByTab, 
    addWidget, 
    removeWidget, 
    updateWidget, 
    refreshWidgets, 
    isLoading 
  } = useWidgets();
  
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [hoverPosition, setHoverPosition] = useState<GridPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const gridLayout = useGridLayout(containerWidth);

  // Get widgets for this tab
  const tabWidgets = useMemo(() => {
    return getWidgetsByTab(tab as any);
  }, [getWidgetsByTab, tab]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Track container width for responsive grid
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setShowGridOverlay(true);
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (!event.delta) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.active.rect.current.translated?.left || 0;
    const y = event.active.rect.current.translated?.top || 0;
    
    const relativeX = x - rect.left - gridLayout.gap;
    const relativeY = y - rect.top - gridLayout.gap;
    
    const gridPos = gridLayout.snapToGrid(relativeX, relativeY);
    const draggedWidget = tabWidgets.find(w => w.id === activeId);
    const fullGridPos: GridPosition = {
      ...gridPos,
      width: draggedWidget?.gridPosition.width || 2,
      height: draggedWidget?.gridPosition.height || 2,
    };
    setHoverPosition(fullGridPos);
  }, [gridLayout]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null);
    setShowGridOverlay(false);
    setHoverPosition(null);

    if (!hoverPosition) return;

    const activeWidget = tabWidgets.find((widget) => widget.id === event.active.id);
    if (!activeWidget) return;

    const newPosition: GridPosition = {
      ...activeWidget.gridPosition,
      row: hoverPosition.row,
      col: hoverPosition.col,
    };

    // Check if the new position is valid
    if (gridLayout.isValidPosition(newPosition, tabWidgets, activeWidget.id)) {
      await updateWidget(activeWidget.id, { gridPosition: newPosition });
    }
  }, [tabWidgets, updateWidget, hoverPosition, gridLayout]);

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
      setShowCatalog(false);
    }
  }, [addWidget, tab]);

  const handleDeleteWidget = useCallback(async (widgetId: string) => {
    await removeWidget(widgetId);
  }, [removeWidget]);

  const handleRefresh = useCallback(async () => {
    await refreshWidgets();
  }, [refreshWidgets]);

  const renderWidget = useCallback((widget: BaseWidget) => {
    const isDragging = activeId === widget.id;
    
    return (
      <DraggableWidget
        key={widget.id}
        widget={widget}
        isDragOverlay={false}
        onUpdate={(updates) => handleWidgetUpdate(widget.id, updates)}
        onDuplicate={() => handleDuplicateWidget(widget)}
        onDelete={() => handleDeleteWidget(widget.id)}
        style={{
          ...gridLayout.getWidgetStyle(widget.gridPosition),
          opacity: isDragging ? 0.3 : 1,
        }}
      >
        <WidgetRenderer widget={widget} />
      </DraggableWidget>
    );
  }, [activeId, handleWidgetUpdate, handleDuplicateWidget, handleDeleteWidget, gridLayout]);

  const gridContent = (
    <div className="space-y-4">
      {/* Layout Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={showGridOverlay ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGridOverlay(!showGridOverlay)}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Grid Guide
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Widget Grid Container */}
      <div className="relative">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <div 
            ref={containerRef}
            className="widget-grid-container relative"
            style={gridLayout.getGridStyle()}
          >
            {tabWidgets.map(renderWidget)}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="widget-drag-ghost">
                <DraggableWidget
                  widget={tabWidgets.find(w => w.id === activeId)!}
                  isDragOverlay={true}
                  onUpdate={() => {}}
                  onDuplicate={() => {}}
                  onDelete={() => {}}
                  style={{ opacity: 0.8 }}
                >
                  <WidgetRenderer widget={tabWidgets.find(w => w.id === activeId)!} />
                </DraggableWidget>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Grid Drop Overlay */}
        <GridDropOverlay
          isVisible={showGridOverlay || !!activeId}
          containerWidth={containerWidth}
          widgets={tabWidgets}
          draggedWidget={activeId ? tabWidgets.find(w => w.id === activeId) : undefined}
          hoverPosition={hoverPosition}
        />
      </div>

      {/* Add Widget Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowCatalog(true)}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>
      </div>

      {/* Advanced Widget Catalog */}
      {showCatalog && (
        <AdvancedWidgetCatalog
          currentTab={tab}
          onAddWidget={handleAddWidget}
          onClose={() => setShowCatalog(false)}
        />
      )}

      {/* Empty State */}
      {tabWidgets.length === 0 && (
        <div className="text-center py-12">
          <div className="p-8 max-w-md mx-auto border border-border rounded-lg bg-secondary/20">
            <div className="text-muted-foreground font-mono mb-4">
              No widgets in this tab yet
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Click "Add Widget" above to get started
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