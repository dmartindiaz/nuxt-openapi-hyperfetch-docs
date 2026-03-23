# What is Nuxt OpenAPI Hyperfetch?

Nuxt OpenAPI Hyperfetch is a CLI tool that automatically generates **type-safe Nuxt 3 composables** from OpenAPI/Swagger specifications. It eliminates the need to write repetitive API integration code by creating production-ready composables that work seamlessly with Nuxt's SSR architecture.

## The Problem

When building Nuxt applications that consume REST APIs, developers typically:

1. **Manually write composables** for each endpoint
2. **Copy-paste types** from API documentation
3. **Repeat the same patterns** for error handling, loading states, and callbacks
4. **Struggle with SSR compatibility** when using external HTTP clients

This is tedious, error-prone, and doesn't scale well as APIs grow.

## The Solution

Nuxt OpenAPI Hyperfetch solves this by:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     📄 OpenAPI Specification                        │
│                      Describe tu API REST                           │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  ⚡ Nuxt OpenAPI Hyperfetch CLI                     │
└──┬────────────────┬─────────────────┬─────────────────┬────────────┘
   │                │                 │                 │
   │                │                 │                 │
   ▼                ▼                 ▼                 ▼
┌──────────┐  ┌──────────┐  ┌───────────────┐  ┌──────────────────┐
│ useFetch │  │useAsync  │  │ nuxt-server   │  │  TypeScript      │
│Composable│  │Composable│  │ Server Routes │  │     Types        │
│          │  │          │  │   /api/*      │  │  Pet, User...    │
│  Forms   │  │ Complex  │  │   (BFF)       │  │                  │
│and simple│  │  logic   │  │  (optional)   │  │  Auto-generated  │
│  calls   │  │          │  │               │  │                  │
└─────┬────┘  └─────┬────┘  └───────┬───────┘  └────────┬─────────┘
      │             │               │                    │
      │             │               │                    │ (tipado)
      └─────────────┴───────────────┴────────────────────┘
                                    │
                                    ▼
              ┌─────────────────────────────────────────┐
              │      ✨ Your Nuxt Application          │
              ├─────────────────────────────────────────┤
              │  ✅ Type-safe                          │
              │  ✅ SSR Ready                          │
              │  ✅ Callbacks (onSuccess, onError...)  │
              └─────────────────────────────────────────┘
```

### Key Features

#### 🎯 **Type-Safety**

All generated composables have full TypeScript support. Request parameters, response types, and error types are automatically inferred from your OpenAPI schema:

```typescript
// ✅ Type-safe parameters
const { data } = useFetchGetPetById({ petId: 123 })
//                                     ^ TypeScript knows this requires { petId: number }

// ✅ Type-safe response
data.value?.name
//          ^ TypeScript knows Pet has a 'name' property

// ❌ TypeScript catches errors
useFetchGetPetById({ id: 123 })
//                   ^ Error: Property 'petId' is required
```

#### ⚡ **SSR Compatible**

Generated composables use Nuxt's built-in `useFetch` and `useAsyncData`, which means:

- ✅ Requests execute on the server during SSR
- ✅ Data is serialized and hydrated on the client
- ✅ No "flashing" content or extra client-side requests
- ✅ Full support for Nuxt's data fetching lifecycle

#### 🔄 **Lifecycle Callbacks**

Every composable supports four lifecycle callbacks:

```typescript
useFetchGetPetById(
  { petId: 123 },
  {
    onRequest: ({ url, params }) => {
      // Before request is sent
      console.log('Fetching from:', url)
    },
    onSuccess: (data) => {
      // When request succeeds (200-299)
      showToast(`Loaded ${data.name}`, 'success')
    },
    onError: (error) => {
      // When request fails (400+, network error)
      showToast('Failed to load pet', 'error')
    },
    onFinish: ({ success }) => {
      // Always runs (success or failure)
      hideLoadingSpinner()
      console.log('Request finished:', success ? 'success' : 'failed')
    }
  }
)
```

#### 🔌 **Global Callbacks**

Define callbacks once in a plugin, apply them everywhere:

```typescript
// plugins/api-global-callbacks.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      // Add auth token to ALL requests
      headers['Authorization'] = `Bearer ${getToken()}`
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

#### 🎛️ **Request Interception**

Modify requests before they're sent:

```typescript
useFetchGetUsers(
  {},
  {
    onRequest: ({ url, body, headers, query }) => {
      // Add custom header
      headers['X-Custom-Header'] = 'value'
      
      // Modify query params
      query.limit = 100
      
      // Transform body
      body.timestamp = Date.now()
    }
  }
)
```

#### 🚀 **Multiple Generator Types**

Choose the pattern that fits your needs:

| Generator | Use Case | SSR | Type Safety |
|-----------|----------|-----|-------------|
| `useFetch` | Simple API calls, forms | ✅ | ✅ |
| `useAsyncData` | Complex logic, transformations | ✅ | ✅ |
| `nuxtServer` | BFF pattern, auth context, transformers | ✅ | ✅ |

## How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│  📄 PASO 1: Parse OpenAPI                                       │
│  Lee swagger.yaml o openapi.json                                │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  🔍 PASO 2: Extract Endpoints                                    │
│  Identifica todas las operaciones                                │
│  GET, POST, PUT, DELETE, PATCH                                   │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  📦 PASO 3: Generate Types                                       │
│  Create TypeScript interfaces                                    │
│  from schemas and components                                     │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  ⚙️  PASO 4: Create Composables                                  │
│  Generate wrapper functions                                      │
│  useFetch* or useAsync* for each endpoint                        │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  📋 PASO 5: Copy Runtime Files                                   │
│  Include helpers for callbacks                                   │
│  and global configuration                                        │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
╔══════════════════════════════════════════════════════════════════╗
║  ✅ STEP 6: Ready to Use!                                        ║
║  Import and use in your Nuxt app                                 ║
║  with full type safety                                           ║
╚══════════════════════════════════════════════════════════════════╝
```

## What Gets Generated?

For an endpoint like this in your OpenAPI spec:

```yaml
/pets/{petId}:
  get:
    operationId: getPetById
    parameters:
      - name: petId
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Pet'
```

Nuxt OpenAPI Hyperfetch creates:

```typescript
// Generated composable
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

// Generated type
interface Pet {
  id: number
  name: string
  status: 'available' | 'pending' | 'sold'
}
```

## When to Use Nuxt OpenAPI Hyperfetch

### ✅ Perfect For

- Nuxt 3 applications consuming REST APIs
- Teams that want type-safety without manual type definitions
- Projects with OpenAPI/Swagger specifications
- Applications that need SSR-compatible API integration
- Teams that want standardized API patterns

### ❌ Not Ideal For

- GraphQL APIs (use @nuxtjs/apollo instead)
- Non-Nuxt Vue applications (no SSR support)
- Projects without OpenAPI specs (can't generate types)
- Simple apps with 1-2 endpoints (manual composables might be simpler)

## Next Steps

- [**Getting Started**](/guide/getting-started) - Install and generate your first composables
- [**Core Concepts**](/guide/core-concepts) - Understand the key concepts
- [**Examples**](/examples/composables/basic/simple-get) - See practical code examples
