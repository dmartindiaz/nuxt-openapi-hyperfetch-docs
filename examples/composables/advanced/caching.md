# Caching

Caching strategies and cache invalidation patterns.

## Basic SWR (Stale-While-Revalidate)

```vue
<script setup lang="ts">
import { useFetchPet } from '~/composables/pets'

const route = useRoute()
const petId = computed(() => Number(route.params.id))

// Data is cached and reused across navigations
const { data: pet, refresh } = useFetchPet(petId)
</script>

<template>
  <div>
    <h1>{{ pet?.name }}</h1>
    <button @click="refresh">Refresh</button>
  </div>
</template>
```

## Cache Key Strategy

```typescript
// composables/useFetchPets.ts
export function useFetchPets(params: MaybeRef<PetListParams>) {
  // Generate unique cache key from params
  const cacheKey = computed(() => {
    const p = unref(params)
    return `pets:${p.status}:${p.category}:${p.page}`
  })
  
  return useAsyncData(
    cacheKey.value,
    () => $fetch('/api/pets', { params: unref(params) })
  )
}
```

## Manual Cache Invalidation

```vue
<script setup lang="ts">
import { useFetchPets, useUpdatePet } from '~/composables/pets'

const { data: pets, refresh: refreshPets } = useFetchPets()

const { execute: updatePet } = useUpdatePet({
  onSuccess: async () => {
    // Invalidate and refetch pets list
    await refreshPets()
  }
})
</script>
```

## Global Cache Invalidation

```typescript
// composables/useCache.ts
export function useCache() {
  const invalidate = (pattern: string) => {
    const nuxtApp = useNuxtApp()
    const keys = Object.keys(nuxtApp.payload.data)
    
    keys.forEach(key => {
      if (key.includes(pattern)) {
        delete nuxtApp.payload.data[key]
      }
    })
  }
  
  return { invalidate }
}
```

```vue
<script setup lang="ts">
const { invalidate } = useCache()

const { execute: deletePet } = useDeletePet({
  onSuccess: () => {
    // Invalidate all pets-related cache
    invalidate('pets:')
  }
})
</script>
```

## Optimistic Updates

```vue
<script setup lang="ts">
const { data: pets } = useFetchPets()

const { execute: updatePet } = useUpdatePet({
  immediate: false,
  onRequest: (ctx) => {
    // Optimistic update
    const pet = pets.value?.find(p => p.id === ctx.id)
    if (pet) {
      Object.assign(pet, ctx.body)
    }
  },
  onError: (error, ctx) => {
    // Revert on error
    refreshNuxtData('pets')
  }
})
</script>
```

## Cache with Expiration

```typescript
// composables/useCachedFetch.ts
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60000 // 1 minute
) {
  const cache = useState<{ data: T; timestamp: number } | null>(key, () => null)
  
  const isExpired = computed(() => {
    if (!cache.value) return true
    return Date.now() - cache.value.timestamp > ttl
  })
  
  const fetch = async () => {
    if (!isExpired.value && cache.value) {
      return cache.value.data
    }
    
    const data = await fetcher()
    cache.value = { data, timestamp: Date.now() }
    return data
  }
  
  const data = ref<T | null>(cache.value?.data || null)
  const loading = ref(false)
  
  onMounted(async () => {
    loading.value = true
    data.value = await fetch()
    loading.value = false
  })
  
  return { data, loading, refresh: fetch }
}
```

```vue
<script setup lang="ts">
const { data: pet } = useCachedFetch(
  'pet:1',
  () => $fetch('/api/pets/1'),
  60000 // Cache for 1 minute
)
</script>
```

## LocalStorage Cache

```typescript
// composables/useLocalStorageCache.ts
export function useLocalStorageCache<T>(key: string) {
  const get = (): T | null => {
    if (process.server) return null
    
    const item = localStorage.getItem(key)
    if (!item) return null
    
    try {
      const { data, timestamp } = JSON.parse(item)
      return data
    } catch {
      return null
    }
  }
  
  const set = (data: T, ttl: number = Infinity) => {
    if (process.server) return
    
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
      ttl
    }))
  }
  
  const clear = () => {
    if (process.server) return
    localStorage.removeItem(key)
  }
  
  return { get, set, clear }
}
```

```vue
<script setup lang="ts">
const cache = useLocalStorageCache<Pet[]>('pets')

const { data: pets } = useFetchPets({
  onSuccess: (data) => {
    // Cache in localStorage
    cache.set(data, 5 * 60 * 1000) // 5 minutes
  }
})

// Show cached data while loading
const displayPets = computed(() => pets.value || cache.get() || [])
</script>
```

## Cache Prefetching

```vue
<script setup lang="ts">
// pages/pets/index.vue
const { data: pets } = useFetchPets()

// Prefetch pet details on hover
const prefetchPet = (id: number) => {
  const nuxtApp = useNuxtApp()
  nuxtApp.runWithContext(() => {
    useFetchPet(id)
  })
}
</script>

<template>
  <ul>
    <li v-for="pet in pets" :key="pet.id">
      <NuxtLink 
        :to="`/pets/${pet.id}`"
        @mouseenter="prefetchPet(pet.id)"
      >
        {{ pet.name }}
      </NuxtLink>
    </li>
  </ul>
</template>
```

## Next Steps

- [Authentication Flow →](/examples/composables/advanced/authentication-flow)
- [File Upload →](/examples/composables/advanced/file-upload)
- [Pagination →](/examples/composables/advanced/pagination)
