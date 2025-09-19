import React from 'react';
import { WidgetShell } from '@/components/widgets/base/WidgetShell';

interface AIAgentWidgetProps {
  widgetId: string;
  widget?: {
    widget_config: Record<string, any>;
  };
  onConfigUpdate?: (config: Record<string, any>) => void;
}

export default function AIAgentWidget({ 
  widgetId, 
  widget, 
  onConfigUpdate 
}: AIAgentWidgetProps) {
  
  return (
    <WidgetShell
      title="AI Agent"
      isCollapsed={false}
      onCollapse={() => {}}
      onClose={() => {}}
      onToggleFullWidth={() => {}}
      className="min-h-[400px]"
    >
      <div className="p-6 text-center">
        <div className="text-pip-text-secondary font-pip-mono">
          AI Agent Widget - Coming Soon
        </div>
        <div className="text-pip-text-muted text-xs mt-2">
          Widget ID: {widgetId}
        </div>
      </div>
    </WidgetShell>
  );
}