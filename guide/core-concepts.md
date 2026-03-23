# Core Concepts

Understanding these core concepts will help you use Nuxt OpenAPI Hyperfetch effectively.

## 1. Two-Stage Generation Pattern

Nuxt OpenAPI Hyperfetch follows a **two-stage generation pattern** to keep generated code clean and maintainable:

```
┌──────────────────┐
│  OpenAPI Spec    │
└────────┬─────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────────────┐            ┌────────────────────────┐
│ Stage 1: Generate       │            │ Stage 2: Copy Runtime  │
│ Wrappers                │            │                        │
└──────────┬──────────────┘            └──────────┬─────────────┘
           │                                      │
           ▼                                      ▼
  ┌──────────────────────┐            ┌─────────────────────────┐
  │ Generated Composables│            │ Runtime Helper Files    │
  │ useFetchGetPetById() │            │ useApiRequest.ts        │
  │ useFetchAddPet()     │            │ apiHelpers.ts           │
  └──────────┬───────────┘            └──────────┬──────────────┘
             │                                   │
             └──────────────┬────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │   Your App      │
                   └─────────────────┘
```

### Stage 1: Generate Wrappers

Creates **thin wrapper composables** for each API endpoint:

```typescript
// Generated: composables/getPetById.ts
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

These are **auto-generated** and should **not be edited manually**. They're regenerated every time you run the generator.

### Stage 2: Copy Runtime Files

Copies **shared helper functions** that all composables depend on:

```typescript
// Copied: runtime/use-api-request.ts
export function useApiRequest<T>(url: string, options: RequestOptions) {
  // Execute callbacks, transform data, handle errors...
}
```

These are **copied once** into your project and **can be edited** if you need custom behavior. Changes persist across regeneration.

**Why This Pattern?**

- ✅ Wrappers stay clean and predictable (easy to regenerate)
- ✅ Runtime logic is customizable (edit without losing changes)
- ✅ No runtime dependency on `nuxt-openapi-hyperfetch` package
- ✅ Full control over implementation details

## 2. Wrapper Pattern

Every generated composable is a **thin wrapper** around Nuxt's built-in composables:

```
      ┌─────────────────────┐
      │   Your Component    │
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │ useFetchGetPetById  │  ← Generated wrapper (thin layer)
      │                     │    Extracts params, adds types
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │   useApiRequest     │  ← Runtime helper (copied to project)
      │                     │    Executes callbacks, transforms
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │  Nuxt's useFetch    │  ← Built-in Nuxt composable
      │                     │    Handles SSR, reactivity
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │     API Server      │
      └─────────────────────┘
```

### What Wrappers Do

1. **Extract path parameters**: `{petId}` → replaced with actual value
2. **Add type safety**: Infer request/response types from OpenAPI
3. **Execute callbacks**: Run `onRequest`, `onSuccess`, `onError`, `onFinish`
4. **Delegate to Nuxt**: Use `useFetch` or `useAsyncData` for actual request

### Example Wrapper

```typescript
// Generated wrapper
export function useFetchGetPetById(
  params: { petId: number },     // ← Type-safe params
  options?: ApiRequestOptions<Pet> // ← Type-safe options
) {
  return useApiRequest<Pet>(      // ← Runtime helper
    '/pets/{petId}',               // ← URL template
    {
      method: 'GET',
      pathParams: params,          // ← Extracted from path
      ...options                   // ← User options (callbacks, etc.)
    }
  )
}
```

The wrapper handles **parameter extraction** and **callback execution**, then delegates to `useApiRequest` which calls Nuxt's `useFetch`.

## 3. Generator Types

Nuxt OpenAPI Hyperfetch supports three different generator types, each suitable for different use cases:

### useFetch Generator

**Best for:** Simple API calls, forms, basic CRUD operations

```typescript
// Generated composable
const { data, pending, error, refresh } = useFetchGetPets()
```

**Characteristics:**
- Uses Nuxt's `useFetch` under the hood
- Executes immediately when component mounts
- SSR-compatible (runs on server during SSR)
- Returns reactive refs: `data`, `pending`, `error`

**When to use:**
- ✅ Simple GET requests
- ✅ Loading data on page mount
- ✅ Forms with POST/PUT/DELETE
- ❌ Complex data transformations (use `useAsyncData` instead)

### useAsyncData Generator

**Best for:** Complex logic, data transformations, conditional requests

```typescript
// Generated composable
const { data, pending, error, refresh } = useAsyncDataGetPets(
  {}, // params (empty for GET /pets)
  {
    // Transform response data
    transform: (pets) => pets.map(pet => ({ 
      ...pet, 
      displayName: pet.name.toUpperCase() 
    })),
    // Control execution
    immediate: false, // Don't fetch on mount
    lazy: true,       // Don't block navigation
    server: true,     // Run on server during SSR
  }
)
```

**Characteristics:**
- Uses Nuxt's `useAsyncData` under the hood
- Unique cache key is auto-generated per endpoint
- More control over request execution (immediate, lazy, server options)
- Built-in support for data transformation via `transform` option
- Better for complex scenarios with multiple operations

**When to use:**
- ✅ Need to transform response data client-side
- ✅ Control when the request executes (immediate vs lazy)
- ✅ Need fine-grained SSR control
- ✅ Want automatic request deduplication

### nuxtServer Generator

**Best for:** Backend-for-Frontend (BFF) pattern, server-side logic

```typescript
// Generated server route: server/api/pets/[pet].get.ts
export default defineEventHandler(async (event): Promise<Pet> => {
  // 1. Extract and validate path parameter
  const petId = getRouterParam(event, 'pet')
  if (!petId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'petId is required'
    })
  }
  
  // 2. Get API configuration from runtime config
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl
  
  try {
    // 3. Call external API from your Nuxt server
    const data = await $fetch<Pet>(`${baseUrl}/pet/${petId}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth if configured
        ...(config.apiSecret ? { 'Authorization': `Bearer ${config.apiSecret}` } : {})
      }
    })
    
    // 4. Return data (or transform with BFF pattern)
    return data
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Request failed'
    })
  }
})
```

**Then use from client:**
```typescript
// Client-side usage (no generated composable needed)
const { data: pet } = useFetch(`/api/pets/${petId}`)
```

::: tip BFF Pattern (Optional)
If you generate with `--bff`, optional transformers are created:

```typescript
// server/bff/transformers/pets.ts (you implement the logic)
export async function transformPet(data: Pet, event: H3Event, auth?: AuthContext) {
  // Add user permissions, filter sensitive fields, etc.
  return {
    ...data,
    canEdit: auth?.permissions.includes('pet:edit'),
    // Remove sensitive fields based on auth
  }
}
```

The generated code will try to use the transformer if it exists.
:::

**Characteristics:**
- Generates Nuxt server routes (not composables)
- Routes follow Nuxt conventions: `[param].method.ts`
- Uses `useRuntimeConfig()` for API base URL and secrets
- Handles parameter validation and error responses
- API keys and secrets stay on server (never exposed to client)

**When to use:**
- ✅ Need authentication context (JWT verification)
- ✅ Want to filter/transform data before sending to client
- ✅ Need to combine data from multiple sources
- ✅ Want to hide external API details from client
- ✅ Keep API keys and secrets secure on server

See [Choosing a Generator](/guide/choosing-a-generator) for detailed comparison.

## 4. Type Safety

All generated composables have **full TypeScript support**:

### Request Parameters

```typescript
// OpenAPI spec defines petId as required integer
useFetchGetPetById({ petId: 123 })  // ✅ Valid

useFetchGetPetById({ petId: "abc" }) // ❌ Type error
useFetchGetPetById({})               // ❌ petId is required
```

### Response Types

```typescript
const { data } = useFetchGetPetById({ petId: 123 })

// TypeScript knows the shape of Pet
data.value?.name      // ✅ string
data.value?.status    // ✅ 'available' | 'pending' | 'sold'
data.value?.unknown   // ❌ Property doesn't exist
```

### Callback Context

```typescript
useFetchGetPetById(
  { petId: 123 },
  {
    onSuccess: (pet) => {
      // 'pet' is typed as Pet
      console.log(pet.name) // ✅ Autocomplete works
    },
    onError: (error) => {
      // 'error' is typed with status, statusText, data
      if (error.status === 404) {
        console.log('Pet not found')
      }
    }
  }
)
```

### Types Are Generated From OpenAPI

All types come directly from your OpenAPI `components/schemas`:

```yaml
# OpenAPI spec
components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
        name:
          type: string
        status:
          type: string
          enum: [available, pending, sold]
```

Becomes:

```typescript
// Generated by OpenAPI Generator in models/Pet.ts
export interface Pet {
  id?: number
  name: string
  status?: 'available' | 'pending' | 'sold'
}
```

::: tip
TypeScript types are generated by **OpenAPI Generator** (not by nuxt-openapi-hyperfetch). Generated composables import these types to provide autocompletion and validation.
:::

## 5. SSR Compatibility

All generated composables work with Nuxt's **server-side rendering**:

```
   Browser              Nuxt Server              API
      │                      │                    │
      │ 1. Request page      │                    │
      ├─────────────────────>│                    │
      │                      │                    │
      │                      │ 2. useFetchGetPets()│
      │                      │    (on server)     │
      │                      ├───────────────────>│
      │                      │                    │
      │                      │   3. Returns data  │
      │                      │<───────────────────┤
      │                      │                    │
      │ 4. Renders HTML +    │                    │
      │    serialized data   │                    │
      │<─────────────────────┤                    │
      │                      │                    │
      │ 5. Hydrates          │                    │
      │   (no extra request) │                    │
      │                      │                    │
```

**What this means:**

- ✅ Requests execute on the server during initial page load
- ✅ Data is embedded in HTML (no loading spinner on first render)
- ✅ No duplicate requests (server data is reused on client)
- ✅ Better SEO (content is in HTML)

**Example:**

```vue
<script setup lang="ts">
// This runs on the server during SSR
const { data: pets } = useFetchGetPets()
</script>

<template>
  <!-- Rendered on server, no loading state needed -->
  <ul>
    <li v-for="pet in pets" :key="pet.id">
      {{ pet.name }}
    </li>
  </ul>
</template>
```

## 6. Callbacks

Every composable supports **four lifecycle callbacks**:

```typescript
useFetchGetPetById(
  { petId: 123 },
  {
    onRequest: ({ url, method, headers, body, query }) => {
      // ⏱️ Before request is sent
      // Use to: add headers, log requests, show loading UI
      // You can modify headers here:
      headers['Authorization'] = `Bearer ${token}`
    },
    onSuccess: (data) => {
      // ✅ When response is 2xx
      // Use to: show success toast, navigate, update state
      console.log('Loaded pet:', data.name)
    },
    onError: (error) => {
      // ❌ When response is 4xx/5xx or network error
      // Use to: show error message, retry, log errors
      console.error('Failed to load pet:', error)
    },
    onFinish: ({ data, error, success }) => {
      // 🏁 Always runs (after success or error)
      // Receives context with data, error, and success flag
      // Use to: hide loading spinner, cleanup
      if (success) {
        console.log('Request completed successfully')
      } else {
        console.log('Request failed')
      }
    }
  }
)
```

### Execution Order

```
┌──────────────────────────────┐
│ Component calls composable   │
└──────────────┬───────────────┘
               │
               ▼
         ┌──────────┐
         │onRequest │  ⏱️  Before request is sent
         └─────┬────┘
               │
               ▼
         ┌──────────┐
         │ Request  │  🌐 HTTP request sent
         └─────┬────┘
               │
          ┌────┴────┐
          │         │
     ✅ Success   ❌ Error
          │         │
          ▼         ▼
    ┌──────────┐ ┌──────────┐
    │onSuccess │ │ onError  │  Response handling
    └─────┬────┘ └─────┬────┘
          │            │
          └─────┬──────┘
                │
                ▼
          ┌──────────┐
          │ onFinish │  🏁 Always runs (success or error)
          └──────────┘
```

### Global vs Local Callbacks

**Global Callbacks** (defined once in a plugin):

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  // Get auth token from cookie or localStorage
  const authToken = useCookie('auth-token')
  
  // Define global callbacks for all API requests
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      // Add auth token to all requests
      if (authToken.value) {
        headers['Authorization'] = `Bearer ${authToken.value}`
      }
    },
    onError: (error) => {
      // Global error handling
      if (error.status === 401) {
        // Redirect to login on unauthorized
        navigateTo('/login')
      }
    }
  })
})
```

Applied to **all requests** automatically.

**Local Callbacks** (passed to individual composable):

```typescript
useFetchGetPets({}, {
  onSuccess: (pets) => {
    console.log(`Loaded ${pets.length} pets`)
  }
})
```

Applied to **this request only**.

See [Callbacks](/composables/features/callbacks/overview) for full details.

## Next Steps

Now that you understand core concepts:

- **Choose a Generator**: Learn about [different generator types](/guide/choosing-a-generator)
- **See Examples**: Browse [practical examples](/examples/composables/basic/simple-get)
- **Add Callbacks**: Learn about [lifecycle callbacks](/composables/features/callbacks/overview)
- **Use Global Callbacks**: Set up [global callbacks](/composables/features/global-callbacks/overview)
