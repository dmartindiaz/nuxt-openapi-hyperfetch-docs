# Design Patterns

Common patterns used throughout nuxt-openapi-hyperfetch generated code.

## Code Generation Patterns

### Template-Based Generation

Generate consistent code from templates:

```typescript
// Pattern: Operation → Composable
GET /pets/{id} → function useFetchPet(id: number)
POST /pets → function useCreatePet(body: CreatePetRequest)
```

### Naming Conventions

Consistent naming across all generated code:

- **Client Composables**: `useFetch*`, `useAsyncData*`, `use*`
- **Server Composables**: `getServer*`, `createServer*`, `updateServer*`, `deleteServer*`
- **Types**: PascalCase from schema names
- **Files**: kebab-case matching operation tags

## Type Safety Patterns

### Type Inference

Let TypeScript infer types from the composable:

```typescript
const { data: pet } = useFetchPet(1)
//      ^? Ref<Pet | null>

pet.value?.name
//         ^? string | undefined
```

### Generic Constraints

Type-safe options:

```typescript
interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void
  //                 ^? inferred from composable
}
```

## Callback Patterns

### Per-Request Callbacks

Execute logic for specific requests:

```typescript
const { data } = useFetchPet(1, {
  onSuccess: (pet) => {
    console.log('Loaded:', pet.name)
  }
})
```

### Global Callbacks

Execute logic for all requests:

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => ({
  provide: {
    apiCallbacks: {
      onError: (error) => toast.error(error.message)
    }
  }
}))
```

### Skip Patterns

Bypass global callbacks when needed:

```typescript
const { data } = useFetchPet(1, {
  skipGlobalError: true // Handle error locally
})
```

## Reactivity Patterns

### MaybeRef Parameters

Accept both refs and raw values:

```typescript
const id = ref(1)
const { data: pet1 } = useFetchPet(id) // Reactive
const { data: pet2 } = useFetchPet(1)  // Static
```

### Computed Query Params

Reactive query parameters:

```typescript
const status = ref('available')
const { data: pets } = useFetchPets(() => ({
  status: status.value
}))
```

## Error Handling Patterns

### Error State

Composables provide error state:

```typescript
const { data, error } = useFetchPet(1)

if (error.value) {
  // Handle error
}
```

### Error Recovery

Retry and fallback strategies:

```typescript
const { execute } = useFetchPet(1, {
  onError: async (error) => {
    // Retry once
    await execute()
  }
})
```

## Server Patterns

### BFF (Backend-for-Frontend)

Server routes that proxy and transform:

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const pet = await getServerPet(event, Number(id))
  
  // Add permissions
  return {
    ...pet,
    canEdit: event.context.user?.id === pet.ownerId
  }
})
```

### Authentication Injection

Automatically forward auth:

```typescript
export async function getServerPet(event: H3Event, id: number) {
  return await $fetch(`/pets/${id}`, {
    headers: getProxyHeaders(event) // Include auth
  })
}
```

## Patterns Overview

- [Client Composables →](/architecture/patterns/client-composables)
- [Server Composables →](/architecture/patterns/server-composables)
- [BFF Pattern →](/architecture/patterns/bff-pattern)
- [Error Handling →](/architecture/patterns/error-handling)

## Next Steps

- [Architecture Decisions →](/architecture/decisions/)
- [Examples →](/examples/)
