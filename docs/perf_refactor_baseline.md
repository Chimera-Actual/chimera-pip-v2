# Performance Refactor Baseline

## Build Commands Status
Running baseline verification commands...

**Note: Commands not executed in this analysis phase - focusing on code audit first**

## Files with Performance-Critical Patterns

### Timer/Interval Usage
- `src/components/PipBoy/BootSequence.tsx` - 3 intervals (message, progress, typewriter)
- `src/components/PipBoy/DashboardFooter.tsx` - 3 intervals (1s clock, 5s connection, 30s sync)
- `src/features/state-management/contexts/PerformanceContext.tsx` - 30s memory tracking
- `src/hooks/usePresence.ts` - 2min activity interval
- `src/hooks/useWeatherData.ts` - refresh interval
- `src/components/widgets/weather/PipBoyRadiationMeter.tsx` - animation timers
- `src/hooks/useSecurity.ts` - 30s token check interval
- Multiple debounce timeouts across hooks and components

### Supabase Realtime Subscriptions
- `src/hooks/usePresence.ts` - presence channel subscription
- `src/hooks/useWidgetsQuery.ts` - per-tab widget subscriptions
- `src/lib/supabaseHelpers.ts` - generic subscription helper

### Navigator.onLine Usage
- `src/components/PipBoy/DashboardFooter.tsx` - connection status monitoring
- `src/hooks/useWeatherData.ts` - offline detection

### Why-Did-You-Render Issues
- `src/lib/wdyr.ts` - Uses problematic `require()` and top-level `await` in ESM context

## Hook Usage Analysis
Based on code examination, potential hook rule violations in:
- Components that may call hooks conditionally in loops or render logic
- Need runtime verification during testing phase

## Performance Concerns Identified
1. **WDYR Import Crash Risk** - ESM/CommonJS mixing
2. **Multiple Timer Redundancy** - Overlapping interval functions
3. **Subscription Leaks** - Realtime channels not guaranteed cleanup
4. **Inactive Tab Overhead** - All tabs may render simultaneously
5. **Auth Loop Potential** - Profile fetching without guards
6. **Crypto Blocking** - Synchronous decrypt operations