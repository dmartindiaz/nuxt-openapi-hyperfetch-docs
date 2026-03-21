# useFetch Composables

The `useFetch` generator creates simple, type-safe composables that wrap Nuxt's `useFetch` composable.

## Overview

Generated `useFetch` composables provide:

- ✅ Immediate execution on component mount
- ✅ Simple API (no cache keys required)
- ✅ Full type safety from OpenAPI schemas
- ✅ SSR compatible
- ✅ Lifecycle callbacks support
- ✅ Global callbacks support
- ✅ Reactive parameters

## Generated Structure

For an OpenAPI endpoint like this:

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
```

The generator creates:

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

## Basic Usage

### Simple GET Request

```vue
<script setup lang="ts">
const { data: pet, pending, error, refresh } = useFetchGetPetById({ petId: 123 })
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>{{ pet.name }}</div>
  </div>
</template>
```

### With Query Parameters

```typescript
const { data: pets } = useFetchGetPets({
  status: 'available',
  limit: 10
})
```

### With Request Body (POST/PUT)

```typescript
const { data: newPet, execute } = useFetchCreatePet(
  {
    body: {
      name: 'Fluffy',
      status: 'available'
    }
  },
  {
    immediate: false // Don't execute on mount
  }
)

// Execute manually (e.g., on form submit)
const handleSubmit = async () => {
  await execute()
}
```

## Return Values

All `useFetch` composables return the same interface as Nuxt's `useFetch`:

```typescript
interface UseFetchReturn<T> {
  data: Ref<T | null>          // Response data
  pending: Ref<boolean>         // Loading state
  error: Ref<Error | null>      // Error object
  refresh: () => Promise<void>  // Re-execute request
  execute: () => Promise<void>  // Manual execution (if immediate: false)
  status: Ref<string>           // 'idle' | 'pending' | 'success' | 'error'
}
```

### Example Usage

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = useFetchGetPet({ petId: 123 })

// Refresh data manually
const handleRefresh = () => {
  refresh()
}

// Watch for changes
watch(data, (newPet) => {
  if (newPet) {
    console.log('Pet updated:', newPet.name)
  }
})
</script>
```

## When to Use

### ✅ Perfect For

- **Simple GET requests**: Loading data on page mount
- **Forms**: POST/PUT/DELETE operations
- **Basic CRUD**: Standard create, read, update, delete
- **Immediate execution**: When you want the request to run automatically

### ❌ Not Ideal For

- **Raw responses with headers**: Use `useAsyncData` with raw variant for full response access
- **Multiple API calls in sequence**: Use `useAsyncData` for better control
- **Conditional execution with complex logic**: Use `useAsyncData` for fine-grained control

## Advanced Configuration

See these guides for advanced features:

- [Basic Usage](/composables/use-fetch/basic-usage) - Comprehensive examples
- [Configuration](/composables/use-fetch/configuration) - All available options
- [Callbacks](/composables/features/callbacks/overview) - Lifecycle callbacks
- [Global Callbacks](/composables/features/global-callbacks/overview) - Plugin setup

## Examples

Browse practical examples:

- [Simple GET](/examples/composables/basic/simple-get)
- [Path Parameters](/examples/composables/basic/path-parameters)
- [Query Parameters](/examples/composables/basic/query-parameters)
- [POST Request](/examples/composables/basic/post-request)

## Next Steps

- [Basic Usage →](/composables/use-fetch/basic-usage)
- [Configuration Options →](/composables/use-fetch/configuration)
- [Switch to useAsyncData →](/composables/use-async-data/vs-use-fetch)
