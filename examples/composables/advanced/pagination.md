# Pagination

Implement paginated lists with page controls and infinite scroll.

## Basic Pagination

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const page = ref(1)
const limit = 10

const { data, loading } = useFetchPets(() => ({
  page: page.value,
  limit
}))

const pets = computed(() => data.value?.items || [])
const totalPages = computed(() => Math.ceil((data.value?.total || 0) / limit))

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
  }
}
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    
    <ul>
      <li v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
    
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page === totalPages">Next</button>
    </div>
  </div>
</template>
```

## Page Numbers

```vue
<script setup lang="ts">
const page = ref(1)
const limit = 10

const { data } = useFetchPets({ page, limit })

const totalPages = computed(() => Math.ceil((data.value?.total || 0) / limit))

const pageNumbers = computed(() => {
  const pages = []
  const maxPages = 5
  const half = Math.floor(maxPages / 2)
  
  let start = Math.max(1, page.value - half)
  let end = Math.min(totalPages.value, start + maxPages - 1)
  
  if (end - start < maxPages - 1) {
    start = Math.max(1, end - maxPages + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const goToPage = (p: number) => {
  page.value = p
}
</script>

<template>
  <div class="pagination">
    <button @click="goToPage(1)" :disabled="page === 1">First</button>
    <button @click="goToPage(page - 1)" :disabled="page === 1">Prev</button>
    
    <button 
      v-for="p in pageNumbers" 
      :key="p"
      @click="goToPage(p)"
      :class="{ active: p === page }"
    >
      {{ p }}
    </button>
    
    <button @click="goToPage(page + 1)" :disabled="page === totalPages">Next</button>
    <button @click="goToPage(totalPages)" :disabled="page === totalPages">Last</button>
  </div>
</template>

<style scoped>
.pagination button.active {
  background: #007bff;
  color: white;
}
</style>
```

## Infinite Scroll

```vue
<script setup lang="ts">
const page = ref(1)
const limit = 20
const pets = ref<Pet[]>([])
const hasMore = ref(true)

const { data, loading, execute } = useFetchPets({
  immediate: false,
  watch: false
})

const loadMore = async () => {
  const result = await execute({ page: page.value, limit })
  
  if (result) {
    pets.value.push(...result.items)
    hasMore.value = result.items.length === limit
    page.value++
  }
}

// Initial load
onMounted(() => {
  loadMore()
})

// Scroll listener
const handleScroll = () => {
  const scrolled = window.scrollY + window.innerHeight
  const threshold = document.body.offsetHeight - 200
  
  if (scrolled >= threshold && !loading.value && hasMore.value) {
    loadMore()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    <ul>
      <li v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
    
    <div v-if="loading" class="loading">Loading more...</div>
    <div v-else-if="!hasMore" class="end">No more items</div>
  </div>
</template>
```

## Cursor-Based Pagination

```vue
<script setup lang="ts">
const cursor = ref<string | null>(null)
const pets = ref<Pet[]>([])

const { data, loading, execute } = useFetchPets({
  immediate: false,
  watch: false
})

const loadMore = async () => {
  const result = await execute({ cursor: cursor.value, limit: 20 })
  
  if (result) {
    pets.value.push(...result.items)
    cursor.value = result.nextCursor
  }
}

onMounted(() => {
  loadMore()
})
</script>

<template>
  <div>
    <ul>
      <li v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
    
    <button @click="loadMore" v-if="cursor" :disabled="loading">
      {{ loading ? 'Loading...' : 'Load More' }}
    </button>
  </div>
</template>
```

## URL Sync with Pagination

```vue
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const page = computed({
  get: () => Number(route.query.page) || 1,
  set: (value) => {
    router.push({
      query: { ...route.query, page: value }
    })
  }
})

const { data } = useFetchPets({ page, limit: 10 })
</script>
```

## Next Steps

- [Caching →](/examples/composables/advanced/caching)
- [Authentication Flow →](/examples/composables/advanced/authentication-flow)
- [File Upload →](/examples/composables/advanced/file-upload)
