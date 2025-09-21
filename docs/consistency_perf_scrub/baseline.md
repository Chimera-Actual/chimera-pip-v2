# Consistency & Performance Scrub - Baseline

## Build Commands Status
```bash
npm ci                # Cannot execute in this environment - requires manual execution
npm run type-check    # Cannot execute in this environment - requires manual execution  
npm run lint         # Cannot execute in this environment - requires manual execution
npm run test -- --reporter=basic  # Cannot execute in this environment - requires manual execution
npm run build        # Cannot execute in this environment - requires manual execution
npm run preview      # Cannot execute in this environment - requires manual execution
```

## Current Environment Usage in src/lib/supabaseClient.ts
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Throw a **clear** error in the browser if missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (.env for local, host env for preview/prod)."
  );
}
```

## Current Settings UIs Inventory

### Modal/Dialog-based Settings:
1. **src/components/PipBoy/SettingsModal.tsx** - `PipBoySettingsModal` (uses SettingsModal)
   - Theme, sound, glow intensity, scan lines, layout mode
   - Currently uses Dialog-based SettingsModal

2. **src/components/PipBoy/UserProfileModal.tsx** - `UserProfileModal` (uses SettingsModal) 
   - Character profile, security, Quick Access, notifications
   - Currently uses Dialog-based SettingsModal

3. **src/components/PipBoy/ApiKeysModal.tsx** - `ApiKeysModal` (uses SettingsModal)
   - API key management
   - Currently uses Dialog-based SettingsModal

4. **src/components/ui/SettingsModal.tsx** - Base SettingsModal component
   - Dialog-based modal with max-w-2xl and h-[85vh]
   - Provides standardized header, content area, and action buttons

### Sheet-based Settings:
5. **src/components/widgets/base/WidgetSettingsSheet.tsx** - `WidgetSettingsSheet`
   - Right-side sheet for widget settings
   - Uses shadcn Sheet component

### Other Dialog Components:
6. **src/components/auth/ChangePasswordModal.tsx** - Password change dialog
7. **src/components/widgets/WidgetSelectorModal.tsx** - Widget selection modal
8. Various alert dialogs in ApiKeyManager.tsx

## Current Theme Provider Defaults (src/contexts/theme/ThemeProvider.tsx)
```typescript
const DEFAULT_THEME: ThemeConfig = {
  colorScheme: 'green',
  soundEnabled: true,
  glowIntensity: 75,
  scanLineIntensity: 50,
  backgroundScanLines: 50,        // Currently set to 50 (scanlines ON by default)
  scrollingScanLines: 'normal',   // Currently set to 'normal' (scanlines ON by default)  
  layoutMode: 'tabbed',
};
```

## Console Errors During Development
No console errors currently captured during baseline assessment.

## Issues Identified
1. **Mixed UI Patterns**: Mix of Dialog-based SettingsModal and Sheet-based settings
2. **Scanlines Default**: backgroundScanLines: 50 and scrollingScanLines: 'normal' means scanlines are ON by default
3. **Environment Error Handling**: Hard crash on missing env variables - not graceful
4. **Settings Persistence**: Complex theme persistence system but no unified user settings store
5. **Provider Order**: Need to verify ThemeProvider → PerformanceProvider → AuthProvider → TabManagerProvider order