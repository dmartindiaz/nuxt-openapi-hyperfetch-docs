# onRequest Callback

The `onRequest` callback is called **before** the HTTP request is sent, allowing you to modify the request or execute side effects.

## Signature

```typescript
onRequest?: (context: OnRequestContext) => void | Promise<void>

interface OnRequestContext {
  url: string                      // Request URL
  method: string                   // HTTP method (GET, POST, etc.)
  headers: Record<string, string>  // Request headers (mutable)
  body?: any                       // Request body (mutable)
  query: Record<string, any>       // Query parameters (mutable)
}
```

## Basic Usage

```typescript
useFetchGetPets({}, {
  onRequest: ({ url, method, headers }) => {
    console.log(`Making ${method} request to ${url}`)
  }
})
```

## Common Use Cases

### Add Custom Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    headers['X-Custom-Header'] = 'value'
    headers['X-Request-ID'] = crypto.randomUUID()
    headers['X-Client-Version'] = '1.0.0'
  }
})
```

### Add Authentication Token

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    const token = useCookie('auth-token').value
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
})
```

### Modify Query Parameters

```typescript
useFetchGetPets({}, {
  onRequest: ({ query }) => {
    // Add timestamp to prevent caching
    query.timestamp = Date.now()
    
    // Add version
    query.v = '2.0'
    
    // Convert arrays to comma-separated
    if (Array.isArray(query.tags)) {
      query.tags = query.tags.join(',')
    }
  }
})
```

### Modify Request Body

```typescript
useFetchCreatePet(
  { body: { name: 'Fluffy' } },
  {
    onRequest: ({ body }) => {
      if (body) {
        // Add client metadata
        body.clientVersion = '1.0.0'
        body.timestamp = Date.now()
        body.locale = navigator.language
      }
    }
  }
)
```

### Request Logging

```typescript
useFetchGetPets({}, {
  onRequest: ({ url, method, headers, body, query }) => {
    console.group(`[API] ${method} ${url}`)
    console.log('Headers:', headers)
    console.log('Query:', query)
    if (body) console.log('Body:', body)
    console.groupEnd()
  }
})
```

### Show Loading Indicator

```vue
<script setup lang="ts">
const loading = ref(false)

const { data: pets } = useFetchGetPets({}, {
  onRequest: () => {
    loading.value = true
  },
  onFinish: () => {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="loading-spinner">Loading...</div>
</template>
```

### Track Analytics

```typescript
useFetchGetPets({}, {
  onRequest: ({ url, method }) => {
    trackEvent('api_request', {
      url,
      method,
      timestamp: Date.now()
    })
  }
})
```

### Correlation IDs

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    // Generate correlation ID for request tracing
    const correlationId = crypto.randomUUID()
    headers['X-Correlation-ID'] = correlationId
    
    // Store for later use
    sessionStorage.setItem('last-correlation-id', correlationId)
  }
})
```

## Async Operations

The callback can be async:

```typescript
useFetchGetPets({}, {
  onRequest: async ({ headers }) => {
    // Refresh token if needed
    const token = await refreshTokenIfNeeded()
    headers['Authorization'] = `Bearer ${token}`
  }
})
```

## Modifying the Request

All properties except `url` and `method` are **mutable**:

```typescript
useFetchGetPets({}, {
  onRequest: (context) => {
    // ✅ Can modify
    context.headers['X-Custom'] = 'value'
    context.query.page = 1
    if (context.body) {
      context.body.extra = 'data'
    }
    
    // ❌ Cannot modify (readonly)
    // context.url = '/different-url'
    // context.method = 'POST'
  }
})
```

## Multiple Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    Object.assign(headers, {
      'X-Request-ID': crypto.randomUUID(),
      'X-Client-Version': '1.0.0',
      'X-Platform': 'web',
      'X-Locale': navigator.language,
      'Accept-Language': navigator.language
    })
  }
})
```

## Conditional Logic

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers, query }) => {
    // Add auth only for certain environments
    if (process.env.NODE_ENV === 'production') {
      const token = useCookie('auth-token').value
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Add debug flag in development
    if (process.env.NODE_ENV === 'development') {
      query.debug = true
    }
  }
})
```

## Error Handling in Callbacks

If `onRequest` throws, the request **is not sent**:

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    const token = useCookie('auth-token').value
    if (!token) {
      // Request will not be sent
      throw new Error('No auth token available')
    }
    headers['Authorization'] = `Bearer ${token}`
  }
})
```

## Best Practices

### ✅ Do

```typescript
// ✅ Add headers
onRequest: ({ headers }) => {
  headers['X-Custom'] = 'value'
}

// ✅ Modify query params
onRequest: ({ query }) => {
  query.timestamp = Date.now()
}

// ✅ Log requests
onRequest: ({ url, method }) => {
  console.log(`${method} ${url}`)
}

// ✅ Track analytics
onRequest: async ({ url }) => {
  await trackEvent('api_request', { url })
}
```

### ❌ Don't

```typescript
// ❌ Don't mutate url/method
onRequest: (context) => {
  context.url = '/different-url' // Readonly!
}

// ❌ Don't modify unrelated state
onRequest: () => {
  someUnrelatedState.value = true // Side effect!
}

// ❌ Don't make other API calls (race conditions)
onRequest: async () => {
  await $fetch('/other-endpoint') // Can cause issues
}
```

## Integration with Global Callbacks

Local `onRequest` runs **after** global `onRequest`:

```typescript
// plugins/api.ts
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    // 1️⃣ Runs first
    headers['Authorization'] = `Bearer ${token}`
  }
})

// Component
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    // 2️⃣ Runs second (can override global)
    headers['X-Custom'] = 'value'
  }
})
```

## Examples

### API Client Version Header

```typescript
const API_VERSION = '2.0.0'

useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    headers['X-API-Version'] = API_VERSION
  }
})
```

### Request Timing

```typescript
const requestStart = ref<number>(0)

useFetchGetPets({}, {
  onRequest: () => {
    requestStart.value = performance.now()
  },
  onFinish: () => {
    const duration = performance.now() - requestStart.value
    console.log(`Request took ${duration}ms`)
  }
})
```

### Locale Header

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    const locale = useI18n().locale.value
    headers['Accept-Language'] = locale
  }
})
```

## Next Steps

- [onSuccess Callback →](/composables/features/callbacks/on-success)
- [Global Callbacks →](/composables/features/global-callbacks/overview)
- [Request Interception →](/composables/features/request-interception)
