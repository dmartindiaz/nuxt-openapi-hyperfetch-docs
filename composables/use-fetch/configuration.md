# useFetch Configuration

Complete reference for configuration options added by the CLI.

## Overview

The CLI adds **two types of options** to generated composables:

1. **Lifecycle Callbacks** - Execute code at different request stages
2. **Global Callback Control** - Control when global callbacks apply

::: tip Nuxt Options
All standard Nuxt `useFetch` options are also available (`immediate`, `watch`, `server`, `lazy`, `transform`, etc.).

See [Nuxt useFetch Documentation](https://nuxt.com/docs/api/composables/use-fetch) for complete list.
:::

## Options Interface

```typescript
interface ApiRequestOptions<T> {
  // CLI Options: Lifecycle callbacks
  onRequest?: (context: OnRequestContext) => void | Promise<void>
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: ApiError) => void | Promise<void>
  onFinish?: (context: FinishContext<T>) => void | Promise<void>
  
  // CLI Options: Global callback control
  skipGlobalCallbacks?: boolean
  skipForUrls?: string[]
  
  // Nuxt useFetch options (all available)
  immediate?: boolean
  watch?: boolean
  server?: boolean
  lazy?: boolean
  transform?: (data: T) => any
  // ... see Nuxt docs for complete list
}
```

## Lifecycle Callbacks

Execute code at different stages of the request lifecycle.

### onRequest

Called **before** the request is sent. Use to modify headers, query params, or log requests.

```typescript
useFetchGetPets({}, {
  onRequest: ({ url, method, headers, body, query }) => {
    // Add custom header
    headers['X-Request-ID'] = crypto.randomUUID()
    
    // Modify query parameters
    query.timestamp = Date.now()
    
    // Log request
    console.log(`[API] ${method} ${url}`)
  }
})
```

**Context:**

```typescript
interface OnRequestContext {
  url: string
  method: string
  headers: Record<string, string>
  body?: any
  query: Record<string, any>
}
```

**Use cases:**
- Add authentication tokens
- Add correlation IDs for tracing
- Modify query params dynamically
- Log requests for debugging
- Add custom headers

### onSuccess

Called when response status is **2xx**. Response data is fully typed from your OpenAPI schema.

```typescript
useFetchCreatePet(
  { body: { name: 'Fluffy' } },
  {
    onSuccess: (pet) => {
      // 'pet' is typed as Pet from OpenAPI
      showToast(`Created pet: ${pet.name}`, 'success')
      navigateTo(`/pets/${pet.id}`)
    }
  }
)
```

**Context:** `T` (response data, fully typed from OpenAPI)

**Use cases:**
- Show success messages
- Navigate to another page
- Update other state
- Track analytics

### onError

Called when response status is **4xx/5xx** or network error occurs.

```typescript
useFetchGetPets({}, {
  onError: (error) => {
    // Handle different error types
    if (error.status === 404) {
      showToast('Resource not found', 'error')
    } else if (error.status === 401) {
      navigateTo('/login')
    } else if (error.status >= 500) {
      showToast('Server error, please try again', 'error')
    } else {
      showToast(`Error: ${error.message}`, 'error')
    }
  }
})
```

**Context:**

```typescript
interface ApiError extends Error {
  status: number           // HTTP status code
  statusText: string       // HTTP status text
  data: any                // Response body (if any)
  url: string              // Request URL
}
```

**Use cases:**
- Show error messages
- Redirect on authentication errors
- Log errors to tracking service
- Retry failed requests
- Handle specific error codes

### onFinish

Called **always** after request completes, regardless of success or failure.

```typescript
const loading = ref(false)

useFetchGetPets({}, {
  onRequest: () => {
    loading.value = true
  },
  onFinish: ({ success, data, error }) => {
    loading.value = false
    console.log('Request complete:', success ? 'success' : 'failed')
  }
})
```

**Context:**

```typescript
interface FinishContext<T> {
  success: boolean    // true if success, false if error
  data: T | null      // Response data (null if error)
  error: ApiError | null  // Error object (null if success)
}
```

**Use cases:**
- Hide loading spinners
- Cleanup resources
- Track request completion
- Log request duration

## Global Callback Control

Control when global callbacks are applied to requests.

### skipGlobalCallbacks

Skip **all** global callbacks for a specific request:

```typescript
useFetchGetPublicPets({}, {
  skipGlobalCallbacks: true
})
```

**Use cases:**
- Skip authentication for public endpoints
- Skip global error handling for specific requests
- Prevent global loading indicators

**Example:**

```typescript
// In plugin: Add auth to all requests
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    headers['Authorization'] = `Bearer ${getToken()}`
  }
})

// In component: Skip auth for public endpoint
useFetchGetPublicPets({}, {
  skipGlobalCallbacks: true // Don't add auth token
})
```

### skipForUrls

Skip global callbacks only for specific URL patterns:

```typescript
useFetchGetData({}, {
  skipForUrls: ['/api/public/*', '/health']
})
```

**Use cases:**
- Skip auth for specific URL patterns
- Skip global callbacks for health checks
- Fine-grained control over global callbacks

[Learn more about global callbacks →](/composables/features/global-callbacks/overview)

## Complete Example

```vue
<script setup lang="ts">
const { data, pending, error, execute } = useFetchGetPets(
  { status: 'available', limit: 20 },
  {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CLI Options: Lifecycle Callbacks
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    onRequest: ({ url, headers }) => {
      console.log('Fetching from:', url)
      headers['X-Request-ID'] = crypto.randomUUID()
    },
    onSuccess: (pets) => {
      showToast(`Loaded ${pets.length} pets`, 'success')
    },
    onError: (error) => {
      if (error.status === 401) {
        navigateTo('/login')
      } else {
        showToast('Failed to load pets', 'error')
      }
    },
    onFinish: ({ success }) => {
      console.log('Request complete:', success)
    },
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CLI Options: Global Callback Control
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    skipGlobalCallbacks: false,
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Nuxt Options (see Nuxt docs)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    immediate: true,
    watch: true,
    server: true,
  }
)
</script>
```

## Common Patterns

### Auth-Protected Request

```typescript
useFetchGetUserProfile(
  { userId: currentUser.value.id },
  {
    onRequest: ({ headers }) => {
      const token = useCookie('auth-token').value
      headers['Authorization'] = `Bearer ${token}`
    },
    onError: (error) => {
      if (error.status === 401) {
        navigateTo('/login')
      }
    },
    server: false // Nuxt option: only on client
  }
)
```

### Form Submission with Optimistic UI

```typescript
const form = ref({ name: '', email: '' })
const optimisticUser = ref(null)

const { execute: submit, pending } = useFetchCreateUser(
  { body: form.value },
  {
    immediate: false, // Nuxt option
    onRequest: () => {
      // Optimistic update
      optimisticUser.value = { ...form.value, id: 'temp' }
    },
    onSuccess: (user) => {
      optimisticUser.value = user
      showToast('User created!', 'success')
      form.value = { name: '', email: '' }
    },
    onError: () => {
      optimisticUser.value = null
      showToast('Failed to create user', 'error')
    }
  }
)
```

### Retry on Failure

```typescript
const maxRetries = 3
let retryCount = 0

const { data, execute } = useFetchGetData(
  {},
  {
    immediate: false, // Nuxt option
    onError: async (error) => {
      if (error.status >= 500 && retryCount < maxRetries) {
        retryCount++
        console.log(`Retry ${retryCount}/${maxRetries}`)
        await new Promise(r => setTimeout(r, 1000 * retryCount))
        execute()
      }
    },
    onSuccess: () => {
      retryCount = 0 // Reset on success
    }
  }
)
```

## Next Steps

- **Nuxt useFetch**: [Official Documentation](https://nuxt.com/docs/api/composables/use-fetch) - Complete Nuxt options reference
- **Callbacks**: [Lifecycle Callbacks](/composables/features/callbacks/overview) - Learn more about each callback
- **Global Callbacks**: [Global Callbacks](/composables/features/global-callbacks/overview) - Set up plugin-based callbacks
- **Basic Usage**: [Basic Usage Examples](/composables/use-fetch/basic-usage) - See practical examples
