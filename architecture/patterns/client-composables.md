# Client Composable Patterns

Design patterns for generated client-side composables.

## Composable Types

### useFetch Composables

For data that needs SSR support:

```typescript
export function useFetchPet(
  id: MaybeRef<number>,
  options?: UseFetchOptions<Pet>
) {
  return useFetch<Pet>(
    () => `/pets/${unref(id)}`,
    options
  )
}
```

**When to use:**
- Data needed for initial page render
- SEO-critical content
- Data that changes frequently

### useAsyncData Composables

For more control over data fetching:

```typescript
export function useAsyncDataPet(
  id: MaybeRef<number>,
  options?: UseAsyncDataOptions<Pet>
) {
  return useAsyncData(
    `pet-${unref(id)}`,
    () => $fetch<Pet>(`/pets/${unref(id)}`),
    options
  )
}
```

**When to use:**
- Custom cache keys needed
- Manual data transformation
- More control over fetching logic

## Parameter Patterns

### Path Parameters

```typescript
// Single parameter
function useFetchPet(id: MaybeRef<number>)

// Multiple parameters
function useFetchPetPhoto(
  petId: MaybeRef<number>,
  photoId: MaybeRef<number>
)
```

### Query Parameters

```typescript
// Object parameter
function useFetchPets(
  params: MaybeRef<{
    status?: string
    category?: string
    limit?: number
  }>
)
```

### Request Body

```typescript
// POST/PUT/DELETE body
function useCreatePet(
  options?: UseFetchOptions<Pet>
) {
  return useFetch<Pet>('/pets', {
    method: 'POST',
    immediate: false,
    ...options
  })
}

// Usage
const { execute } = useCreatePet()
await execute({ body: { name: 'Fluffy' } })
```

## Reactivity Patterns

### Reactive Parameters

```typescript
const id = ref(1)
const { data: pet } = useFetchPet(id)

// Changes automatically when id changes
id.value = 2
```

### Reactive Query Params

```typescript
const filters = ref({ status: 'available' })
const { data: pets } = useFetchPets(filters)

// Refetch when filters change
filters.value.status = 'pending'
```

### Computed Parameters

```typescript
const route = useRoute()
const petId = computed(() => Number(route.params.id))

const { data: pet } = useFetchPet(petId)
```

## Callback Patterns

### Success Navigation

```typescript
const { execute } = useCreatePet({
  onSuccess: () => {
    navigateTo('/pets')
  }
})
```

### Error Handling

```typescript
const { execute } = useUpdatePet(1, {
  onError: (error) => {
    toast.error(error.message)
  }
})
```

### Loading States

```typescript
const globalLoading = useState('loading', () => false)

const { execute } = useCreatePet({
  onRequest: () => {
    globalLoading.value = true
  },
  onFinish: () => {
    globalLoading.value = false
  }
})
```

## Cache Patterns

### Default Caching

```typescript
// Automatically cached by key
const { data: pet } = useFetchPet(1)
```

### Manual Refresh

```typescript
const { data: pet, refresh } = useFetchPet(1)

// Manually refresh
await refresh()
```

### Cache Invalidation

```typescript
const { refresh: refreshPets } = useFetchPets()

const { execute: createPet } = useCreatePet({
  onSuccess: () => {
    refreshPets() // Invalidate list cache
  }
})
```

## Lazy Loading

### Immediate vs Lazy

```typescript
// Immediate (default) - fetches on mount
const { data: pet } = useFetchPet(1)

// Lazy - waits for execute()
const { data: pet, execute } = useFetchPet(1, { 
  immediate: false 
})
await execute()
```

### Conditional Fetching

```typescript
const userId = computed(() => route.params.userId)

const { data: user } = useFetchUser(userId, {
  // Only fetch when userId exists
  immediate: computed(() => !!userId.value)
})
```

## Transform Patterns

### Response Transformation

```typescript
const { data: pet } = useFetchPet(1, {
  transform: (pet) => ({
    ...pet,
    displayName: `${pet.name} (${pet.category})`
  })
})
```

### Pick Specific Fields

```typescript
const { data: pet } = useFetchPet(1, {
  pick: ['id', 'name', 'category']
})
```

## Next Steps

- [Server Composables →](/architecture/patterns/server-composables)
- [Error Handling →](/architecture/patterns/error-handling)
- [Examples →](/examples/composables/basic/simple-get)
