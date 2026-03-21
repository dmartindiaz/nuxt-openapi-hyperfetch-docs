# Composables Interfaces

TypeScript interfaces for generated client composables.

## UseFetch Composable

Generated composables using `useFetch`.

### Type Signature

```typescript
function useFetchPet(
  id: MaybeRef<number>,
  options?: UseFetchOptions<Pet>
): UseFetchReturn<Pet>
```

### UseFetchOptions

```typescript
interface UseFetchOptions<T> {
  // Nuxt useFetch options
  immediate?: boolean
  watch?: WatchSource[]
  server?: boolean
  lazy?: boolean
  default?: () => T | null
  transform?: (data: T) => T
  pick?: string[]
  
  // Custom callbacks
  onRequest?: (ctx: RequestContext) => void
  onSuccess?: (data: T, ctx: RequestContext) => void
  onError?: (error: Error, ctx: RequestContext) => void
  onFinish?: (ctx: RequestContext) => void
  
  // Skip global callbacks
  skipGlobalRequest?: boolean
  skipGlobalSuccess?: boolean
  skipGlobalError?: boolean
  skipGlobalFinish?: boolean
}
```

### UseFetchReturn

```typescript
interface UseFetchReturn<T> {
  data: Ref<T | null>
  pending: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
  execute: () => Promise<T>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
}
```

## UseAsyncData Composable

Generated composables using `useAsyncData`.

### Type Signature

```typescript
function useAsyncDataPet(
  id: MaybeRef<number>,
  options?: UseAsyncDataOptions<Pet>
): UseAsyncDataReturn<Pet>
```

### UseAsyncDataOptions

```typescript
interface UseAsyncDataOptions<T> {
  // Nuxt useAsyncData options
  immediate?: boolean
  watch?: WatchSource[]
  server?: boolean
  lazy?: boolean
  default?: () => T | null
  transform?: (data: T) => T
  pick?: string[]
  
  // Custom callbacks
  onRequest?: (ctx: RequestContext) => void
  onSuccess?: (data: T, ctx: RequestContext) => void
  onError?: (error: Error, ctx: RequestContext) => void
  onFinish?: (ctx: RequestContext) => void
  
  // Skip global callbacks
  skipGlobalRequest?: boolean
  skipGlobalSuccess?: boolean
  skipGlobalError?: boolean
  skipGlobalFinish?: boolean
}
```

### UseAsyncDataReturn

```typescript
interface UseAsyncDataReturn<T> {
  data: Ref<T | null>
  pending: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
  execute: () => Promise<T>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
}
```

## Request Context

Context object passed to callbacks.

```typescript
interface RequestContext {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, any>
  body?: any
  headers?: Record<string, string>
  timestamp: number
}
```

## Generated Types

Types generated from OpenAPI schemas.

### Pet

```typescript
interface Pet {
  id: number
  name: string
  category?: string
  photoUrls?: string[]
  tags?: Tag[]
  status: 'available' | 'pending' | 'sold'
}
```

### CreatePetRequest

```typescript
interface CreatePetRequest {
  name: string
  category?: string
  photoUrls?: string[]
  tags?: Tag[]
  status?: 'available' | 'pending' | 'sold'
}
```

### UpdatePetRequest

```typescript
interface UpdatePetRequest {
  name?: string
  category?: string
  photoUrls?: string[]
  tags?: Tag[]
  status?: 'available' | 'pending' | 'sold'
}
```

## Examples

### Using Type Inference

```typescript
// Type is inferred from composable
const { data: pet } = useFetchPet(1)
//      ^? Ref<Pet | null>

pet.value?.name
//         ^? string | undefined
```

### Explicit Typing

```typescript
import type { Pet, UseFetchOptions } from '~/composables/pets'

const options: UseFetchOptions<Pet> = {
  onSuccess: (data) => {
    //         ^? Pet
    console.log(data.name)
  }
}

const { data } = useFetchPet(1, options)
```

### Custom Type Guards

```typescript
function isPet(value: unknown): value is Pet {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}
```

## Next Steps

- [Server Interfaces →](/api/interfaces/server)
- [Generated Types →](/api/interfaces/types)
- [Composables Examples →](/examples/composables/basic/simple-get)
