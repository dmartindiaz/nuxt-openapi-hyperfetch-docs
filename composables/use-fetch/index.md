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
/pet/{petId}:
  get:
    operationId: getPetById
    parameters:
      - name: petId
        in: path
        required: true
        schema:
          type: integer
    responses:
      '200':
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Pet'
```

The generator creates:

```typescript
// Generated: composables/useFetchGetPetById.ts
export function useFetchGetPetById(
  params: { petId: number },         // ✅ Type-safe from OpenAPI
  options?: ApiRequestOptions<Pet>   // ✅ Includes CLI callbacks
) {
  return useApiRequest<Pet>(`/pet/${params.petId}`, {
    method: 'GET',
    ...options
  })
}
```

## Basic Usage

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

::: tip Nuxt useFetch Reference
Generated composables wrap Nuxt's `useFetch`, returning `{ data, pending, error, refresh, execute, status }`.

For complete documentation on return values and standard options, see:
**[Nuxt useFetch Documentation →](https://nuxt.com/docs/api/composables/use-fetch)**
:::

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

- [Basic Usage](/composables/use-fetch/basic-usage)
- [Configuration Options](/composables/use-fetch/configuration)

## Next Steps

- [Basic Usage →](/composables/use-fetch/basic-usage)
- [Configuration Options →](/composables/use-fetch/configuration)
- [Switch to useAsyncData →](/composables/use-async-data/vs-use-fetch)
