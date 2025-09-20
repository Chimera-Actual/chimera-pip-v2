import React, { memo, useMemo } from 'react';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import { TabConfiguration } from '@/types/tabManagement';
import { useMemoizedSelector } from '@/features/state-management/hooks/useMemoizedSelector';

interface TabWidgetManagerProps {
  tab: TabConfiguration;
  onDataReady: (tabName: string, data: ReturnType<typeof useTabWidgets>) => void;
}

/**
 * Child component that manages widgets for a single tab.
 * This component exists to properly use the useTabWidgets hook at the top level
 * and avoid Rules of Hooks violations. Optimized for performance.
 */
export const TabWidgetManager = memo<TabWidgetManagerProps>(({ tab, onDataReady }) => {
  const tabWidgetData = useTabWidgets(tab.name);
  
  // Memoize the callback data to prevent unnecessary parent re-renders
  const memoizedData = useMemoizedSelector(
    { tabWidgetData, tabName: tab.name },
    ({ tabWidgetData }) => tabWidgetData,
    [tabWidgetData]
  );
  
  // Report data back to parent with memoized stability
  React.useEffect(() => {
    onDataReady(tab.name, memoizedData);
  }, [tab.name, memoizedData, onDataReady]);
  
  // This component doesn't render anything - it just manages the hook
  return null;
});