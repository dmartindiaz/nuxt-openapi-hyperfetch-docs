# Error Handling Patterns

Best practices for handling errors in generated composables.

## Client-Side Error Handling

### Basic Error State

```vue
<script setup lang="ts">
const { data: pet, error } = useFetchPet(1)
</script>

<template>
  <div v-if="error" class="error">
    {{ error.message }}
  </div>
  <div v-else-if="pet">
    {{ pet.name }}
  </div>
</template>
```

### Per-Request Error Handling

```typescript
const { execute } = useCreatePet({
  onError: (error) => {
    if (error.statusCode === 422) {
      // Validation error
      showValidationErrors(error.data.errors)
    } else if (error.statusCode === 401) {
      // Unauthorized
      navigateTo('/login')
    } else {
      // Generic error
      toast.error('Failed to create pet')
    }
  }
})
```

### Global Error Handling

```typescript
// plugins/api-errors.ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  return {
    provide: {
      apiCallbacks: {
        onError: (error: Error, ctx: RequestContext) => {
          // Skip if component handles it
          if (ctx.skipGlobalError) return
          
          const message = getErrorMessage(error)
          toast.error(message)
        }
      }
    }
  }
})

function getErrorMessage(error: Error): string {
  if (error.statusCode === 404) return 'Not found'
  if (error.statusCode === 401) return 'Please log in'
  if (error.statusCode === 403) return 'Permission denied'
  if (error.statusCode === 422) return 'Invalid data'
  if (error.statusCode >= 500) return 'Server error'
  return error.message || 'An error occurred'
}
```

## Server-Side Error Handling

### Basic Error Handling

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    return await getServerPet(event, Number(id))
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch pet'
    })
  }
})
```

### Error Transformation

```typescript
export default defineEventHandler(async (event) => {
  try {
    return await getServerPet(event, 1)
  } catch (error: any) {
    // Transform backend errors to frontend-friendly messages
    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: 'Pet not found',
        data: { petId: 1 }
      })
    }
    
    if (error.statusCode === 403) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to view this pet'
      })
    }
    
    throw error
  }
})
```

### Error Logging

```typescript
export default defineEventHandler(async (event) => {
  try {
    return await getServerPet(event, 1)
  } catch (error: any) {
    // Log error server-side
    console.error('[API Error]', {
      path: event.path,
      method: event.method,
      statusCode: error.statusCode,
      message: error.message,
      user: event.context.user?.id
    })
    
    throw error
  }
})
```

## Error Types

### Network Errors

```typescript
const { execute } = useFetchPet(1, {
  onError: (error) => {
    if (!navigator.onLine) {
      toast.error('No internet connection')
    } else if (error.message.includes('fetch')) {
      toast.error('Network error. Please try again.')
    }
  }
})
```

### Validation Errors (422)

```typescript
interface ValidationError {
  statusCode: 422
  data: {
    errors: Record<string, string[]>
  }
}

const { execute } = useCreatePet({
  onError: (error: ValidationError) => {
    if (error.statusCode === 422) {
      // Display field errors
      Object.entries(error.data.errors).forEach(([field, messages]) => {
        toast.error(`${field}: ${messages.join(', ')}`)
      })
    }
  }
})
```

### Authentication Errors (401)

```typescript
const { execute } = useFetchPet(1, {
  onError: (error) => {
    if (error.statusCode === 401) {
      // Clear token and redirect
      const token = useCookie('auth_token')
      token.value = null
      navigateTo('/login')
    }
  }
})
```

### Permission Errors (403)

```typescript
const { execute } = useDeletePet(1, {
  onError: (error) => {
    if (error.statusCode === 403) {
      toast.error('You do not have permission to delete this pet')
    }
  }
})
```

## Retry Patterns

### Simple Retry

```typescript
const { execute } = useFetchPet(1, {
  onError: async (error) => {
    if (error.statusCode >= 500) {
      // Retry once on server error
      await execute()
    }
  }
})
```

### Exponential Backoff

```typescript
async function retryWithBackoff(
  fn: () => Promise<any>,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      const delay = Math.pow(2, i) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

const { execute } = useFetchPet(1, {
  onError: async (error) => {
    if (error.statusCode >= 500) {
      await retryWithBackoff(execute, 3)
    }
  }
})
```

## Fallback Patterns

### Cached Data Fallback

```typescript
const cache = useLocalStorageCache<Pet>('pet-1')

const { data: pet, error } = useFetchPet(1, {
  onError: () => {
    // Use cached data on error
    const cached = cache.get()
    if (cached) {
      pet.value = cached
    }
  }
})
```

### Default Data

```typescript
const { data: pet } = useFetchPet(1, {
  default: () => ({
    id: 1,
    name: 'Loading...',
    status: 'available'
  })
})
```

## Error Recovery

### Manual Retry

```vue
<script setup lang="ts">
const { data: pet, error, execute } = useFetchPet(1)

const retry = async () => {
  await execute()
}
</script>

<template>
  <div v-if="error" class="error">
    <p>{{ error.message }}</p>
    <button @click="retry">Retry</button>
  </div>
</template>
```

### Automatic Recovery

```typescript
const { execute } = useFetchPet(1, {
  onError: async (error, ctx) => {
    if (error.statusCode === 401) {
      // Try to refresh auth token
      await refreshAuthToken()
      // Retry request
      await execute()
    }
  }
})
```

## Best Practices

### 1. Always Handle Errors

```typescript
// ✅ Good
const { error } = useFetchPet(1)
if (error.value) {
  // Handle error
}

// ❌ Bad
const { data } = useFetchPet(1)
// No error handling
```

### 2. Provide User-Friendly Messages

```typescript
// ✅ Good
if (error.statusCode === 404) {
  return 'Pet not found. Please check the ID and try again.'
}

// ❌ Bad
return error.message // "Failed to fetch /pets/1"
```

### 3. Log Errors for Debugging

```typescript
// ✅ Good
onError: (error, ctx) => {
  console.error('API Error:', {
    url: ctx.url,
    method: ctx.method,
    statusCode: error.statusCode,
    message: error.message
  })
}
```

### 4. Don't Swallow Errors

```typescript
// ✅ Good
onError: (error) => {
  toast.error(error.message)
  throw error // Re-throw for upstream handling
}

// ❌ Bad
onError: (error) => {
  // Silent failure
}
```

## Next Steps

- [Client Composables →](/architecture/patterns/client-composables)
- [Server Composables →](/architecture/patterns/server-composables)
- [onError Callback →](/composables/features/callbacks/on-error)
