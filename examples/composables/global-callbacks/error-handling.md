# Global Error Handling

Centralize error handling across all API requests using global callbacks.

## Basic Global Error Handler

```typescript
// plugins/global-error-handler.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  globalThis.$apiCallbacks = {
    onError: (error) => {
      // Log all errors
      console.error('API Error:', error)
      
      // Show user-friendly message
      let message = 'An error occurred'
      
      switch (error.statusCode) {
        case 400:
          message = 'Invalid request'
          break
        case 401:
          message = 'Please login to continue'
          break
        case 403:
          message = 'You do not have permission'
          break
        case 404:
          message = 'Resource not found'
          break
        case 500:
          message = 'Server error. Please try again later.'
          break
        default:
          message = error.message || 'Unknown error'
      }
      
      toast.error(message)
    }
  }
})
```

## Network Error Handling

```typescript
// plugins/network-error-handler.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  const online = useOnline()
  
  globalThis.$apiCallbacks = {
    onError: (error, retry) => {
      // Check if network error
      if (!online.value) {
        toast.error('No internet connection', {
          action: {
            label: 'Retry',
            onClick: retry
          }
        })
        return false
      }
      
      // Timeout error
      if (error.message?.includes('timeout')) {
        toast.error('Request timed out', {
          action: {
            label: 'Retry',
            onClick: retry
          }
        })
        return false
      }
    }
  }
})
```

## Error Categorization

```typescript
// plugins/error-categorization.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  const router = useRouter()
  
  const handleClientError = (error: any) => {
    if (error.statusCode === 401) {
      toast.warning('Session expired')
      router.push('/login')
    } else if (error.statusCode === 403) {
      toast.error('Access denied')
    } else if (error.statusCode === 404) {
      toast.info('Resource not found')
    } else {
      toast.error(error.message || 'Invalid request')
    }
  }
  
  const handleServerError = (error: any) => {
    toast.error('Server error. Our team has been notified.', {
      duration: 5000
    })
    
    // Send to error tracking
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error)
    }
  }
  
  globalThis.$apiCallbacks = {
    onError: (error) => {
      console.error('[API Error]', error)
      
      if (error.statusCode >= 400 && error.statusCode < 500) {
        handleClientError(error)
      } else if (error.statusCode >= 500) {
        handleServerError(error)
      } else {
        toast.error('Something went wrong')
      }
    }
  }
})
```

## Validation Error Display

```typescript
// plugins/validation-errors.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  globalThis.$apiCallbacks = {
    onError: (error) => {
      // Handle validation errors (422)
      if (error.statusCode === 422 && error.data?.errors) {
        const errors = error.data.errors
        
        // Show first error for each field
        Object.entries(errors).forEach(([field, messages]) => {
          const fieldName = field.replace(/_/g, ' ')
          toast.error(`${fieldName}: ${messages[0]}`, {
            duration: 5000
          })
        })
        
        return false // Don't show generic error
      }
    }
  }
})
```

## Error Retry Logic

```typescript
// plugins/error-retry.ts
export default defineNuxtPlugin(() => {
  const retryAttempts = new Map<string, number>()
  const maxRetries = 3
  
  globalThis.$apiCallbacks = {
    onError: async (error, retry, context) => {
      const url = context.url
      
      // Don't retry client errors
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return false
      }
      
      // Get retry count
      const attempts = retryAttempts.get(url) || 0
      
      // Retry server errors and timeouts
      if (attempts < maxRetries) {
        retryAttempts.set(url, attempts + 1)
        
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000
        console.log(`Retrying ${url} after ${delay}ms (attempt ${attempts + 1}/${maxRetries})`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        
        return retry()
      } else {
        // Max retries reached
        retryAttempts.delete(url)
        console.error(`Max retries reached for ${url}`)
        return false
      }
    },
    
    onSuccess: (context) => {
      // Clear retry count on success
      retryAttempts.delete(context.url)
    }
  }
})
```

## Rate Limit Handling

```typescript
// plugins/rate-limit-handler.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  globalThis.$apiCallbacks = {
    onError: async (error, retry) => {
      if (error.statusCode === 429) {
        // Get retry-after header
        const retryAfter = error.response?.headers.get('retry-after')
        const waitSeconds = retryAfter ? parseInt(retryAfter) : 60
        
        toast.warning(`Rate limit exceeded. Retrying in ${waitSeconds} seconds...`)
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000))
        
        return retry()
      }
    }
  }
})
```

## Error Recovery Strategies

```typescript
// plugins/error-recovery.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  const strategies = {
    // Retry with exponential backoff
    retryWithBackoff: async (error: any, retry: Function, attempt: number) => {
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        return retry()
      }
      return false
    },
    
    // Fall back to cached data
    useCachedData: (error: any, context: any) => {
      const cached = localStorage.getItem(`cache_${context.url}`)
      if (cached) {
        toast.info('Using cached data')
        return JSON.parse(cached)
      }
      return null
    },
    
    // Redirect to error page
    redirectToError: (error: any) => {
      navigateTo(`/error?code=${error.statusCode}`)
    }
  }
  
  globalThis.$apiCallbacks = {
    onError: async (error, retry, context) => {
      console.error('API Error:', error)
      
      // 401: Redirect to login
      if (error.statusCode === 401) {
        navigateTo('/login')
        return false
      }
      
      // 503: Service unavailable - retry with backoff
      if (error.statusCode === 503) {
        return await strategies.retryWithBackoff(error, retry, context.attempt || 0)
      }
      
      // Network error - try cached data
      if (!navigator.onLine) {
        const cached = strategies.useCachedData(error, context)
        if (cached) return cached
      }
      
      // Fatal error - redirect to error page
      if (error.statusCode >= 500) {
        strategies.redirectToError(error)
        return false
      }
      
      return false
    }
  }
})
```

## User-Friendly Error Messages

```typescript
// utils/error-messages.ts
export const errorMessages: Record<number, string> = {
  400: 'The request was invalid. Please check your input.',
  401: 'Your session has expired. Please login again.',
  403: 'You do not have permission to access this resource.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists.',
  422: 'Please check the form for errors.',
  429: 'Too many requests. Please slow down.',
  500: 'Server error. Our team has been notified.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service is under maintenance. Please try again later.',
}

export function getErrorMessage(statusCode: number, defaultMessage?: string): string {
  return errorMessages[statusCode] || defaultMessage || 'An unexpected error occurred'
}
```

```typescript
// plugins/friendly-errors.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  globalThis.$apiCallbacks = {
    onError: (error) => {
      const message = getErrorMessage(error.statusCode, error.message)
      toast.error(message)
    }
  }
})
```

## Complete Example

```vue
<script setup lang="ts">
import { useFetchPets, useCreatePet } from '~/composables/pets'

// Fetch pets - global error handler will handle errors
const { data: pets, error: fetchError, refresh } = useFetchPets()

// Create pet form
const form = reactive({
  name: '',
  species: ''
})

// Global callbacks will handle errors
const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onSuccess: () => {
    form.name = ''
    form.species = ''
    refresh()
  }
  // No need for onError - global handler covers it
})

const handleSubmit = async () => {
  await createPet(form)
}
</script>

<template>
  <div class="pets-page">
    <h1>Pets Management</h1>
    
    <!-- Create form -->
    <form @submit.prevent="handleSubmit">
      <input v-model="form.name" placeholder="Name" required />
      <input v-model="form.species" placeholder="Species" required />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating...' : 'Create Pet' }}
      </button>
    </form>
    
    <!-- Pets list -->
    <div class="pets-list">
      <div v-for="pet in pets" :key="pet.id" class="pet-item">
        <h3>{{ pet.name }}</h3>
        <p>{{ pet.species }}</p>
      </div>
      
      <div v-if="!pets || pets.length === 0">
        No pets found
      </div>
    </div>
  </div>
</template>

<style scoped>
.pets-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  margin-bottom: 30px;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pets-list {
  display: grid;
  gap: 15px;
}

.pet-item {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}

.pet-item h3 {
  margin: 0 0 5px;
}

.pet-item p {
  margin: 0;
  color: #666;
}
</style>
```

## Next Steps

- [Analytics Tracking →](/examples/composables/global-callbacks/analytics)
- [Skip Patterns →](/examples/composables/global-callbacks/skip-patterns)
- [Auth Token →](/examples/composables/global-callbacks/auth-token)
- [Global Callbacks Guide →](/composables/features/global-callbacks/overview)
