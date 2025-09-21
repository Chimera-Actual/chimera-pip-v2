# Deployment Cache Strategy

## Overview
This document outlines the service worker caching strategy for Chimera PIP-Boy, with different behaviors for preview and production environments.

## Preview Environment Behavior
- **Lovable Preview Domains**: Service Worker registration is completely disabled for any `*.lovableproject.com` or `*.lovable.app` domains
- **Development**: Service Worker registration is disabled in development mode
- **Benefit**: Eliminates "Failed to fetch dynamically imported module" errors caused by stale service workers caching old index.html pointing to non-existent chunks

## Production Environment Behavior
- **Service Worker Enabled**: Full PWA functionality with aggressive caching
- **Auto-Update**: Service Worker automatically updates when new versions are deployed
- **Cache Cleanup**: Old caches are automatically purged during activation
- **Retry Logic**: Dynamic imports automatically retry once on failure to handle cache mismatches

## Cache Strategy Details

### HTML Documents (Navigation Requests)
- **Strategy**: Network-first
- **Fallback**: Cached index.html when offline
- **Reasoning**: Prevents stale HTML from referencing non-existent chunks

### Static Assets (JS, CSS, Images)
- **Strategy**: Cache-first
- **Update**: Background updates with automatic cache cleanup
- **Versioning**: Cache names include build version/timestamp

### API Requests
- **Supabase**: Never cached (bypassed completely)
- **Other APIs**: Standard network-first with offline fallback

## Implementation Files
- `src/registerSW.ts`: Main registration logic with environment guards
- `src/lib/dynamicImport.ts`: Retry wrapper for dynamic imports
- `public/sw.js`: Basic service worker with network-first HTML strategy
- `public/sw-enhanced.js`: Advanced service worker with comprehensive caching

## Build Configuration
- **Vite Base**: Set to `/` for consistent dynamic import resolution
- **Manual Chunks**: React vendor chunk separation for better caching
- **Source Maps**: Generated in development only

## Testing
Service worker behavior can be tested by:
1. Building the project (`npm run build`)
2. Serving with a static server (`npm run preview`)
3. Verifying no SW registration on lovable domains
4. Confirming SW registration on other domains
5. Testing dynamic import retry logic

## Monitoring
Service worker events are logged to console:
- Registration success/failure
- Update notifications
- Cache cleanup operations
- Dynamic import retry attempts