# useFetch Configuration

Complete reference for all configuration options available in generated `useFetch` composables.

## Options Interface

```typescript
interface ApiRequestOptions<T> {
  // Lifecycle callbacks
  onRequest?: (context: OnRequestContext) => void | Promise<void>
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: ApiError) => void | Promise<void>
  onFinish?: () => void | Promise<void>
  
  // Global callback control
  skipGlobalCallbacks?: boolean
  skipForUrls?: string[]
  
  // Nuxt useFetch options
  immediate?: boolean
  watch?: boolean
  server?: boolean
  lazy?: boolean
  dedupe?: 'cancel' | 'defer'
  // ... and all other useFetch options
}
```

## Lifecycle Callbacks

### onRequest

Called **before** the request is sent. Use to modify headers, log requests, or show loading UI.

```typescript
useFetchGetPets({}, {
  onRequest: ({ url, method, headers, body, query }) => {
    // Add custom header
    headers['X-Request-ID'] = crypto.randomUUID()
    
    // Modify query
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

### onSuccess

Called when response status is **2xx**. Use to show success messages, navigate, or update state.

```typescript
useFetchCreatePet(
  { body: { name: 'Fluffy' } },
  {
    onSuccess: (pet) => {
      // pet is fully typed from OpenAPI schema
      showToast(`Created pet: ${pet.name}`, 'success')
      navigateTo(`/pets/${pet.id}`)
    }
  }
)
```

**Context:** `T` (response data, fully typed)

### onError

Called when response status is **4xx/5xx** or network error occurs.

```typescript
useFetchGetPets({}, {
  onError: (error) => {
    // Handle different error types
    if (error.status === 404) {
      showToast('Pet not found', 'error')
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
  status: number
  statusText: string
  data: any
  url: string
}
```

### onFinish

Called **always** after request completes (success or failure).

```typescript
const loading = ref(false)

useFetchGetPets({}, {
  onRequest: () => {
    loading.value = true
  },
  onFinish: () => {
    loading.value = false
  }
})
```

## Global Callback Control

### skipGlobalCallbacks

Skip **all** global callbacks for this request:

```typescript
useFetchGetPets({}, {
  skipGlobalCallbacks: true
})
```

Use when:
- Request should not include auth token
- Request should skip global error handling
- Request is for public data

### skipForUrls

Skip global callbacks only for specific URL patterns:

```typescript
// In plugin
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    headers['Authorization'] = `Bearer ${token}`
  }
})

// In component - skip auth for public endpoint
useFetchGetPublicPets({}, {
  skipForUrls: ['/api/public/*']
})
```

## Nuxt useFetch Options

All Nuxt `useFetch` options are available:

### immediate

Control when the request executes:

```typescript
// Execute immediately on mount (default)
const { data } = useFetchGetPets({}, {
  immediate: true
})

// Don't execute on mount (manual execution)
const { execute } = useFetchGetPets({}, {
  immediate: false
})

await execute() // Execute manually
```

### watch

Control whether parameters are watched:

```typescript
const petId = ref(123)

// Watch parameters (default) - re-fetches when petId changes
const { data } = useFetchGetPetById(
  { petId: petId.value },
  { watch: true }
)

// Don't watch parameters - only fetches once
const { data } = useFetchGetPetById(
  { petId: petId.value },
  { watch: false }
)
```

### server

Control SSR execution:

```typescript
// Execute on server during SSR (default)
const { data } = useFetchGetPets({}, {
  server: true
})

// Only execute on client (skip SSR)
const { data } = useFetchGetPets({}, {
  server: false
})
```

Use `server: false` for:
- User-specific data that shouldn't be in SSR
- Data that requires client-side context

### lazy

Return immediately without blocking navigation:

```typescript
// Blocks navigation until request completes (default)
const { data } = useFetchGetPets({}, {
  lazy: false
})

// Returns immediately, doesn't block navigation
const { data, pending } = useFetchGetPets({}, {
  lazy: true
})
```

With `lazy: true`, component renders immediately with `pending: true`.

### dedupe

Control how duplicate requests are handled:

```typescript
// Cancel previous request (default)
const { data } = useFetchGetPets({}, {
  dedupe: 'cancel'
})

// Defer new request until previous completes
const { data } = useFetchGetPets({}, {
  dedupe: 'defer'
})
```

### Other Options

All standard `useFetch` options work:

```typescript
useFetchGetPets({}, {
  // Caching
  key: 'custom-key',        // Custom cache key
  
  // Timing
  timeout: 5000,            // Request timeout (ms)
  
  // Headers
  headers: {
    'X-Custom': 'value'
  },
  
  // Data Transformation
  transform: (data) => data.map(item => item.name),  // Transform response
  pick: ['id', 'name'],     // Pick specific fields
  
  // Credentials
  credentials: 'include',   // Send cookies
  
  // Mode
  mode: 'cors',             // CORS mode
})
```

See [Nuxt useFetch docs](https://nuxt.com/docs/api/composables/use-fetch) for complete list.

## Examples

### Complete Configuration

```vue
<script setup lang="ts">
const { data, pending, error, execute } = useFetchGetPets(
  {
    status: 'available',
    limit: 20
  },
  {
    // Callbacks
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
    onFinish: () => {
      console.log('Request complete')
    },
    
    // Global callback control
    skipGlobalCallbacks: false,
    skipForUrls: [],
    
    // Nuxt options
    immediate: true,
    watch: true,
    server: true,
    lazy: false,
    dedupe: 'cancel',
    key: 'pets-list',
    timeout: 10000,
  }
)
</script>
```

### Auth-Protected Request

```typescript
useFetchGetUserProfile(
  { userId: currentUser.value.id },
  {
    onRequest: ({ headers }) => {
      // Add auth token
      const token = useCookie('auth-token').value
      headers['Authorization'] = `Bearer ${token}`
    },
    onError: (error) => {
      // Redirect to login if unauthorized
      if (error.status === 401) {
        navigateTo('/login')
      }
    },
    // Only execute on client (user-specific data)
    server: false
  }
)
```

### Public Request (No Auth)

```typescript
useFetchGetPublicPets(
  {},
  {
    // Skip global auth callback
    skipGlobalCallbacks: true,
    // Execute on server for SEO
    server: true
  }
)
```

### Form Submission

```typescript
const form = ref({
  name: '',
  email: ''
})

const { execute: submit, pending } = useFetchCreateUser(
  { body: form.value },
  {
    immediate: false,
    onSuccess: (user) => {
      showToast(`User created: ${user.id}`, 'success')
      navigateTo(`/users/${user.id}`)
      // Reset form
      form.value = { name: '', email: '' }
    },
    onError: (error) => {
      if (error.status === 422) {
        showToast('Invalid form data', 'error')
      } else {
        showToast('Failed to create user', 'error')
      }
    }
  }
)

const handleSubmit = async () => {
  await submit()
}
```

## Next Steps

- [Basic Usage Examples](/composables/use-fetch/basic-usage)
- [Lifecycle Callbacks](/composables/features/callbacks/overview)
- [Global Callbacks](/composables/features/global-callbacks/overview)
- [Request Interception](/composables/features/request-interception)
