# Composables Issues

Solutions for client composable problems.

## Import Errors

### Cannot Find Module

```typescript
Cannot find module '~/composables/pets'
```

**Cause:** Generated files not in correct location

**Solution:**

```bash
# 1. Check generation output directory
nxh generate -i swagger.yaml -o ./composables

# 2. Verify file exists
ls composables/pets.ts

# 3. Restart Nuxt dev server
npm run dev
```

### Type Errors on Import

```typescript
Module has no exported member 'useFetchPet'
```

**Cause:** Composable not generated or typo

**Solution:**

```typescript
// ❌ Bad - wrong name
import { useFetchPet } from '~/composables/pets'

// ✅ Good - check actual export name
// Look in generated file for exact name
import { useFetchPetById } from '~/composables/pets'
```

## useFetch Issues

### Data Always Undefined

```vue
<script setup lang="ts">
const { data } = useFetchPet(1)
// data is always undefined
</script>
```

**Cause:** API call failing or wrong baseURL

**Solution:**

```typescript
// 1. Check error state
const { data, error, status } = useFetchPet(1)
console.log('Error:', error.value)
console.log('Status:', status.value)

// 2. Configure baseURL in nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: 'https://api.example.com'  // ✅ Set correct URL
    }
  }
})

// 3. Or provide baseURL in composable
const { data } = useFetchPet(1, {
  baseURL: 'https://api.example.com'
})
```

### Request Not Reactive

```vue
<script setup lang="ts">
const petId = ref(1)
const { data } = useFetchPet(petId.value)  // ❌ Not reactive

petId.value = 2  // Doesn't refetch
</script>
```

**Cause:** Passing `.value` instead of ref

**Solution:**

```vue
<script setup lang="ts">
const petId = ref(1)
const { data } = useFetchPet(petId)  // ✅ Pass ref directly

petId.value = 2  // ✅ Automatically refetches
</script>
```

### SSR Hydration Mismatch

```bash
Hydration children mismatch
```

**Cause:** Client and server render differently

**Solution:**

```vue
<script setup lang="ts">
const { data, pending } = useFetchPet(1)
</script>

<template>
  <!-- ❌ Bad - renders differently on server/client -->
  <div v-if="data">{{ data.name }}</div>

  <!-- ✅ Good - same on both -->
  <div v-if="!pending && data">{{ data.name }}</div>
  <div v-else>Loading...</div>
</template>
```

## useAsyncData Issues

### Infinite Loop

```typescript
const { data } = useAsyncDataPets('pets', async () => {
  const response = await fetch('/api/pets')
  return response.json()
})
// Infinite fetch loop
```

**Cause:** Unstable key or dependencies

**Solution:**

```typescript
// ✅ Use stable key
const { data } = useAsyncDataPets('pets', async () => {
  // Fetch logic
})

// ✅ Or use reactive key
const petId = ref(1)
const { data } = useAsyncDataPet(
  () => `pet-${petId.value}`,  // ✅ Stable but reactive
  async () => {
    // Fetch logic
  }
)
```

### Data Not Updating

```typescript
const { data, refresh } = useAsyncDataPets('pets')

// Later...
refresh()  // Doesn't seem to work
```

**Cause:** Cache not being invalidated

**Solution:**

```typescript
// ✅ Force refresh
const { data, refresh } = useAsyncDataPets('pets')

await refresh({
  _initial: true,
  dedupe: 'cancel'
})

// ✅ Or clear cache first
const nuxtApp = useNuxtApp()
nuxtApp.payload.data['pets'] = undefined
await refresh()
```

## Callbacks Issues

### Callbacks Not Firing

```typescript
const { data } = useFetchPet(1, {
  onSuccess: (data) => {
    console.log('Success')  // ❌ Never logs
  }
})
```

**Cause:** Error in callback or async timing

**Solution:**

```typescript
// ✅ Check for errors in callback
const { data } = useFetchPet(1, {
  onSuccess: (data) => {
    try {
      console.log('Success:', data)
      // Your logic
    } catch (err) {
      console.error('Callback error:', err)
    }
  },
  onError: (error) => {
    console.error('Request failed:', error)
  }
})
```

### Global Callbacks Not Working

```typescript
// plugins/api.ts
export default defineNuxtPlugin({
  setup() {
    return {
      provide: {
        apiCallbacks: {
          onRequest: () => {
            console.log('Request')  // ❌ Never logs
          }
        }
      }
    }
  }
})
```

**Cause:** Wrong plugin structure

**Solution:**

```typescript
// plugins/api.ts
export default defineNuxtPlugin((nuxtApp) => {
  // ✅ Correct structure
  nuxtApp.provide('apiCallbacks', {
    onRequest: (url, options) => {
      console.log('Request to:', url)
    },
    onSuccess: (data) => {
      console.log('Success:', data)
    }
  })
})
```

## Type Issues

### Type Not Assignable

```typescript
interface MyPet {
  name: string
}

const { data } = useFetchPet(1)
const pet: MyPet = data.value  // ❌ Type error
```

**Cause:** Type mismatch or data is nullable

**Solution:**

```typescript
// ✅ Handle nullable
const { data } = useFetchPet(1)
if (data.value) {
  const pet: Pet = data.value  // ✅ Type guard
}

// ✅ Or use optional chaining
const name = data.value?.name

// ✅ Or assert non-null (if you're sure)
const pet = data.value!
```

### Generic Type Constraint

```typescript
function usePet<T>(id: number) {
  const { data } = useFetchPet(id)
  return data as T  // ❌ Type error
}
```

**Cause:** Type constraint needed

**Solution:**

```typescript
// ✅ Add constraint
function usePet<T extends Pet>(id: number) {
  const { data } = useFetchPet(id)
  return data as Ref<T | null>
}

// ✅ Or use generated type
import type { Pet } from '~/composables/pets'

function usePet(id: number): Ref<Pet | null> {
  const { data } = useFetchPet(id)
  return data
}
```

## Parameters Issues

### Path Parameters Not Working

```typescript
const { data } = useFetchPetById()  // ❌ Missing required parameter
```

**Cause:** Required parameter not provided

**Solution:**

```typescript
// ✅ Provide all required parameters
const petId = 1
const { data } = useFetchPetById(petId)
```

### Query Parameters Not Applied

```typescript
const { data } = useFetchPets({
  limit: 10,
  offset: 0
})
// API called without query params
```

**Cause:** Wrong parameter location

**Solution:**

```typescript
// ✅ Check generated signature
// If generated as separate parameters:
const { data } = useFetchPets({ 
  query: {
    limit: 10,
    offset: 0
  }
})

// Or check if it should be in options:
const { data } = useFetchPets(undefined, {
  query: {
    limit: 10,
    offset: 0
  }
})
```

### Body Not Sent

```typescript
const { data } = useAsyncDataCreatePet('create-pet', {
  name: 'Fluffy',
  type: 'cat'
})
// Body not sent to API
```

**Cause:** Body should be in separate parameter

**Solution:**

```typescript
// ✅ Pass body as parameter
const { data } = useAsyncDataCreatePet(
  'create-pet',
  {
    name: 'Fluffy',
    type: 'cat'
  }
)
```

## Performance Issues

### Too Many Requests

```vue
<script setup lang="ts">
// ❌ Fetches on every render
const route = useRoute()
const { data } = useFetchPet(Number(route.params.id))
</script>
```

**Cause:** Composable called in reactive context

**Solution:**

```vue
<script setup lang="ts">
// ✅ Use computed for reactive params
const route = useRoute()
const petId = computed(() => Number(route.params.id))
const { data } = useFetchPet(petId)
</script>
```

### Slow Initial Load

```typescript
// Multiple serial requests
const { data: pets } = await useFetchPets()
const { data: owners } = await useFetchOwners()
const { data: stores } = await useFetchStores()
```

**Cause:** Serial requests instead of parallel

**Solution:**

```typescript
// ✅ Parallel requests
const [
  { data: pets },
  { data: owners },
  { data: stores }
] = await Promise.all([
  useFetchPets(),
  useFetchOwners(),
  useFetchStores()
])
```

## Debugging

### Enable Request Logging

```typescript
// plugins/api-logger.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('apiCallbacks', {
    onRequest: (url, options) => {
      console.log('→', options.method, url)
    },
    onSuccess: (data, url) => {
      console.log('✓', url, data)
    },
    onError: (error, url) => {
      console.error('✗', url, error)
    }
  })
})
```

### Inspect Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Check request/response

### Check Nuxt Payload

```vue
<script setup lang="ts">
const nuxtApp = useNuxtApp()
console.log('Payload:', nuxtApp.payload.data)
</script>
```

## Next Steps

- [Runtime Errors →](/troubleshooting/runtime-errors)
- [Type Errors →](/troubleshooting/type-errors)
- [Composables Guide →](/composables/)
