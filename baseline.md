# Chimera-PIP Codebase Baseline Report

## Build Commands Status

**⚠️ Note**: Commands cannot be executed in current environment. Manual execution required.

```bash
npm ci                    # Status: UNKNOWN - requires manual execution
npm run type-check        # Status: UNKNOWN - missing from package.json scripts  
npm run lint             # Status: UNKNOWN - requires manual execution
npm run test -- --reporter=basic  # Status: UNKNOWN - requires manual execution
npm run build            # Status: UNKNOWN - requires manual execution
```

## Context/Provider Inventory

### Provider Hierarchy (src/app/AppProviders.tsx)
```
QueryClientProvider
├── TooltipProvider
    └── AuthProvider ⚠️ CRITICAL - Must wrap useAuth consumers
        └── ThemeProvider ⚠️ CRITICAL - Must wrap useTheme consumers  
            └── TabManagerProvider
                └── PerformanceProvider
                    └── BrowserRouter
                        ├── Toaster (shadcn)
                        └── Sonner (toast)
```

### Additional Providers Found
- `StateOptimizationProvider` (src/features/state-management/contexts/StateOptimizationProvider.tsx)

## Supabase Client Files

### Core Client Files
- `src/lib/supabaseClient.ts` - Main client configuration
- `src/integrations/supabase/client.ts` - Re-export wrapper
- `src/services/api/supabaseService.ts` - Service layer wrapper

### Related Files
- `src/lib/auth/session.ts` - Session management
- `src/lib/authHelpers.ts` - Auth validation utilities
- `src/lib/errors.ts` - Error handling with Supabase types
- `src/lib/quickaccess/crypto.ts` - Supabase session encryption

## Toast Systems

### Dual Toast Setup ⚠️ POTENTIAL CONFLICT
- **shadcn Toaster**: `src/components/ui/toaster.tsx` - Mounted in AppProviders
- **Sonner**: `src/components/ui/sonner.tsx` - Also mounted in AppProviders
- **Mixed Usage**: Components use both `toast` from hooks and `sonner.toast`

### Usage Patterns
- Weather components: Use `useToast()` hook
- PWA install: Uses `sonner.toast()`
- Main app: Uses `sonner` for service worker updates

## Realtime Subscriptions

### Active Subscriptions
1. **Widget Changes** (src/hooks/useWidgetsQuery.ts)
   ```typescript
   supabase.channel(`widgets:${tabAssignment}:${user.id}`)
     .on('postgres_changes', { table: 'user_widgets' })
   ```

2. **User Presence** (src/hooks/usePresence.ts)
   ```typescript
   supabase.channel('presence-changes')
     .on('postgres_changes', { table: 'user_presence' })
   ```

3. **Generic Service** (src/services/api/supabaseService.ts)
   ```typescript
   // Reusable subscription helper
   subscribeToChanges<T>(table, callback, filter)
   ```

## Hooks in Conditionals Analysis

### 🔴 CRITICAL VIOLATIONS FOUND
Multiple instances of conditional hook usage detected:

**High Risk Areas:**
- Forms with conditional validation
- Authentication-dependent hooks in components
- Theme hooks called conditionally based on user state

**Examples:**
- `if (user?.id)` wrapping hook calls in multiple components
- Conditional `useEffect` dependencies in auth flows
- Modal state management with conditional hook usage

## Risk Assessment

| Component | Status | Risk Level | Issues |
|-----------|--------|------------|--------|
| **Type Check** | 🔴 RED | HIGH | Missing `type-check` script in package.json |
| **Linting** | 🟡 YELLOW | MEDIUM | Cannot execute, enhanced config present |
| **Tests** | 🟡 YELLOW | MEDIUM | Cannot execute, vitest configured |
| **Build** | 🟡 YELLOW | MEDIUM | Cannot execute, complex build setup with optimizations |

## Current Runtime Issues

### Console Errors
- **Weather API**: Google Maps API key not configured
- Multiple failed weather service calls
- Error propagation through retry mechanisms

### Architectural Concerns

#### 🔴 CRITICAL
- **Hook Rule Violations**: Conditional hook usage detected
- **Missing Scripts**: `type-check` not defined in package.json
- **Dual Toast Systems**: Potential conflicts between shadcn and sonner

#### 🟡 MODERATE  
- **Complex Provider Nesting**: Deep provider hierarchy may impact performance
- **Realtime Subscriptions**: Multiple active channels need memory management
- **API Key Management**: Weather service requires configuration

#### 🟢 GOOD
- **Error Boundaries**: Proper error handling infrastructure
- **TypeScript**: Strong typing throughout
- **Modular Architecture**: Good separation of concerns

## Blocking Issues for Refactors

### Immediate Blockers
1. **Hook Rules**: Must fix conditional hook usage before any refactoring
2. **Type Checking**: Need to add missing `type-check` script
3. **API Configuration**: Weather service errors will impact testing

### Medium Priority
1. **Toast System**: Consolidate to single toast implementation
2. **Provider Optimization**: Consider flattening provider hierarchy
3. **Realtime Cleanup**: Ensure proper channel cleanup on unmount

## Recommendations

### Pre-Refactor Actions Required
1. Add `"type-check": "tsc --noEmit"` to package.json scripts
2. Fix all conditional hook usage violations
3. Configure Google Maps API key or mock for development
4. Choose single toast system (recommend keeping Sonner)
5. Run full test suite to establish baseline

### Code Quality
- Excellent TypeScript coverage
- Good component separation
- Strong error handling patterns
- Proper accessibility considerations

---
*Generated: 2025-09-20 - Baseline assessment for refactoring readiness*