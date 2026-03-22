# Plugin Configuration

Configure global callbacks and behavior using Nuxt plugins.

## Global Callbacks Plugin

Create a plugin to add global callbacks to all generated composables.

### Basic Setup

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  // Global callbacks will be added here
})
```

### Global Request Callback

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const globalCallbacks = {
    onRequest: (ctx: RequestContext) => {
      console.log(`[API] ${ctx.method} ${ctx.url}`)
    }
  }
  
  return {
    provide: {
      apiCallbacks: globalCallbacks
    }
  }
})
```

### Global Error Callback

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  const globalCallbacks = {
    onError: (error: Error, ctx: RequestContext) => {
      toast.error(`Failed: ${error.message}`)
    }
  }
  
  return {
    provide: {
      apiCallbacks: globalCallbacks
    }
  }
})
```

## Complete Plugin Example

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  const loading = useState('global-loading', () => false)
  
  const globalCallbacks = {
    onRequest: (ctx: RequestContext) => {
      loading.value = true
      console.log(`[API] ${ctx.method} ${ctx.url}`)
    },
    
    onSuccess: (data: any, ctx: RequestContext) => {
      loading.value = false
      
      // Show toast for mutations
      if (['POST', 'PUT', 'DELETE'].includes(ctx.method)) {
        toast.success('Success!')
      }
    },
    
    onError: (error: Error, ctx: RequestContext) => {
      loading.value = false
      
      const message = error.statusCode === 404
        ? 'Not found'
        : error.statusCode === 401
        ? 'Unauthorized'
        : 'An error occurred'
      
      toast.error(message)
    },
    
    onFinish: (ctx: RequestContext) => {
      loading.value = false
    }
  }
  
  return {
    provide: {
      apiCallbacks: globalCallbacks
    }
  }
})
```

## Authentication Plugin

Add authentication token to all requests.

```typescript
// plugins/auth.ts
export default defineNuxtPlugin(() => {
  const token = useCookie('auth_token')
  
  const globalCallbacks = {
    onRequest: (ctx: RequestContext) => {
      if (token.value) {
        ctx.headers = {
          ...ctx.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    },
    
    onError: (error: Error) => {
      // Redirect to login on 401
      if (error.statusCode === 401) {
        navigateTo('/login')
      }
    }
  }
  
  return {
    provide: {
      apiCallbacks: globalCallbacks
    }
  }
})
```

## Analytics Plugin

Track API usage.

```typescript
// plugins/analytics.ts
export default defineNuxtPlugin(() => {
  const globalCallbacks = {
    onRequest: (ctx: RequestContext) => {
      gtag('event', 'api_request', {
        method: ctx.method,
        url: ctx.url
      })
    },
    
    onSuccess: (data: any, ctx: RequestContext) => {
      gtag('event', 'api_success', {
        method: ctx.method,
        url: ctx.url
      })
    },
    
    onError: (error: Error, ctx: RequestContext) => {
      gtag('event', 'api_error', {
        method: ctx.method,
        url: ctx.url,
        error: error.message
      })
    }
  }
  
  return {
    provide: {
      apiCallbacks: globalCallbacks
    }
  }
})
```

## Multiple Plugins

Combine multiple plugins:

```typescript
// plugins/01.auth.ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      authCallbacks: { /* ... */ }
    }
  }
})

// plugins/02.analytics.ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      analyticsCallbacks: { /* ... */ }
    }
  }
})

// plugins/03.api.ts
export default defineNuxtPlugin((nuxtApp) => {
  const auth = nuxtApp.$authCallbacks
  const analytics = nuxtApp.$analyticsCallbacks
  
  const globalCallbacks = {
    onRequest: (ctx: RequestContext) => {
      auth.onRequest?.(ctx)
      analytics.onRequest?.(ctx)
    }
    // ... combine other callbacks
  }
  
  return {
    provide: {
      apiCallbacks: globalCallbacks
    }
  }
})
```

## Plugin Order

Control plugin execution order with filename prefixes:

```
plugins/
├── 01.auth.ts          # First
├── 02.analytics.ts     # Second
├── 03.api.ts           # Third
└── toast.client.ts     # Client-only
```

## Client-Only Plugin

```typescript
// plugins/analytics.client.ts
export default defineNuxtPlugin(() => {
  // Only runs on client
  const globalCallbacks = {
    onRequest: (ctx: RequestContext) => {
      if (window.gtag) {
        gtag('event', 'api_request', { url: ctx.url })
      }
    }
  }
  
  return {
    provide: {
      apiCallbacks: globalCallbacks
    }
  }
})
```

## Server-Only Plugin

```typescript
// plugins/logging.server.ts
export default defineNuxtPlugin(() => {
  // Only runs on server
  const globalCallbacks = {
    onRequest: (ctx: RequestContext) => {
      console.log(`[Server] ${ctx.method} ${ctx.url}`)
    }
  }
  
  return {
    provide: {
      apiCallbacks: globalCallbacks
    }
  }
})
```

## Next Steps

- [Runtime Config →](/api/runtime/config)
- [Global Callbacks →](/composables/features/global-callbacks/overview)
- [Examples →](/examples/composables/global-callbacks/auth-token)
