# Authentication

Add authentication tokens and credentials to your API requests using both local and global callbacks.

## Overview

Authentication can be implemented at two levels:

1. **Local Level**: Per-request authentication
2. **Global Level**: Automatic authentication for all requests

```typescript
// Local
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'Authorization': `Bearer ${token}`
      }
    }
  }
})

// Global (recommended)
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'Authorization': `Bearer ${token}`
      }
    }
  }
})
```

## Bearer Token Authentication

### Local Token

```typescript
<script setup lang="ts">
const token = useCookie('auth-token')

const { data: pets } = useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    if (token.value) {
      return {
        headers: {
          ...headers,
          'Authorization': `Bearer ${token.value}`
        }
      }
    }
  }
})
</script>
```

### Global Token

```typescript
// plugins/auth.ts
export default defineNuxtPlugin(() => {
  const token = useCookie('auth-token')
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      if (token.value) {
        return {
          headers: {
            ...headers,
            'Authorization': `Bearer ${token.value}`
          }
        }
      }
    }
  })
})
```

## API Key Authentication

### Header-Based

```typescript
// plugins/api-key.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      return {
        headers: {
          ...headers,
          'X-API-Key': config.public.apiKey
        }
      }
    }
  })
})
```

### Query Parameter

```typescript
useGlobalCallbacks({
  onRequest: ({ query }) => {
    const config = useRuntimeConfig()
    return {
      query: {
        ...query,
        api_key: config.public.apiKey
      }
    }
  }
})
```

## Token Refresh Flow

### Automatic Refresh

```vue
<script setup lang="ts">
const token = useCookie('auth-token')
const refreshToken = useCookie('refresh-token')

const refreshAccessToken = async () => {
  const { token: newToken } = await $fetch('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken: refreshToken.value }
  })
  
  token.value = newToken
  return newToken
}

useGlobalCallbacks({
  onRequest: ({ headers }) => {
    if (token.value) {
      return {
        headers: {
          ...headers,
          'Authorization': `Bearer ${token.value}`
        }
      }
    }
  },
  onError: async (error, { refresh }) => {
    // Token expired
    if (error.status === 401) {
      try {
        await refreshAccessToken()
        // Retry request with new token
        refresh()
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await navigateTo('/login')
      }
    }
  }
})
</script>
```

### Manual Refresh

```vue
<script setup lang="ts">
const token = ref<string | null>(null)
const isRefreshing = ref(false)

const refreshToken = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    const { token: newToken } = await $fetch('/api/auth/refresh')
    token.value = newToken
  } finally {
    isRefreshing.value = false
  }
}

const { data, refresh } = useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    if (token.value) {
      return {
        headers: {
          ...headers,
          'Authorization': `Bearer ${token.value}`
        }
      }
    }
  },
  onError: async (error) => {
    if (error.status === 401 && !isRefreshing.value) {
      await refreshToken()
      refresh()
    }
  }
})
</script>
```

## Basic Authentication

```typescript
const username = 'user'
const password = 'pass'
const credentials = btoa(`${username}:${password}`)

useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'Authorization': `Basic ${credentials}`
      }
    }
  }
})
```

## OAuth2 Token

```typescript
// plugins/oauth.ts
export default defineNuxtPlugin(() => {
  const accessToken = useCookie('oauth-access-token')
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      if (accessToken.value) {
        return {
          headers: {
            ...headers,
            'Authorization': `Bearer ${accessToken.value}`
          }
        }
      }
    }
  })
})
```

## Custom Headers

### Single Custom Header

```typescript
useFetchGetPets({}, {
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'X-Auth-Token': useCookie('custom-token').value
      }
    }
  }
})
```

### Multiple Custom Headers

```typescript
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    const userId = useCookie('user-id').value
    const sessionId = useCookie('session-id').value
    
    return {
      headers: {
        ...headers,
        'X-User-ID': userId,
        'X-Session-ID': sessionId
      }
    }
  }
})
```

## Conditional Authentication

### Skip for Public Endpoints

```typescript
useGlobalCallbacks({
  onRequest: ({ headers, url }) => {
    const publicEndpoints = ['/api/public', '/api/health']
    const isPublic = publicEndpoints.some(ep => url.includes(ep))
    
    if (!isPublic) {
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
  }
})
```

### Different Auth per Endpoint

```typescript
useGlobalCallbacks({
  onRequest: ({ headers, url }) => {
    if (url.includes('/api/admin')) {
      return {
        headers: {
          ...headers,
          'Authorization': `Bearer ${useCookie('admin-token').value}`
        }
      }
    } else if (url.includes('/api/user')) {
      return {
        headers: {
          ...headers,
          'Authorization': `Bearer ${useCookie('user-token').value}`
        }
      }
    }
  }
})
```

## Environment-Based Auth

```typescript
// plugins/auth.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      if (process.dev) {
        // Development: Use test token
        return {
          headers: {
            ...headers,
            'Authorization': 'Bearer test-token'
          }
        }
      } else {
        // Production: Use real token
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
    }
  })
})
```

## Session-Based Authentication

```typescript
// plugins/session.ts
export default defineNuxtPlugin(() => {
  const sessionId = useCookie('session-id')
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      if (sessionId.value) {
        return {
          headers: {
            ...headers,
            'X-Session-ID': sessionId.value
          }
        }
      }
    }
  })
})
```

## JWT Verification

```typescript
const verifyToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000
    return Date.now() < exp
  } catch {
    return false
  }
}

useGlobalCallbacks({
  onRequest: ({ headers }) => {
    const token = useCookie('auth-token').value
    
    if (token) {
      if (verifyToken(token)) {
        return {
          headers: {
            ...headers,
            'Authorization': `Bearer ${token}`
          }
        }
      } else {
        // Token expired, redirect to login
        navigateTo('/login')
      }
    }
  }
})
```

## Multi-Tenancy

```typescript
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    const tenantId = useCookie('tenant-id').value
    const token = useCookie('auth-token').value
    
    return {
      headers: {
        ...headers,
        ...(tenantId && { 'X-Tenant-ID': tenantId }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
  }
})
```

## Real-World Examples

### Complete Auth System

```typescript
// plugins/auth-system.ts
export default defineNuxtPlugin(() => {
  const token = useCookie('auth-token')
  const refreshToken = useCookie('refresh-token')
  const isRefreshing = ref(false)
  
  const refresh = async () => {
    if (isRefreshing.value) return
    
    isRefreshing.value = true
    try {
      const response = await $fetch('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken: refreshToken.value }
      })
      
      token.value = response.accessToken
      refreshToken.value = response.refreshToken
    } catch {
      // Refresh failed, clear tokens
      token.value = null
      refreshToken.value = null
      await navigateTo('/login')
    } finally {
      isRefreshing.value = false
    }
  }
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      if (token.value) {
        return {
          headers: {
            ...headers,
            'Authorization': `Bearer ${token.value}`
          }
        }
      }
    },
    onError: async (error, { refresh: refreshRequest }) => {
      if (error.status === 401 && token.value && !isRefreshing.value) {
        await refresh()
        // Retry original request
        refreshRequest()
      }
    }
  })
})
```

### Role-Based Headers

```typescript
// plugins/role-auth.ts
export default defineNuxtPlugin(() => {
  const user = useUserStore()
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      if (user.token) {
        return {
          headers: {
            ...headers,
            'Authorization': `Bearer ${user.token}`,
            ...(user.role && { 'X-User-Role': user.role }),
            ...(user.permissions && { 'X-Permissions': user.permissions.join(',') })
          }
        }
      }
    }
  })
})
```

### API Gateway Pattern

```typescript
// plugins/gateway.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      const userToken = useCookie('auth-token').value
      
      return {
        headers: {
          ...headers,
          'X-Gateway-Key': config.public.gatewayKey,
          ...(userToken && { 'Authorization': `Bearer ${userToken}` })
        }
      }
    }
  })
})
```

## Security Best Practices

### ✅ Do

```typescript
// ✅ Store tokens in httpOnly cookies
const token = useCookie('auth-token', { 
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})

// ✅ Use environment variables for API keys
const config = useRuntimeConfig()
onRequest: ({ headers }) => {
  return {
    headers: {
      ...headers,
      'X-API-Key': config.public.apiKey
    }
  }
}

// ✅ Verify token expiration
if (isTokenExpired(token.value)) {
  await refreshToken()
}

// ✅ Clear tokens on logout
const logout = () => {
  token.value = null
  refreshToken.value = null
  navigateTo('/login')
}
```

### ❌ Don't

```typescript
// ❌ Don't hardcode tokens
onRequest: ({ headers }) => {
  return {
    headers: {
      ...headers,
      'Authorization': 'Bearer hardcoded-token' // ❌ Never do this!
    }
  }
}

// ❌ Don't store sensitive tokens in localStorage
localStorage.setItem('token', token)  // Use httpOnly cookies!

// ❌ Don't expose tokens in URLs
const url = `/api/pets?token=${token}`  // Use headers!

// ❌ Don't skip HTTPS in production
// Always use secure cookies and HTTPS
```

## Troubleshooting

### Token Not Sent

```typescript
// Check if token exists
onRequest: ({ headers }) => {
  const token = useCookie('auth-token').value
  console.log('Token:', token ? 'EXISTS' : 'MISSING')
  
  if (token) {
    return {
      headers: {
        ...headers,
        'Authorization': `Bearer ${token}`
      }
    }
  }
}
```

### CORS Issues

```typescript
// Ensure credentials are included
useFetchGetPets({}, {
  credentials: 'include',  // Send cookies
  onRequest: ({ headers }) => {
    return {
      headers: {
        ...headers,
        'Authorization': `Bearer ${token.value}`
      }
    }
  }
})
```

## Next Steps

- [Global Callbacks Setup →](/composables/features/global-callbacks/setup)
- [onRequest Callback →](/composables/features/callbacks/on-request)
- [onError Callback →](/composables/features/callbacks/on-error)
