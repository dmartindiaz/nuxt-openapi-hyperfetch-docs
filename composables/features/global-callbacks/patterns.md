# URL Patterns

URL-based control is available in two forms:

1. The `patterns` array in `globalCallbacks` — apply all global callbacks only to matching URLs
2. URL conditions inside individual callbacks — fine-grained per-callback logic

## Using the patterns Array

Set `patterns` in your `globalCallbacks` object to restrict ALL global callbacks to specific URL globs:

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  const globalCallbacks = {
    patterns: ['/api/private/**', '/api/admin/**'],
    onRequest: ({ headers }) => {
      const token = useCookie('auth-token').value
      return { headers: { ...headers, 'Authorization': `Bearer ${token}` } }
    }
  }
  return { provide: { getGlobalApiCallbacks: () => globalCallbacks } }
})
```

All global callbacks (onRequest, onSuccess, onError, onFinish) are silently skipped when the URL doesn't match any pattern.

## Filtering Inside Callbacks

For per-callback URL logic, check `url` directly inside the callback:

```typescript
const globalCallbacks = {
  onRequest: ({ url, headers }) => {
    if (!url.startsWith('/api/private')) return // no-op for public routes
    const token = useCookie('auth-token').value
    return { headers: { ...headers, 'Authorization': `Bearer ${token}` } }
  }
}
```

### Common Patterns

```typescript
// Prefix check
if (url.startsWith('/api/admin')) { ... }

// Exact match
if (url === '/api/health') { ... }

// Exclude pattern
if (!url.startsWith('/api/public')) { ... }

// Contains
if (url.includes('/admin/')) { ... }

// Multiple conditions
const isProtected = url.startsWith('/api/private') || url.includes('/admin/')
```

### Multiple Route Groups

```typescript
const globalCallbacks = {
  onRequest: ({ url, headers }) => {
    if (url.startsWith('/api/billing')) {
      return { headers: { ...headers, 'X-Billing-Key': billingKey } }
    }
    if (url.startsWith('/api/users')) {
      const token = useCookie('auth-token').value
      return { headers: { ...headers, 'Authorization': `Bearer ${token}` } }
    }
    // No extra headers for other routes
  }
}
```

## Best Practices

```typescript
// ✅ Use patterns when the same logic applies to a named group of routes
const globalCallbacks = {
  patterns: ['/api/private/**'],
  onRequest: ({ headers }) => { ... }
}

// ✅ Use url conditions inside callbacks for fine-grained logic
onRequest: ({ url, headers }) => {
  if (url.startsWith('/api/billing')) { ... }
}

// ✅ Use early returns for clarity
onRequest: ({ url, headers }) => {
  if (url.startsWith('/api/public')) return
  return { headers: { ...headers, 'Authorization': `Bearer ${token}` } }
}

// ✅ Extract a helper for reused conditions
const isPublic = (url: string) =>
  url.startsWith('/api/public') || url === '/api/health'
```

## Next Steps

- [Control Options →](/composables/features/global-callbacks/control-options)
- [Setup Guide →](/composables/features/global-callbacks/setup)
