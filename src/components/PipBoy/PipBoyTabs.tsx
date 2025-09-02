import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Package, Database, Map, Radio, Settings, Plus, GripVertical } from 'lucide-react';
import { PipBoyTab } from './PipBoyContainer';
import { useTabManager } from '@/hooks/useTabManager';
import { TabEditor } from '@/components/tabManagement/TabEditor';
import { TabContextMenu } from './TabContextMenu';
import { TabConfiguration } from '@/types/tabManagement';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PipBoyTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const getTabIcon = (name: string, iconName?: string) => {
  // Default icons for core tabs
  const defaultIcons: Record<string, any> = {
    'STAT': BarChart3,
    'INV': Package, 
    'DATA': Database,
    'MAP': Map,
    'RADIO': Radio
  };
  
  return defaultIcons[name] || Settings;
};

// Sortable Tab Component
const SortableTab = React.memo<{
  tab: TabConfiguration;
  isActive: boolean;
  onTabChange: (tab: string) => void;
  onContextMenu: (e: React.MouseEvent, tab: TabConfiguration) => void;
  isMobile: boolean;
}>(({ tab, isActive, onTabChange, onContextMenu, isMobile }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getTabIcon(tab.name, tab.icon);

  // Mobile long press handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isMobile) {
      const timer = setTimeout(() => {
        onContextMenu(e as any, tab);
      }, 500); // 500ms long press
      setLongPressTimer(timer);
    }
  }, [isMobile, onContextMenu, tab]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Button
        variant="ghost"
        title={tab.description}
        className={`relative flex-1 ${isMobile ? 'h-14 px-2' : 'h-16 px-4'} rounded-none border-r border-pip-border last:border-r-0 font-pip-display font-semibold transition-all ${
          isActive 
            ? 'pip-tab-active text-primary' 
            : 'text-pip-text-secondary hover:text-primary hover:bg-pip-bg-secondary/50'
        }`}
        onClick={() => onTabChange(tab.name)}
        onContextMenu={(e) => onContextMenu(e, tab)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ color: tab.color || undefined }}
      >
        <div className={`flex ${isMobile ? 'flex-col items-center space-y-0.5' : 'flex-col items-center space-y-1'}`}>
          <Icon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          <span className={`${isMobile ? 'text-xs font-medium' : 'text-xs'} truncate max-w-full`}>
            {isMobile && tab.name.length > 6 ? tab.name.slice(0, 6) : tab.name}
          </span>
        </div>
        
        {/* Tab indicator */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 ${
            isActive ? 'scale-x-100' : 'scale-x-0'
          }`}
          style={{ backgroundColor: tab.color || 'hsl(var(--primary))' }}
        />
      </Button>

      {/* Drag Handle - Hidden on mobile, shown on hover on desktop */}
      {!tab.isDefault && !isMobile && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical className="h-3 w-3 text-pip-text-muted" />
        </div>
      )}

      {/* Mobile drag handle - always visible but subtle */}
      {!tab.isDefault && isMobile && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 right-1 opacity-30 p-1 touch-none"
        >
          <GripVertical className="h-3 w-3 text-pip-text-muted" />
        </div>
      )}
    </div>
  );
});

export const PipBoyTabs: React.FC<PipBoyTabsProps> = ({ currentTab, onTabChange }) => {
  const { tabs, createTab, reorderTabs, isLoading } = useTabManager();
  const [showTabEditor, setShowTabEditor] = useState(false);
  const [editingTab, setEditingTab] = useState<TabConfiguration | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tab: TabConfiguration;
  } | null>(null);

  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 10 : 5, // Larger distance for mobile to prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Slight delay to distinguish from scrolling
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleContextMenu = (e: React.MouseEvent, tab: TabConfiguration) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tab
    });
  };

  const handleCreateTab = useCallback(async (tabData: any) => {
    await createTab(tabData);
    setShowTabEditor(false);
  }, [createTab]);

  const handleEditTab = useCallback((tab: TabConfiguration) => {
    setEditingTab(tab);
    setShowTabEditor(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowTabEditor(false);
    setEditingTab(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 't':
            e.preventDefault();
            setShowTabEditor(true);
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
            e.preventDefault();
            const index = parseInt(e.key) - 1;
            if (tabs[index]) {
              onTabChange(tabs[index].name);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, onTabChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);
      
      const newOrder = arrayMove(tabs, oldIndex, newIndex);
      reorderTabs(newOrder);
    }
  };

  if (isLoading) {
    return (
      <div className="flex border-b border-pip-border animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 h-16 border-r border-pip-border last:border-r-0 bg-pip-bg-secondary/30" />
        ))}
      </div>
    );
  }
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className={`flex border-b border-pip-border ${isMobile ? 'overflow-x-auto scrollbar-hide' : ''}`}>
          <SortableContext items={tabs.map(tab => tab.id)} strategy={horizontalListSortingStrategy}>
            {tabs.map((tab) => {
              const isActive = currentTab === tab.name;
              
              return (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  isActive={isActive}
                  onTabChange={onTabChange}
                  onContextMenu={handleContextMenu}
                  isMobile={isMobile}
                />
              );
            })}
          </SortableContext>
          
          {/* Add Tab Button */}
          <Button
            variant="ghost"
            className={`${isMobile ? 'h-14 px-3' : 'h-16 px-4'} border-r border-pip-border text-pip-text-secondary hover:text-primary hover:bg-pip-bg-secondary/50 transition-all flex-shrink-0`}
            onClick={() => setShowTabEditor(true)}
            title="Create new tab (Ctrl+T)"
          >
            <Plus className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
        </div>
      </DndContext>
      

      {/* Tab Editor Modal */}
      <TabEditor
        tab={editingTab}
        isOpen={showTabEditor}
        onClose={handleCloseEditor}
        onSave={editingTab ? undefined : handleCreateTab}
      />

      {/* Context Menu */}
      {contextMenu && (
        <TabContextMenu
          tab={contextMenu.tab}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onEdit={handleEditTab}
        />
      )}
    </>
  );
};