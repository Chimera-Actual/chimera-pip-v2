import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserApp } from '@/types/appManagement';

export const useAppManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addApp = useCallback(async (
    appId: string,
    tabAssignment: string,
    settings: any = {}
  ): Promise<UserApp | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      // Add new app 
      const { data, error } = await supabase
        .from('user_widgets')
        .insert({
          user_id: user.id,
          widget_type: appId,
          tab_assignment: tabAssignment,
          widget_config: settings,
          display_order: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "App Added",
        description: `Successfully added app to ${tabAssignment}`,
      });

      return data as unknown as UserApp;
    } catch (error) {
      console.error('Error adding app:', error);
      toast({
        title: "Error",
        description: "Failed to add app",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const removeApp = useCallback(async (appId: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_widgets')
        .delete()
        .eq('id', appId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "App Removed",
        description: "Successfully removed app",
      });

      return true;
    } catch (error) {
      console.error('Error removing app:', error);
      toast({
        title: "Error",
        description: "Failed to remove app",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const getTabApps = useCallback(async (tabAssignment: string): Promise<UserApp[]> => {
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
      return (data || []) as unknown as UserApp[];
    } catch (error) {
      console.error('Error loading apps:', error);
      return [];
    }
  }, [user]);

  return {
    addApp,
    removeApp,
    getTabApps,
    isLoading,
  };
};