# Global Headers

Automatically add headers to all API requests without repeating code. Perfect for authentication tokens, API keys, versioning, and custom headers.

## Overview

Global Headers allows you to configure headers **once** that will be automatically included in every API request made by generated composables (both `useFetch` and `useAsyncData`).

::: tip Works with Both Generators
Global Headers is available for:
- ✅ **useFetch** composables
- ✅ **useAsyncData** composables (standard and raw)

It's a shared feature that works across all generated code.
:::

## Why Use Global Headers?

**Problem**: Repeating the same headers in every request

```typescript
// ❌ Without Global Headers - repetitive and error-prone
const { data: pets } = useFetchGetPets({}, {
  headers: { Authorization: `Bearer ${token}` }
})

const { data: pet } = useFetchGetPet({ petId: 123 }, {
  headers: { Authorization: `Bearer ${token}` }
})

const { data: user } = useFetchGetUser({ userId: 456 }, {
  headers: { Authorization: `Bearer ${token}` }
})
```

**Solution**: Configure once, apply everywhere

```typescript
// ✅ With Global Headers - clean and maintainable
const { data: pets } = useFetchGetPets({})
const { data: pet } = useFetchGetPet({ petId: 123 })
const { data: user } = useFetchGetUser({ userId: 456 })
// All automatically include Authorization header!
```

## Common Use Cases

- 🔐 **Authentication tokens**: Bearer tokens, JWT, API keys
- 📱 **Client identification**: App version, platform, device ID
- 🌍 **Localization**: Language preferences, timezone
- 🏢 **Multi-tenancy**: Tenant ID, organization ID
- 📊 **Tracking**: Request IDs, correlation IDs, trace IDs
- ⚙️ **API versioning**: API version headers

## Implementation Methods

There are **two ways** to implement Global Headers. You can use one or both (they merge together).

### Method 1: Composable (Recommended)

Create `composables/useApiHeaders.ts` in your Nuxt project:

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = () => {
  const authStore = useAuthStore()
  const { locale } = useI18n()
  const config = useRuntimeConfig()

  // Return a function that's called before each request
  return () => {
    const headers: Record<string, string> = {}

    // Add auth header if user is logged in
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    // Add API key
    if (config.public.apiKey) {
      headers['X-API-Key'] = config.public.apiKey
    }

    // Add client information
    headers['X-Client-Version'] = '1.0.0'
    headers['X-Client-Platform'] = 'web'

    // Add localization
    headers['Accept-Language'] = locale.value

    return headers
  }
}
```

**Benefits:**
- ✅ Auto-imported by Nuxt (no manual import needed)
- ✅ Fully reactive - updates when token/locale changes
- ✅ Conditional logic - only add headers when needed
- ✅ Access to all Nuxt composables and stores

**Example with Different Auth Libraries:**

```typescript
// With Nuxt Auth
export const useApiHeaders = () => {
  const { token } = useAuth()
  
  return () => ({
    Authorization: token.value ? `Bearer ${token.value}` : undefined
  })
}

// With Pinia Auth Store
export const useApiHeaders = () => {
  const authStore = useAuthStore()
  
  return () => ({
    Authorization: authStore.isAuthenticated 
      ? `Bearer ${authStore.accessToken}` 
      : undefined
  })
}

// With Supabase
export const useApiHeaders = () => {
  const supabase = useSupabaseClient()
  
  return async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      Authorization: session?.access_token 
        ? `Bearer ${session.access_token}` 
        : undefined
    }
  }
}
```

### Method 2: Plugin

Create `plugins/api-headers.ts` in your Nuxt project:

```typescript
// plugins/api-headers.ts
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  return {
    provide: {
      getApiHeaders: () => {
        const headers: Record<string, string> = {}

        if (authStore.token) {
          headers['Authorization'] = `Bearer ${authStore.token}`
        }

        if (config.public.apiKey) {
          headers['X-API-Key'] = config.public.apiKey
        }

        headers['X-Client-Version'] = '1.0.0'

        return headers
      }
    }
  }
})
```

**Type Safety (optional):**

```typescript
// types/api.d.ts
declare module '#app' {
  interface NuxtApp {
    $getApiHeaders(): Record<string, string>
  }
}

export {};
```

**Benefits:**
- ✅ Available globally as `$getApiHeaders`
- ✅ More control over execution
- ✅ Can be used outside composables

## Complete Authentication Examples

### Example 1: JWT Bearer Token

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = () => {
  // Get token from cookie or localStorage
  const token = useCookie('auth-token')
  
  return () => {
    // Only add header if token exists
    if (!token.value) {
      return {}
    }
    
    return {
      Authorization: `Bearer ${token.value}`
    }
  }
}
```

**Usage:**

```vue
<script setup lang="ts">
// Token automatically included in all requests
const { data: pets } = useFetchGetPets({})
const { data: user } = useFetchGetUser({ userId: 123 })

// Works with callbacks too
const { data: pet } = useFetchGetPet(
  { petId: 456 },
  {
    onSuccess: (pet) => {
      console.log('Loaded:', pet.name)
    }
  }
)
</script>
```

### Example 2: API Key + Bearer Token

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  
  return () => {
    const headers: Record<string, string> = {
      // Always include API key
      'X-API-Key': config.public.apiKey
    }
    
    // Add auth token if user is logged in
    if (authStore.isAuthenticated) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    return headers
  }
}
```

### Example 3: Multi-Tenant Application

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = () => {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()
  
  return () => {
    const headers: Record<string, string> = {}
    
    // Add tenant context
    if (tenantStore.currentTenant) {
      headers['X-Tenant-ID'] = tenantStore.currentTenant.id
      headers['X-Organization-ID'] = tenantStore.currentTenant.organizationId
    }
    
    // Add authentication
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    return headers
  }
}
```

### Example 4: Refresh Token Handling

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = () => {
  const authStore = useAuthStore()
  
  return async () => {
    // Check if token needs refresh
    if (authStore.isTokenExpired()) {
      await authStore.refreshToken()
    }
    
    return {
      Authorization: `Bearer ${authStore.accessToken}`
    }
  }
}
```

## Merge Strategy

Headers are merged in a specific order, with **later sources overriding earlier ones**:

```typescript
1. Global Headers (Composable)  → Base layer
   ↓
2. Global Headers (Plugin)      → Can add/override
   ↓
3. Request Headers (options)    → Per-request override
   ↓
4. onRequest Callback           → Final override
```

### Example of Merge Behavior

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = () => {
  return () => ({
    Authorization: 'Bearer token-from-composable',
    'X-Client-Version': '1.0.0',
    'X-Custom-A': 'from-composable'
  })
}

// plugins/api-headers.ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      getApiHeaders: () => ({
        Authorization: 'Bearer token-from-plugin', // Overrides composable
        'X-Custom-B': 'from-plugin'
      })
    }
  }
})

// Component
const { data } = useFetchGetPets({}, {
  headers: {
    'X-Custom-C': 'from-request' // Added
  },
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'X-Request-ID': crypto.randomUUID() // Added
        // Override if needed:
        // 'Authorization': 'Bearer different-token'
      }
    }
  }
})

// Final merged headers:
// {
//   Authorization: 'Bearer token-from-plugin',
//   'X-Client-Version': '1.0.0',
//   'X-Custom-A': 'from-composable',
//   'X-Custom-B': 'from-plugin',
//   'X-Custom-C': 'from-request',
//   'X-Request-ID': '<uuid>'
// }
```

## Auth Library Agnostic

Global Headers works with **any authentication library or custom solution**:

### Nuxt Auth

```typescript
export const useApiHeaders = () => {
  const { token } = useAuth()
  
  return () => ({
    Authorization: token.value ? `Bearer ${token.value}` : undefined
  })
}
```

### Supabase

```typescript
export const useApiHeaders = () => {
  const supabase = useSupabaseClient()
  
  return async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token 
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}
  }
}
```

### Firebase Auth

```typescript
export const useApiHeaders = () => {
  const auth = useFirebaseAuth()
  
  return async () => {
    const token = await auth.currentUser?.getIdToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}
```

### Auth0

```typescript
export const useApiHeaders = () => {
  const { getAccessTokenSilently } = useAuth0()
  
  return async () => {
    try {
      const token = await getAccessTokenSilently()
      return { Authorization: `Bearer ${token}` }
    } catch {
      return {}
    }
  }
}
```

### Custom Cookie-Based Auth

```typescript
export const useApiHeaders = () => {
  const token = useCookie('auth-token')
  const sessionId = useCookie('session-id')
  
  return () => {
    const headers: Record<string, string> = {}
    
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    
    if (sessionId.value) {
      headers['X-Session-ID'] = sessionId.value
    }
    
    return headers
  }
}
```

## Override Global Headers

You can override or skip global headers for specific requests:

### Override Specific Header

```typescript
// Global header sets Authorization
const { data: publicPets } = useFetchGetPets({}, {
  headers: {
    Authorization: undefined // Remove auth for public endpoint
  }
})
```

### Add Extra Headers

```typescript
const { data: pets } = useFetchGetPets({}, {
  headers: {
    'X-Custom-Header': 'special-value' // Merged with global headers
  }
})
```

### Modify in onRequest

```typescript
const { data: pets } = useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    // Remove unwanted header
    const { ['X-API-Key']: removed, ...rest } = headers || {}
    
    return {
      headers: {
        ...rest,
        'Authorization': 'Bearer different-token',
        ...(someCondition && { 'X-Special-Flag': 'true' })
      }
    }
  }
})
```

## Debugging Headers

To see what headers are being sent:

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = () => {
  return () => {
    const headers = {
      Authorization: 'Bearer token',
      'X-Client-Version': '1.0.0'
    }
    
    // Debug in development
    if (process.dev) {
      console.log('Global Headers:', headers)
    }
    
    return headers
  }
}

// Or in component
const { data: pets } = useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    console.log('Final headers:', headers)
  }
})
```

## Best Practices

### ✅ Do

- Return empty object `{}` when no headers needed (not `null` or `undefined`)
- Use reactive sources (stores, cookies, composables)
- Keep header logic simple and fast
- Remove headers by setting to `undefined`
- Use TypeScript for type safety

```typescript
// ✅ Good
export const useApiHeaders = () => {
  const token = useCookie('token')
  
  return () => {
    if (!token.value) return {}
    
    return {
      Authorization: `Bearer ${token.value}`
    }
  }
}
```

### ❌ Don't

- Don't return `null` or `undefined` (return `{}` instead)
- Don't perform expensive operations (API calls, heavy computation)
- Don't mutate global state
- Don't use synchronous localStorage reads (use cookies or async)

```typescript
// ❌ Bad
export const useApiHeaders = () => {
  return () => {
    // Don't make API calls here
    const token = await $fetch('/api/get-token')
    
    // Don't return null
    return null
  }
}
```

## Performance Considerations

Global Headers function is called **before every request**:

```typescript
// ✅ Optimized - cached reference
export const useApiHeaders = () => {
  const authStore = useAuthStore() // Cached
  
  return () => ({
    Authorization: `Bearer ${authStore.token}` // Fast property access
  })
}

// ❌ Not optimized - recreates store each time
export const useApiHeaders = () => {
  return () => {
    const authStore = useAuthStore() // Called every request
    return {
      Authorization: `Bearer ${authStore.token}`
    }
  }
}
```

## TypeScript Support

Full type safety for headers:

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = (): (() => Record<string, string>) => {
  const authStore = useAuthStore()
  
  return (): Record<string, string> => {
    const headers: Record<string, string> = {}
    
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    return headers
  }
}

// Type-safe in usage
const { data } = useFetchGetPets({}, {
  headers: {
    'X-Custom': 'value' // TypeScript knows this is Record<string, string>
  }
})
```

## Comparison with onRequest Callback

| Feature | Global Headers | onRequest Callback |
|---------|---------------|-------------------|
| **Scope** | All requests | Per request |
| **Setup** | Once in composable/plugin | Each call |
| **Use Case** | Common headers (auth, API key) | Request-specific logic |
| **Reactivity** | ✅ Automatic | ✅ Manual |
| **Override** | ✅ Can be overridden | ✅ Final override |

**Use both together:**

```typescript
// Global Headers - common auth
export const useApiHeaders = () => {
  return () => ({
    Authorization: `Bearer ${useAuthStore().token}`
  })
}

// onRequest - request-specific
const { data } = useFetchGetPets({}, {
  onRequest: ({ headers, query }) => {
    return {
      headers: {
        ...headers,
        'X-Request-ID': crypto.randomUUID()
      },
      query: {
        ...query,
        timestamp: Date.now()
      }
    }
  }
})
```

## Troubleshooting

### Headers Not Being Sent

Check:
1. File is in correct location (`composables/useApiHeaders.ts`)
2. Function returns an object (not `null`)
3. Headers are not being overridden later
4. No errors in console

```typescript
// Add debug logging
export const useApiHeaders = () => {
  console.log('useApiHeaders initialized')
  
  return () => {
    const headers = { Authorization: 'Bearer token' }
    console.log('Returning headers:', headers)
    return headers
  }
}
```

### Token Not Updating

Ensure you're using reactive sources:

```typescript
// ✅ Reactive - updates when token changes
export const useApiHeaders = () => {
  const token = useCookie('token') // Reactive
  
  return () => ({
    Authorization: `Bearer ${token.value}`
  })
}

// ❌ Not reactive - captures initial value
export const useApiHeaders = () => {
  const token = useCookie('token').value // Static value
  
  return () => ({
    Authorization: `Bearer ${token}` // Never updates
  })
}
```

### Headers Being Cached

Global Headers are re-evaluated on each request, but if you're seeing caching:

1. Check if you're using static values instead of reactive ones
2. Clear browser cache and cookies
3. Check for aggressive HTTP caching on the API side

## Next Steps

- [Request Interception →](/composables/features/request-interception)
- [Global Callbacks →](/composables/features/global-callbacks/overview)
- [Authentication →](/composables/features/authentication)
- [onError Callback →](/composables/features/callbacks/on-error)
