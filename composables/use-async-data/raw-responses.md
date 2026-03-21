# Raw Responses

Access full HTTP response details including status codes, headers, and raw data using the `Raw` variant of generated composables.

## Overview

Every `useAsyncData` composable has a **Raw variant** that returns the complete response object:

```typescript
// Standard variant - returns data only
const { data: pets } = useAsyncDataGetPets('pets')

// Raw variant - returns full response
const { data: response } = useAsyncDataGetPetsRaw('pets-raw')
```

## Generated Raw Composables

For each operation, two composables are generated:

```typescript
// Standard
export function useAsyncDataGetPets(key: string, params?: {}) {
  return useApiAsyncData<Pet[]>(key, '/pets', { method: 'GET' })
}

// Raw (adds "Raw" suffix)
export function useAsyncDataGetPetsRaw(key: string, params?: {}) {
  return useApiAsyncDataRaw<Pet[]>(key, '/pets', { method: 'GET' })
}
```

## Response Structure

Raw responses have this structure:

```typescript
interface RawResponse<T> {
  status: number           // HTTP status code (200, 404, etc.)
  statusText: string       // Status text ("OK", "Not Found", etc.)
  headers: Headers         // Response headers
  _data: T                 // Actual response data
}
```

## Basic Usage

### Accessing Status Code

```vue
<script setup lang="ts">
const { data: response } = useAsyncDataGetPetsRaw('pets-raw')

watch(response, (res) => {
  if (res) {
    console.log('Status:', res.status) // 200, 404, 500, etc.
    
    if (res.status === 200) {
      console.log('Success!')
    } else if (res.status === 404) {
      console.log('Not found')
    }
  }
})
</script>

<template>
  <div>
    <p>HTTP Status: {{ response?.status }}</p>
    <ul>
      <li v-for="pet in response?._data" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
  </div>
</template>
```

### Accessing Headers

```vue
<script setup lang="ts">
const { data: response } = useAsyncDataGetPetsRaw('pets-raw')

const rateLimit = computed(() => {
  if (!response.value) return null
  
  return {
    limit: response.value.headers.get('X-RateLimit-Limit'),
    remaining: response.value.headers.get('X-RateLimit-Remaining'),
    reset: response.value.headers.get('X-RateLimit-Reset')
  }
})
</script>

<template>
  <div>
    <p v-if="rateLimit">
      Rate Limit: {{ rateLimit.remaining }} / {{ rateLimit.limit }}
    </p>
    <ul>
      <li v-for="pet in response?._data" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
  </div>
</template>
```

## Common Use Cases

### Pagination Headers

Many APIs return pagination info in headers:

```vue
<script setup lang="ts">
const page = ref(1)

const { data: response, refresh } = useAsyncDataGetPetsRaw(
  `pets-page-${page.value}`
)

const pagination = computed(() => {
  if (!response.value) return null
  
  return {
    total: Number(response.value.headers.get('X-Total-Count')),
    page: Number(response.value.headers.get('X-Page')),
    perPage: Number(response.value.headers.get('X-Per-Page')),
    totalPages: Number(response.value.headers.get('X-Total-Pages'))
  }
})

const nextPage = () => {
  page.value++
  refresh()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    refresh()
  }
}
</script>

<template>
  <div>
    <ul>
      <li v-for="pet in response?._data" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
    
    <div v-if="pagination" class="pagination">
      <button @click="prevPage" :disabled="page === 1">Previous</button>
      <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
      <button @click="nextPage" :disabled="page >= pagination.totalPages">
        Next
      </button>
    </div>
  </div>
</template>
```

### ETags for Caching

```vue
<script setup lang="ts">
const etag = ref<string | null>(null)

const { data: response, refresh } = useAsyncDataGetPetsRaw(
  'pets-etag',
  {},
  {
    onRequest: ({ headers }) => {
      // Send If-None-Match if we have an ETag
      if (etag.value) {
        headers['If-None-Match'] = etag.value
      }
    }
  }
)

watch(response, (res) => {
  if (res) {
    // Store new ETag
    const newEtag = res.headers.get('ETag')
    if (newEtag) {
      etag.value = newEtag
    }
    
    // Check if cached (304 status)
    if (res.status === 304) {
      console.log('Using cached data')
    }
  }
})
</script>
```

### Rate Limiting

```vue
<script setup lang="ts">
const { data: response } = useAsyncDataGetPetsRaw('pets')

const rateLimitStatus = computed(() => {
  if (!response.value) return null
  
  const remaining = Number(response.value.headers.get('X-RateLimit-Remaining'))
  const limit = Number(response.value.headers.get('X-RateLimit-Limit'))
  const resetTime = Number(response.value.headers.get('X-RateLimit-Reset'))
  
  return {
    remaining,
    limit,
    percentage: (remaining / limit) * 100,
    resetsAt: new Date(resetTime * 1000)
  }
})

// Show warning when approaching limit
watch(rateLimitStatus, (status) => {
  if (status && status.percentage < 10) {
    showToast(`Rate limit warning: ${status.remaining} requests remaining`, 'warning')
  }
})
</script>

<template>
  <div>
    <div v-if="rateLimitStatus" class="rate-limit-indicator">
      <div 
        class="bar" 
        :style="{ width: rateLimitStatus.percentage + '%' }"
      />
      <span>{{ rateLimitStatus.remaining }} / {{ rateLimitStatus.limit }}</span>
    </div>
    
    <ul>
      <li v-for="pet in response?._data" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
  </div>
</template>
```

### Custom Status Handling

```vue
<script setup lang="ts">
const { data: response } = useAsyncDataGetPetByIdRaw(
  'pet-123',
  { petId: 123 }
)

const message = computed(() => {
  if (!response.value) return 'Loading...'
  
  switch (response.value.status) {
    case 200:
      return `Pet found: ${response.value._data.name}`
    case 404:
      return 'Pet not found'
    case 403:
      return 'You do not have permission to view this pet'
    case 500:
      return 'Server error, please try again'
    default:
      return `Unexpected status: ${response.value.status}`
  }
})
</script>

<template>
  <div>
    <p>{{ message }}</p>
    <div v-if="response?.status === 200">
      <h1>{{ response._data.name }}</h1>
      <p>Status: {{ response._data.status }}</p>
    </div>
  </div>
</template>
```

### Content Type Detection

```vue
<script setup lang="ts">
const { data: response } = useAsyncDataGetPetImageRaw('pet-image')

const contentType = computed(() => {
  return response.value?.headers.get('Content-Type')
})

const isImage = computed(() => {
  return contentType.value?.startsWith('image/')
})

const isJson = computed(() => {
  return contentType.value?.includes('application/json')
})
</script>

<template>
  <div>
    <p>Content-Type: {{ contentType }}</p>
    <img v-if="isImage" :src="response?._data" />
    <pre v-else-if="isJson">{{ response?._data }}</pre>
  </div>
</template>
```

## Combining with Standard Variant

You can use both variants when needed:

```vue
<script setup lang="ts">
// For display (simple)
const { data: pets } = useAsyncDataGetPets('pets')

// For metadata (detailed)
const { data: response } = useAsyncDataGetPetsRaw('pets-raw')

const totalCount = computed(() => {
  return response.value?.headers.get('X-Total-Count')
})
</script>

<template>
  <div>
    <p>Total: {{ totalCount }}</p>
    <ul>
      <li v-for="pet in pets" :key="pet.id">{{ pet.name }}</li>
    </ul>
  </div>
</template>
```

## TypeScript Support

Raw responses are fully typed:

```typescript
const { data: response } = useAsyncDataGetPetsRaw('pets')

// TypeScript knows the structure
response.value?.status        // number
response.value?.statusText    // string
response.value?.headers       // Headers
response.value?._data         // Pet[] (typed from OpenAPI)
```

## When to Use Raw Responses

### ✅ Use Raw When:

- Need to read response headers
- Need HTTP status codes
- Working with pagination headers
- Implementing ETags/caching
- Need rate limit information
- Custom status code handling

### ❌ Use Standard When:

- Only need response data
- Don't care about headers/status
- Simpler code is preferred
- Type transformations are needed

## Next Steps

- [Basic Usage](/composables/use-async-data/basic-usage)
- [vs useFetch](/composables/use-async-data/vs-use-fetch)
- [Pagination Example](/examples/composables/advanced/pagination)
