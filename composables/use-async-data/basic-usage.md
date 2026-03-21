# useAsyncData Basic Usage

Complete guide to using generated `useAsyncData` composables.

## Simple Requests

### Basic GET

```vue
<script setup lang="ts">
const { data: pets, pending, error } = useAsyncDataGetPets('pets-list')
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="pet in pets" :key="pet.id">{{ pet.name }}</li>
    </ul>
  </div>
</template>
```

### With Path Parameters

```vue
<script setup lang="ts">
const route = useRoute()
const petId = computed(() => Number(route.params.id))

const { data: pet } = useAsyncDataGetPetById(
  `pet-${petId.value}`,
  { petId: petId.value }
)
</script>

<template>
  <div>
    <h1>{{ pet?.name }}</h1>
    <p>Status: {{ pet?.status }}</p>
  </div>
</template>
```

### With Query Parameters

```typescript
const { data: pets } = useAsyncDataGetPets(
  'pets-filtered',
  {
    status: 'available',
    limit: 20
  }
)
```

## Data Transformation

Transform response data before it's returned:

### Simple Transformation

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

### Complex Transformation

```typescript
const { data: enrichedPets } = useAsyncDataGetPets(
  'enriched-pets',
  {},
  {
    transform: (pets) => pets.map(pet => ({
      ...pet,
      displayName: `${pet.name} (#${pet.id})`,
      isAvailable: pet.status === 'available',
      badge: pet.status === 'available' ? '✅' : '❌'
    }))
  }
)
```

### Filtering Data

```typescript
const { data: availablePets } = useAsyncDataGetPets(
  'available-pets',
  {},
  {
    transform: (pets) => pets.filter(pet => pet.status === 'available')
  }
)
```

## Cache Key Strategies

### Static Keys

```typescript
// Simple static key
const { data } = useAsyncDataGetPets('pets-list')
```

### Dynamic Keys Based on Parameters

```typescript
const petId = ref(123)

const { data } = useAsyncDataGetPetById(
  `pet-${petId.value}`,
  { petId: petId.value }
)
```

### Keys with Query Parameters

```typescript
const filters = ref({
  status: 'available',
  limit: 20
})

const cacheKey = computed(() => 
  `pets-${filters.value.status}-${filters.value.limit}`
)

const { data } = useAsyncDataGetPets(
  cacheKey.value,
  filters.value
)
```

### Namespaced Keys

```typescript
// Use prefix for organization
const { data: userPets } = useAsyncDataGetUserPets(
  `user:${userId}:pets`,
  { userId }
)

const { data: userProfile } = useAsyncDataGetUserProfile(
  `user:${userId}:profile`,
  { userId }
)
```

## Manual Execution

Use `immediate: false` for manual execution:

```vue
<script setup lang="ts">
const searchQuery = ref('')

const { data: results, execute, pending } = useAsyncDataSearchPets(
  'search-results',
  { query: searchQuery.value },
  {
    immediate: false,
    watch: false
  }
)

const handleSearch = async () => {
  if (searchQuery.value.length >= 3) {
    await execute()
  }
}
</script>

<template>
  <div>
    <input v-model="searchQuery" @input="handleSearch" />
    <div v-if="pending">Searching...</div>
    <ul v-if="results">
      <li v-for="pet in results" :key="pet.id">{{ pet.name }}</li>
    </ul>
  </div>
</template>
```

## Refresh Data

```vue
<script setup lang="ts">
const { data: pets, refresh, pending } = useAsyncDataGetPets('pets')

const handleRefresh = async () => {
  await refresh()
  showToast('Pets refreshed!', 'success')
}
</script>

<template>
  <div>
    <button @click="handleRefresh" :disabled="pending">
      {{ pending ? 'Refreshing...' : 'Refresh' }}
    </button>
    <ul>
      <li v-for="pet in pets" :key="pet.id">{{ pet.name }}</li>
    </ul>
  </div>
</template>
```

## With Callbacks

```typescript
const { data: pets } = useAsyncDataGetPets(
  'pets',
  {},
  {
    onRequest: ({ url }) => {
      console.log('Fetching from:', url)
    },
    onSuccess: (pets) => {
      showToast(`Loaded ${pets.length} pets`, 'success')
    },
    onError: (error) => {
      if (error.status === 404) {
        showToast('No pets found', 'error')
      }
    },
    onFinish: () => {
      console.log('Request complete')
    }
  }
)
```

## Multiple API Calls

Combine multiple API calls in one composable:

```vue
<script setup lang="ts">
const petId = ref(123)

// Load pet and owner in parallel
const { data: petDetails, pending } = useAsyncData(
  `pet-details-${petId.value}`,
  async () => {
    const [pet, owner] = await Promise.all([
      useAsyncDataGetPetById(`pet-${petId.value}`, { petId: petId.value }),
      useAsyncDataGetOwnerById(`owner-${petId.value}`, { ownerId: petId.value })
    ])
    
    return {
      pet: pet.data.value,
      owner: owner.data.value
    }
  }
)
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else>
    <h1>{{ petDetails?.pet.name }}</h1>
    <p>Owner: {{ petDetails?.owner.name }}</p>
  </div>
</template>
```

## Conditional Execution

Execute only when conditions are met:

```vue
<script setup lang="ts">
const userId = ref<number | null>(null)

const shouldFetch = computed(() => userId.value !== null)

const { data: user, execute } = useAsyncDataGetUser(
  `user-${userId.value}`,
  { userId: userId.value! },
  {
    immediate: false
  }
)

watch(shouldFetch, async (should) => {
  if (should) {
    await execute()
  }
})
</script>
```

## Error Handling

```vue
<script setup lang="ts">
const { data, error, status } = useAsyncDataGetPets('pets')

// Different handling based on status
const errorMessage = computed(() => {
  if (!error.value) return null
  
  switch (error.value.status) {
    case 404:
      return 'No pets found'
    case 401:
      return 'Please log in'
    case 500:
      return 'Server error, please try again'
    default:
      return error.value.message
  }
})
</script>

<template>
  <div>
    <div v-if="status === 'pending'">Loading...</div>
    <div v-else-if="error" class="error">
      {{ errorMessage }}
    </div>
    <ul v-else>
      <li v-for="pet in data" :key="pet.id">{{ pet.name }}</li>
    </ul>
  </div>
</template>
```

## SSR Considerations

```vue
<script setup lang="ts">
// Runs on server and client
const { data } = useAsyncDataGetPets('pets', {}, {
  server: true
})

// Only runs on client
const { data: clientData } = useAsyncDataGetUserPets('user-pets', {}, {
  server: false
})
</script>
```

## Pick Specific Fields

```typescript
const { data: pets } = useAsyncDataGetPets(
  'pets-minimal',
  {},
  {
    pick: ['id', 'name', 'status']
  }
)

// Only id, name, and status are returned
```

## Next Steps

- [Raw Responses](/composables/use-async-data/raw-responses)
- [vs useFetch](/composables/use-async-data/vs-use-fetch)
- [Callbacks](/composables/features/callbacks/overview)
- [Examples](/examples/composables/basic/simple-get)
