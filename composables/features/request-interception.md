# Request Interception

Request interception allows you to modify outgoing requests before they're sent to the API server.

## Overview

Use the `onRequest` callback to intercept and modify:

- **Headers**: Add, modify, or remove headers
- **Query Parameters**: Add or modify query params
- **Body**: Modify request body (POST/PUT/PATCH)
- **URL**: Inspect (but not modify) the URL

```typescript
useFetchGetPets({}, {
  onRequest: ({ url, method, headers, body, query }) => {
    // Modify the request before it's sent
  }
})
```

## Modifying Headers

### Add Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    headers['X-Custom-Header'] = 'value'
    headers['X-Request-ID'] = crypto.randomUUID()
    headers['X-Client-Version'] = '1.0.0'
  }
})
```

### Multiple Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    Object.assign(headers, {
      'X-Platform': 'web',
      'X-Language': 'en',
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'X-Request-Time': Date.now().toString()
    })
  }
})
```

### Conditional Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    const isDev = process.env.NODE_ENV === 'development'
    
    if (isDev) {
      headers['X-Debug-Mode'] = 'true'
    }
    
    const locale = useI18n().locale.value
    headers['Accept-Language'] = locale
  }
})
```

### Remove Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    // Remove a header by setting to undefined
    delete headers['X-Unwanted-Header']
  }
})
```

## Modifying Query Parameters

### Add Query Params

```typescript
useFetchGetPets({}, {
  onRequest: ({ query }) => {
    query.timestamp = Date.now()
    query.version = 'v2'
    query.format = 'json'
  }
})
```

### Modify Existing Params

```typescript
useFetchGetPets(
  { status: 'available', limit: 10 },
  {
    onRequest: ({ query }) => {
      // Increase limit
      query.limit = 100
      
      // Add additional filter
      query.includeArchived = true
    }
  }
)
```

### Array to String

```typescript
useFetchGetPets(
  { tags: ['dog', 'cat'] },
  {
    onRequest: ({ query }) => {
      // Convert array to comma-separated string
      if (Array.isArray(query.tags)) {
        query.tags = query.tags.join(',')
      }
    }
  }
)
```

## Modifying Body

### Add Fields to Body

```typescript
useFetchCreatePet(
  { body: { name: 'Fluffy', status: 'available' } },
  {
    onRequest: ({ body }) => {
      if (body) {
        body.createdAt = new Date().toISOString()
        body.clientVersion = '1.0.0'
        body.source = 'web'
      }
    }
  }
)
```

### Transform Body

```typescript
useFetchCreatePet(
  { body: { name: 'fluffy' } },
  {
    onRequest: ({ body }) => {
      if (body && body.name) {
        // Capitalize name
        body.name = body.name.charAt(0).toUpperCase() + body.name.slice(1)
      }
    }
  }
)
```

### Validate Before Send

```typescript
useFetchCreatePet(
  { body: formData.value },
  {
    onRequest: ({ body }) => {
      if (body) {
        // Validate
        if (!body.name || body.name.trim() === '') {
          throw new Error('Name is required')
        }
        
        // Sanitize
        body.name = body.name.trim()
      }
    }
  }
)
```

## Common Use Cases

### Add Authentication

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

### Request Tracing

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers, url, method }) => {
    const traceId = crypto.randomUUID()
    headers['X-Trace-ID'] = traceId
    headers['X-Span-ID'] = crypto.randomUUID()
    
    console.log(`[Trace ${traceId}] ${method} ${url}`)
  }
})
```

### Prevent Caching

```typescript
useFetchGetPets({}, {
  onRequest: ({ query }) => {
    // Add timestamp to prevent caching
    query._t = Date.now()
  }
})
```

### Add Metadata

```typescript
useFetchCreateOrder(
  { body: orderData.value },
  {
    onRequest: ({ body, headers }) => {
      if (body) {
        // Add client metadata
        body.metadata = {
          clientVersion: '1.0.0',
          platform: 'web',
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      }
      
      // Add correlation ID
      headers['X-Correlation-ID'] = crypto.randomUUID()
    }
  }
)
```

### API Versioning

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers, query }) => {
    // Use headers for versioning
    headers['X-API-Version'] = '2.0'
    
    // Or use query params
    query.api_version = '2.0'
  }
})
```

### Locale/i18n

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers, query }) => {
    const { locale } = useI18n()
    
    // Via header
    headers['Accept-Language'] = locale.value
    
    // Or via query
    query.locale = locale.value
  }
})
```

## Global Interception

Use global callbacks for app-wide interception:

```typescript
// plugins/api-interceptor.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers, query }) => {
      // Add to ALL requests
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Prevent caching
      query._t = Date.now()
      
      // Add client info
      headers['X-Client-Version'] = '1.0.0'
    }
  })
})
```

## Advanced Patterns

### Retry with Backoff

```vue
<script setup lang="ts">
const retryCount = ref(0)
const maxRetries = 3

const { refresh } = useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    if (retryCount.value > 0) {
      headers['X-Retry-Count'] = retryCount.value.toString()
    }
  },
  onError: async (error) => {
    if (error.status >= 500 && retryCount.value < maxRetries) {
      retryCount.value++
      const delay = Math.pow(2, retryCount.value) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      refresh()
    }
  }
})
</script>
```

### Feature Flags

```typescript
const featureFlags = useFeatureFlags()

useFetchGetPets({}, {
  onRequest: ({ headers, query }) => {
    // Send active feature flags
    headers['X-Features'] = Object.keys(featureFlags)
      .filter(key => featureFlags[key])
      .join(',')
  }
})
```

### A/B Testing

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    const variant = useCookie('ab-test-variant').value || 'A'
    headers['X-AB-Variant'] = variant
  }
})
```

## TypeScript Support

Full type safety:

```typescript
useFetchGetPets({}, {
  onRequest: ({ url, method, headers, body, query }) => {
    url         // string (readonly)
    method      // string (readonly)
    headers     // Record<string, string> (mutable)
    body        // any (mutable)
    query       // Record<string, any> (mutable)
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

// ✅ Transform body data
onRequest: ({ body }) => {
  if (body) {
    body.processed = true
  }
}

// ✅ Use for auth
onRequest: ({ headers }) => {
  headers['Authorization'] = `Bearer ${token}`
}
```

### ❌ Don't

```typescript
// ❌ Don't try to modify url/method
onRequest: ({ url, method }) => {
  url = '/different-url'      // Readonly!
  method = 'POST'             // Readonly!
}

// ❌ Don't make API calls
onRequest: async () => {
  await $fetch('/other-endpoint')  // Race conditions!
}

// ❌ Don't do heavy processing
onRequest: ({ body }) => {
  // Don't: complex algorithms
  // Don't: large data processing
}
```

## Next Steps

- [Callbacks Overview →](/composables/features/callbacks/overview)
- [onRequest Callback →](/composables/features/callbacks/on-request)
- [Global Callbacks →](/composables/features/global-callbacks/overview)
- [Examples →](/examples/composables/callbacks/request-logging)
