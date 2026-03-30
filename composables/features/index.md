# Shared Features

Both `useFetch` and `useAsyncData` composables share powerful features that enhance your API integration.

## Overview

Generated composables include:

- ✅ **Configuration File**: Configure base URL and generation options
- ✅ **Lifecycle Callbacks**: Execute code at different request stages
- ✅ **Global Callbacks**: Define callbacks once, apply everywhere
- ✅ **Global Headers**: Set headers globally (auth tokens, API keys)
- ✅ **Pick Fields**: Select specific response fields with dot notation
- ✅ **Request Interception**: Modify requests before sending
- ✅ **Authentication**: Built-in auth token and error handling patterns
- ✅ **Error Handling**: Centralized error management

## Features Comparison

| Feature | useFetch | useAsyncData | Source |
|---------|----------|--------------|--------|
| **Configuration File** | ✅ Full | ✅ Full | CLI adds |
| **Callbacks** | ✅ Full | ✅ Full | CLI adds |
| **Global Callbacks** | ✅ Full | ✅ Full | CLI adds |
| **Global Headers** | ✅ Full | ✅ Full | CLI adds |
| **Pick Fields** | ✅ Full | ✅ Full | CLI adds |
| **Request Interception** | ✅ Full | ✅ Full | CLI adds |
| **Type Safety** | ✅ Full | ✅ Full | CLI adds (from OpenAPI) |
| **Authentication** | ✅ Full | ✅ Full | Pattern using CLI callbacks |
| **Error Handling** | ✅ Full | ✅ Full | Pattern using CLI callbacks |

## Configuration File

Configure the CLI behavior with `nxh.config.js` in your project root.

### Basic Configuration

```javascript
// nxh.config.js
export default {
  input: './openapi.yaml',
  output: './composables',
  baseUrl: 'https://api.example.com',
  generators: ['useFetch', 'useAsyncData']
}
```

::: tip CLI Feature
The configuration file is specific to the CLI. It controls code generation and sets the base URL for client composables (useFetch and useAsyncData only).
:::

[Learn more about CLI configuration →](/guide/use-as-cli#cli-config-file-nxh-config)

## Callbacks

Execute code at different stages of the request lifecycle.

### Four Lifecycle Callbacks

```typescript
useFetchGetPets({}, {
  onRequest: ({ url, headers, body, query }) => {
    // ⏱️ Before request
    console.log('Starting request to:', url)
  },
  onSuccess: (data) => {
    // ✅ On 2xx response
    console.log('Success!', data)
  },
  onError: (error) => {
    // ❌ On 4xx/5xx or network error
    console.error('Failed!', error)
  },
  onFinish: () => {
    // 🏁 Always runs
    console.log('Request complete')
  }
})
```

[Learn more about callbacks →](/composables/features/callbacks/overview)

## Global Callbacks

Define callbacks once in a plugin, apply them to all requests automatically.

### Plugin Setup

```typescript
// plugins/api-callbacks.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
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
    },
    onError: (error) => {
      // Handle ALL errors in one place
      if (error.status === 401) {
        navigateTo('/login')
      }
    }
  })
})
```

Now every API request automatically includes the auth token and handles 401 errors.

[Learn more about global callbacks →](/composables/features/global-callbacks/overview)

## Global Headers

Set headers globally for all API requests using `useApiHeaders()` composable.

### Composable Method

```typescript
// composables/useApiHeaders.ts
export const useApiHeaders = () => {
  const authToken = useCookie('auth-token')
  
  return computed(() => ({
    'Authorization': authToken.value ? `Bearer ${authToken.value}` : '',
    'X-Client-Version': '1.0.0'
  }))
}
```

All API requests automatically include these headers. Global headers merge with request-specific headers.

::: tip CLI Feature
Global headers are a CLI-specific feature that work with both `useFetch` and `useAsyncData` composables.
:::

[Learn more about global headers →](/composables/features/global-headers)

## Pick Fields

Select specific fields from API responses using the `pick` option with dot notation support.

### Basic Usage

```typescript
// Pick specific fields
const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'name', 'email'] as const
})
// data: { id: number, name: string, email: string }

// Pick nested fields with dot notation
const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['profile.name', 'profile.avatar', 'status'] as const
})
// data: { profile: { name: string, avatar: string }, status: string }
```

::: tip CLI Feature
The `pick` option is a CLI-specific feature that reduces data transfer and improves performance. It works with both `useFetch` and `useAsyncData` composables.
:::

[Learn more about pick fields →](/composables/features/pick)

## Request Interception

Modify requests before they're sent using `onRequest`.

```typescript
useFetchGetUsers({}, {
  onRequest: ({ url, method, headers, body, query }) => {
    return {
      headers: {
        ...headers,
        'X-Custom-Header': 'value',
        'X-Request-ID': crypto.randomUUID()
      },
      query: {
        ...query,
        timestamp: Date.now(),
        version: 'v2'
      },
      body: body ? {
        ...body,
        clientVersion: '1.0.0'
      } : undefined
    }
  }
})
```

[Learn more about request interception →](/composables/features/request-interception)

## Authentication

Built-in patterns for authentication.

### Global Auth Token

```typescript
// plugins/api-auth.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    },
    onError: (error) => {
      if (error.status === 401) {
        // Clear token and redirect
        useCookie('auth-token').value = null
        navigateTo('/login')
      }
    }
  })
})
```

### Skip Auth for Public Requests

```typescript
useFetchGetPublicPets({}, {
  skipGlobalCallbacks: true // Skip auth token
})
```

[Learn more about authentication →](/composables/features/authentication)

## Error Handling

Centralized error management with global callbacks.

```typescript
// plugins/api-errors.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onError: (error) => {
      // Log all errors
      console.error('[API Error]', error)
      
      // Handle by status code
      if (error.status === 404) {
        showToast('Resource not found', 'error')
      } else if (error.status === 403) {
        showToast('Access denied', 'error')
      } else if (error.status >= 500) {
        showToast('Server error, please try again', 'error')
      } else {
        showToast(error.message, 'error')
      }
    }
  })
})
```

[Learn more about error handling →](/composables/features/callbacks/on-error)

## Feature Architecture

```
         ┌─────────────────────────────────────────────────────┐
         │                                                     │
         ▼                                                     │
  ┌────────────┐                                              │
  │ Component  │                                              │
  └──────┬─────┘                                              │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │Generated Composable  │                                    │
  └──────┬───────────────┘                                    │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │  Local Callbacks     │                                    │
  └──────┬───────────────┘                                    │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │  Global Callbacks    │                                    │
  └──────┬───────────────┘                                    │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │Request Interception  │                                    │
  └──────┬───────────────┘                                    │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │  Nuxt Composable     │                                    │
  └──────┬───────────────┘                                    │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │       API            │                                    │
  └──────┬───────────────┘                                    │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │     Response         │                                    │
  └──────┬───────────────┘                                    │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │Data Transformation   │                                    │
  └──────┬───────────────┘                                    │
         │                                                     │
         ▼                                                     │
  ┌──────────────────────┐                                    │
  │Success/Error Callbacks│                                   │
  └──────┬───────────────┘                                    │
         │                                                     │
         └─────────────────────────────────────────────────────┘
```

## Next Steps

Explore each feature in detail:

- [Callbacks Overview →](/composables/features/callbacks/overview)
- [Global Callbacks →](/composables/features/global-callbacks/overview)
- [Request Interception →](/composables/features/request-interception)
- [Server Transformers →](/server/transformers/)
- [Authentication →](/composables/features/authentication)
- [Error Handling →](/composables/features/callbacks/on-error)
