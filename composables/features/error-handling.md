# Error Handling

Centralized error handling strategies for API requests using callbacks and global patterns.

## Overview

Handle errors at multiple levels:

1. **Local Level**: Per-request error handling
2. **Global Level**: Application-wide error handling
3. **Component Level**: UI-specific error handling

```typescript
// Local
useFetchGetPets({}, {
  onError: (error) => {
    console.error('Request failed:', error)
  }
})

// Global (recommended)
useGlobalCallbacks({
  onError: (error) => {
    // Handle all errors centrally
  }
})
```

## Basic Error Handling

### Local Error Handler

```vue
<script setup lang="ts">
const errorMessage = ref('')

const { data, error } = useFetchGetPets({}, {
  onError: (error) => {
    errorMessage.value = error.message
  }
})
</script>

<template>
  <div v-if="errorMessage" class="error">
    {{ errorMessage }}
  </div>
</template>
```

### Global Error Handler

```typescript
// plugins/error-handler.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onError: (error) => {
      // Log to monitoring service
      console.error('API Error:', error)
      
      // Show toast notification
      const toast = useToast()
      toast.error(error.message)
    }
  })
})
```

## Error Status Codes

### Handle by Status

```typescript
useFetchGetPets({}, {
  onError: (error) => {
    switch (error.status) {
      case 400:
        console.error('Bad request:', error.message)
        break
      case 401:
        console.error('Unauthorized')
        navigateTo('/login')
        break
      case 403:
        console.error('Forbidden')
        break
      case 404:
        console.error('Not found')
        break
      case 500:
        console.error('Server error')
        break
      default:
        console.error('Unknown error:', error)
    }
  }
})
```

### Global Status Handler

```typescript
// plugins/error-handler.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  useGlobalCallbacks({
    onError: async (error) => {
      switch (error.status) {
        case 401:
          // Unauthorized - redirect to login
          toast.error('Session expired. Please login again.')
          await navigateTo('/login')
          break
          
        case 403:
          // Forbidden
          toast.error('You don\'t have permission to access this resource.')
          break
          
        case 404:
          // Not found
          toast.warning('Resource not found.')
          break
          
        case 422:
          // Validation error
          toast.error('Please check your input and try again.')
          break
          
        case 429:
          // Rate limit
          toast.warning('Too many requests. Please try again later.')
          break
          
        case 500:
        case 502:
        case 503:
          // Server errors
          toast.error('Server error. Please try again later.')
          break
          
        default:
          toast.error(error.message || 'An unexpected error occurred.')
      }
    }
  })
})
```

## Validation Errors

### Display Field Errors

```vue
<script setup lang="ts">
interface ValidationError {
  field: string
  message: string
}

const fieldErrors = ref<Record<string, string>>({})

const { execute } = useFetchCreatePet(
  { body: formData.value },
  {
    immediate: false,
    onError: (error) => {
      if (error.status === 422 && error.data?.errors) {
        // Map errors to fields
        fieldErrors.value = error.data.errors.reduce((acc, err: ValidationError) => {
          acc[err.field] = err.message
          return acc
        }, {} as Record<string, string>)
      }
    },
    onSuccess: () => {
      // Clear errors on success
      fieldErrors.value = {}
    }
  }
)
</script>

<template>
  <form @submit.prevent="execute">
    <input v-model="formData.name" />
    <span v-if="fieldErrors.name" class="error">
      {{ fieldErrors.name }}
    </span>
  </form>
</template>
```

### Show Validation Summary

```vue
<script setup lang="ts">
const validationErrors = ref<string[]>([])

const { execute } = useFetchCreatePet(
  { body: formData.value },
  {
    immediate: false,
    onError: (error) => {
      if (error.status === 422 && error.data?.errors) {
        validationErrors.value = error.data.errors.map(e => e.message)
      }
    }
  }
)
</script>

<template>
  <div v-if="validationErrors.length" class="validation-errors">
    <h3>Please fix the following errors:</h3>
    <ul>
      <li v-for="error in validationErrors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>
```

## Retry Logic

### Simple Retry

```vue
<script setup lang="ts">
const retryCount = ref(0)
const maxRetries = 3

const { data, refresh } = useFetchGetPets({}, {
  onError: (error) => {
    if (error.status >= 500 && retryCount.value < maxRetries) {
      retryCount.value++
      setTimeout(() => refresh(), 1000)
    }
  },
  onSuccess: () => {
    retryCount.value = 0  // Reset on success
  }
})
</script>
```

### Exponential Backoff

```vue
<script setup lang="ts">
const retryCount = ref(0)
const maxRetries = 5

const { data, refresh } = useFetchGetPets({}, {
  onError: async (error) => {
    if (error.status >= 500 && retryCount.value < maxRetries) {
      retryCount.value++
      
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.pow(2, retryCount.value) * 1000
      
      await new Promise(resolve => setTimeout(resolve, delay))
      refresh()
    } else if (retryCount.value >= maxRetries) {
      useToast().error('Maximum retries exceeded. Please try again later.')
    }
  }
})
</script>
```

### Global Retry

```typescript
// plugins/retry.ts
export default defineNuxtPlugin(() => {
  const retries = new Map<string, number>()
  const maxRetries = 3
  
  useGlobalCallbacks({
    onError: async (error, { url, refresh }) => {
      if (error.status >= 500) {
        const count = retries.get(url) || 0
        
        if (count < maxRetries) {
          retries.set(url, count + 1)
          
          // Wait before retry
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, count) * 1000)
          )
          
          refresh()
        } else {
          retries.delete(url)
          useToast().error('Service unavailable. Please try again later.')
        }
      }
    },
    onSuccess: (data, { url }) => {
      // Reset retry count on success
      retries.delete(url)
    }
  })
})
```

## Timeout Handling

```vue
<script setup lang="ts">
const timedOut = ref(false)

const { data } = useFetchGetPets({}, {
  timeout: 10000,  // 10 seconds
  onError: (error) => {
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      timedOut.value = true
      useToast().error('Request timed out. Please try again.')
    }
  }
})
</script>
```

## Network Error Handling

```typescript
useGlobalCallbacks({
  onError: (error) => {
    if (!navigator.onLine) {
      useToast().error('No internet connection. Please check your network.')
      return
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      useToast().error('Network error. Please check your connection.')
      return
    }
    
    // Handle other errors...
  }
})
```

## Error Logging

### Console Logging

```typescript
useGlobalCallbacks({
  onError: (error, { url, method }) => {
    console.group('🔴 API Error')
    console.error('URL:', url)
    console.error('Method:', method)
    console.error('Status:', error.status)
    console.error('Message:', error.message)
    console.error('Data:', error.data)
    console.error('Stack:', error.stack)
    console.groupEnd()
  }
})
```

### Send to Monitoring Service

```typescript
// plugins/monitoring.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onError: async (error, { url, method }) => {
      // Send to Sentry, LogRocket, etc.
      await $fetch('/api/log-error', {
        method: 'POST',
        body: {
          url,
          method,
          status: error.status,
          message: error.message,
          data: error.data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      })
    }
  })
})
```

## User-Friendly Messages

```typescript
// plugins/friendly-errors.ts
const errorMessages: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Please log in to continue.',
  403: 'You don\'t have permission to do that.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please slow down.',
  500: 'Something went wrong on our end. We\'re working on it!',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service under maintenance. Please try again later.'
}

export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  useGlobalCallbacks({
    onError: (error) => {
      const message = errorMessages[error.status] || error.message || 'An unexpected error occurred.'
      toast.error(message)
    }
  })
})
```

## Fallback Data

```vue
<script setup lang="ts">
const fallbackData = [
  { id: 1, name: 'Sample Pet 1', status: 'available' },
  { id: 2, name: 'Sample Pet 2', status: 'available' }
]

const displayData = ref(fallbackData)

const { data } = useFetchGetPets({}, {
  onSuccess: (pets) => {
    displayData.value = pets
  },
  onError: () => {
    // Keep using fallback data
    useToast().warning('Using cached data. Some information may be outdated.')
  }
})
</script>
```

## Error Boundaries

```vue
<script setup lang="ts">
const hasError = ref(false)
const errorDetails = ref<Error | null>(null)

const { data } = useFetchGetPets({}, {
  onError: (error) => {
    hasError.value = true
    errorDetails.value = error
  }
})

const retry = () => {
  hasError.value = false
  errorDetails.value = null
  refresh()
}
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <h2>Something went wrong</h2>
    <p>{{ errorDetails?.message }}</p>
    <button @click="retry">Try Again</button>
  </div>
  <div v-else>
    <!-- Normal content -->
  </div>
</template>
```

## Real-World Example

### Complete Error System

```typescript
// plugins/error-system.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  const retries = new Map<string, number>()
  
  useGlobalCallbacks({
    onError: async (error, { url, method, refresh }) => {
      // Log error
      console.error(`[${method}] ${url}`, error)
      
      // Network error
      if (!navigator.onLine) {
        toast.error('No internet connection')
        return
      }
      
      // Authentication
      if (error.status === 401) {
        const token = useCookie('auth-token')
        const refreshToken = useCookie('refresh-token')
        
        if (refreshToken.value) {
          try {
            const response = await $fetch('/api/auth/refresh', {
              method: 'POST',
              body: { refreshToken: refreshToken.value }
            })
            
            token.value = response.accessToken
            refresh()  // Retry original request
            return
          } catch {
            // Refresh failed
            await navigateTo('/login')
            return
          }
        }
        
        toast.error('Please log in to continue')
        await navigateTo('/login')
        return
      }
      
      // Server errors with retry
      if (error.status >= 500) {
        const count = retries.get(url) || 0
        
        if (count < 3) {
          retries.set(url, count + 1)
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, count) * 1000)
          )
          refresh()
          return
        }
        
        retries.delete(url)
        toast.error('Service unavailable. Please try again later.')
        return
      }
      
      // Validation errors
      if (error.status === 422) {
        toast.error('Please check your input')
        return
      }
      
      // Default error message
      toast.error(error.message || 'An error occurred')
    },
    
    onSuccess: (data, { url }) => {
      // Reset retry count on success
      retries.delete(url)
    }
  })
})
```

## Best Practices

### ✅ Do

```typescript
// ✅ Handle errors gracefully
onError: (error) => {
  toast.error(error.message)
}

// ✅ Provide user-friendly messages
onError: (error) => {
  const friendly = getFriendlyMessage(error.status)
  toast.error(friendly)
}

// ✅ Log errors for debugging
onError: (error, { url, method }) => {
  console.error(`[${method}] ${url}`, error)
}

// ✅ Retry transient errors
onError: async (error, { refresh }) => {
  if (error.status >= 500) {
    await delay(1000)
    refresh()
  }
}
```

### ❌ Don't

```typescript
// ❌ Don't ignore errors
onError: () => {}  // Silent failure!

// ❌ Don't show technical details to users
onError: (error) => {
  alert(error.stack)  // Confusing!
}

// ❌ Don't retry indefinitely
onError: (error, { refresh }) => {
  refresh()  // Infinite loop!
}

// ❌ Don't expose sensitive info
onError: (error) => {
  console.log(error.data)  // May contain secrets!
}
```

## Next Steps

- [onError Callback →](/composables/features/callbacks/on-error)
- [Global Callbacks →](/composables/features/global-callbacks/overview)
- [Authentication →](/composables/features/authentication)
- [Troubleshooting →](/troubleshooting/)
