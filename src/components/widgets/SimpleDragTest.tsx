import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestItem {
  id: string;
  content: string;
}

interface SortableItemProps {
  id: string;
  content: string;
}

function SortableItem({ id, content }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  console.log('🔧 SortableItem:', { id, isDragging, transform });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 p-4 bg-pip-bg-secondary border border-pip-border rounded-lg",
        isDragging && "opacity-50 scale-105 shadow-lg z-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-pip-bg-tertiary rounded"
        style={{ touchAction: 'none' }}
      >
        <Move className="w-4 h-4 text-pip-text-secondary" />
      </div>
      <div className="text-pip-text-bright">{content}</div>
    </div>
  );
}

export function SimpleDragTest() {
  const [items, setItems] = useState<TestItem[]>([
    { id: '1', content: 'Item 1 - Try dragging me!' },
    { id: '2', content: 'Item 2 - Drag and drop test' },
    { id: '3', content: 'Item 3 - Simple drag test' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    console.log('🚀 SIMPLE DRAG END:', { activeId: active.id, overId: over?.id });

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        console.log('🔄 Reordering:', { oldIndex, newIndex });
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-bold text-pip-text-bright">Simple Drag Test</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => console.log('🚀 SIMPLE DRAG START:', event.active.id)}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id} content={item.content} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}