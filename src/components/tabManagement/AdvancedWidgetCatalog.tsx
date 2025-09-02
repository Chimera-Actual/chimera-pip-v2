import React, { useState } from 'react';
import { Search, Grid, List, Plus, X, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WidgetType } from '@/types/widgets';
import { useWidgetCatalog } from '@/hooks/useWidgetCatalog';
import { useTagManager } from '@/hooks/useTagManager';
import * as LucideIcons from 'lucide-react';

interface AdvancedWidgetCatalogProps {
  currentTab: string;
  onAddWidget: (widgetType: WidgetType) => void;
  onClose: () => void;
}

const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Folder;
  return <Icon className={className} />;
};

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

  const handleAddWidget = (widgetType: string) => {
    onAddWidget(widgetType as WidgetType);
  };

  const categoryColors = {
    productivity: 'bg-green-500/20 text-green-400 border-green-500/30',
    entertainment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    system: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    communication: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    custom: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-card border-2 border-pip-border-bright/30 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col pip-glow">
        {/* Header */}
        <div className="p-6 border-b border-pip-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-pip-display text-primary">Widget Catalog</h2>
              <p className="text-muted-foreground mt-1">
                Add widgets to <span className="text-primary font-semibold">{currentTab}</span> tab
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-primary"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search and Controls */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search widgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-pip-border focus:border-primary"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary/20 border-primary' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40 bg-black/50 border-pip-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-pip-border rounded-md bg-black/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-none ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-none ${viewMode === 'list' ? 'bg-primary/20 text-primary' : ''}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tags */}
          {showFilters && (
            <div className="mt-4 p-4 border border-pip-border rounded-md bg-black/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-primary">Filter by tags:</span>
                {selectedTags.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagSelection(tag.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-pip-border bg-black/40 text-muted-foreground hover:border-primary/50'
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
        <div className="flex-1 overflow-y-auto p-6">
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
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-3'
            }`}>
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  className={`bg-black/60 border border-pip-border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${
                    viewMode === 'list' ? 'flex items-center gap-4' : ''
                  }`}
                >
                  <div className={`flex items-start gap-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 bg-primary/20 rounded-md flex items-center justify-center">
                        <IconComponent iconName={widget.icon} className="h-5 w-5 text-primary" />
                      </div>
                      {widget.featured && (
                        <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-current" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-primary truncate">{widget.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={categoryColors[widget.category]}
                        >
                          {widget.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
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
                    className="w-full mt-3 bg-primary/20 border border-primary/30 hover:bg-primary/30"
                    size={viewMode === 'list' ? 'sm' : 'default'}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pip-border bg-black/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">Manage Tags</Button>
              <Button variant="ghost" size="sm">Import Widgets</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};