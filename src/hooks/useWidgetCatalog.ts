import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WidgetCatalogItem } from '@/types/tabManagement';
import { WidgetType } from '@/types/widgets';
import { toast } from '@/hooks/use-toast';
import { reportError } from '@/lib/errorReporting';

export const useWidgetCatalog = () => {
  const [widgets, setWidgets] = useState<WidgetCatalogItem[]>([]);
  const [widgetTags, setWidgetTags] = useState<Map<string, string[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'popular'>('category');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load widget catalog from database
  const loadWidgetCatalog = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load widget catalog
      const { data: catalogData, error: catalogError } = await supabase
        .from('widget_catalog')
        .select('*')
        .order('featured', { ascending: false });

      if (catalogError) {
        throw catalogError;
      }

      // Load widget-tag associations
      const { data: associationsData, error: associationsError } = await supabase
        .from('widget_tag_associations')
        .select(`
          widget_type,
          tag_id,
          widget_tags (
            id,
            name,
            color,
            icon
          )
        `);

      if (associationsError) {
        throw associationsError;
      }

      // Create tag associations map
      const tagMap = new Map<string, string[]>();
      associationsData?.forEach((assoc: { widget_type: string; tag_id: string }) => {
        if (!tagMap.has(assoc.widget_type)) {
          tagMap.set(assoc.widget_type, []);
        }
        tagMap.get(assoc.widget_type)!.push(assoc.tag_id);
      });

      setWidgetTags(tagMap);

      // Format catalog data
      const formattedWidgets: WidgetCatalogItem[] = (catalogData || []).map(widget => ({
        id: widget.id,
        widgetType: widget.widget_type,
        name: widget.name,
        description: widget.description,
        icon: widget.icon,
        tags: tagMap.get(widget.widget_type) || [],
        category: widget.category as 'productivity' | 'entertainment' | 'system' | 'communication' | 'custom',
        featured: widget.featured,
        isDefault: widget.is_default,
        previewImage: widget.preview_image || undefined,
        defaultSettings: (widget.default_settings as Record<string, any>) || {},
        requiredPermissions: widget.required_permissions || undefined,
      }));

      setWidgets(formattedWidgets);
    } catch (err) {
      reportError('Failed to load widget catalog', {
        component: 'useWidgetCatalog',
        action: 'loadWidgetCatalog'
      }, err);
      setError('Failed to load widget catalog');
      toast({
        title: 'Error',
        description: 'Failed to load widget catalog. Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter and sort widgets
  const filteredAndSortedWidgets = useMemo(() => {
    let filtered = widgets;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(widget =>
        widget.name.toLowerCase().includes(query) ||
        widget.description.toLowerCase().includes(query) ||
        widget.category.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(widget =>
        selectedTags.some(tagId => widget.tags.includes(tagId))
      );
    }

    // Sort widgets
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        case 'popular':
          if (a.featured !== b.featured) {
            return b.featured ? 1 : -1;
          }
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [widgets, searchQuery, selectedTags, sortBy]);

  // Get widget by type
  const getWidgetByType = useCallback((widgetType: WidgetType): WidgetCatalogItem | undefined => {
    return widgets.find(w => w.widgetType === widgetType);
  }, [widgets]);

  // Get widgets by category
  const getWidgetsByCategory = useCallback((category: string): WidgetCatalogItem[] => {
    return widgets.filter(w => w.category === category);
  }, [widgets]);

  // Get featured widgets
  const getFeaturedWidgets = useCallback((): WidgetCatalogItem[] => {
    return widgets.filter(w => w.featured);
  }, [widgets]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSortBy('category');
  }, []);

  // Toggle tag selection
  const toggleTagSelection = useCallback((tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  // Load catalog when component mounts
  useEffect(() => {
    loadWidgetCatalog();
  }, [loadWidgetCatalog]);

  return {
    widgets: filteredAndSortedWidgets,
    allWidgets: widgets,
    widgetTags,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isLoading,
    error,
    getWidgetByType,
    getWidgetsByCategory,
    getFeaturedWidgets,
    clearFilters,
    toggleTagSelection,
    refreshCatalog: loadWidgetCatalog,
  };
};