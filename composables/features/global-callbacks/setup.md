# Global Callbacks Setup

Learn how to set up global callbacks in your Nuxt application using plugins.

## Plugin Setup

Create a plugin file to register global callbacks:

```typescript
// plugins/api-global-callbacks.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      // Add auth token to all requests
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
  })
})
```

## Plugin Naming

Nuxt loads plugins in alphabetical order. To control execution order, use numeric prefixes:

```
plugins/
  01.auth.ts              # Loads first
  02.api-callbacks.ts     # Loads second
  03.analytics.ts         # Loads third
```

Or use the explicit order option:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  plugins: [
    '~/plugins/auth.ts',
    '~/plugins/api-callbacks.ts',
    '~/plugins/analytics.ts'
  ]
})
```

## Basic Examples

### Authentication Only

```typescript
// plugins/api-auth.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    },
    onError: (error) => {
      if (error.status === 401) {
        useCookie('auth-token').value = null
        navigateTo('/login')
      }
    }
  })
})
```

### Error Handling Only

```typescript
// plugins/api-errors.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onError: (error) => {
      console.error('[API Error]', error)
      
      if (error.status === 404) {
        showToast('Resource not found', 'error')
      } else if (error.status >= 500) {
        showToast('Server error', 'error')
      }
    }
  })
})
```

### Logging Only

```typescript
// plugins/api-logging.ts
export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'development') {
    useGlobalCallbacks({
      onRequest: ({ url, method }) => {
        console.log(`[API] ${method} ${url}`)
      },
      onSuccess: () => {
        console.log('[API] ✅ Success')
      },
      onError: (error) => {
        console.error(`[API] ❌ Error ${error.status}`)
      }
    })
  }
})
```

## Complete Setup

Full-featured plugin with all callbacks:

```typescript
// plugins/api-global-callbacks.ts
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const toast = useToast()
  
  useGlobalCallbacks({
    onRequest: ({ url, method, headers, query }) => {
      // 1. Auth token
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }
      
      // 2. Request ID for tracing
      headers['X-Request-ID'] = crypto.randomUUID()
      
      // 3. Client info
      headers['X-Client-Version'] = '1.0.0'
      headers['X-Platform'] = 'web'
      
      // 4. Timestamp (prevent caching)
      query._t = Date.now()
      
      // 5. Log (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] → ${method} ${url}`)
      }
    },
    
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] ✅ Success')
      }
    },
    
    onError: (error) => {
      // 1. Log error
      console.error('[API Error]', {
        url: error.url,
        status: error.status,
        message: error.message,
        timestamp: new Date().toISOString()
      })
      
      // 2. Handle specific errors
      switch (error.status) {
        case 401:
          authStore.logout()
          toast.error('Session expired, please login')
          navigateTo('/login')
          break
          
        case 403:
          toast.error('Access denied')
          break
          
        case 404:
          toast.error('Resource not found')
          break
          
        case 422:
          toast.error('Validation error')
          break
          
        case 500:
        case 502:
        case 503:
          toast.error('Server error, please try again')
          break
          
        default:
          if (error.status >= 400) {
            toast.error('Request failed')
          }
      }
    },
    
    onFinish: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] 🏁 Complete')
      }
    }
  })
})
```

## Using Composables in Plugins

You can use other composables in your plugin:

```typescript
export default defineNuxtPlugin(() => {
  // ✅ Use Nuxt composables
  const route = useRoute()
  const authStore = useAuthStore()
  const { locale } = useI18n()
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      headers['Authorization'] = `Bearer ${authStore.token}`
      headers['Accept-Language'] = locale.value
      headers['X-Current-Route'] = route.path
    }
  })
})
```

## Environment-Specific Setup

Different callbacks for different environments:

```typescript
// plugins/api-global-callbacks.ts
export default defineNuxtPlugin(() => {
  const isDev = process.env.NODE_ENV === 'development'
  const isProd = process.env.NODE_ENV === 'production'
  
  useGlobalCallbacks({
    onRequest: ({ headers, query }) => {
      // Auth token (all environments)
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Debug mode (dev only)
      if (isDev) {
        query.debug = true
      }
      
      // Analytics (prod only)
      if (isProd) {
        headers['X-Client-Version'] = '1.0.0'
      }
    },
    
    onError: (error) => {
      // Detailed logging (dev only)
      if (isDev) {
        console.error('[API Error]', error)
      }
      
      // Error tracking (prod only)
      if (isProd) {
        sendToErrorTracking(error)
      }
      
      // User messages (all environments)
      if (error.status === 401) {
        navigateTo('/login')
      }
    }
  })
})
```

## Multiple Callback Registrations

You can call `useGlobalCallbacks` multiple times (they stack):

```typescript
// plugins/01.api-auth.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      // Add auth
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
  })
})

// plugins/02.api-logging.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ url, method }) => {
      // Add logging (stacks with auth)
      console.log(`${method} ${url}`)
    }
  })
})

// Both callbacks run!
```

## Client-Only vs Server

Control where callbacks run:

### Client-Only Plugin

```typescript
// plugins/api-callbacks.client.ts  ← .client suffix
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      // Only runs on client
      headers['X-User-Agent'] = navigator.userAgent
    }
  })
})
```

### Server-Only Plugin

```typescript
// plugins/api-callbacks.server.ts  ← .server suffix
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      // Only runs on server
      headers['X-Server-ID'] = process.env.SERVER_ID
    }
  })
})
```

### Conditional Logic

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      if (process.client) {
        // Client-side only
        headers['X-User-Agent'] = navigator.userAgent
      }
      
      if (process.server) {
        // Server-side only
        headers['X-Server-ID'] = process.env.SERVER_ID
      }
    }
  })
})
```

## TypeScript Support

Full type safety:

```typescript
import type { ApiRequestOptions } from '~/composables/api/runtime/callbacks'

export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ url, headers, body, query }) => {
      // All typed!
      url         // string
      headers     // Record<string, string>
      body        // any
      query       // Record<string, any>
    },
    onSuccess: (data) => {
      // data is typed based on API response
    },
    onError: (error) => {
      // error has status, statusText, data, url
      error.status      // number
      error.statusText  // string
    }
  })
})
```

## Best Practices

### ✅ Do

```typescript
// ✅ Use meaningful plugin names
// plugins/api-global-callbacks.ts

// ✅ Group related logic
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    // All auth logic here
  },
  onError: (error) => {
    // All error handling here
  }
})

// ✅ Use environment checks
if (process.env.NODE_ENV === 'development') {
  // Dev-only code
}

// ✅ Keep it simple
// Global callbacks should be lightweight
```

### ❌ Don't

```typescript
// ❌ Don't make API calls in callbacks
onRequest: async () => {
  await $fetch('/other-endpoint') // Race conditions!
}

// ❌ Don't put heavy logic in global callbacks
onRequest: () => {
  // Don't: complex computations
  // Don't: DOM manipulation
  // Don't: heavy transformations
}

// ❌ Don't rely on call order between plugins
// Use numeric prefixes if order matters
```

## Debugging

Enable verbose logging to debug global callbacks:

```typescript
export default defineNuxtPlugin(() => {
  const debug = process.env.NODE_ENV === 'development'
  
  useGlobalCallbacks({
    onRequest: (context) => {
      if (debug) {
        console.group('[Global Callback] onRequest')
        console.log('URL:', context.url)
        console.log('Method:', context.method)
        console.log('Headers:', context.headers)
        console.log('Body:', context.body)
        console.log('Query:', context.query)
        console.groupEnd()
      }
    }
  })
})
```

## Next Steps

- [Control Options →](/composables/features/global-callbacks/control-options)
- [URL Patterns →](/composables/features/global-callbacks/patterns)
- [Examples →](/examples/composables/global-callbacks/auth-token)
