# Supabase Realtime Subscription Cleanup

## Overview
This document outlines the implementation of proper Supabase realtime subscription cleanup to prevent memory leaks and duplicate subscriptions.

## Changes Made

### 1. Fixed Duplicate Subscriptions
- **Problem**: `DashboardContent.tsx` had duplicate subscription logic with `useWidgetsQuery`
- **Solution**: Removed redundant subscription from `DashboardContent.tsx` since `useWidgetsQuery` already handles it

### 2. Added Debouncing
- **Problem**: Rapid database events could cause excessive re-renders
- **Solution**: Added 100ms debounce for widget updates and 200ms for presence updates
- **Implementation**: Using `setTimeout` with proper cleanup in useEffect return function

### 3. Improved Channel Uniqueness
- **Problem**: `subscribeToTable` helper used timestamp for channel IDs which could collide
- **Solution**: Use `crypto.randomUUID()` for better uniqueness guarantees

### 4. Comprehensive Testing
- **Added**: `usePresence.test.ts` - Tests subscription setup and cleanup
- **Added**: `useWidgetsQuery.cleanup.test.ts` - Comprehensive cleanup testing
- **Added**: `supabaseHelpers.realtime.test.ts` - Helper function testing
- **Updated**: Existing `useWidgetsQuery.test.ts` to include cleanup assertions

## Code Patterns

### Proper Subscription Pattern
```typescript
useEffect(() => {
  if (!user?.id || !tabAssignment) return;

  let debounceTimeout: NodeJS.Timeout;
  
  const channel = supabase
    .channel(`widgets:${tabAssignment}:${user.id}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_widgets',
      filter: `tab_assignment=eq.${tabAssignment}`,
    }, (payload) => {
      // Debounce rapid updates
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        // Handle update...
      }, 100);
    })
    .subscribe();

  return () => {
    clearTimeout(debounceTimeout);
    supabase.removeChannel(channel);
  };
}, [user?.id, tabAssignment, queryClient]);
```

### Test Pattern
```typescript
it('should cleanup subscription on unmount', () => {
  const { unmount } = renderHook(() => useWidgetsQuery('MAIN'), { wrapper });
  
  unmount();
  
  expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
});
```

## Benefits

1. **No Memory Leaks**: All subscriptions are properly cleaned up
2. **No Duplicate Handlers**: Each component manages its own subscriptions
3. **Better Performance**: Debounced updates prevent excessive re-renders
4. **Unique Channels**: UUID-based channel names prevent collisions
5. **Comprehensive Testing**: Full test coverage for subscription lifecycle

## Files Modified

- `src/hooks/useWidgetsQuery.ts` - Added debouncing and proper cleanup
- `src/hooks/usePresence.ts` - Added debouncing and proper cleanup
- `src/components/PipBoy/DashboardContent.tsx` - Removed duplicate subscription
- `src/lib/supabaseHelpers.ts` - Improved channel uniqueness
- `src/test/hooks/usePresence.test.ts` - New test file
- `src/test/hooks/useWidgetsQuery.cleanup.test.ts` - New comprehensive test
- `src/test/lib/supabaseHelpers.realtime.test.ts` - New helper test
- `src/test/hooks/useWidgetsQuery.test.ts` - Updated with cleanup assertions