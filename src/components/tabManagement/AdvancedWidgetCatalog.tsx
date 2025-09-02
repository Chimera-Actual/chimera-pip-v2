import React, { useState, useCallback, useEffect } from 'react';
import { Search, Grid, List, Plus, X, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WidgetType } from '@/types/widgets';
import { useWidgetCatalog } from '@/hooks/useWidgetCatalog';
import { useTagManager } from '@/hooks/useTagManager';
import { useIsMobile } from '@/hooks/use-mobile';
import * as LucideIcons from 'lucide-react';

interface AdvancedWidgetCatalogProps {
  currentTab: string;
  onAddWidget: (widgetType: WidgetType) => void;
  onClose: () => void;
}

const IconComponent = React.memo(({ iconName, className }: { iconName: string; className?: string }) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Folder;
  return <Icon className={className} />;
});

export const AdvancedWidgetCatalog: React.FC<AdvancedWidgetCatalogProps> = ({
  currentTab,
  onAddWidget,
  onClose
}) => {
  const {
    widgets,
    searchQuery,
    setSearchQuery,
    selectedTags,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isLoading,
    clearFilters,
    toggleTagSelection,
  } = useWidgetCatalog();

  const { tags } = useTagManager();
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  const handleAddWidget = useCallback((widgetType: string) => {
    onAddWidget(widgetType as WidgetType);
  }, [onAddWidget]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setShowFilters(!showFilters);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showFilters]);

  const categoryColors = {
    productivity: 'bg-green-500/20 text-green-400 border-green-500/30',
    entertainment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    system: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    communication: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    custom: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 md:p-4"
         role="dialog" 
         aria-modal="true" 
         aria-labelledby="widget-catalog-title">
      <div className={`relative bg-pip-bg-primary border-2 border-pip-border-bright rounded-lg w-full ${isMobile ? 'max-w-full h-full' : 'max-w-6xl h-[90vh]'} flex flex-col pip-glow pip-terminal pip-scanlines`}>
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 pip-scanlines rounded-lg" />
        {/* Header */}
        <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-pip-border relative z-10`}>
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h2 id="widget-catalog-title" className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold font-pip-display text-pip-green-primary pip-text-glow`}>WIDGET CATALOG</h2>
              <p className="text-pip-text-muted mt-1 font-pip-mono text-xs truncate">
                {'>'} ADD_WIDGETS_TO_TAB: <span className="text-pip-green-secondary font-semibold">{currentTab}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-pip-text-secondary hover:text-pip-green-primary pip-button-glow border border-pip-border hover:border-pip-green-secondary flex-shrink-0 ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search and Controls */}
          <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex gap-4 items-center'}`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="SEARCH WIDGETS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-pip-bg-tertiary/80 border-pip-border focus:border-pip-green-primary font-pip-mono text-pip-green-primary placeholder:text-pip-text-muted pip-glow"
                aria-label="Search widgets"
              />
            </div>

            <div className={`${isMobile ? 'flex flex-wrap gap-2' : 'flex gap-4'} ${isMobile ? 'w-full' : ''}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`font-pip-mono pip-button-glow ${showFilters ? 'bg-pip-green-primary/20 border-pip-green-primary text-pip-green-primary' : 'border-pip-border text-pip-text-secondary hover:border-pip-green-secondary hover:text-pip-green-secondary'} ${isMobile ? 'flex-1' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                {isMobile ? '' : 'FILTERS'}
              </Button>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className={`${isMobile ? 'flex-1 min-w-0' : 'w-40'} bg-pip-bg-tertiary/80 border-pip-border font-pip-mono text-pip-green-primary`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-pip-bg-primary border-pip-border z-50 backdrop-blur-sm">
                  <SelectItem value="category">CATEGORY</SelectItem>
                  <SelectItem value="name">NAME</SelectItem>
                  <SelectItem value="popular">POPULAR</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-pip-border rounded-md bg-pip-bg-tertiary/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-none pip-button-glow ${viewMode === 'grid' ? 'bg-pip-green-primary/20 text-pip-green-primary' : 'text-pip-text-secondary hover:text-pip-green-secondary'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-none pip-button-glow ${viewMode === 'list' ? 'bg-pip-green-primary/20 text-pip-green-primary' : 'text-pip-text-secondary hover:text-pip-green-secondary'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Tags */}
          {showFilters && (
            <div className="mt-4 p-4 border border-pip-border rounded-md bg-pip-bg-tertiary/30 pip-glow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold font-pip-mono text-pip-green-primary">FILTER BY TAGS:</span>
                {selectedTags.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="font-pip-mono text-pip-text-secondary hover:text-pip-green-secondary pip-button-glow">
                    CLEAR ALL
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagSelection(tag.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium font-pip-mono border transition-all pip-button-glow ${
                      selectedTags.includes(tag.id)
                        ? 'border-pip-green-primary bg-pip-green-primary/20 text-pip-green-primary'
                        : 'border-pip-border bg-pip-bg-tertiary/40 text-pip-text-muted hover:border-pip-green-secondary hover:text-pip-green-secondary'
                    }`}
                    style={{
                      borderColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                      backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : undefined,
                    }}
                  >
                    {tag.icon && <IconComponent iconName={tag.icon} className="h-3 w-3" />}
                    {tag.name}
                    <span className="opacity-60">({tag.usageCount})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : widgets.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No widgets found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or tag filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid' 
                ? `grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}` 
                : 'space-y-3'
            }`}>
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  className={`bg-pip-bg-secondary/60 border border-pip-border rounded-lg p-4 transition-all hover:border-pip-green-secondary/50 hover:shadow-lg hover:shadow-pip-green-glow/10 pip-widget ${
                    viewMode === 'list' ? 'flex items-center gap-4' : ''
                  }`}
                >
                  <div className={`flex items-start gap-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 bg-pip-green-primary/20 rounded-md flex items-center justify-center pip-glow">
                        <IconComponent iconName={widget.icon} className="h-5 w-5 text-pip-green-primary" />
                      </div>
                      {widget.featured && (
                        <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-current" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold font-pip-mono text-pip-green-primary truncate">{widget.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={categoryColors[widget.category]}
                        >
                          {widget.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-pip-text-muted mb-2 line-clamp-2 font-pip-mono">
                        {widget.description}
                      </p>

                      {widget.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {widget.tags.slice(0, 3).map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            return tag ? (
                              <span
                                key={tagId}
                                className="inline-block px-2 py-0.5 text-xs rounded font-medium text-black"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ) : null;
                          })}
                          {widget.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{widget.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {widget.requiredPermissions && (
                        <div className="text-xs text-orange-400 mb-2">
                          Requires: {widget.requiredPermissions.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                <Button
                  onClick={() => handleAddWidget(widget.widgetType)}
                  className="w-full mt-3 bg-pip-green-primary/20 border border-pip-green-primary/30 hover:bg-pip-green-primary/30 font-pip-mono text-pip-green-primary pip-button-glow"
                  size={viewMode === 'list' ? 'sm' : 'default'}
                  aria-label={`Add ${widget.name} widget`}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    ADD WIDGET
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pip-border bg-pip-bg-tertiary/30 relative z-10">
          <div className="flex items-center justify-between text-sm text-pip-text-muted font-pip-mono">
            <span>
              SHOWING {widgets.length} WIDGET{widgets.length !== 1 ? 'S' : ''}
            </span>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="font-pip-mono text-pip-text-secondary hover:text-pip-green-secondary pip-button-glow">MANAGE TAGS</Button>
              <Button variant="ghost" size="sm" className="font-pip-mono text-pip-text-secondary hover:text-pip-green-secondary pip-button-glow">IMPORT WIDGETS</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};