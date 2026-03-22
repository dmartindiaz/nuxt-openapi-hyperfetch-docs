# Auth Token Refresh

Automatically refresh authentication tokens across all API requests using global callbacks.

## Token Refresh with Global Callback

```typescript
// composables/useAuthToken.ts
export function useAuthToken() {
  const token = useCookie('auth_token')
  const refreshToken = useCookie('refresh_token')
  
  const refresh = async () => {
    const response = await $fetch('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken: refreshToken.value }
    })
    
    token.value = response.token
    refreshToken.value = response.refreshToken
    
    return response.token
  }
  
  return {
    token,
    refreshToken,
    refresh
  }
}
```

## Setup Global Token Refresh

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  const { token, refresh } = useAuthToken()
  const router = useRouter()
  
  // Global callback for 401 errors
  globalThis.$apiCallbacks = {
    onError: async (error) => {
      if (error.statusCode === 401) {
        try {
          // Try to refresh token
          await refresh()
          
          // Retry the original request
          return true // Signal to retry
        } catch (refreshError) {
          // Refresh failed, redirect to login
          router.push('/login')
          return false
        }
      }
    }
  }
})
```

## Token Refresh Example

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useAuthToken } from '~/composables/useAuthToken'

const { token } = useAuthToken()

// This will automatically refresh token on 401
const { data: pets, error, refresh: refetchPets } = useFetchPets({
  headers: computed(() => ({
    Authorization: `Bearer ${token.value}`
  }))
})

// Watch for token changes and refetch
watch(token, () => {
  refetchPets()
})
</script>

<template>
  <div>
    <div v-if="error?.statusCode === 401">
      Refreshing authentication...
    </div>
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
  </div>
</template>
```

## Automatic Token Injection

```typescript
// plugins/auth-interceptor.ts
export default defineNuxtPlugin(() => {
  const { token, refresh } = useAuthToken()
  
  globalThis.$apiCallbacks = {
    // Inject token before every request
    onRequest: async ({ options }) => {
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    },
    
    // Handle 401 errors globally
    onError: async (error, retry) => {
      if (error.statusCode === 401 && !error.url.includes('/auth/')) {
        try {
          // Refresh token
          const newToken = await refresh()
          
          // Retry original request with new token
          return retry()
        } catch (err) {
          // Redirect to login
          navigateTo('/login')
          return false
        }
      }
    }
  }
})
```

## Token Expiration Check

```typescript
// utils/jwt.ts
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiry = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expiry
  } catch {
    return true
  }
}

export function willExpireSoon(token: string, minutesBefore = 5): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiry = payload.exp * 1000
    const threshold = minutesBefore * 60 * 1000
    return Date.now() >= (expiry - threshold)
  } catch {
    return true
  }
}
```

## Proactive Token Refresh

```typescript
// plugins/proactive-refresh.ts
export default defineNuxtPlugin(() => {
  const { token, refresh } = useAuthToken()
  
  // Check token expiration every minute
  if (process.client) {
    setInterval(async () => {
      if (token.value && willExpireSoon(token.value, 5)) {
        console.log('Token expiring soon, refreshing...')
        try {
          await refresh()
        } catch (err) {
          console.error('Failed to refresh token:', err)
        }
      }
    }, 60000) // Check every minute
  }
  
  // Also add global callback for requests
  globalThis.$apiCallbacks = {
    onRequest: async ({ options }) => {
      // Refresh if token will expire soon
      if (token.value && willExpireSoon(token.value, 1)) {
        await refresh()
      }
      
      // Inject token
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

## Refresh Queue

```typescript
// composables/useTokenRefresh.ts
export function useTokenRefresh() {
  const refreshing = ref(false)
  const refreshQueue: Array<() => void> = []
  
  const refresh = async () => {
    // If already refreshing, wait for it
    if (refreshing.value) {
      return new Promise((resolve) => {
        refreshQueue.push(resolve)
      })
    }
    
    refreshing.value = true
    
    try {
      const { token, refreshToken } = useAuthToken()
      
      const response = await $fetch('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken: refreshToken.value }
      })
      
      token.value = response.token
      refreshToken.value = response.refreshToken
      
      // Resolve all waiting requests
      refreshQueue.forEach(resolve => resolve())
      refreshQueue.length = 0
      
      return response.token
    } finally {
      refreshing.value = false
    }
  }
  
  return { refresh, refreshing }
}
```

## Complete Example with Retry

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useAuthToken } from '~/composables/useAuthToken'
import { useToast } from '~/composables/useToast'

const { token } = useAuthToken()
const toast = useToast()

let retryCount = 0
const maxRetries = 3

const { data: pets, error, loading } = useFetchPets({
  // Global callback will handle 401
  onError: async (error, retry) => {
    if (error.statusCode === 401) {
      if (retryCount < maxRetries) {
        retryCount++
        toast.info(`Refreshing authentication... (${retryCount}/${maxRetries})`)
        
        // Global callback will refresh and retry
        return true
      } else {
        toast.error('Session expired. Please login again.')
        navigateTo('/login')
        return false
      }
    }
  },
  onSuccess: () => {
    // Reset retry count on success
    retryCount = 0
  }
})
</script>

<template>
  <div>
    <div v-if="loading">Loading pets...</div>
    <div v-else-if="error">
      <p v-if="error.statusCode === 401">
        Authenticating...
      </p>
      <p v-else>Error: {{ error.message }}</p>
    </div>
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
  </div>
</template>
```

## Silent Refresh Pattern

```typescript
// plugins/silent-refresh.ts
export default defineNuxtPlugin(() => {
  const { token, refresh } = useAuthToken()
  const refreshing = ref(false)
  const pendingRequests: Array<() => void> = []
  
  globalThis.$apiCallbacks = {
    onRequest: async ({ options }) => {
      // Wait if currently refreshing
      if (refreshing.value) {
        await new Promise(resolve => {
          pendingRequests.push(resolve)
        })
      }
      
      // Inject current token
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    },
    
    onError: async (error, retry) => {
      if (error.statusCode === 401 && !refreshing.value) {
        refreshing.value = true
        
        try {
          await refresh()
          
          // Resume pending requests
          pendingRequests.forEach(resolve => resolve())
          pendingRequests.length = 0
          
          // Retry the failed request
          return retry()
        } catch (err) {
          // Clear pending requests
          pendingRequests.length = 0
          
          // Redirect to login
          navigateTo('/login')
          return false
        } finally {
          refreshing.value = false
        }
      }
    }
  }
})
```

## Token Refresh Indicator

```vue
<!-- components/TokenRefreshIndicator.vue -->
<script setup lang="ts">
const refreshing = useState('tokenRefreshing', () => false)
</script>

<template>
  <Transition name="fade">
    <div v-if="refreshing" class="refresh-indicator">
      <div class="spinner"></div>
      Refreshing session...
    </div>
  </Transition>
</template>

<style scoped>
.refresh-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Next Steps

- [Global Error Handling →](/examples/composables/global-callbacks/error-handling)
- [Analytics Tracking →](/examples/composables/global-callbacks/analytics)
- [Skip Patterns →](/examples/composables/global-callbacks/skip-patterns)
- [Global Callbacks Guide →](/composables/features/global-callbacks/overview)
