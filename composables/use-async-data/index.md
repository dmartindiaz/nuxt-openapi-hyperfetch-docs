# useAsyncData Composables

The `useAsyncData` generator creates composables that wrap Nuxt's `useAsyncData` composable, providing more control and flexibility than `useFetch`.

## Overview

Generated `useAsyncData` composables provide:

- ✅ Full control over request execution
- ✅ Access to raw responses (headers, status)
- ✅ Data transformation support
- ✅ Manual cache key management
- ✅ All benefits of `useFetch` (callbacks, type safety, SSR)
- ⚠️ Requires explicit cache keys
- ⚠️ Slightly more complex API

## Generated Structure

For an OpenAPI endpoint like this:

```yaml
/pets:
  get:
    operationId: getPets
    responses:
      200:
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/Pet'
```

The generator creates **two composables**:

### Standard Variant

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

### Raw Variant

```typescript
export function useAsyncDataGetPetsRaw(
  key: string,
  params?: {}
) {
  return useApiAsyncDataRaw<Pet[]>(key, '/pets', {
    method: 'GET'
  })
}
```

## Basic Usage

### Simple Request

```vue
<script setup lang="ts">
// Requires a unique cache key
const { data: pets, pending, error } = useAsyncDataGetPets('pets-list')
</script>

<template>
  <ul>
    <li v-for="pet in pets" :key="pet.id">{{ pet.name }}</li>
  </ul>
</template>
```

### With Parameters

```typescript
const { data: pet } = useAsyncDataGetPetById(
  'pet-123',
  { petId: 123 }
)
```

### With Callbacks

```typescript
const { data: pets } = useAsyncDataGetPets(
  'pets',
  {},
  {
    onSuccess: (pets) => {
      console.log(`Loaded ${pets.length} pets`)
    },
    onError: (error) => {
      console.error('Failed to load pets:', error)
    }
  }
)
```

## Raw Response Access

Use the `Raw` variant to access full response:

```vue
<script setup lang="ts">
const { data: response } = useAsyncDataGetPetsRaw('pets-raw')

watch(response, (res) => {
  if (res) {
    console.log('Status:', res.status)          // 200
    console.log('Headers:', res.headers)        // Headers object
    console.log('Data:', res._data)             // Pet[]
  }
})
</script>

<template>
  <div>
    <p>Status: {{ response?.status }}</p>
    <ul>
      <li v-for="pet in response?._data" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
  </div>
</template>
```

## Data Transformation

Transform response data before it's returned:

```typescript
const { data: petNames } = useAsyncDataGetPets(
  'pet-names',
  {},
  {
    transform: (pets) => pets.map(pet => pet.name)
  }
)

// data is now string[] instead of Pet[]
```

## Cache Keys

Cache keys are **required** and should be:

### Unique Per Request

```typescript
// ❌ Bad - same key for different parameters
const { data: pet1 } = useAsyncDataGetPetById('pet', { petId: 1 })
const { data: pet2 } = useAsyncDataGetPetById('pet', { petId: 2 })

// ✅ Good - unique keys
const { data: pet1 } = useAsyncDataGetPetById('pet-1', { petId: 1 })
const { data: pet2 } = useAsyncDataGetPetById('pet-2', { petId: 2 })
```

### Dynamic Based on Parameters

```typescript
const petId = ref(123)

const { data: pet } = useAsyncDataGetPetById(
  `pet-${petId.value}`,
  { petId: petId.value }
)
```

### Consistent Across Components

```typescript
// Component A
const { data: pets } = useAsyncDataGetPets('pets-list')

// Component B - shares cache with Component A
const { data: pets } = useAsyncDataGetPets('pets-list')
```

## When to Use

### ✅ Perfect For

- **Data transformations**: Need to process response data
- **Raw responses**: Need access to headers, status code
- **Multiple API calls**: Combine multiple calls in one composable
- **Fine-grained cache control**: Manage cache keys precisely
- **Complex logic**: Need more control than `useFetch` provides

### ❌ Not Ideal For

- **Simple GET requests**: `useFetch` is simpler
- **Beginners**: `useFetch` has easier API
- **When cache keys are annoying**: `useFetch` handles them automatically

## Comparison with useFetch

| Feature | useFetch | useAsyncData |
|---------|----------|--------------|
| Cache Key | Auto | Manual |
| Raw Response | ❌ | ✅ |
| Data Transform | ✅ Full | ✅ Full |
| API Complexity | Simple | Medium |
| Best For | Basic calls | Complex logic |

## Advanced Features

See these guides for advanced usage:

- [Basic Usage](/composables/use-async-data/basic-usage) - Comprehensive examples
- [Raw Responses](/composables/use-async-data/raw-responses) - Working with raw responses
- [vs useFetch](/composables/use-async-data/vs-use-fetch) - When to use each

## Examples

Browse practical examples:

- [Simple GET](/examples/composables/basic/simple-get)
- [Data Transformation](/examples/composables/advanced/pagination)
- [Multiple APIs](/examples/composables/advanced/authentication-flow)

## Next Steps

- [Basic Usage →](/composables/use-async-data/basic-usage)
- [Raw Responses →](/composables/use-async-data/raw-responses)
- [useFetch vs useAsyncData →](/composables/use-async-data/vs-use-fetch)
