# useAsyncData Composables

Generated composables wrap Nuxt's `useAsyncData`, adding type safety and extra features.

## Overview

::: tip Nuxt useAsyncData Documentation
Generated composables wrap Nuxt's `useAsyncData`. For core features like `data`, `pending`, `error`, `refresh()`, cache keys, and options like `immediate`, `watch`, `server`, `dedupe`, see:

**[Nuxt useAsyncData Official Documentation →](https://nuxt.com/docs/api/composables/use-async-data)**
:::

## What the CLI Adds

- ✅ **Type Safety**: Automatic types from OpenAPI schema
- ✅ **Reactive Params**: Pass a `ref` or `computed` — auto-refresh when it changes (not in native Nuxt)
- ✅ **Lifecycle Callbacks**: onRequest, onSuccess, onError, onFinish
- ✅ **Pick Fields**: Select specific response fields with dot notation
- ✅ **Response Headers** (Raw variant): Access headers & status (not in Nuxt)
- ✅ **Global Callbacks**: Apply hooks to all requests
- ✅ **Global Headers**: Automatic authentication headers
- ✅ **Request Interception**: Modify requests before sending

## Two Variants Generated

For each OpenAPI endpoint, the CLI generates **two composables**:

### Standard Variant

Returns only data (like Nuxt's useAsyncData):

```typescript
const { data: pets, pending, error } = useAsyncDataGetPets()
// data: Ref<Pet[]>
```

### Raw Variant (CLI Addition)

Returns full response with headers, status, and data:

```typescript
const { data: response } = useAsyncDataGetPetsRaw()
// response: Ref<{ data: Pet[], headers: Headers, status: number, statusText: string }>
```

### Cache Key Behavior

Generated `useAsyncData*` composables create a key automatically from operation + resolved URL + params.

- Auto-key example: `useAsyncDataGetPetById-/pet/1` vs `useAsyncDataGetPetById-/pet/2` (independent cache entries)
- Auto-key example with query params: `useAsyncDataFindPetsByStatus-/pet/findByStatus-{"status":"available"}`
- No params example: `useAsyncDataGetInventory-/store/inventory`

You can still pass a custom key if you want manual cache sharing between components (for example, intentional SSR payload sharing):

```typescript
const { data } = useAsyncDataFindPetsByStatus(
  { status: 'available' },
  undefined,
  'mi-clave'
)
```

::: tip Response Headers - Not in Nuxt
**Important**: Nuxt's native `useAsyncData` does NOT return response headers or status codes. The Raw variant is a CLI addition for accessing pagination headers, rate limits, ETags, and more.
:::

## Quick Example

### Standard Variant

```vue
<script setup lang="ts">
// Type-safe composable with lifecycle callbacks
const { data: pets, pending, error } = useAsyncDataGetPets(
  undefined,
  {
    onSuccess: (pets) => {
      console.log(`Loaded ${pets.length} pets`)
    }
  }
)
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <ul v-else>
    <li v-for="pet in pets" :key="pet.id">{{ pet.name }}</li>
  </ul>
</template>
```

### Raw Variant (with Headers)

```vue
<script setup lang="ts">
const { data: response } = useAsyncDataGetPetsRaw()

const totalCount = computed(() => {
  return response.value?.headers.get('X-Total-Count')
})
</script>

<template>
  <div>
    <p>Total: {{ totalCount }}</p>
    <ul>
      <li v-for="pet in response?.data" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
  </div>
</template>
```

## When to Use

### ✅ Use useAsyncData When:

- **Need response headers/status**: Pagination, rate limits, ETags
- **Complex data transformations**: Multi-step processing
- **Multiple API calls**: Combine several requests
- **Fine-grained cache control**: Precise cache key management

### ❌ Use useFetch Instead When:

- **Simple GET requests**: useFetch is simpler
- **Don't need headers**: Standard data fetching
- **Auto cache keys are fine**: Less boilerplate

[See detailed comparison →](/composables/use-async-data/vs-use-fetch)

## Learn More

- [Basic Usage →](/composables/use-async-data/basic-usage)
- [Pagination →](/composables/use-async-data/pagination)
- [Raw Responses →](/composables/use-async-data/raw-responses)
- [useFetch vs useAsyncData →](/composables/use-async-data/vs-use-fetch)
- [Shared Features →](/composables/features/)
