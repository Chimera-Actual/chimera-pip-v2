import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const getItemHeight = useCallback((index: number) => {
    return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
  }, [itemHeight]);

  const { virtualItems, totalHeight } = useMemo(() => {
    const getItemOffset = (index: number) => {
      if (typeof itemHeight === 'number') {
        return index * itemHeight;
      }
      
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    };

    const startIndex = Math.max(
      0,
      typeof itemHeight === 'number'
        ? Math.floor(scrollTop / itemHeight) - overscan
        : Math.floor(scrollTop / 50) - overscan // Estimate for dynamic height
    );

    const endIndex = Math.min(
      items.length - 1,
      typeof itemHeight === 'number'
        ? Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        : Math.ceil((scrollTop + containerHeight) / 50) + overscan
    );

    const virtualItems: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const start = getItemOffset(i);
      const size = getItemHeight(i);
      virtualItems.push({
        index: i,
        start,
        end: start + size,
        size,
      });
    }

    const totalHeight = typeof itemHeight === 'number'
      ? items.length * itemHeight
      : getItemOffset(items.length);

    return { virtualItems, totalHeight };
  }, [scrollTop, containerHeight, items.length, getItemHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              left: 0,
              right: 0,
              height: virtualRow.size,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}