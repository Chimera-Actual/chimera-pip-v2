import React, { memo } from 'react';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import { TabConfiguration } from '@/types/tabManagement';

interface TabWidgetManagerProps {
  tab: TabConfiguration;
  onDataReady: (tabName: string, data: ReturnType<typeof useTabWidgets>) => void;
}

/**
 * Child component that manages widgets for a single tab.
 * This component exists to properly use the useTabWidgets hook at the top level
 * and avoid Rules of Hooks violations.
 */
export const TabWidgetManager = memo<TabWidgetManagerProps>(({ tab, onDataReady }) => {
  const tabWidgetData = useTabWidgets(tab.name);
  
  // Report data back to parent without causing re-renders
  React.useEffect(() => {
    onDataReady(tab.name, tabWidgetData);
  }, [tab.name, tabWidgetData, onDataReady]);
  
  // This component doesn't render anything - it just manages the hook
  return null;
});