import { supabase } from "@/lib/supabaseClient";

export type UserSettings = {
  // extend as needed; keep stable keys
  characterName?: string;
  vaultNumber?: string;
  theme?: any; // theme_config JSON from Supabase
  // add more settings fields here
};

export async function fetchUserSettings(userId: string): Promise<UserSettings> {
  try {
    // Try to get basic user data - adapt based on actual schema
    const { data: user, error: pErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (pErr) {
      console.warn('Error fetching user settings:', pErr);
      return {};
    }
    
    return {
      characterName: user?.character_name ?? undefined,
      vaultNumber: user?.vault_number?.toString() ?? undefined,
      theme: user?.theme_config ?? undefined,
    };
  } catch (error) {
    console.warn('Settings fetch failed:', error);
    return {};
  }
}

export async function updateUserSettings(userId: string, patch: Partial<UserSettings>): Promise<void> {
  try {
    // Prepare update object with available fields
    const update: any = {};
    if (patch.characterName !== undefined) update.character_name = patch.characterName;
    if (patch.vaultNumber !== undefined) update.vault_number = parseInt(patch.vaultNumber) || null;
    if (patch.theme !== undefined) update.theme_config = patch.theme;

    const { error } = await supabase.from('users').update(update).eq('id', userId);
    if (error) {
      console.warn('Settings update failed:', error);
      throw error;
    }
  } catch (error) {
    console.warn('Settings save failed:', error);
    throw error;
  }
}
