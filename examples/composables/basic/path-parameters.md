# Path Parameters

Using dynamic route parameters with generated composables.

## Basic Example

```vue
<script setup lang="ts">
import { useFetchPet } from '~/composables/pets'

// Get ID from route
const route = useRoute()
const id = computed(() => route.params.id as string)

// Fetch pet by ID
const { data: pet, loading, error } = await useFetchPet(id.value)
</script>

<template>
  <div>
    <div v-if="loading">Loading pet...</div>
    <div v-else-if="error">Pet not found</div>
    <div v-else-if="pet">
      <h1>{{ pet.name }}</h1>
      <p>Species: {{ pet.species }}</p>
      <p>Status: {{ pet.status }}</p>
    </div>
  </div>
</template>
```

## Reactive Parameters

```vue
<script setup lang="ts">
import { useFetchPet } from '~/composables/pets'

const route = useRoute()
const petId = computed(() => route.params.id as string)

// Automatically refetch when petId changes
const { data: pet, loading, error } = useFetchPet(petId)

// Watch for changes
watch(petId, (newId, oldId) => {
  console.log(`Pet changed from ${oldId} to ${newId}`)
})
</script>

<template>
  <div>
    <div v-if="loading">Loading pet #{{ petId }}...</div>
    <div v-else-if="error">Pet not found</div>
    <div v-else-if="pet">
      <h1>{{ pet.name }}</h1>
      <NuxtLink :to="`/pets/${Number(petId) - 1}`">← Previous</NuxtLink>
      <NuxtLink :to="`/pets/${Number(petId) + 1}`">Next →</NuxtLink>
    </div>
  </div>
</template>
```

## Multiple Parameters

```vue
<script setup lang="ts">
import { useFetchPetPhoto } from '~/composables/pets'

const route = useRoute()
const petId = computed(() => route.params.petId as string)
const photoId = computed(() => route.params.photoId as string)

// Fetch specific photo for specific pet
const { data: photo, loading, error } = await useFetchPetPhoto(
  petId.value,
  photoId.value
)
</script>

<template>
  <div>
    <nav>
      <NuxtLink :to="`/pets/${petId}`">← Back to Pet</NuxtLink>
    </nav>
    
    <div v-if="loading">Loading photo...</div>
    <div v-else-if="error">Photo not found</div>
    <div v-else-if="photo">
      <img :src="photo.url" :alt="photo.caption" />
      <p>{{ photo.caption }}</p>
    </div>
  </div>
</template>
```

## Pet Detail Page

```vue
<script setup lang="ts">
import { useFetchPet, useFetchPetPhotos } from '~/composables/pets'

const route = useRoute()
const id = route.params.id as string

// Fetch pet and photos in parallel
const [
  { data: pet, loading: loadingPet, error: errorPet },
  { data: photos, loading: loadingPhotos }
] = await Promise.all([
  useFetchPet(id),
  useFetchPetPhotos(id)
])

// SEO
useHead({
  title: computed(() => pet.value?.name ?? 'Pet Details'),
  meta: [
    { 
      name: 'description', 
      content: computed(() => pet.value?.description ?? '') 
    }
  ]
})
</script>

<template>
  <div class="pet-detail">
    <div v-if="loadingPet">Loading...</div>
    <div v-else-if="errorPet">Pet not found</div>
    <div v-else-if="pet">
      <!-- Header -->
      <header>
        <h1>{{ pet.name }}</h1>
        <span :class="`status status-${pet.status}`">
          {{ pet.status }}
        </span>
      </header>
      
      <!-- Photos Gallery -->
      <div class="photos" v-if="photos && photos.length > 0">
        <img 
          v-for="photo in photos" 
          :key="photo.id" 
          :src="photo.url" 
          :alt="photo.caption"
        />
      </div>
      
      <!-- Details -->
      <div class="details">
        <div class="detail-item">
          <strong>Species:</strong>
          {{ pet.species }}
        </div>
        <div class="detail-item">
          <strong>Age:</strong>
          {{ pet.age }} years
        </div>
        <div class="detail-item" v-if="pet.breed">
          <strong>Breed:</strong>
          {{ pet.breed }}
        </div>
        <div class="detail-item">
          <strong>Description:</strong>
          {{ pet.description }}
        </div>
      </div>
      
      <!-- Actions -->
      <div class="actions">
        <NuxtLink to="/pets">← Back to List</NuxtLink>
        <NuxtLink :to="`/pets/${id}/edit`">Edit Pet</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pet-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.photos img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.details {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: bold;
}

.status-available {
  background: #d4edda;
  color: #155724;
}
</style>
```

## Edit Pet Page

```vue
<script setup lang="ts">
import { useFetchPet, useUpdatePet } from '~/composables/pets'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

// Fetch current pet data
const { data: pet, loading } = await useFetchPet(id)

// Form state
const form = ref({
  name: '',
  species: '',
  age: 0,
  status: 'available',
  description: ''
})

// Populate form when pet loads
watch(pet, (newPet) => {
  if (newPet) {
    form.value = {
      name: newPet.name,
      species: newPet.species,
      age: newPet.age ?? 0,
      status: newPet.status,
      description: newPet.description ?? ''
    }
  }
}, { immediate: true })

// Update composable
const { 
  execute: updatePet, 
  loading: updating, 
  error 
} = useUpdatePet(id, {
  immediate: false,
  onSuccess: () => {
    router.push(`/pets/${id}`)
  }
})

const handleSubmit = async () => {
  await updatePet(form.value)
}
</script>

<template>
  <div class="edit-pet">
    <h1>Edit Pet</h1>
    
    <div v-if="loading">Loading...</div>
    
    <form v-else @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Name</label>
        <input v-model="form.name" required />
      </div>
      
      <div class="form-group">
        <label>Species</label>
        <input v-model="form.species" required />
      </div>
      
      <div class="form-group">
        <label>Age</label>
        <input v-model.number="form.age" type="number" min="0" />
      </div>
      
      <div class="form-group">
        <label>Status</label>
        <select v-model="form.status">
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="form.description" rows="4"></textarea>
      </div>
      
      <div v-if="error" class="error">
        {{ error.message }}
      </div>
      
      <div class="actions">
        <button type="submit" :disabled="updating">
          {{ updating ? 'Saving...' : 'Save Changes' }}
        </button>
        <NuxtLink :to="`/pets/${id}`">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-pet {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error {
  background: #fee;
  color: #c00;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

## Nested Parameters

```vue
<script setup lang="ts">
import { useFetchUserPetOrders } from '~/composables/orders'

const route = useRoute()
const userId = computed(() => route.params.userId as string)
const petId = computed(() => route.params.petId as string)

// GET /users/:userId/pets/:petId/orders
const { data: orders, loading } = await useFetchUserPetOrders(
  userId.value,
  petId.value
)
</script>

<template>
  <div>
    <h2>Orders for Pet #{{ petId }} (User #{{ userId }})</h2>
    
    <div v-if="loading">Loading orders...</div>
    <div v-else-if="orders && orders.length > 0">
      <div v-for="order in orders" :key="order.id">
        Order #{{ order.id }} - {{ order.status }}
      </div>
    </div>
    <div v-else>
      No orders found
    </div>
  </div>
</template>
```

## Dynamic Navigation

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const { data: pets } = await useFetchPets()

const route = useRoute()
const currentId = computed(() => Number(route.params.id))

const currentIndex = computed(() => 
  pets.value?.findIndex(p => p.id === currentId.value) ?? -1
)

const previousPet = computed(() => {
  if (currentIndex.value <= 0) return null
  return pets.value?.[currentIndex.value - 1]
})

const nextPet = computed(() => {
  if (!pets.value || currentIndex.value >= pets.value.length - 1) return null
  return pets.value[currentIndex.value + 1]
})
</script>

<template>
  <div>
    <nav class="pet-navigation">
      <NuxtLink 
        v-if="previousPet" 
        :to="`/pets/${previousPet.id}`"
        class="nav-button"
      >
        ← {{ previousPet.name }}
      </NuxtLink>
      
      <NuxtLink to="/pets" class="nav-button">
        All Pets
      </NuxtLink>
      
      <NuxtLink 
        v-if="nextPet" 
        :to="`/pets/${nextPet.id}`"
        class="nav-button"
      >
        {{ nextPet.name }} →
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.pet-navigation {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.nav-button {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
}

.nav-button:hover {
  background: #e0e0e0;
}
</style>
```

## Next Steps

- [Query Parameters →](/examples/composables/basic/query-parameters)
- [POST Request →](/examples/composables/basic/post-request)
- [Callbacks →](/examples/composables/callbacks/)
- [Composables API →](/api/composables/)
