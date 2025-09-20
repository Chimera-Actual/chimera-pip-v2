# Supabase Client Architecture

This directory contains the consolidated Supabase client setup and helpers for the Chimera-PIP 4000 mk2.

## Files Overview

### Core Client
- **`supabaseClient.ts`** - The canonical Supabase client instance with environment validation
- **`supabaseHelpers.ts`** - Common Supabase patterns and auth-scoped operations

### Related Services  
- **`../services/db.ts`** - Generic CRUD operations with error handling
- **`../services/api/`** - API layer with caching and webhook services
- **`errors.ts`** - Error normalization utilities

## Usage Patterns

### Direct Client Access
```typescript
import { supabase } from '@/lib/supabaseClient';

// For custom queries or when you need full Supabase API access
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', 'value');
```

### Auth-Scoped Helpers (Recommended)
```typescript
import { queryUserData, insertUserData } from '@/lib/supabaseHelpers';

// Automatically adds user_id filter and handles auth
const userWidgets = await queryUserData('user_widgets', { active: true });
const newWidget = await insertUserData('user_widgets', { name: 'Test' });
```

### Generic Database Service
```typescript
import { db } from '@/services/db';

// Generic CRUD with error wrapping (no automatic user scoping)
const result = await db.getMany('table', { filters: { active: true } });
```

## Import Guidelines

**✅ Always use the canonical client:**
```typescript
import { supabase } from '@/lib/supabaseClient';
```

**❌ Don't use the re-export wrapper:**
```typescript
import { supabase } from '@/integrations/supabase/client'; // Avoid
```

## Error Handling

All helpers use the normalized error system from `errors.ts`:
- PostgreSQL errors are mapped to user-friendly messages
- Auth errors are properly handled and reported
- All errors are logged to the error reporting service

## Testing

Helper functions include comprehensive tests in `__tests__/supabaseHelpers.test.ts`.