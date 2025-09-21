import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext"; // adapt
import { fetchUserSettings, updateUserSettings, UserSettings } from "@/lib/settingsStore";

export function useUserSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;

  const q = useQuery({
    queryKey: ['user-settings', userId],
    queryFn: () => fetchUserSettings(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const m = useMutation({
    mutationFn: (patch: Partial<UserSettings>) => updateUserSettings(userId!, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-settings', userId] }),
  });

  return {
    settings: q.data,
    isLoading: q.isLoading,
    error: q.error as Error | null,
    save: (patch: Partial<UserSettings>) => m.mutateAsync(patch),
    isSaving: m.isPending,
  };
}