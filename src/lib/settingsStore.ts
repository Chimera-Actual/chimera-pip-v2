import { supabase } from "@/lib/supabaseClient";

export type UserSettings = {
  // extend as needed; keep stable keys
  characterName?: string;
  vaultNumber?: string;
  theme?: any; // theme_config JSON from Supabase
  // add more settings fields here
};

// Reads from `users` table (theme_config, character_name, vault_number)
export async function fetchUserSettings(userId: string): Promise<UserSettings> {
  const { data: profile, error: pErr } = await supabase
    .from('users')
    .select('theme_config, character_name, vault_number')
    .eq('id', userId)
    .single();
  if (pErr) throw pErr;
  return {
    characterName: profile?.character_name ?? undefined,
    vaultNumber: profile?.vault_number?.toString() ?? undefined,
    theme: profile?.theme_config as any ?? undefined,
  };
}

export async function updateUserSettings(userId: string, patch: Partial<UserSettings>): Promise<void> {
  // Update users table; merge theme JSON if provided
  const update: any = {};
  if (patch.characterName !== undefined) update.character_name = patch.characterName;
  if (patch.vaultNumber !== undefined) update.vault_number = parseInt(patch.vaultNumber) || null;
  if (patch.theme !== undefined) update.theme_config = patch.theme;

  const { error } = await supabase.from('users').update(update).eq('id', userId);
  if (error) throw error;
}
