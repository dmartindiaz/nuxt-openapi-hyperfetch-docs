# Global Callback Control Options

Learn how to control which requests global callbacks apply to using skip options.

## Skip Options

Generated composables provide two ways to control global callbacks:

```typescript
interface ApiRequestOptions {
  skipGlobalCallbacks?: boolean      // Skip ALL global callbacks
  skipForUrls?: string[]             // Skip for specific URL patterns
}
```

## skipGlobalCallbacks

Skip **all** global callbacks for a specific request.

### Basic Usage

```typescript
// plugins/api.ts - Nuxt plugin
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      const token = useCookie('auth-token').value
      headers['Authorization'] = `Bearer ${token}`
    }
  })
})
```

```typescript
// components/PublicPets.vue - Component
const { data: pets } = useFetchGetPublicPets({}, {
  skipGlobalCallbacks: true  // Skip auth for public endpoint
})
```

### Use Cases

#### Public Endpoints

```typescript
// Public data doesn't need auth
useFetchGetPublicPets({}, {
  skipGlobalCallbacks: true
})

useFetchGetPublicArticles({}, {
  skipGlobalCallbacks: true
})
```

#### Health Checks

```typescript
// Health checks shouldn't include auth
useFetchHealthCheck({}, {
  skipGlobalCallbacks: true
})
```

#### External APIs

```typescript
// External APIs use different auth
useFetchExternalService({}, {
  skipGlobalCallbacks: true,
  onRequest: ({ headers }) => {
    // Use different auth
    headers['X-External-Key'] = externalApiKey
  }
})
```

## skipForUrls

Skip global callbacks only for **specific URL patterns**.

### Basic Usage

```typescript
// Skip auth for URLs matching pattern
useFetchGetData({}, {
  skipForUrls: ['/api/public/*']
})
```

### Pattern Matching

Supports wildcard patterns:

```typescript
useFetchGetData({}, {
  skipForUrls: [
    '/api/public/*',          // Matches /api/public/anything
    '/api/health',            // Exact match
    '*/anonymous/*',          // Matches any path with /anonymous/
    '/api/v*/public'          // Matches /api/v1/public, /api/v2/public, etc.
  ]
})
```

### Multiple Patterns

```typescript
useFetchGetData({}, {
  skipForUrls: [
    '/api/public/*',
    '/api/health',
    '/api/status',
    '/api/metrics'
  ]
})
```

## Comparison

| Option | Skips | Use Case |
|--------|-------|----------|
| `skipGlobalCallbacks: true` | **All** global callbacks | Public endpoints, external APIs |
| `skipForUrls: [...]` | Only for matching URLs | Selective skipping |

## Examples

### Public vs Private Endpoints

```typescript
// plugins/auth.ts - Nuxt plugin
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
  })
})
```

```typescript
// components/PetsList.vue - Component
const { data: publicPets } = useFetchGetPublicPets({}, {
  skipGlobalCallbacks: true  // Public endpoint, no auth needed
})

const { data: privatePets } = useFetchGetPrivatePets({
  // Private endpoint, auth header is added automatically via global callback
})
```

### Selective URL Skipping

```typescript
// Skip auth for specific patterns
const { data } = useFetchGetData({}, {
  skipForUrls: [
    '/api/public/*',   // Public routes
    '/api/health',     // Health check
    '/api/metrics'     // Metrics endpoint
  ]
})
```

### External API Integration

```typescript
// plugins/api.ts - Nuxt plugin for internal API
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      const internalToken = useCookie('internal-token').value
      headers['Authorization'] = `Bearer ${internalToken}`
    }
  })
})
```

```typescript
// components/ExternalData.vue - Component using external API
const externalApiKey = useRuntimeConfig().public.externalApiKey

const { data: externalData } = useFetchGetExternalData({}, {
  skipGlobalCallbacks: true,  // Skip internal auth
  onRequest: ({ headers }) => {
    headers['X-API-Key'] = externalApiKey  // Use external API key instead
  }
})
```

### Conditional Skipping

```typescript
const isPublicRoute = computed(() => 
  route.path.startsWith('/public')
)

const { data } = useFetchGetData({}, {
  skipGlobalCallbacks: isPublicRoute.value
})
```

## Advanced Patterns

### Skip by Environment

```typescript
const skipGlobal = process.env.NODE_ENV === 'development'

useFetchGetDevData({}, {
  skipGlobalCallbacks: skipGlobal
})
```

### Skip for Testing

```typescript
const isTestMode = process.env.VITEST === 'true'

useFetchGetData({}, {
  skipGlobalCallbacks: isTestMode
})
```

### Composable Wrapper

Create a composable that handles skipping:

```typescript
// composables/usePublicApi.ts
export function usePublicApi<T>(
  fn: () => ReturnType<typeof useFetchGetData>
) {
  return fn({
    skipGlobalCallbacks: true
  })
}

// Usage
const { data } = usePublicApi(() => useFetchGetData())
```

## Execution Order

When global callbacks are **not skipped**:

```mermaid
graph LR
    A[Request] --> B[Global onRequest]
    B --> C[Local onRequest]
    C --> D[HTTP Request]
```

When global callbacks are **skipped**:

```mermaid
graph LR
    A[Request] --> B[Local onRequest]
    B --> C[HTTP Request]
    
    style B fill:#fff3e0
```

## Best Practices

### ✅ Do

```typescript
// ✅ Skip for public endpoints
useFetchGetPublicData({}, {
  skipGlobalCallbacks: true
})

// ✅ Use URL patterns for multiple routes
skipForUrls: ['/api/public/*', '/api/health']

// ✅ Skip for external APIs
useFetchExternalApi({}, {
  skipGlobalCallbacks: true,
  onRequest: ({ headers }) => {
    headers['X-External-Key'] = key
  }
})
```

### ❌ Don't

```typescript
// ❌ Don't skip unnecessarily
useFetchGetPrivateData({}, {
  skipGlobalCallbacks: true  // Why skip auth?
})

// ❌ Don't use both options together
useFetchGetData({}, {
  skipGlobalCallbacks: true,
  skipForUrls: ['/*']  // Redundant!
})

// ❌ Don't skip just to override
// Use local callbacks instead
useFetchGetData({}, {
  skipGlobalCallbacks: true,
  onRequest: ({ headers }) => {
    // Just add extra logic, don't skip!
  }
})
```

## Debugging

Log when global callbacks are skipped:

```typescript
// Plugin
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ url }) => {
      console.log('[Global] onRequest:', url)
    }
  })
})

// Component
useFetchGetData({}, {
  skipGlobalCallbacks: true,
  onRequest: ({ url }) => {
    console.log('[Local] onRequest (global skipped):', url)
  }
})

// Output:
// [Local] onRequest (global skipped): /api/data
// (No [Global] log)
```

## TypeScript

Full type safety:

```typescript
useFetchGetData({}, {
  skipGlobalCallbacks: true,        // boolean
  skipForUrls: ['/api/public/*']   // string[]
})

// Type errors
useFetchGetData({}, {
  skipGlobalCallbacks: 'true',     // ❌ Must be boolean
  skipForUrls: '/api/public/*'     // ❌ Must be array
})
```

## Real-World Examples

### Multi-Tenant Application

```typescript
// Global: Tenant header
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    const tenant = useCookie('tenant-id').value
    headers['X-Tenant-ID'] = tenant
  }
})

// Skip for global endpoints
useFetchGetGlobalConfig({}, {
  skipGlobalCallbacks: true  // No tenant header
})
```

### API Gateway

```typescript
// Different auth for different APIs
const { data: internalData } = useFetchGetInternalData({})

const { data: externalData } = useFetchGetExternalData({}, {
  skipGlobalCallbacks: true,
  onRequest: ({ headers }) => {
    headers['X-Gateway-Key'] = gatewayKey
  }
})
```

### Feature Flags

```typescript
const featureFlags = useFeatureFlags()

useFetchGetData({}, {
  skipGlobalCallbacks: featureFlags.useNewAuth,
  onRequest: ({ headers }) => {
    if (featureFlags.useNewAuth) {
      headers['Authorization'] = `Bearer ${newToken}`
    }
  }
})
```

## Next Steps

- [URL Patterns →](/composables/features/global-callbacks/patterns)
- [Setup Guide →](/composables/features/global-callbacks/setup)
- [Examples →](/examples/composables/global-callbacks/skip-patterns)
