# Simple GET Request

The most basic example: fetching data with the generated `useFetch` composable.

## Basic Example

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const { data: pets, loading, error } = await useFetchPets()
</script>

<template>
  <div>
    <div v-if="loading">Loading pets...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <h2>Pets ({{ pets?.length }})</h2>
      <div v-for="pet in pets" :key="pet.id" class="pet-card">
        <h3>{{ pet.name }}</h3>
        <p>{{ pet.species }}</p>
        <span :class="`status-${pet.status}`">{{ pet.status }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pet-card {
  border: 1px solid #ddd;
  margin: 10px 0;
  padding: 15px;
  border-radius: 8px;
}

.status-available { color: green; }
.status-pending { color: orange; }
.status-sold { color: gray; }
</style>
```

## Without Await (Client-Side)

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

// Don't await - load on client
const { data: pets, loading, error } = useFetchPets()
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
  </div>
</template>
```

## With Manual Refresh

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const { data: pets, loading, error, refresh } = await useFetchPets()

const handleRefresh = async () => {
  await refresh()
}
</script>

<template>
  <div>
    <button @click="handleRefresh" :disabled="loading">
      {{ loading ? 'Refreshing...' : 'Refresh' }}
    </button>
    
    <div v-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
  </div>
</template>
```

## With Type Safety

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import type { Pet } from '~/types/api'

const { data: pets, loading, error } = await useFetchPets()

// TypeScript knows pets is Pet[] | null
const availablePets = computed(() => 
  pets.value?.filter((pet: Pet) => pet.status === 'available') ?? []
)

const totalPets = computed(() => pets.value?.length ?? 0)
</script>

<template>
  <div>
    <p>Total: {{ totalPets }} | Available: {{ availablePets.length }}</p>
    
    <div v-for="pet in availablePets" :key="pet.id">
      {{ pet.name }} - {{ pet.species }}
    </div>
  </div>
</template>
```

## With Computed Properties

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const { data: pets, loading } = await useFetchPets()

// Filter by status
const availablePets = computed(() => 
  pets.value?.filter(p => p.status === 'available') ?? []
)

const pendingPets = computed(() => 
  pets.value?.filter(p => p.status === 'pending') ?? []
)

const soldPets = computed(() => 
  pets.value?.filter(p => p.status === 'sold') ?? []
)

// Group by species
const petsBySpecies = computed(() => {
  const groups: Record<string, Pet[]> = {}
  
  pets.value?.forEach(pet => {
    if (!groups[pet.species]) {
      groups[pet.species] = []
    }
    groups[pet.species].push(pet)
  })
  
  return groups
})
</script>

<template>
  <div>
    <div class="stats">
      <div>Available: {{ availablePets.length }}</div>
      <div>Pending: {{ pendingPets.length }}</div>
      <div>Sold: {{ soldPets.length }}</div>
    </div>
    
    <div v-for="(pets, species) in petsBySpecies" :key="species">
      <h3>{{ species }} ({{ pets.length }})</h3>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
  </div>
</template>
```

## With Error Handling

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const { data: pets, loading, error, refresh } = await useFetchPets()

const errorMessage = computed(() => {
  if (!error.value) return null
  
  // Customize error messages
  if (error.value.statusCode === 404) {
    return 'Pets not found'
  } else if (error.value.statusCode === 500) {
    return 'Server error. Please try again later.'
  } else if (error.value.statusCode === 401) {
    return 'Please login to view pets'
  }
  
  return error.value.message
})

const handleRetry = async () => {
  await refresh()
}
</script>

<template>
  <div>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Loading pets...
    </div>
    
    <div v-else-if="error" class="error-card">
      <h3>⚠️ Error</h3>
      <p>{{ errorMessage }}</p>
      <button @click="handleRetry">Try Again</button>
    </div>
    
    <div v-else-if="!pets || pets.length === 0" class="empty-state">
      <p>No pets found</p>
    </div>
    
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-card {
  background: #fee;
  border: 1px solid #fcc;
  padding: 20px;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.loading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

## SSR Example

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

// Use await for SSR
const { data: pets, loading, error } = await useFetchPets()

// This will be rendered on the server
const metaDescription = computed(() => 
  `Browse ${pets.value?.length ?? 0} available pets`
)

useHead({
  title: 'Available Pets',
  meta: [
    { name: 'description', content: metaDescription }
  ]
})
</script>

<template>
  <div>
    <h1>Available Pets</h1>
    
    <!-- This HTML is rendered on the server -->
    <div v-for="pet in pets" :key="pet.id">
      <h2>{{ pet.name }}</h2>
      <p>{{ pet.description }}</p>
    </div>
  </div>
</template>
```

## Complete Component Example

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import type { Pet } from '~/types/api'

// Fetch pets
const { data: pets, loading, error, refresh } = await useFetchPets()

// State
const searchQuery = ref('')
const selectedSpecies = ref<string | null>(null)

// Computed
const filteredPets = computed(() => {
  let result = pets.value ?? []
  
  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(pet => 
      pet.name.toLowerCase().includes(query) ||
      pet.description?.toLowerCase().includes(query)
    )
  }
  
  // Filter by species
  if (selectedSpecies.value) {
    result = result.filter(pet => pet.species === selectedSpecies.value)
  }
  
  return result
})

const availableSpecies = computed(() => {
  const species = new Set<string>()
  pets.value?.forEach(pet => species.add(pet.species))
  return Array.from(species).sort()
})

// Methods
const clearFilters = () => {
  searchQuery.value = ''
  selectedSpecies.value = null
}
</script>

<template>
  <div class="pets-page">
    <header>
      <h1>Available Pets</h1>
      <button @click="refresh" :disabled="loading">
        🔄 Refresh
      </button>
    </header>
    
    <!-- Filters -->
    <div class="filters">
      <input 
        v-model="searchQuery" 
        type="search" 
        placeholder="Search pets..."
      />
      
      <select v-model="selectedSpecies">
        <option :value="null">All Species</option>
        <option v-for="species in availableSpecies" :key="species" :value="species">
          {{ species }}
        </option>
      </select>
      
      <button @click="clearFilters" v-if="searchQuery || selectedSpecies">
        Clear Filters
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Loading...
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error.message }}</p>
      <button @click="refresh">Try Again</button>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="filteredPets.length === 0" class="empty">
      <p v-if="searchQuery || selectedSpecies">
        No pets match your filters
      </p>
      <p v-else>No pets available</p>
    </div>
    
    <!-- Pet List -->
    <div v-else class="pet-grid">
      <div v-for="pet in filteredPets" :key="pet.id" class="pet-card">
        <img :src="pet.photoUrl" :alt="pet.name" v-if="pet.photoUrl" />
        <h3>{{ pet.name }}</h3>
        <p class="species">{{ pet.species }}</p>
        <p class="description">{{ pet.description }}</p>
        <span :class="`status status-${pet.status}`">
          {{ pet.status }}
        </span>
      </div>
    </div>
    
    <!-- Results count -->
    <footer>
      Showing {{ filteredPets.length }} of {{ pets?.length ?? 0 }} pets
    </footer>
  </div>
</template>

<style scoped>
.pets-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters input,
.filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.pet-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.2s;
}

.pet-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.pet-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.species {
  color: #666;
  font-size: 0.9em;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: bold;
}

.status-available {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-sold {
  background: #e2e3e5;
  color: #383d41;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px;
}

.error {
  background: #fee;
  border-radius: 8px;
}
</style>
```

## Next Steps

- [Path Parameters →](/examples/composables/basic/path-parameters)
- [Query Parameters →](/examples/composables/basic/query-parameters)
- [POST Request →](/examples/composables/basic/post-request)
- [Composables Guide →](/guide/composables/)
