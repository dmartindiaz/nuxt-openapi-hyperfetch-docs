# useFetch Basic Usage

Complete guide to using generated `useFetch` composables.

## GET Requests

### Simple GET

```vue
<script setup lang="ts">
const { data: pets, pending, error } = useFetchGetPets()
</script>

<template>
  <div>
    <div v-if="pending">Loading pets...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="pet in pets" :key="pet.id">{{ pet.name }}</li>
    </ul>
  </div>
</template>
```

### GET with Path Parameters

```vue
<script setup lang="ts">
const route = useRoute()
const petId = computed(() => Number(route.params.id))

const { data: pet, pending, error } = useFetchGetPetById({
  petId: petId.value
})
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Pet not found</div>
  <div v-else>
    <h1>{{ pet.name }}</h1>
    <p>Status: {{ pet.status }}</p>
  </div>
</template>
```

### GET with Query Parameters

```vue
<script setup lang="ts">
const filters = ref({
  status: 'available',
  limit: 20,
  offset: 0
})

const { data: pets } = useFetchGetPets(filters.value)

// Update filters (triggers new request)
const changeStatus = (status: string) => {
  filters.value.status = status
}
</script>
```

## POST Requests

### Create Resource

```vue
<script setup lang="ts">
const form = ref({
  name: '',
  status: 'available'
})

const { data: newPet, execute, pending, error } = useFetchCreatePet(
  { body: form.value },
  {
    immediate: false, // Don't execute on mount
    onSuccess: (pet) => {
      console.log('Pet created:', pet.id)
      navigateTo(`/pets/${pet.id}`)
    }
  }
)

const handleSubmit = async () => {
  await execute()
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" placeholder="Pet name" />
    <select v-model="form.status">
      <option>available</option>
      <option>pending</option>
      <option>sold</option>
    </select>
    <button type="submit" :disabled="pending">
      {{ pending ? 'Creating...' : 'Create Pet' }}
    </button>
    <div v-if="error" class="error">{{ error.message }}</div>
  </form>
</template>
```

## PUT/PATCH Requests

### Update Resource

```vue
<script setup lang="ts">
const petId = 123

// Load existing pet
const { data: pet } = useFetchGetPetById({ petId })

// Update form
const form = ref({
  name: '',
  status: 'available'
})

// Watch pet data and populate form
watch(pet, (loadedPet) => {
  if (loadedPet) {
    form.value.name = loadedPet.name
    form.value.status = loadedPet.status
  }
}, { immediate: true })

// Update composable
const { execute: updatePet, pending, error } = useFetchUpdatePet(
  {
    petId,
    body: form.value
  },
  {
    immediate: false,
    onSuccess: () => {
      showToast('Pet updated!', 'success')
    }
  }
)

const handleSubmit = async () => {
  await updatePet()
}
</script>
```

## DELETE Requests

### Delete Resource

```vue
<script setup lang="ts">
const petId = 123

const { execute: deletePet, pending } = useFetchDeletePet(
  { petId },
  {
    immediate: false,
    onSuccess: () => {
      showToast('Pet deleted', 'success')
      navigateTo('/pets')
    },
    onError: (error) => {
      showToast(`Failed to delete: ${error.message}`, 'error')
    }
  }
)

const confirmDelete = () => {
  if (confirm('Are you sure?')) {
    deletePet()
  }
}
</script>

<template>
  <button @click="confirmDelete" :disabled="pending">
    {{ pending ? 'Deleting...' : 'Delete Pet' }}
  </button>
</template>
```

## Reactive Parameters

Parameters can be reactive:

```vue
<script setup lang="ts">
// Reactive parameter
const petId = ref(123)

// Composable automatically re-fetches when petId changes
const { data: pet } = useFetchGetPetById({ petId: petId.value })

// Change ID (triggers new request)
const loadNextPet = () => {
  petId.value++
}
</script>

<template>
  <div>
    <h1>{{ pet?.name }}</h1>
    <button @click="loadNextPet">Next Pet</button>
  </div>
</template>
```

## Manual Refresh

```vue
<script setup lang="ts">
const { data: pets, refresh, pending } = useFetchGetPets()

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

```vue
<script setup lang="ts">
const { data: pet } = useFetchGetPetById(
  { petId: 123 },
  {
    onRequest: ({ url }) => {
      console.log('Fetching from:', url)
    },
    onSuccess: (pet) => {
      showToast(`Loaded ${pet.name}`, 'success')
    },
    onError: (error) => {
      showToast(`Failed: ${error.message}`, 'error')
    },
    onFinish: () => {
      console.log('Request complete')
    }
  }
)
</script>
```

## Conditional Execution

Use `immediate: false` to control execution:

```vue
<script setup lang="ts">
const shouldLoad = ref(false)

const { data, execute, pending } = useFetchGetPets(
  {},
  {
    immediate: false, // Don't execute on mount
    watch: false      // Don't watch parameters
  }
)

const loadPets = () => {
  shouldLoad.value = true
  execute()
}
</script>

<template>
  <div>
    <button v-if="!shouldLoad" @click="loadPets">Load Pets</button>
    <div v-else-if="pending">Loading...</div>
    <ul v-else>
      <li v-for="pet in data" :key="pet.id">{{ pet.name }}</li>
    </ul>
  </div>
</template>
```

## Error Handling

```vue
<script setup lang="ts">
const { data, error, status } = useFetchGetPets()

// Watch error state
watch(error, (err) => {
  if (err) {
    console.error('API Error:', err)
  }
})

// Or use status
watch(status, (newStatus) => {
  if (newStatus === 'error') {
    showToast('Failed to load pets', 'error')
  }
})
</script>

<template>
  <div>
    <div v-if="status === 'pending'">Loading...</div>
    <div v-else-if="status === 'error'">
      <p>Error: {{ error?.message }}</p>
      <pre>{{ error }}</pre>
    </div>
    <div v-else>
      <ul>
        <li v-for="pet in data" :key="pet.id">{{ pet.name }}</li>
      </ul>
    </div>
  </div>
</template>
```

## SSR Considerations

Composables execute on server during SSR:

```vue
<script setup lang="ts">
// This runs on server during SSR, then hydrates on client
const { data: pets } = useFetchGetPets()

// Check if we're on server
if (process.server) {
  console.log('Running on server')
}

// Check if we're on client
if (process.client) {
  console.log('Running on client')
}
</script>
```

### Skip SSR for Specific Requests

```vue
<script setup lang="ts">
const { data } = useFetchGetPets(
  {},
  {
    server: false // Only execute on client
  }
)
</script>
```

## Next Steps

- [Configuration Options](/composables/use-fetch/configuration)
- [Lifecycle Callbacks](/composables/features/callbacks/overview)
- [Global Callbacks](/composables/features/global-callbacks/overview)
- [Practical Examples](/examples/composables/basic/simple-get)
