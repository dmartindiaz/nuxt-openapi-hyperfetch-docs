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
    // Return modifications to apply them
    return {
      headers: { ...headers, 'X-Custom': 'value' },
      query: { ...query, timestamp: Date.now() }
    }
  }
})
```

## Modifying Headers

### Add Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'X-Custom-Header': 'value',
        'X-Request-ID': crypto.randomUUID(),
        'X-Client-Version': '1.0.0'
      }
    }
  }
})
```

### Multiple Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'X-Platform': 'web',
        'X-Language': 'en',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'X-Request-Time': Date.now().toString()
      }
    }
  }
})
```

### Conditional Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    const isDev = process.env.NODE_ENV === 'development'
    const locale = useI18n().locale.value
    
    return {
      headers: {
        ...headers,
        ...(isDev && { 'X-Debug-Mode': 'true' }),
        'Accept-Language': locale
      }
    }
  }
})
```

### Remove Headers

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    const { ['X-Unwanted-Header']: removed, ...rest } = headers || {}
    return {
      headers: rest
    }
  }
})
```

## Modifying Query Parameters

### Add Query Params

```typescript
useFetchGetPets({}, {
  onRequest: ({ query }) => {
    return {
      query: {
        ...query,
        timestamp: Date.now(),
        version: 'v2',
        format: 'json'
      }
    }
  }
})
```

### Modify Existing Params

```typescript
useFetchGetPets(
  { status: 'available', limit: 10 },
  {
    onRequest: ({ query }) => {
      return {
        query: {
          ...query,
          limit: 100,
          includeArchived: true
        }
      }
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
      return {
        query: {
          ...query,
          tags: Array.isArray(query?.tags) ? query.tags.join(',') : query?.tags
        }
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
        return {
          body: {
            ...body,
            createdAt: new Date().toISOString(),
            clientVersion: '1.0.0',
            source: 'web'
          }
        }
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
        return {
          body: {
            ...body,
            name: body.name.charAt(0).toUpperCase() + body.name.slice(1)
          }
        }
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
        
        // Return sanitized body
        return {
          body: {
            ...body,
            name: body.name.trim()
          }
        }
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
      return {
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`
        }
      }
    }
  }
})
```

### Request Tracing

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers, url, method }) => {
    const traceId = crypto.randomUUID()
    
    console.log(`[Trace ${traceId}] ${method} ${url}`)
    
    return {
      headers: {
        ...headers,
        'X-Trace-ID': traceId,
        'X-Span-ID': crypto.randomUUID()
      }
    }
  }
})
```

### Prevent Caching

```typescript
useFetchGetPets({}, {
  onRequest: ({ query }) => {
    return {
      query: {
        ...query,
        _t: Date.now()
      }
    }
  }
})
```

### Add Metadata

```typescript
useFetchCreateOrder(
  { body: orderData.value },
  {
    onRequest: ({ body, headers }) => {
      return {
        body: body ? {
          ...body,
          metadata: {
            clientVersion: '1.0.0',
            platform: 'web',
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          }
        } : body,
        headers: {
          ...headers,
          'X-Correlation-ID': crypto.randomUUID()
        }
      }
    }
  }
)
```

### API Versioning

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers, query }) => {
    return {
      headers: {
        ...headers,
        'X-API-Version': '2.0'
      },
      query: {
        ...query,
        api_version: '2.0'
      }
    }
  }
})
```

### Locale/i18n

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers, query }) => {
    const { locale } = useI18n()
    
    return {
      headers: {
        ...headers,
        'Accept-Language': locale.value
      },
      query: {
        ...query,
        locale: locale.value
      }
    }
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
      const token = useCookie('auth-token').value
      
      return {
        headers: {
          ...headers,
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'X-Client-Version': '1.0.0'
        },
        query: {
          ...query,
          _t: Date.now()
        }
      }
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
      return {
        headers: {
          ...headers,
          'X-Retry-Count': retryCount.value.toString()
        }
      }
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
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'X-Features': Object.keys(featureFlags)
          .filter(key => featureFlags[key])
          .join(',')
      }
    }
  }
})
```

### A/B Testing

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    const variant = useCookie('ab-test-variant').value || 'A'
    return {
      headers: {
        ...headers,
        'X-AB-Variant': variant
      }
    }
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
    headers     // Record<string, string> | undefined
    body        // any | undefined
    query       // Record<string, any> | undefined
    
    // Return modifications:
    return {
      headers: { ...headers, 'X-Custom': 'value' },
      query: { ...query, timestamp: Date.now() },
      body: body ? { ...body, extra: 'data' } : undefined
    }
  }
})
```

## Best Practices

### ✅ Do

```typescript
// ✅ Return modified headers
onRequest: ({ headers }) => {
  return {
    headers: { ...headers, 'X-Custom': 'value' }
  }
}

// ✅ Return modified query
onRequest: ({ query }) => {
  return {
    query: { ...query, timestamp: Date.now() }
  }
}

// ✅ Return modified body
onRequest: ({ body }) => {
  if (body) {
    return {
      body: { ...body, processed: true }
    }
  }
}

// ✅ Use for auth
onRequest: ({ headers }) => {
  return {
    headers: { ...headers, 'Authorization': `Bearer ${token}` }
  }
}
```

### ❌ Don't

```typescript
// ❌ Don't modify directly (won't work!)
onRequest: ({ headers }) => {
  headers['X-Custom'] = 'value' // ❌ Direct mutation doesn't work!
}

// ❌ Don't try to modify url/method
onRequest: () => {
  return {
    url: '/different-url',  // ❌ url/method cannot be modified!
    method: 'POST'
  }
}

// ❌ Don't make API calls
onRequest: async () => {
  await $fetch('/other-endpoint')  // ❌ Race conditions!
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
