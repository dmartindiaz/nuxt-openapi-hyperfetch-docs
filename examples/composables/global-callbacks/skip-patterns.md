# Skip Patterns

Conditionally skip global callbacks for specific requests using patterns.

## Basic Skip Pattern

```typescript
// plugins/conditional-callbacks.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  globalThis.$apiCallbacks = {
    onError: (error, retry, context) => {
      // Skip global error handling for specific endpoints
      if (context.skipGlobalError) {
        return // Let local handler deal with it
      }
      
      toast.error(error.message)
    }
  }
})
```

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

// This request will skip global error handler
const { data: pets, error } = useFetchPets({
  skipGlobalError: true,
  onError: (error) => {
    // Custom error handling
    console.log('Custom error handler:', error)
  }
})
</script>
```

## Skip by URL Pattern

```typescript
// plugins/skip-patterns.ts
export default defineNuxtPlugin(() => {
  const shouldSkipGlobalCallback = (url: string, skipPatterns: string[]) => {
    return skipPatterns.some(pattern => {
      if (pattern.includes('*')) {
        // Wildcard matching
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return regex.test(url)
      }
      return url.includes(pattern)
    })
  }
  
  globalThis.$apiCallbacks = {
    onError: (error, retry, context) => {
      const skipPatterns = [
        '/api/health',
        '/api/metrics',
        '/api/analytics/*'
      ]
      
      if (shouldSkipGlobalCallback(context.url, skipPatterns)) {
        return // Skip global error handling
      }
      
      // Global error handling
      useToast().error(error.message)
    }
  }
})
```

## Skip Authentication for Public Endpoints

```typescript
// plugins/auth-skip.ts
export default defineNuxtPlugin(() => {
  const { token } = useAuthToken()
  
  const publicEndpoints = [
    '/api/public',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/health'
  ]
  
  const isPublic = (url: string) => {
    return publicEndpoints.some(endpoint => url.includes(endpoint))
  }
  
  globalThis.$apiCallbacks = {
    onRequest: ({ url, options }) => {
      // Skip auth token for public endpoints
      if (isPublic(url)) {
        return
      }
      
      // Add auth token for protected endpoints
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    }
  }
})
```

## Skip Analytics for Certain Requests

```typescript
// plugins/analytics-skip.ts
export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()
  
  const skipAnalytics = (url: string) => {
    return [
      '/api/health',
      '/api/ping',
      '/api/metrics',
      '/api/logs'
    ].some(pattern => url.includes(pattern))
  }
  
  globalThis.$apiCallbacks = {
    onRequest: ({ url, options }) => {
      if (skipAnalytics(url)) {
        return
      }
      
      analytics.track('api_request', {
        url,
        method: options.method
      })
    }
  }
})
```

## Skip by Request Method

```typescript
// plugins/method-skip.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  globalThis.$apiCallbacks = {
    onSuccess: ({ url, options }) => {
      // Only show success message for POST, PUT, DELETE
      const showMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
      
      if (!showMethods.includes(options.method || 'GET')) {
        return // Skip success message for GET requests
      }
      
      toast.success('Operation completed successfully')
    }
  }
})
```

## Skip by Status Code

```typescript
// plugins/status-skip.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  const router = useRouter()
  
  globalThis.$apiCallbacks = {
    onError: (error) => {
      // Skip global handler for 404 - let page handle it
      if (error.statusCode === 404) {
        return
      }
      
      // Handle 401 globally
      if (error.statusCode === 401) {
        router.push('/login')
        return
      }
      
      // Show toast for other errors
      toast.error(error.message)
    }
  }
})
```

## Conditional Skip Based on Context

```typescript
// plugins/context-skip.ts
export default defineNuxtPlugin(() => {
  const route = useRoute()
  
  globalThis.$apiCallbacks = {
    onError: (error, retry, context) => {
      // Skip global error on specific pages
      if (route.path === '/silent-mode') {
        console.log('Silent error:', error)
        return
      }
      
      // Skip retry logic for specific operations
      if (context.noRetry) {
        return
      }
      
      // Global error handling
      useToast().error(error.message)
    }
  }
})
```

## Skip Loading Indicator

```typescript
// plugins/loading-skip.ts
export default defineNuxtPlugin(() => {
  const loading = useLoading()
  
  globalThis.$apiCallbacks = {
    onRequest: ({ url, options }) => {
      // Skip loading for background requests
      if (options.background || options.silent) {
        return
      }
      
      loading.start()
    },
    
    onResponse: ({ options }) => {
      if (options.background || options.silent) {
        return
      }
      
      loading.stop()
    }
  }
})
```

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

// Silent background request - no loading indicator
const { data: pets } = useFetchPets({
  silent: true
})
</script>
```

## Skip Cache for Fresh Data

```typescript
// plugins/cache-skip.ts
export default defineNuxtPlugin(() => {
  const cache = new Map<string, any>()
  
  globalThis.$apiCallbacks = {
    onRequest: ({ url, options }) => {
      // Skip cache if fresh data requested
      if (options.fresh || options.noCache) {
        return
      }
      
      // Return cached data
      if (cache.has(url)) {
        const cached = cache.get(url)
        if (Date.now() - cached.timestamp < 60000) { // 1 minute
          return cached.data
        }
      }
    },
    
    onSuccess: ({ url, response, options }) => {
      if (options.noCache) {
        return
      }
      
      cache.set(url, {
        data: response,
        timestamp: Date.now()
      })
    }
  }
})
```

## Skip Patterns with Metadata

```vue
<script setup lang="ts">
import { useFetchPets, useCreatePet } from '~/composables/pets'

// Fetch with metadata
const { data: pets } = useFetchPets({
  meta: {
    skipGlobalError: true,
    skipAnalytics: true,
    silent: true,
    cache: false
  }
})

// Create with custom skip
const { execute: createPet } = useCreatePet({
  immediate: false,
  meta: {
    skipSuccessToast: true,
    skipErrorLog: false
  }
})
</script>
```

```typescript
// In plugin
globalThis.$apiCallbacks = {
  onSuccess: ({ options }) => {
    if (options.meta?.skipSuccessToast) {
      return
    }
    
    useToast().success('Success!')
  },
  
  onError: ({ error, options }) => {
    if (options.meta?.skipErrorLog) {
      return
    }
    
    console.error('API Error:', error)
  }
}
```

## Environment-Based Skipping

```typescript
// plugins/env-skip.ts
export default defineNuxtPlugin(() => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  globalThis.$apiCallbacks = {
    onRequest: ({ url, options }) => {
      // Skip analytics in development
      if (isDevelopment) {
        console.log('[DEV] Request:', url)
        return // Skip analytics
      }
      
      // Track in production
      if (isProduction) {
        useAnalytics().track('api_request', { url })
      }
    }
  }
})
```

## Complete Example

```vue
<script setup lang="ts">
import { useFetchPets, useCreatePet, useUpdatePet } from '~/composables/pets'

// Background polling - skip all global callbacks
const { data: livePets } = useFetchPets({
  meta: {
    silent: true,
    skipGlobalError: true,
    skipAnalytics: true,
    background: true
  },
  // Poll every 5 seconds
  pollingInterval: 5000
})

// User-initiated fetch - use all global callbacks
const { data: pets, loading, error, refresh } = useFetchPets()

// Create pet - skip success toast, use custom
const form = reactive({
  name: '',
  species: ''
})

const { execute: createPet, loading: creating } = useCreatePet({
  immediate: false,
  meta: {
    skipSuccessToast: true // We'll show custom message
  },
  onSuccess: (pet) => {
    // Custom success handling
    useToast().success(`${pet.name} has been created!`, {
      duration: 5000
    })
    
    form.name = ''
    form.species = ''
    refresh()
  }
})

// Update pet - skip global error, handle locally
const { execute: updatePet } = useUpdatePet({
  immediate: false,
  meta: {
    skipGlobalError: true
  },
  onError: (error) => {
    // Custom error handling
    if (error.statusCode === 409) {
      useToast().warning('Pet name already exists')
    } else {
      useToast().error('Failed to update pet')
    }
  }
})
</script>

<template>
  <div class="pets-page">
    <h1>Pets Management</h1>
    
    <!-- Live count from background polling -->
    <div v-if="livePets" class="live-count">
      Live count: {{ livePets.length }} pets
    </div>
    
    <!-- Main list with loading -->
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
    
    <!-- Create form -->
    <form @submit.prevent="() => createPet(form)">
      <input v-model="form.name" placeholder="Name" required />
      <input v-model="form.species" placeholder="Species" required />
      <button type="submit" :disabled="creating">
        Create
      </button>
    </form>
  </div>
</template>

<style scoped>
.live-count {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 0.9em;
}
</style>
```

## Best Practices

### ✅ Do

```typescript
// ✅ Use specific skip patterns
meta: { skipGlobalError: true }

// ✅ Skip for background requests
meta: { silent: true, background: true }

// ✅ Document why skipping
// Skip analytics for health checks
if (url.includes('/health')) return

// ✅ Use URL patterns for consistency
const publicEndpoints = ['/api/public/*']
```

### ❌ Don't

```typescript
// ❌ Don't skip everything
meta: { skipAll: true }

// ❌ Don't use overly broad patterns
if (url.includes('api')) return

// ❌ Don't skip security callbacks
meta: { skipAuth: true } // Dangerous!

// ❌ Don't skip without reason
return // Why?
```

## Next Steps

- [Auth Token →](/examples/composables/global-callbacks/auth-token)
- [Error Handling →](/examples/composables/global-callbacks/error-handling)
- [Analytics →](/examples/composables/global-callbacks/analytics)
- [Global Callbacks Guide →](/composables/features/global-callbacks/overview)
