import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WidgetTag } from '@/types/tabManagement';
import { toast } from '@/hooks/use-toast';
import { reportError } from '@/lib/errorReporting';

export const useTagManager = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<WidgetTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tags from database
  const loadTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('widget_tags')
        .select('*')
        .order('usage_count', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedTags: WidgetTag[] = (data || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        icon: tag.icon || undefined,
        description: tag.description || undefined,
        isDefault: tag.is_default,
        isCustom: !tag.is_default,
        userId: tag.user_id || undefined,
        usageCount: tag.usage_count,
        createdAt: new Date(tag.created_at),
      }));

      setTags(formattedTags);
    } catch (err) {
      reportError('Failed to load tags', {
        component: 'useTagManager',
        action: 'loadTags'
      }, err);
      setError('Failed to load tags');
      toast({
        title: 'Error',
        description: 'Failed to load widget tags. Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new custom tag
  const createTag = useCallback(async (tagData: Partial<WidgetTag>): Promise<WidgetTag | null> => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create custom tags.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const newTag: Omit<WidgetTag, 'id' | 'createdAt'> = {
        name: tagData.name || 'New Tag',
        color: tagData.color || '#00ff00',
        icon: tagData.icon,
        description: tagData.description,
        isDefault: false,
        isCustom: true,
        userId: user.id,
        usageCount: 0,
      };

      const { data, error: insertError } = await supabase
        .from('widget_tags')
        .insert({
          name: newTag.name,
          color: newTag.color,
          icon: newTag.icon,
          description: newTag.description,
          is_default: newTag.isDefault,
          user_id: newTag.userId,
          usage_count: newTag.usageCount,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const createdTag: WidgetTag = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon || undefined,
        description: data.description || undefined,
        isDefault: data.is_default,
        isCustom: !data.is_default,
        userId: data.user_id || undefined,
        usageCount: data.usage_count,
        createdAt: new Date(data.created_at),
      };

      setTags(prev => [...prev, createdTag]);

      toast({
        title: 'Tag Created',
        description: `${createdTag.name} tag has been created successfully.`,
      });

      return createdTag;
    } catch (err) {
      reportError('Failed to create tag', {
        component: 'useTagManager',
        action: 'createTag'
      }, err);
      toast({
        title: 'Error',
        description: 'Failed to create tag. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user?.id]);

  // Update a tag
  const updateTag = useCallback(async (tagId: string, updates: Partial<WidgetTag>): Promise<void> => {
    const tag = tags.find(t => t.id === tagId);
    if (tag?.isDefault && !user?.id) {
      toast({
        title: 'Error',
        description: 'Cannot modify default tags.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.usageCount !== undefined) dbUpdates.usage_count = updates.usageCount;

      const { error: updateError } = await supabase
        .from('widget_tags')
        .update(dbUpdates)
        .eq('id', tagId);

      if (updateError) {
        throw updateError;
      }

      setTags(prev => prev.map(tag =>
        tag.id === tagId ? { ...tag, ...updates } : tag
      ));

      if (updates.name || updates.color || updates.icon || updates.description) {
        toast({
          title: 'Tag Updated',
          description: 'Tag has been updated successfully.',
        });
      }
    } catch (err) {
      reportError('Failed to update tag', {
        component: 'useTagManager',
        action: 'updateTag'
      }, err);
      if (updates.name || updates.color || updates.icon || updates.description) {
        toast({
          title: 'Error',
          description: 'Failed to update tag. Please try again.',
          variant: 'destructive',
        });
      }
    }
  }, [tags, user?.id]);

  // Delete a tag
  const deleteTag = useCallback(async (tagId: string): Promise<void> => {
    const tag = tags.find(t => t.id === tagId);
    if (tag?.isDefault) {
      toast({
        title: 'Error',
        description: 'Cannot delete default tags.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id || tag?.userId !== user.id) {
      toast({
        title: 'Error',
        description: 'You can only delete your own custom tags.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('widget_tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setTags(prev => prev.filter(t => t.id !== tagId));
      setSelectedTags(prev => prev.filter(id => id !== tagId));

      toast({
        title: 'Tag Deleted',
        description: `${tag?.name} tag has been deleted.`,
      });
    } catch (err) {
      reportError('Failed to delete tag', {
        component: 'useTagManager',
        action: 'deleteTag'
      }, err);
      toast({
        title: 'Error',
        description: 'Failed to delete tag. Please try again.',
        variant: 'destructive',
      });
    }
  }, [tags, user?.id]);

  // Toggle tag selection
  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  // Clear selected tags
  const clearSelectedTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  // Increment tag usage count
  const incrementTagUsage = useCallback(async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      await updateTag(tagId, { usageCount: tag.usageCount + 1 });
    }
  }, [tags, updateTag]);

  // Load tags when component mounts
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    selectedTags,
    setSelectedTags,
    isLoading,
    error,
    createTag,
    updateTag,
    deleteTag,
    toggleTag,
    clearSelectedTags,
    incrementTagUsage,
    refreshTags: loadTags,
  };
};