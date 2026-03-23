# Global Callbacks Setup

Global callbacks are configured in `plugins/api-callbacks.ts`. You need to **create this file manually** in your Nuxt project.

## Plugin Boilerplate

Create `plugins/api-callbacks.ts` with the following structure:

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  const globalCallbacks = {
    // onRequest, onSuccess, onError, onFinish
  }

  return {
    provide: {
      getGlobalApiCallbacks: () => globalCallbacks
    }
  }
})
```

::: warning
The `provide: { getGlobalApiCallbacks: () => globalCallbacks }` block is mandatory. Without it, the composables runtime cannot find the global callbacks.
:::

## Authentication

The most common use case â€” add an auth token to every request and redirect on 401:

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  const globalCallbacks = {
    onRequest: ({ headers }) => {
      const token = useCookie('auth-token').value
      if (token) {
        return {
          headers: { ...headers, 'Authorization': `Bearer ${token}` }
        }
      }
    },
    onError: (error) => {
      if (error.status === 401) {
        useCookie('auth-token').value = null
        navigateTo('/login')
        return false // Prevent local onError from also handling this
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

## Error Handling

Centralized error handling for all requests:

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()

  const globalCallbacks = {
    onError: (error) => {
      switch (error.status) {
        case 401:
          navigateTo('/login')
          return false
        case 403:
          toast.error('Access denied')
          return false
        case 404:
          toast.error('Resource not found')
          break
        default:
          if (error.status >= 500) {
            toast.error('Server error, please try again')
          }
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

## Using Nuxt Composables

Use any Nuxt composable at the plugin level (not inside the callbacks):

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore() // âœ… Call composables here
  const { locale } = useI18n()

  const globalCallbacks = {
    onRequest: ({ headers }) => {
      return {
        headers: {
          ...headers,
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {}),
          'Accept-Language': locale.value
        }
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

## Plugin Loading Order

Nuxt loads plugins alphabetically. Use numeric prefixes when the callbacks plugin depends on another plugin (e.g. an auth store):

```
plugins/
  01.auth.ts            # Sets up auth store first
  02.api-callbacks.ts   # Uses auth store
```

Or specify order explicitly in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  plugins: [
    '~/plugins/auth.ts',
    '~/plugins/api-callbacks.ts'
  ]
})
```

## Client vs Server

Use Nuxt file suffixes to restrict where the plugin runs:

```typescript
// plugins/api-callbacks.client.ts â€” client only
export default defineNuxtPlugin(() => {
  const globalCallbacks = {
    onRequest: ({ headers }) => {
      return { headers: { ...headers, 'X-User-Agent': navigator.userAgent } }
    }
  }
  return { provide: { getGlobalApiCallbacks: () => globalCallbacks } }
})
```

Or use conditional logic inside a single plugin:

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  const globalCallbacks = {
    onRequest: ({ headers }) => {
      const extra = process.client
        ? { 'X-User-Agent': navigator.userAgent }
        : { 'X-Server-ID': process.env.SERVER_ID ?? '' }

      return { headers: { ...headers, ...extra } }
    }
  }

  return { provide: { getGlobalApiCallbacks: () => globalCallbacks } }
})
```

## Best Practices

### âœ… Do

```typescript
// âœ… Return modifications from onRequest
onRequest: ({ headers }) => {
  return { headers: { ...headers, 'X-Custom': 'value' } }
}

// âœ… Return false to cancel local callback execution
onError: (error) => {
  if (error.status === 401) {
    navigateTo('/login')
    return false
  }
}

// âœ… Call composables at plugin level, not inside callbacks
export default defineNuxtPlugin(() => {
  const store = useAuthStore() // âœ… here
  const globalCallbacks = {
    onRequest: () => {
      store.token // use it here
    }
  }
})
```

### âŒ Don't

```typescript
// âŒ Don't mutate headers directly â€” won't work
onRequest: ({ headers }) => {
  headers['Authorization'] = 'Bearer token' // âŒ
}

// âŒ Don't call composables inside callbacks
onRequest: ({ headers }) => {
  const store = useAuthStore() // âŒ Call this at plugin level instead
}

// âŒ Don't make async API calls inside callbacks
onRequest: async () => {
  await $fetch('/other-endpoint') // âŒ Race conditions
}
```

## Next Steps

- [Control Options â†’](/composables/features/global-callbacks/control-options)
- [URL Patterns â†’](/composables/features/global-callbacks/patterns)
