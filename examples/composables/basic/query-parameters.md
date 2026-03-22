# Query Parameters

Filtering, searching, and paginating data using query parameters.

## Basic Query Parameters

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

// Fetch with query params
const { data: pets, loading } = await useFetchPets({
  query: {
    status: 'available',
    limit: 10
  }
})
</script>

<template>
  <div>
    <div v-for="pet in pets" :key="pet.id">
      {{ pet.name }} - {{ pet.status }}
    </div>
  </div>
</template>
```

## Search with Query String

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const searchQuery = ref('')

// Reactive query params
const { data: pets, loading } = useFetchPets({
  query: computed(() => ({
    search: searchQuery.value,
    limit: 20
  }))
})
</script>

<template>
  <div>
    <input 
      v-model="searchQuery" 
      type="search" 
      placeholder="Search pets..."
    />
    
    <div v-if="loading">Searching...</div>
    <div v-else-if="pets && pets.length > 0">
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
    <div v-else>
      No pets found
    </div>
  </div>
</template>
```

## Multiple Filters

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

// Filter state
const filters = reactive({
  status: '',
  species: '',
  minAge: null as number | null,
  maxAge: null as number | null,
  sortBy: 'name',
  sortOrder: 'asc' as 'asc' | 'desc'
})

// Build query object
const queryParams = computed(() => {
  const params: Record<string, any> = {
    sortBy: filters.sortBy,
    order: filters.sortOrder
  }
  
  if (filters.status) params.status = filters.status
  if (filters.species) params.species = filters.species
  if (filters.minAge !== null) params.minAge = filters.minAge
  if (filters.maxAge !== null) params.maxAge = filters.maxAge
  
  return params
})

// Fetch with filters
const { data: pets, loading } = useFetchPets({
  query: queryParams
})

const clearFilters = () => {
  filters.status = ''
  filters.species = ''
  filters.minAge = null
  filters.maxAge = null
}
</script>

<template>
  <div class="filter-page">
    <!-- Filters -->
    <aside class="filters">
      <h3>Filters</h3>
      
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status">
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Species</label>
        <input v-model="filters.species" placeholder="e.g., Dog, Cat" />
      </div>
      
      <div class="filter-group">
        <label>Min Age</label>
        <input v-model.number="filters.minAge" type="number" min="0" />
      </div>
      
      <div class="filter-group">
        <label>Max Age</label>
        <input v-model.number="filters.maxAge" type="number" min="0" />
      </div>
      
      <div class="filter-group">
        <label>Sort By</label>
        <select v-model="filters.sortBy">
          <option value="name">Name</option>
          <option value="age">Age</option>
          <option value="createdAt">Date Added</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Order</label>
        <select v-model="filters.sortOrder">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      
      <button @click="clearFilters">Clear Filters</button>
    </aside>
    
    <!-- Results -->
    <main class="results">
      <div v-if="loading">Loading...</div>
      <div v-else-if="pets && pets.length > 0">
        <p>Found {{ pets.length }} pets</p>
        <div v-for="pet in pets" :key="pet.id" class="pet-card">
          <h3>{{ pet.name }}</h3>
          <p>{{ pet.species }} - {{ pet.age }} years</p>
          <span :class="`status-${pet.status}`">{{ pet.status }}</span>
        </div>
      </div>
      <div v-else>
        No pets match your filters
      </div>
    </main>
  </div>
</template>

<style scoped>
.filter-page {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
  padding: 20px;
}

.filters {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}

.filter-group {
  margin-bottom: 15px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.results {
  flex: 1;
}

.pet-card {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
}
</style>
```

## Pagination

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const page = ref(1)
const limit = ref(10)

const { data: response, loading } = useFetchPets({
  query: computed(() => ({
    page: page.value,
    limit: limit.value
  }))
})

// Assuming API returns { data: Pet[], total: number, page: number }
const pets = computed(() => response.value?.data ?? [])
const total = computed(() => response.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / limit.value))

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

const goToPage = (pageNum: number) => {
  page.value = pageNum
}
</script>

<template>
  <div>
    <!-- Results -->
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
    
    <!-- Pagination Controls -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">
        Previous
      </button>
      
      <span>
        Page {{ page }} of {{ totalPages }}
      </span>
      
      <button @click="nextPage" :disabled="page >= totalPages">
        Next
      </button>
    </div>
    
    <!-- Page Numbers -->
    <div class="page-numbers">
      <button
        v-for="pageNum in totalPages"
        :key="pageNum"
        @click="goToPage(pageNum)"
        :class="{ active: page === pageNum }"
      >
        {{ pageNum }}
      </button>
    </div>
    
    <!-- Info -->
    <p>
      Showing {{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }} 
      of {{ total }} pets
    </p>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.page-numbers {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 20px 0;
}

.page-numbers button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.page-numbers button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
```

## URL Sync (Keep filters in URL)

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const route = useRoute()
const router = useRouter()

// Initialize from URL
const status = ref(route.query.status as string || '')
const species = ref(route.query.species as string || '')
const page = ref(Number(route.query.page) || 1)

// Sync to URL when filters change
watch([status, species, page], ([newStatus, newSpecies, newPage]) => {
  router.push({
    query: {
      ...(newStatus && { status: newStatus }),
      ...(newSpecies && { species: newSpecies }),
      ...(newPage > 1 && { page: newPage.toString() })
    }
  })
})

// Fetch with query params
const { data: pets, loading } = useFetchPets({
  query: computed(() => ({
    status: status.value,
    species: species.value,
    page: page.value
  }))
})
</script>

<template>
  <div>
    <div class="filters">
      <select v-model="status">
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="sold">Sold</option>
      </select>
      
      <input v-model="species" placeholder="Species" />
    </div>
    
    <div v-for="pet in pets" :key="pet.id">
      {{ pet.name }}
    </div>
    
    <div class="pagination">
      <button @click="page--" :disabled="page === 1">Previous</button>
      <span>Page {{ page }}</span>
      <button @click="page++">Next</button>
    </div>
  </div>
</template>
```

## Debounced Search

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')
const debouncedQuery = ref('')

// Debounce search input
const updateSearch = useDebounceFn((value: string) => {
  debouncedQuery.value = value
}, 500)

watch(searchQuery, (newValue) => {
  updateSearch(newValue)
})

// Fetch with debounced query
const { data: pets, loading } = useFetchPets({
  query: computed(() => ({
    search: debouncedQuery.value
  }))
})
</script>

<template>
  <div>
    <input 
      v-model="searchQuery" 
      type="search" 
      placeholder="Search pets..."
    />
    
    <div v-if="loading">Searching...</div>
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
  </div>
</template>
```

## Advanced Filtering Example

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

interface FilterState {
  search: string
  status: string[]
  species: string[]
  ageRange: [number, number]
  tags: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

const filters = reactive<FilterState>({
  search: '',
  status: [],
  species: [],
  ageRange: [0, 20],
  tags: [],
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  limit: 10
})

// Build query params
const queryParams = computed(() => ({
  search: filters.search || undefined,
  status: filters.status.length > 0 ? filters.status.join(',') : undefined,
  species: filters.species.length > 0 ? filters.species.join(',') : undefined,
  minAge: filters.ageRange[0],
  maxAge: filters.ageRange[1],
  tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
  sortBy: filters.sortBy,
  order: filters.sortOrder,
  page: filters.page,
  limit: filters.limit
}))

const { data: response, loading, error } = useFetchPets({
  query: queryParams
})

const pets = computed(() => response.value?.data ?? [])
const total = computed(() => response.value?.total ?? 0)

// Filter helpers
const toggleStatus = (status: string) => {
  const index = filters.status.indexOf(status)
  if (index > -1) {
    filters.status.splice(index, 1)
  } else {
    filters.status.push(status)
  }
}

const toggleSpecies = (species: string) => {
  const index = filters.species.indexOf(species)
  if (index > -1) {
    filters.species.splice(index, 1)
  } else {
    filters.species.push(species)
  }
}

const resetFilters = () => {
  filters.search = ''
  filters.status = []
  filters.species = []
  filters.ageRange = [0, 20]
  filters.tags = []
  filters.page = 1
}

// Watch page and scroll to top
watch(() => filters.page, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <div class="advanced-filters">
    <aside class="sidebar">
      <!-- Search -->
      <div class="filter-section">
        <h3>Search</h3>
        <input 
          v-model="filters.search" 
          type="search" 
          placeholder="Search by name..."
        />
      </div>
      
      <!-- Status -->
      <div class="filter-section">
        <h3>Status</h3>
        <label>
          <input 
            type="checkbox" 
            :checked="filters.status.includes('available')"
            @change="toggleStatus('available')"
          />
          Available
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="filters.status.includes('pending')"
            @change="toggleStatus('pending')"
          />
          Pending
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="filters.status.includes('sold')"
            @change="toggleStatus('sold')"
          />
          Sold
        </label>
      </div>
      
      <!-- Species -->
      <div class="filter-section">
        <h3>Species</h3>
        <label>
          <input 
            type="checkbox" 
            :checked="filters.species.includes('dog')"
            @change="toggleSpecies('dog')"
          />
          Dog
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="filters.species.includes('cat')"
            @change="toggleSpecies('cat')"
          />
          Cat
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="filters.species.includes('bird')"
            @change="toggleSpecies('bird')"
          />
          Bird
        </label>
      </div>
      
      <!-- Age Range -->
      <div class="filter-section">
        <h3>Age Range</h3>
        <div class="range-inputs">
          <input 
            v-model.number="filters.ageRange[0]" 
            type="number" 
            min="0" 
            placeholder="Min"
          />
          <span>to</span>
          <input 
            v-model.number="filters.ageRange[1]" 
            type="number" 
            min="0" 
            placeholder="Max"
          />
        </div>
      </div>
      
      <!-- Sort -->
      <div class="filter-section">
        <h3>Sort</h3>
        <select v-model="filters.sortBy">
          <option value="name">Name</option>
          <option value="age">Age</option>
          <option value="createdAt">Date Added</option>
          <option value="price">Price</option>
        </select>
        <select v-model="filters.sortOrder">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      
      <button @click="resetFilters" class="reset-btn">
        Reset All Filters
      </button>
    </aside>
    
    <main class="content">
      <!-- Results Header -->
      <div class="results-header">
        <h2>Pets ({{ total }})</h2>
        <select v-model="filters.limit">
          <option :value="10">10 per page</option>
          <option :value="20">20 per page</option>
          <option :value="50">50 per page</option>
        </select>
      </div>
      
      <!-- Loading/Error -->
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error.message }}</div>
      
      <!-- Results -->
      <div v-else-if="pets.length > 0" class="pets-grid">
        <div v-for="pet in pets" :key="pet.id" class="pet-card">
          <h3>{{ pet.name }}</h3>
          <p>{{ pet.species }} - {{ pet.age }} years</p>
          <span :class="`status-${pet.status}`">{{ pet.status }}</span>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty">
        No pets found with current filters
      </div>
      
      <!-- Pagination -->
      <div v-if="pets.length > 0" class="pagination">
        <button 
          @click="filters.page--" 
          :disabled="filters.page === 1"
        >
          ← Previous
        </button>
        
        <span>
          Page {{ filters.page }} of {{ Math.ceil(total / filters.limit) }}
        </span>
        
        <button 
          @click="filters.page++" 
          :disabled="filters.page >= Math.ceil(total / filters.limit)"
        >
          Next →
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.advanced-filters {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.sidebar {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.filter-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
}

.filter-section:last-of-type {
  border-bottom: none;
}

.filter-section h3 {
  margin-bottom: 10px;
  font-size: 1.1em;
}

.filter-section label {
  display: block;
  margin-bottom: 8px;
  cursor: pointer;
}

.filter-section input[type="search"],
.filter-section input[type="number"],
.filter-section select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-inputs input {
  flex: 1;
  margin-bottom: 0;
}

.reset-btn {
  width: 100%;
  padding: 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.reset-btn:hover {
  background: #c82333;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.pet-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.pet-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.error {
  color: #dc3545;
}
</style>
```

## Next Steps

- [POST Request →](/examples/composables/basic/post-request)
- [Advanced Patterns →](/examples/composables/advanced/)
- [Composables Guide →](/composables/)
