# Global Callbacks

Global callbacks let you define callback logic **once** in a Nuxt plugin and automatically apply it to **all API requests** in your application.

## Why Global Callbacks?

Instead of repeating the same callbacks in every composable:

```typescript
// ❌ Repetitive - same auth logic everywhere
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    return { headers: { ...headers, 'Authorization': `Bearer ${getToken()}` } }
  }
})

useFetchGetOwners({}, {
  onRequest: ({ headers }) => {
    return { headers: { ...headers, 'Authorization': `Bearer ${getToken()}` } }
  }
})
```

Define once in a plugin, apply to every request automatically:

```typescript
// ✅ plugins/api-callbacks.ts — runs for ALL requests
const globalCallbacks = {
  onRequest: ({ headers }) => {
    const token = useCookie('auth-token').value
    if (token) {
      return { headers: { ...headers, 'Authorization': `Bearer ${token}` } }
    }
  }
}
```

## The Plugin File

Global callbacks live in a Nuxt plugin you create manually at `plugins/api-callbacks.ts`:

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  const globalCallbacks = {
    onRequest: ({ headers }) => {
      const token = useCookie('auth-token').value
      if (token) {
        return { headers: { ...headers, 'Authorization': `Bearer ${token}` } }
      }
    },
    onError: (error) => {
      if (error.status === 401) {
        navigateTo('/login')
      }
    }
  }

  return {
    provide: {
      getGlobalApiCallbacks: () => globalCallbacks
    }
  }
})
```

::: tip
The `provide: { getGlobalApiCallbacks: () => globalCallbacks }` block is required — it connects the plugin to the composables runtime. Don't remove it.
:::

[Full setup guide →](/composables/features/global-callbacks/setup)

## All Four Callbacks

The `globalCallbacks` object supports the same four lifecycle callbacks as local callbacks:

```typescript
const globalCallbacks = {
  onRequest: ({ url, headers, body, query }) => {
    // Before every request — return modifications to apply them
    return { headers: { ...headers, 'X-Request-ID': crypto.randomUUID() } }
  },
  onSuccess: (data, context) => {
    // After every successful request
  },
  onError: (error, context) => {
    // After every failed request
    // Return false to prevent local onError from running
  },
  onFinish: ({ success, data, error }) => {
    // After every request (success or failure)
  }
}
```

::: tip onSuccess and onError receive a second `context` parameter
Unlike local callbacks, the global `onSuccess` and `onError` receive an optional `context` object with request metadata.
:::

## Execution Order

Global callbacks always run **before** local callbacks:

```
    Request
       │
       ▼
  Global onRequest  →  Local onRequest
                              │
                              ▼
                        HTTP Request
                              │
                    ┌─────────┴─────────┐
                    │                   │
               2xx Success         4xx/5xx Error
                    │                   │
                    ▼                   ▼
          Global onSuccess       Global onError
                    │                   │
                    ▼                   ▼
           Local onSuccess        Local onError
                    │                   │
                    └──────────┬────────┘
                               │
                               ▼
                      Global onFinish
                               │
                               ▼
                       Local onFinish
```

## Control Options

Skip global callbacks for specific requests directly from the composable:

```typescript
// Skip ALL global callbacks
useFetchGetPublicPets({}, {
  skipGlobalCallbacks: true
})

// Skip only specific callbacks
useFetchGetPets({}, {
  skipGlobalCallbacks: ['onSuccess', 'onFinish']
})
```

[Learn more about control options →](/composables/features/global-callbacks/control-options)

## Next Steps

- [Setup Guide →](/composables/features/global-callbacks/setup)
- [Control Options →](/composables/features/global-callbacks/control-options)
- [URL Patterns →](/composables/features/global-callbacks/patterns)
