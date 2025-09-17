import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWidgetManager, UserWidget } from '@/hooks/useWidgetManager';
import { WidgetControlButtons } from '@/components/widgets/WidgetControlButtons';
import { WidgetInstanceSettingsModal } from '@/components/widgets/WidgetInstanceSettingsModal';
import { TestWidget } from '@/components/widgets/TestWidget';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { GRID_SYSTEM } from '@/lib/constants';
import { iconMapping } from '@/utils/iconMapping';
import { TestTube, Edit, Move, Settings } from 'lucide-react';

interface GridCanvasProps {
  tab: string;
  className?: string;
  onDoubleClick?: () => void;
}

interface DraggedWidget extends UserWidget {
  isDragging?: boolean;
}

export function GridCanvas({ tab, className, onDoubleClick }: GridCanvasProps) {
  const { getTabWidgets, updateWidget, deleteWidget, isLoading } = useWidgetManager();
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<UserWidget[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<UserWidget | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<DraggedWidget | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadWidgets = useCallback(async () => {
    try {
      const tabWidgets = await getTabWidgets(tab);
      setWidgets(tabWidgets);
    } catch (error) {
      console.error('Failed to load widgets:', error);
      toast({
        title: "Error",
        description: "Failed to load widgets",
        variant: "destructive"
      });
    }
  }, [tab, getTabWidgets, toast]);

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  const getGridArea = (widget: UserWidget) => {
    const x = widget.grid_x || 0;
    const y = widget.grid_y || 0;
    const width = widget.grid_width || GRID_SYSTEM.DEFAULT_WIDGET_WIDTH;
    const height = widget.grid_height || GRID_SYSTEM.DEFAULT_WIDGET_HEIGHT;
    
    return `${y + 1} / ${x + 1} / ${y + height + 1} / ${x + width + 1}`;
  };

  const findAvailablePosition = (requiredWidth: number, requiredHeight: number): { x: number; y: number } => {
    const occupiedCells = new Set<string>();
    
    // Mark occupied cells
    widgets.forEach(widget => {
      const x = widget.grid_x || 0;
      const y = widget.grid_y || 0;
      const width = widget.grid_width || GRID_SYSTEM.DEFAULT_WIDGET_WIDTH;
      const height = widget.grid_height || GRID_SYSTEM.DEFAULT_WIDGET_HEIGHT;
      
      for (let i = x; i < x + width; i++) {
        for (let j = y; j < y + height; j++) {
          occupiedCells.add(`${i},${j}`);
        }
      }
    });

    // Find first available position
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= GRID_SYSTEM.COLUMNS - requiredWidth; x++) {
        let canPlace = true;
        
        for (let i = x; i < x + requiredWidth && canPlace; i++) {
          for (let j = y; j < y + requiredHeight && canPlace; j++) {
            if (occupiedCells.has(`${i},${j}`)) {
              canPlace = false;
            }
          }
        }
        
        if (canPlace) {
          return { x, y };
        }
      }
    }
    
    return { x: 0, y: 0 };
  };

  const isPositionAvailable = (x: number, y: number, width: number, height: number, excludeId?: string): boolean => {
    return !widgets.some(widget => {
      if (excludeId && widget.id === excludeId) return false;
      
      const wx = widget.grid_x || 0;
      const wy = widget.grid_y || 0;
      const ww = widget.grid_width || GRID_SYSTEM.DEFAULT_WIDGET_WIDTH;
      const wh = widget.grid_height || GRID_SYSTEM.DEFAULT_WIDGET_HEIGHT;
      
      return !(x >= wx + ww || x + width <= wx || y >= wy + wh || y + height <= wy);
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const widgetId = event.active.id as string;
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      setActiveId(widgetId);
      setDraggedWidget({ ...widget, isDragging: true });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedWidget(null);

    if (!over || !draggedWidget) return;

    const dropData = over.data?.current;
    if (!dropData?.gridPosition) return;

    const { x, y } = dropData.gridPosition;
    const width = draggedWidget.grid_width || GRID_SYSTEM.DEFAULT_WIDGET_WIDTH;
    const height = draggedWidget.grid_height || GRID_SYSTEM.DEFAULT_WIDGET_HEIGHT;

    // Check if position is valid
    if (x < 0 || x + width > GRID_SYSTEM.COLUMNS || y < 0) return;
    
    // Check for collisions
    if (!isPositionAvailable(x, y, width, height, active.id as string)) {
      toast({
        title: "Invalid Position",
        description: "Cannot place widget there - position is occupied",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateWidget(active.id as string, {
        grid_x: x,
        grid_y: y
      });
      
      toast({
        title: "Widget Moved",
        description: "Widget position updated successfully"
      });
      
      loadWidgets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update widget position",
        variant: "destructive"
      });
    }
  };

  const getIconComponent = (widget: UserWidget) => {
    const iconName = widget.widget_config?.icon || 'TestTube';
    const IconComponent = iconMapping[iconName as keyof typeof iconMapping] || TestTube;
    return <IconComponent className="w-6 h-6" />;
  };

  const renderWidgetContent = (widget: UserWidget) => {
    const normalizedType = (widget.widget_type || '').toLowerCase().replace(/[^a-z]/g, '');
    switch (normalizedType) {
      case 'test':
      case 'testwidget':
        return (
          <TestWidget
            title={widget.widget_config?.title || 'Test Widget'}
            settings={widget.widget_config || {}}
            onSettingsChange={(settings) => handleSaveSettings(widget.id, settings)}
          />
        );
      default:
        return (
          <div className="p-6">
            <div className="space-y-2 text-pip-text-secondary font-pip-mono text-xs">
              <div>Color: {widget.widget_config?.colorValue || 'N/A'}</div>
              <div>Text: {widget.widget_config?.textInput || 'N/A'}</div>
              <div>Number: {widget.widget_config?.numberInput || 0}</div>
            </div>
          </div>
        );
    }
  };

  const handleCloseWidget = async (widgetId: string) => {
    try {
      await deleteWidget(widgetId);
      toast({
        title: "Success",
        description: "Widget removed successfully"
      });
      loadWidgets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove widget",
        variant: "destructive"
      });
    }
  };

  const handleToggleCollapse = async (widget: UserWidget) => {
    try {
      await updateWidget(widget.id, {
        is_collapsed: !widget.is_collapsed
      });
      loadWidgets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update widget",
        variant: "destructive"
      });
    }
  };

  const handleSettings = (widget: UserWidget) => {
    setSelectedWidget(widget);
  };

  const handleSaveSettings = async (widgetId: string, config: any) => {
    try {
      await updateWidget(widgetId, {
        widget_config: config
      });
      toast({
        title: "Success",
        description: "Widget settings saved"
      });
      loadWidgets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save widget settings",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-pip-border rounded-lg cursor-pointer hover:border-pip-primary transition-colors"
        onDoubleClick={onDoubleClick}
      >
        <TestTube className="w-12 h-12 text-pip-text-secondary mb-4" />
        <p className="text-pip-text-secondary font-pip-mono">No widgets yet</p>
        <p className="text-pip-text-tertiary font-pip-mono text-xs mt-2">Double-click to add widgets</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Control Bar */}
      <div className="flex items-center justify-between mb-6 p-3 bg-pip-bg-secondary border border-pip-border rounded-lg">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="font-pip-mono text-xs">
            {widgets.length} widgets
          </Badge>
          <Badge variant="outline" className="font-pip-mono text-xs">
            {GRID_SYSTEM.COLUMNS}-column grid
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="font-pip-mono text-xs"
          >
            <Edit className="w-4 h-4 mr-2" />
            {editMode ? 'Exit Edit' : 'Edit Layout'}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Grid Container */}
        <div 
          className="grid gap-6 auto-rows-[200px]"
          style={{
            gridTemplateColumns: `repeat(${GRID_SYSTEM.COLUMNS}, 1fr)`,
          }}
          onDoubleClick={onDoubleClick}
        >
          {/* Drop Zones */}
          {editMode && (
            <>
              {Array.from({ length: 24 }).map((_, index) => {
                const x = index % GRID_SYSTEM.COLUMNS;
                const y = Math.floor(index / GRID_SYSTEM.COLUMNS);
                return (
                  <div
                    key={`drop-zone-${x}-${y}`}
                    className="border-2 border-dashed border-pip-border/30 rounded-lg opacity-50 hover:border-pip-primary/50 transition-colors"
                    style={{ gridArea: `${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}` }}
                    data-grid-position={JSON.stringify({ x, y })}
                  />
                );
              })}
            </>
          )}

          {/* Widgets */}
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className={`pip-card transition-all duration-200 ${
                editMode ? 'ring-2 ring-pip-primary/50 cursor-move' : ''
              } ${activeId === widget.id ? 'opacity-50' : ''}`}
              style={{
                gridArea: getGridArea(widget),
              }}
              draggable={editMode}
              data-widget-id={widget.id}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center space-x-2">
                  {getIconComponent(widget)}
                  <h3 className="font-pip-header text-pip-text-primary text-sm">
                    {widget.widget_config?.title || `${widget.widget_type} Widget`}
                  </h3>
                  {editMode && (
                    <Badge variant="secondary" className="font-pip-mono text-xs">
                      {widget.grid_width}×{widget.grid_height}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {editMode && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Move className="w-4 h-4" />
                    </Button>
                  )}
                  <WidgetControlButtons
                    widget={widget}
                    onToggleCollapse={() => handleToggleCollapse(widget)}
                    onClose={() => handleCloseWidget(widget.id)}
                    onSettings={() => handleSettings(widget)}
                  />
                </div>
              </CardHeader>
              
              {!widget.is_collapsed && (
                <CardContent className="p-0">
                  {renderWidgetContent(widget)}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedWidget && (
            <Card className="pip-card opacity-90 rotate-3 scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center space-x-2">
                  {getIconComponent(draggedWidget)}
                  <h3 className="font-pip-header text-pip-text-primary text-sm">
                    {draggedWidget.widget_config?.title || `${draggedWidget.widget_type} Widget`}
                  </h3>
                </div>
              </CardHeader>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      {/* Widget Settings Modal */}
      <WidgetInstanceSettingsModal
        open={!!selectedWidget}
        onClose={() => setSelectedWidget(null)}
        widget={selectedWidget}
        onSave={handleSaveSettings}
      />
    </div>
  );
}