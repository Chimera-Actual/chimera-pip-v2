import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WidgetTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  user_id?: string;
  usage_count: number;
  is_default: boolean;
  created_at: string;
}

export interface WidgetTagAssociation {
  tag_id: string;
  widget_type: string;
  created_at: string;
}

export const useWidgetTags = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tags, setTags] = useState<WidgetTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('widget_tags')
        .select('*')
        .order('usage_count', { ascending: false })
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast({
        title: "Error",
        description: "Failed to load widget tags",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createTag = useCallback(async (tagData: {
    name: string;
    description?: string;
    color: string;
    icon?: string;
  }): Promise<WidgetTag | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('widget_tags')
        .insert({
          ...tagData,
          user_id: user.id,
          usage_count: 0,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      setTags(prev => [...prev, data]);
      toast({
        title: "Tag Created",
        description: `Successfully created tag "${tagData.name}"`,
      });

      return data;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  const updateTag = useCallback(async (tagId: string, updates: Partial<WidgetTag>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('widget_tags')
        .update(updates)
        .eq('id', tagId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTags(prev => prev.map(tag => 
        tag.id === tagId ? { ...tag, ...updates } : tag
      ));

      return true;
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const deleteTag = useCallback(async (tagId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // First remove all associations
      await supabase
        .from('widget_tag_associations')
        .delete()
        .eq('tag_id', tagId);

      // Then delete the tag
      const { error } = await supabase
        .from('widget_tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTags(prev => prev.filter(tag => tag.id !== tagId));
      
      toast({
        title: "Tag Deleted",
        description: "Successfully deleted tag and all associations",
      });

      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const getWidgetTags = useCallback(async (widgetType: string): Promise<WidgetTag[]> => {
    try {
      const { data, error } = await supabase
        .from('widget_tag_associations')
        .select(`
          tag_id,
          widget_tags (*)
        `)
        .eq('widget_type', widgetType);

      if (error) throw error;

      return data?.map(assoc => (assoc as any).widget_tags).filter(Boolean) || [];
    } catch (error) {
      console.error('Error loading widget tags:', error);
      return [];
    }
  }, []);

  const setWidgetTags = useCallback(async (widgetType: string, tagIds: string[]): Promise<boolean> => {
    try {
      // Remove existing associations
      await supabase
        .from('widget_tag_associations')
        .delete()
        .eq('widget_type', widgetType);

      // Add new associations
      if (tagIds.length > 0) {
        const associations = tagIds.map(tagId => ({
          widget_type: widgetType,
          tag_id: tagId,
        }));

        const { error } = await supabase
          .from('widget_tag_associations')
          .insert(associations);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error setting widget tags:', error);
      toast({
        title: "Error",
        description: "Failed to update widget tags",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    isLoading,
    createTag,
    updateTag,
    deleteTag,
    getWidgetTags,
    setWidgetTags,
    loadTags,
  };
};