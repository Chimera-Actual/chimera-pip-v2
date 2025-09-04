import React, { memo, useCallback, useMemo } from 'react';
import { BaseWidget } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';

// Performance-optimized widget container
interface WidgetPerformanceOptimizerProps {
  widget: BaseWidget;
  children: React.ReactNode;
}

export const WidgetPerformanceOptimizer: React.FC<WidgetPerformanceOptimizerProps> = memo(({
  widget,
  children
}) => {
  const { settings, setSettings, collapsed, setCollapsed, isLoading } = useWidgetState(
    widget.id,
    widget.settings
  );

  const { 
    settings: advancedSettings, 
    updateSetting,
    isDirty,
    saveSettings 
  } = useWidgetSettings(widget.id, widget.type);

  // Memoize widget props to prevent unnecessary re-renders
  const optimizedWidget = useMemo(() => ({
    ...widget,
    settings: { ...settings, ...advancedSettings },
    collapsed
  }), [widget, settings, advancedSettings, collapsed]);

  const handleSettingsUpdate = useCallback((newSettings: any) => {
    setSettings(newSettings);
    if (isDirty) {
      saveSettings();
    }
  }, [setSettings, isDirty, saveSettings]);

  const handleCollapseToggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  // Provide optimized context to children
  const contextValue = useMemo(() => ({
    widget: optimizedWidget,
    isLoading,
    onSettingsUpdate: handleSettingsUpdate,
    onCollapseToggle: handleCollapseToggle,
    updateSetting
  }), [optimizedWidget, isLoading, handleSettingsUpdate, handleCollapseToggle, updateSetting]);

  return (
    <WidgetOptimizationContext.Provider value={contextValue}>
      {children}
    </WidgetOptimizationContext.Provider>
  );
});

// Context for sharing optimized widget state
export const WidgetOptimizationContext = React.createContext<{
  widget: BaseWidget;
  isLoading: boolean;
  onSettingsUpdate: (settings: any) => void;
  onCollapseToggle: () => void;
  updateSetting: (key: string, value: any) => void;
} | null>(null);

export const useWidgetOptimization = () => {
  const context = React.useContext(WidgetOptimizationContext);
  if (!context) {
    throw new Error('useWidgetOptimization must be used within a WidgetPerformanceOptimizer');
  }
  return context;
};

WidgetPerformanceOptimizer.displayName = 'WidgetPerformanceOptimizer';