# Choosing a Generator

Nuxt OpenAPI Hyperfetch supports three generator types. Each has different use cases, advantages, and trade-offs.

## Quick Comparison

| Feature | useFetch | useAsyncData | nuxtServer |
|---------|----------|--------------|------------|
| **Complexity** | Simple | Medium | Advanced |
| **SSR Compatible** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Type Safety** | ✅ Full | ✅ Full | ✅ Full |
| **Callbacks** | ✅ Full | ✅ Full | ⚠️ Manual |
| **Raw Response** | ❌ No | ✅ Yes | ✅ Yes |
| **Data Transform** | ✅ Full | ✅ Full | ✅ Full |
| **Client Usage** | Simple | Simple | Requires composable |
| **Server Logic** | ❌ No | ❌ No | ✅ Yes |
| **Best For** | Basic CRUD | Complex logic | BFF pattern |

## 1. useFetch Generator

**Recommended for:** 80% of use cases - simple API calls, basic CRUD operations

### What It Generates

```typescript
export function useFetchGetPetById(
  params: { petId: number },
  options?: ApiRequestOptions<Pet>
) {
  return useApiRequest<Pet>('/pets/{petId}', {
    method: 'GET',
    pathParams: params,
    ...options
  })
}
```

### Characteristics

- ✅ Uses Nuxt's `useFetch` under the hood
- ✅ Simple, predictable API
- ✅ Executes immediately on mount
- ✅ Returns reactive refs: `data`, `pending`, `error`, `refresh`
- ❌ No access to raw response (headers, status)
- ✅ Full data transformation with `transform` and `pick`

### Usage Example

```vue
<script setup lang="ts">
const { data: pet, pending, error, refresh } = useFetchGetPetById(
  { petId: 123 },
  {
    onSuccess: (pet) => {
      showToast(`Loaded ${pet.name}`)
    }
  }
)
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>{{ pet.name }}</div>
</template>
```

### When to Use

✅ **Perfect For:**

- Simple GET requests
- Loading data on component mount
- Basic forms (POST, PUT, DELETE)
- Standard CRUD operations
- When you don't need response headers/status

❌ **Not Ideal For:**

- Complex data transformations
- Multiple API calls in one composable
- Accessing raw response (status code, headers)
- Conditional request execution

### Generation

```bash
nxh generate -i swagger.yaml -o ./composables/api -g useFetch
```

## 2. useAsyncData Generator

**Recommended for:** Complex logic, data transformations, conditional requests

### What It Generates

```typescript
export function useAsyncDataGetPets(
  key: string,
  params?: {},
  options?: ApiAsyncDataOptions<Pet[]>
) {
  return useApiAsyncData<Pet[]>(key, '/pets', {
    method: 'GET',
    ...options
  })
}
```

### Characteristics

- ✅ Uses Nuxt's `useAsyncData` under the hood
- ✅ More control over execution
- ✅ Requires unique cache key
- ✅ Can access raw response
- ✅ Full data transformation support
- ⚠️ Slightly more complex API
- ⚠️ Must manage cache keys manually

### Usage Example

```vue
<script setup lang="ts">
// Basic usage (similar to useFetch)
const { data, pending } = useAsyncDataGetPets('pets-list')

// With transformation
const { data: petNames } = useAsyncDataGetPets(
  'pet-names',
  {},
  {
    transform: (pets) => pets.map(p => p.name)
  }
)

// Access raw response
const { data: petResponse } = useAsyncDataGetPetsRaw('pets-raw')

watch(petResponse, (response) => {
  console.log('Status:', response.status)
  console.log('Headers:', response.headers)
  console.log('Data:', response._data)
})
</script>
```

### When to Use

✅ **Perfect For:**

- Transforming response data
- Multiple API calls in one composable
- Accessing raw response (headers, status code)
- Conditional request execution
- Fine-grained cache control
- Complex data processing

❌ **Not Ideal For:**

- Simple GET requests (useFetch is simpler)
- When you don't need transformations
- Beginners (useFetch is easier to understand)

### Raw Response Variant

`useAsyncData` generator also creates a "raw" variant that returns the raw `$fetch` response:

```typescript
// Generated alongside useAsyncDataGetPets
export function useAsyncDataGetPetsRaw(key: string, params?: {}) {
  return useApiAsyncDataRaw<Pet[]>(key, '/pets', {
    method: 'GET'
  })
}
```

Access full response:

```typescript
const { data: response } = useAsyncDataGetPetsRaw('pets-raw')

response.value?.status      // 200
response.value?.statusText  // "OK"
response.value?.headers     // Headers object
response.value?._data       // Pet[] (actual data)
```

### Generation

```bash
nxh generate -i swagger.yaml -o ./composables/api -g useAsyncData
```

## 3. nuxtServer Generator

**Recommended for:** Backend-For-Frontend (BFF) pattern, server-side logic

### What It Generates

**Basic Mode:**

```typescript
// server/api/pet/[pet].get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import type { Pet } from '~/swagger/models'

export default defineEventHandler(async (event): Promise<Pet> => {
  // Extract and validate path parameter
  const petId = getRouterParam(event, 'pet')
  if (!petId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'petId is required'
    })
  }
  
  // Get API configuration from runtime config
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl
  
  try {
    // Call external API from your Nuxt server
    const data = await $fetch<Pet>(`${baseUrl}/pet/${petId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    return data
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Request failed'
    })
  }
})
```

**BFF Mode (with --bff flag):**

```typescript
// server/api/pet/[pet].get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import type { Pet } from '~/swagger/models'

export default defineEventHandler(async (event): Promise<Pet> => {
  const petId = getRouterParam(event, 'pet')
  if (!petId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'petId is required'
    })
  }
  
  // Try to load auth context (optional)
  let auth = null
  try {
    const { getAuthContext } = await import('~/server/auth/context')
    auth = await getAuthContext(event)
  } catch {
    // Auth not configured - continue without it
  }
  
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl
  
  try {
    const data = await $fetch<Pet>(`${baseUrl}/pet/${petId}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers if available
        ...(auth?.token ? { 'Authorization': `Bearer ${auth.token}` } : {})
      }
    })
    
    // Try to transform data (optional)
    try {
      const { transformPet } = await import('~/server/bff/transformers/pet')
      return await transformPet(data, event, auth)
    } catch {
      // Transformer not found - return raw data
      return data
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Request failed'
    })
  }
})
```

### Characteristics

- ✅ Generates Nuxt server routes (not composables)
- ✅ Runs on your Nuxt server (not directly to external API)
- ✅ Can add authentication context
- ✅ Full data transformation on server
- ✅ Can combine multiple data sources
- ✅ More secure (API keys stay on server)
- ⚠️ Requires manual client-side composable or `useFetch`
- ⚠️ No built-in callbacks (must implement manually)

### Usage Example

**Server Route (Generated):**

```typescript
// server/api/pet/[pet].get.ts
export default defineEventHandler(async (event) => {
  const petId = getRouterParam(event, 'pet')
  if (!petId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'petId is required'
    })
  }
  
  // Load auth context (generated by --bff)
  let auth = null
  try {
    const { getAuthContext } = await import('~/server/auth/context')
    auth = await getAuthContext(event)
  } catch {
    // Auth not configured
  }
  
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl
  
  try {
    const data = await $fetch(`${baseUrl}/pet/${petId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    // Transform with BFF transformer
    try {
      const { transformPet } = await import('~/server/bff/transformers/pet')
      return await transformPet(data, event, auth)
    } catch {
      return data
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Request failed'
    })
  }
})
```

**BFF Transformer (you implement):**

```typescript
// server/bff/transformers/pet.ts
import type { H3Event } from 'h3'
import type { Pet } from '~/swagger/models'
import type { AuthContext } from '~/server/auth/types'

export async function transformPet(
  pet: Pet,
  event: H3Event,
  auth: AuthContext | null
): Promise<Pet & { canEdit?: boolean; canDelete?: boolean }> {
  // Add permissions based on auth
  return {
    ...pet,
    canEdit: auth?.roles?.includes('admin') || false,
    canDelete: auth?.roles?.includes('admin') || false,
  }
}
```

**Client Usage:**

```vue
<script setup lang="ts">
// Use Nuxt's useFetch to call YOUR server route
// Route: /api/pet/[pet] → /api/pet/123
const { data: pet } = useFetch('/api/pet/123')

// pet now includes permissions added by transformer
</script>

<template>
  <div>
    <h1>{{ pet?.name }}</h1>
    <button v-if="pet?.canEdit">Edit</button>
    <button v-if="pet?.canDelete">Delete</button>
  </div>
</template>
```

### When to Use

✅ **Perfect For:**

- Backend-for-Frontend (BFF) pattern
- Adding authentication context (JWT verification)
- Transforming data on server
- Filtering sensitive fields
- Combining data from multiple sources
- Hiding external API details from client
- Adding permissions/authorization logic

❌ **Not Ideal For:**

- Simple client-side API calls (use useFetch instead)
- When you don't need server-side logic
- Prototyping (more setup required)

### Architecture

```
        Client (Nuxt App)
               │
               ▼
    ┌─────────────────────────┐
    │  Nuxt Server Route      │
    │  /server/api/pets/* │
    └───────┬───────┬───────┬────┘
           │        │        │
           ▼        ▼        ▼
      External  Database  Auth
        API               Service
           │        │        │
           └────────┴────────┘
                    │
                    ▼
          Response to Client
```

### Advanced Features

**1. Auth Context:**

```typescript
// server/auth/context.ts (you implement)
import type { H3Event } from 'h3'
import type { AuthContext } from './types'
import { getCookie } from 'h3'

export async function getAuthContext(event: H3Event): Promise<AuthContext | null> {
  const token = getCookie(event, 'auth-token')
  
  if (!token) {
    return null
  }
  
  // Verify JWT and return user context
  // This is just an example - implement your own logic
  try {
    const decoded = await verifyJWT(token)
    return {
      userId: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
      token: token
    }
  } catch {
    return null
  }
}
```

```typescript
// server/api/pet/[pet].get.ts (generated, uses auth)
export default defineEventHandler(async (event) => {
  const petId = getRouterParam(event, 'pet')
  
  // Get auth context
  let auth = null
  try {
    const { getAuthContext } = await import('~/server/auth/context')
    auth = await getAuthContext(event)
  } catch {}
  
  // Require authentication
  if (!auth) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  // Use auth context
  const config = useRuntimeConfig()
  const data = await $fetch(`${config.apiBaseUrl}/pet/${petId}`, {
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'X-User-Id': auth.userId
    }
  })
  
  return data
})
```

**2. Transformers:**

```typescript
// server/bff/transformers/pet.ts (you implement)
import type { H3Event } from 'h3'
import type { Pet } from '~/swagger/models'
import type { AuthContext } from '~/server/auth/types'

export async function transformPet(
  pet: Pet,
  event: H3Event,
  auth: AuthContext | null
): Promise<Pet> {
  // Filter based on permissions
  const isAdmin = auth?.roles?.includes('admin')
  
  return {
    id: pet.id,
    name: pet.name,
    status: pet.status,
    // Only include sensitive fields for admins
    ...(isAdmin && { ownerEmail: pet.ownerEmail }),
    ...(isAdmin && { internalNotes: pet.internalNotes }),
  }
}
```

```typescript
// server/api/pet/index.get.ts (generated, uses transformer)
export default defineEventHandler(async (event): Promise<Pet[]> => {
  let auth = null
  try {
    const { getAuthContext } = await import('~/server/auth/context')
    auth = await getAuthContext(event)
  } catch {}
  
  const config = useRuntimeConfig()
  const data = await $fetch<Pet[]>(`${config.apiBaseUrl}/pet`)
  
  // Transform each pet
  try {
    const { transformPet } = await import('~/server/bff/transformers/pet')
    return await Promise.all(
      data.map(pet => transformPet(pet, event, auth))
    )
  } catch {
    return data
  }
})
```

**3. Combining Sources:**

```typescript
// server/api/pet/[pet]/details.get.ts
export default defineEventHandler(async (event) => {
  const petId = getRouterParam(event, 'pet')
  if (!petId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'petId is required'
    })
  }
  
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl
  
  // Call multiple APIs in parallel
  const [pet, owner, appointments] = await Promise.all([
    $fetch(`${baseUrl}/pet/${petId}`),
    $fetch(`${baseUrl}/owners/${petId}`),
    $fetch(`${baseUrl}/appointments?petId=${petId}`)
  ])
  
  // Combine data
  return {
    ...pet,
    owner,
    upcomingAppointments: appointments.filter(a => a.date > Date.now())
  }
})
```

### Generation

```bash
nxh generate -i swagger.yaml -o ./server/api -g nuxtServer
```

## Decision Tree

Use this flowchart to choose the right generator:

```
  Need server-side logic?
  (auth, security, BFF)
            │
       ┌────┴────┐
       │         │
      Yes        No
       │         │
       ▼         ▼
  nuxtServer  Need raw response or transformations?
   (server)            │
                  ┌────┴────┐
                  │         │
                 Yes        No
                  │         │
                  ▼         ▼
            useAsyncData  useFetch
             (complex)   (simple) ✅
```

### Quick Questions

**Do I need...?**

| Question | If Yes → |
|----------|----------|
| Auth context on server? | **nuxtServer** |
| To combine multiple APIs? | **nuxtServer** |
| To filter sensitive data on server? | **nuxtServer** |
| Response headers/status? | **useAsyncData** |
| Data transformations? | **useAsyncData** |
| Multiple API calls in one composable? | **useAsyncData** |
| Simple GET/POST/PUT/DELETE? | **useFetch** |
| Basic CRUD operations? | **useFetch** |
| Fastest setup? | **useFetch** |

## Mixing Generators

You can use **multiple generators in one project**:

```bash
# Generate client composables with useFetch
nxh generate -i swagger.yaml -o ./composables/api -g useFetch

# Generate server routes with nuxtServer
nxh generate -i swagger.yaml -o ./server/api -g nuxtServer
```

**Example: Complex app architecture**

- `useFetch` for simple CRUD (posts, comments)
- `useAsyncData` for complex data (search with filters, pagination)
- `nuxtServer` for auth-sensitive operations (user profile, payments)

## Next Steps

- **See useFetch Examples**: [Basic Examples](/examples/composables/basic/simple-get)
- **See useAsyncData Examples**: [Advanced Examples](/examples/composables/advanced/authentication-flow)
- **See nuxtServer Examples**: [Server Examples](/examples/server/basic-bff/simple-route)
- **Learn About Callbacks**: [Callback System](/composables/features/callbacks/overview)
