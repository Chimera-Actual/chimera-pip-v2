import React, { memo, useMemo, useCallback } from 'react';
import { BaseWidget, WidgetType } from '@/types/widgets';
import { useWidgets } from '@/contexts/WidgetContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Archive, 
  Trash2, 
  RotateCcw, 
  Download,
  Upload,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AdvancedWidgetManagerProps {
  className?: string;
}

const WidgetManagerCard: React.FC<{
  widget: BaseWidget;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onExport: (widget: BaseWidget) => void;
}> = memo(({ widget, onRestore, onPermanentDelete, onExport }) => {
  return (
    <EnhancedCard variant="pipPrimary" hover="glow" padding="sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-pip-green-primary/10 rounded flex items-center justify-center">
            <Settings className="w-4 h-4 text-pip-green-primary" />
          </div>
          <div>
            <h4 className="font-medium text-pip-text-primary">{widget.title}</h4>
            <p className="text-sm text-pip-text-muted">
              {widget.type} • {widget.tabAssignment}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {widget.archived ? 'Archived' : 'Active'}
          </Badge>
          <div className="flex space-x-1">
            <EnhancedButton 
              variant="pipGhost" 
              size="sm"
              onClick={() => onExport(widget)}
            >
              <Download className="w-3 h-3" />
            </EnhancedButton>
            {widget.archived && (
              <EnhancedButton 
                variant="pipGhost" 
                size="sm"
                onClick={() => onRestore(widget.id)}
              >
                <RotateCcw className="w-3 h-3" />
              </EnhancedButton>
            )}
            <EnhancedButton 
              variant="pipGhost" 
              size="sm"
              onClick={() => onPermanentDelete(widget.id)}
            >
              <Trash2 className="w-3 h-3" />
            </EnhancedButton>
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
});

export const AdvancedWidgetManager: React.FC<AdvancedWidgetManagerProps> = memo(({ className }) => {
  const { 
    getWidgetsByTab,
    restoreWidget, 
    removeWidget
  } = useWidgets();
  
  const { markRenderStart, markRenderEnd } = usePerformanceMonitor('AdvancedWidgetManager');
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'active' | 'archived'>('all');

  React.useLayoutEffect(() => {
    markRenderStart();
    return markRenderEnd;
  });

  const allWidgets = React.useMemo(() => {
    const tabs = ['STAT', 'INV', 'DATA', 'MAP', 'RADIO'] as const;
    return tabs.flatMap(tab => getWidgetsByTab(tab));
  }, [getWidgetsByTab]);

  const filteredWidgets = useMemo(() => {
    return allWidgets.filter(widget => {
      const matchesSearch = widget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           widget.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'archived' && widget.archived) ||
                           (filterType === 'active' && !widget.archived);
      return matchesSearch && matchesFilter;
    });
  }, [allWidgets, searchTerm, filterType]);

  const handleRestore = useCallback((widgetId: string) => {
    restoreWidget(widgetId);
  }, [restoreWidget]);

  const handlePermanentDelete = useCallback((widgetId: string) => {
    if (window.confirm('Permanently delete this widget? This action cannot be undone.')) {
      removeWidget(widgetId);
    }
  }, [removeWidget]);

  const handleExport = useCallback((widget: BaseWidget) => {
    const config = {
      ...widget,
      exported: true,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `widget-${widget.type}-${widget.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          console.log('Imported widget config:', config);
          // Would implement import logic here
        } catch (error) {
          console.error('Failed to import widget config:', error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const stats = useMemo(() => ({
    total: allWidgets.length,
    active: allWidgets.filter(w => !w.archived).length,
    archived: allWidgets.filter(w => w.archived).length,
  }), [allWidgets]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-pip-text-primary pip-enhanced-glow">
            Widget Manager
          </h2>
          <p className="text-pip-text-secondary">
            Manage, backup, and restore your widgets
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="widget-import"
          />
          <label htmlFor="widget-import">
            <EnhancedButton variant="pipSecondary" size="sm" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </span>
            </EnhancedButton>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <EnhancedCard variant="pipGlow" padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-pip-text-primary">{stats.total}</div>
            <div className="text-sm text-pip-text-muted">Total Widgets</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="pipGlow" padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-pip-green-primary">{stats.active}</div>
            <div className="text-sm text-pip-text-muted">Active</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="pipGlow" padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-pip-text-secondary">{stats.archived}</div>
            <div className="text-sm text-pip-text-muted">Archived</div>
          </div>
        </EnhancedCard>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pip-text-muted" />
          <Input
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-pip-bg-secondary border-pip-border"
          />
        </div>
        <div className="flex space-x-2">
          {(['all', 'active', 'archived'] as const).map((type) => (
            <EnhancedButton
              key={type}
              variant={filterType === type ? 'pipPrimary' : 'pipGhost'}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              <Filter className="w-3 h-3 mr-1" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </EnhancedButton>
          ))}
        </div>
      </div>

      {/* Widget List */}
      <div className="space-y-3">
        {filteredWidgets.length === 0 ? (
          <EnhancedCard variant="pipTransparent" padding="lg">
            <div className="text-center text-pip-text-muted">
              No widgets found matching your criteria.
            </div>
          </EnhancedCard>
        ) : (
          filteredWidgets.map((widget) => (
            <WidgetManagerCard
              key={widget.id}
              widget={widget}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              onExport={handleExport}
            />
          ))
        )}
      </div>
    </div>
  );
});

AdvancedWidgetManager.displayName = 'AdvancedWidgetManager';