import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserWidget {
  id: string;
  widget_type: string;
  tab_assignment: string;
  widget_config: any;
  display_order: number;
  widget_width: string;
  is_collapsed: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export const useWidgetManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addWidget = useCallback(async (
    widgetType: string,
    tabAssignment: string,
    settings: any = {}
  ): Promise<UserWidget | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .insert({
          user_id: user.id,
          widget_type: widgetType,
          tab_assignment: tabAssignment,
          widget_config: settings,
          widget_width: 'half',
          display_order: 0, // Will be auto-assigned by trigger
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Widget Added",
        description: `Successfully added ${widgetType} widget to ${tabAssignment}`,
      });

      return data;
    } catch (error) {
      console.error('Error adding widget:', error);
      toast({
        title: "Error",
        description: "Failed to add widget",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const updateWidget = useCallback(async (
    widgetId: string,
    updates: Partial<UserWidget>
  ): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_widgets')
        .update(updates)
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating widget:', error);
      toast({
        title: "Error",
        description: "Failed to update widget",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const deleteWidget = useCallback(async (widgetId: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_widgets')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Widget Removed",
        description: "Successfully removed widget",
      });

      return true;
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: "Error",
        description: "Failed to remove widget",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const getTabWidgets = useCallback(async (tabAssignment: string): Promise<UserWidget[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_assignment', tabAssignment)
        .eq('is_archived', false)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading widgets:', error);
      return [];
    }
  }, [user]);

  return {
    addWidget,
    updateWidget,
    deleteWidget,
    getTabWidgets,
    isLoading,
  };
};