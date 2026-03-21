# URL Patterns

Learn how to use URL patterns to selectively apply global callbacks based on request URLs.

## Overview

URL patterns let you control which global callbacks run based on the request URL, without using `skipGlobalCallbacks` or `skipForUrls` options.

## In Global Callbacks

Check the URL inside global callbacks:

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Only add auth to /api/private/* routes
    if (url.startsWith('/api/private')) {
      const token = useCookie('auth-token').value
      headers['Authorization'] = `Bearer ${token}`
    }
  }
})
```

## Pattern Matching

### Exact Match

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    if (url === '/api/admin') {
      headers['X-Admin-Key'] = adminKey
    }
  }
})
```

### Prefix Match

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Match /api/private/*
    if (url.startsWith('/api/private')) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
})
```

### Suffix Match

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Match */export
    if (url.endsWith('/export')) {
      headers['Accept'] = 'application/csv'
    }
  }
})
```

### Contains

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Match any URL containing 'admin'
    if (url.includes('/admin/')) {
      headers['X-Admin-Context'] = 'true'
    }
  }
})
```

### Regex Match

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Match /api/v1/*, /api/v2/*, etc.
    if (/\/api\/v\d+\//.test(url)) {
      headers['X-API-Version'] = url.match(/v(\d+)/)?.[1]
    }
  }
})
```

## Common Patterns

### Public vs Private Routes

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Add auth to private routes only
    if (!url.startsWith('/api/public')) {
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
  }
})
```

### Admin Routes

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    if (url.includes('/admin/')) {
      // Additional checks for admin routes
      const adminToken = useCookie('admin-token').value
      if (!adminToken) {
        throw new Error('Admin access required')
      }
      headers['X-Admin-Token'] = adminToken
    }
  }
})
```

### API Versioning

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Different auth for different API versions
    if (url.startsWith('/api/v1')) {
      headers['Authorization'] = `Bearer ${v1Token}`
    } else if (url.startsWith('/api/v2')) {
      headers['Authorization'] = `ApiKey ${v2ApiKey}`
    }
  }
})
```

### External vs Internal APIs

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    if (url.startsWith('/api/external')) {
      // External API key
      headers['X-External-Key'] = externalKey
    } else {
      // Internal token
      headers['Authorization'] = `Bearer ${internalToken}`
    }
  }
})
```

## Multiple Conditions

### OR Logic

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Skip auth for health, metrics, or public routes
    const isPublic = url.startsWith('/api/public') ||
                    url === '/api/health' ||
                    url === '/api/metrics'
    
    if (!isPublic) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
})
```

### AND Logic

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Only for private admin routes
    if (url.startsWith('/api/admin') && !url.includes('/public')) {
      headers['X-Admin-Auth'] = adminToken
    }
  }
})
```

### Complex Logic

```typescript
useGlobalCallbacks({
  onRequest: ({ url, method, headers }) => {
    const isPrivate = !url.startsWith('/api/public')
    const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    const isAdmin = url.includes('/admin/')
    
    if (isPrivate || isWrite || isAdmin) {
      const token = useCookie('auth-token').value
      if (!token) {
        throw new Error('Authentication required')
      }
      headers['Authorization'] = `Bearer ${token}`
    }
  }
})
```

## Helper Functions

Create helper functions for reusable patterns:

```typescript
// composables/useUrlPatterns.ts
export function useUrlPatterns() {
  const isPublicRoute = (url: string) => {
    return url.startsWith('/api/public') ||
           url === '/api/health' ||
           url === '/api/metrics'
  }
  
  const isAdminRoute = (url: string) => {
    return url.includes('/admin/')
  }
  
  const requiresAuth = (url: string) => {
    return !isPublicRoute(url)
  }
  
  return {
    isPublicRoute,
    isAdminRoute,
    requiresAuth
  }
}

// Use in plugin
export default defineNuxtPlugin(() => {
  const { requiresAuth } = useUrlPatterns()
  
  useGlobalCallbacks({
    onRequest: ({ url, headers }) => {
      if (requiresAuth(url)) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
  })
})
```

## Real-World Examples

### Multi-Tenant Application

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Global routes don't need tenant header
    if (url.startsWith('/api/global')) {
      return
    }
    
    // All other routes need tenant
    const tenantId = useCookie('tenant-id').value
    headers['X-Tenant-ID'] = tenantId
  }
})
```

### Feature-Based Routing

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers }) => {
    // Different auth per feature
    if (url.startsWith('/api/billing')) {
      headers['X-Billing-Key'] = billingKey
    } else if (url.startsWith('/api/analytics')) {
      headers['X-Analytics-Key'] = analyticsKey
    } else if (url.startsWith('/api/users')) {
      headers['Authorization'] = `Bearer ${userToken}`
    }
  }
})
```

### Environment-Based Routing

```typescript
useGlobalCallbacks({
  onRequest: ({ url, headers, query }) => {
    // Debug flag for dev/staging
    if (process.env.NODE_ENV !== 'production') {
      if (url.startsWith('/api/debug')) {
        query.debug = true
        headers['X-Debug-Mode'] = 'true'
      }
    }
  }
})
```

### Rate Limiting

```typescript
const rateLimits = new Map<string, number>()

useGlobalCallbacks({
  onRequest: ({ url }) => {
    // Rate limit expensive endpoints
    if (url.includes('/api/export') || url.includes('/api/reports')) {
      const count = rateLimits.get(url) || 0
      rateLimits.set(url, count + 1)
      
      if (count > 10) {
        throw new Error('Rate limit exceeded')
      }
    }
  }
})
```

## Best Practices

### ✅ Do

```typescript
// ✅ Use clear, readable patterns
if (url.startsWith('/api/private'))

// ✅ Extract patterns to helper functions
if (requiresAuth(url))

// ✅ Document complex patterns
// Only add auth to non-public routes
if (!isPublicRoute(url))

// ✅ Use early returns for clarity
if (url.startsWith('/api/public')) {
  return  // Skip auth for public routes
}
headers['Authorization'] = token
```

### ❌ Don't

```typescript
// ❌ Don't use complex regex unnecessarily
if (/^\/api\/(?!public).*$/.test(url))  // Too complex

// ❌ Don't duplicate logic
if (url.startsWith('/api/private') || 
    url.startsWith('/api/admin') ||
    url.startsWith('/api/user'))  // Extract to helper

// ❌ Don't hardcode too much
if (url === '/api/users/123/profile')  // Too specific
```

## Testing Patterns

Test URL patterns in development:

```typescript
if (process.env.NODE_ENV === 'development') {
  useGlobalCallbacks({
    onRequest: ({ url }) => {
      console.log('[Pattern Test]', {
        url,
        isPublic: url.startsWith('/api/public'),
        isAdmin: url.includes('/admin'),
        requiresAuth: !url.startsWith('/api/public')
      })
    }
  })
}
```

## TypeScript Support

URL is fully typed:

```typescript
useGlobalCallbacks({
  onRequest: ({ url }) => {
    url  // string
    url.startsWith('/api')    // ✅
    url.includes('admin')     // ✅
    url.match(/pattern/)      // ✅
  }
})
```

## Next Steps

- [Control Options →](/composables/features/global-callbacks/control-options)
- [Setup Guide →](/composables/features/global-callbacks/setup)
- [Examples →](/examples/composables/global-callbacks/auth-token)
