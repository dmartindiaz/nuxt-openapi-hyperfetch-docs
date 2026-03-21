# Loading Spinner

Display loading indicators using callbacks during requests.

## Basic Loading Spinner

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const showSpinner = ref(false)

const { data: pets } = useFetchPets({
  onRequest: () => {
    showSpinner.value = true
  },
  onResponse: () => {
    showSpinner.value = false
  },
  onError: () => {
    showSpinner.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="showSpinner" class="spinner"></div>
    
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

## Global Loading State

```typescript
// composables/useLoading.ts
export function useLoading() {
  const loadingCount = useState<number>('loadingCount', () => 0)
  const isLoading = computed(() => loadingCount.value > 0)
  
  const start = () => {
    loadingCount.value++
  }
  
  const stop = () => {
    if (loadingCount.value > 0) {
      loadingCount.value--
    }
  }
  
  return {
    isLoading: readonly(isLoading),
    start,
    stop
  }
}
```

## Use Global Loading

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useLoading } from '~/composables/useLoading'

const loading = useLoading()

const { data: pets } = useFetchPets({
  onRequest: () => {
    loading.start()
  },
  onResponse: () => {
    loading.stop()
  },
  onError: () => {
    loading.stop()
  }
})
</script>

<template>
  <div>
    <div v-if="loading.isLoading" class="global-spinner">
      Loading...
    </div>
    
    <div v-for="pet in pets" :key="pet.id">
      {{ pet.name }}
    </div>
  </div>
</template>
```

## Loading Overlay Component

```vue
<!-- components/LoadingOverlay.vue -->
<script setup lang="ts">
import { useLoading } from '~/composables/useLoading'

const { isLoading } = useLoading()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner-container">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Button Loading State

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'

const form = reactive({
  name: '',
  species: ''
})

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onSuccess: () => {
    form.name = ''
    form.species = ''
  }
})
</script>

<template>
  <form @submit.prevent="() => createPet(form)">
    <input v-model="form.name" placeholder="Name" required />
    <input v-model="form.species" placeholder="Species" required />
    
    <button type="submit" :disabled="loading" class="btn-submit">
      <span v-if="loading" class="btn-spinner"></span>
      <span>{{ loading ? 'Creating...' : 'Create Pet' }}</span>
    </button>
  </form>
</template>

<style scoped>
.btn-submit {
  position: relative;
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

## Inline Loading Indicator

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const { data: pets, loading } = useFetchPets()

const searchQuery = ref('')
const filteredPets = computed(() => {
  if (!pets.value) return []
  return pets.value.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="Search pets..." />
    
    <div class="pet-list">
      <div v-if="loading" class="inline-loading">
        <div class="spinner-small"></div>
        Loading pets...
      </div>
      
      <div v-else-if="filteredPets.length > 0">
        <div v-for="pet in filteredPets" :key="pet.id" class="pet-item">
          {{ pet.name }}
        </div>
      </div>
      
      <div v-else>
        No pets found
      </div>
    </div>
  </div>
</template>

<style scoped>
.inline-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: #666;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

## Skeleton Loader

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const { data: pets, loading } = await useFetchPets()
</script>

<template>
  <div class="pet-grid">
    <!-- Skeleton cards while loading -->
    <template v-if="loading">
      <div v-for="i in 6" :key="i" class="pet-card skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    </template>
    
    <!-- Actual data -->
    <template v-else>
      <div v-for="pet in pets" :key="pet.id" class="pet-card">
        <img :src="pet.photoUrl" :alt="pet.name" />
        <h3>{{ pet.name }}</h3>
        <p>{{ pet.species }}</p>
        <p>{{ pet.description }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.pet-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.pet-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

/* Skeleton styles */
.skeleton {
  pointer-events: none;
}

.skeleton > * {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-title {
  height: 24px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-text {
  height: 16px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-text.short {
  width: 60%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
```

## Progress Bar

```vue
<script setup lang="ts">
import { useUploadPetPhoto } from '~/composables/pets'

const { execute: upload, loading } = useUploadPetPhoto({
  immediate: false,
  onRequest: () => {
    uploadProgress.value = 0
  }
})

const uploadProgress = ref(0)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const formData = new FormData()
  formData.append('photo', file)
  
  // Simulate progress (in real app, use XHR with progress events)
  const interval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 200)
  
  try {
    await upload(1, formData)
    uploadProgress.value = 100
  } finally {
    clearInterval(interval)
  }
}
</script>

<template>
  <div>
    <input type="file" @change="handleFileSelect" :disabled="loading" />
    
    <div v-if="loading" class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
      <span>{{ uploadProgress }}%</span>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
}
</style>
```

## Multiple Concurrent Requests

```vue
<script setup lang="ts">
import { useFetchPets, useFetchOrders } from '~/composables'
import { useLoading } from '~/composables/useLoading'

const loading = useLoading()

// Both requests use the same loading state
const { data: pets } = useFetchPets({
  onRequest: () => loading.start(),
  onResponse: () => loading.stop(),
  onError: () => loading.stop()
})

const { data: orders } = useFetchOrders({
  onRequest: () => loading.start(),
  onResponse: () => loading.stop(),
  onError: () => loading.stop()
})
</script>

<template>
  <div>
    <div v-if="loading.isLoading" class="loading-banner">
      Loading data...
    </div>
    
    <div class="content">
      <section>
        <h2>Pets</h2>
        <div v-for="pet in pets" :key="pet.id">{{ pet.name }}</div>
      </section>
      
      <section>
        <h2>Orders</h2>
        <div v-for="order in orders" :key="order.id">Order #{{ order.id }}</div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.loading-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #3498db;
  color: white;
  padding: 10px;
  text-align: center;
  z-index: 9999;
}
</style>
```

## Complete Example

```vue
<script setup lang="ts">
import { useFetchPets, useCreatePet } from '~/composables/pets'
import { useLoading } from '~/composables/useLoading'

const loading = useLoading()

// Fetch pets
const { data: pets, refresh } = useFetchPets({
  onRequest: () => loading.start(),
  onResponse: () => loading.stop(),
  onError: () => loading.stop()
})

// Create pet form
const form = reactive({
  name: '',
  species: ''
})

const creating = ref(false)

const { execute: createPet } = useCreatePet({
  immediate: false,
  onRequest: () => {
    creating.value = true
    loading.start()
  },
  onResponse: () => {
    creating.value = false
    loading.stop()
  },
  onError: () => {
    creating.value = false
    loading.stop()
  },
  onSuccess: () => {
    form.name = ''
    form.species = ''
    refresh()
  }
})

const handleSubmit = async () => {
  await createPet(form)
}
</script>

<template>
  <div class="page">
    <LoadingOverlay />
    
    <header>
      <h1>Pets Management</h1>
      <button @click="refresh" :disabled="loading.isLoading">
        <span v-if="loading.isLoading" class="btn-spinner"></span>
        Refresh
      </button>
    </header>
    
    <div class="create-form">
      <h2>Create New Pet</h2>
      <form @submit.prevent="handleSubmit">
        <input 
          v-model="form.name" 
          placeholder="Name" 
          required 
          :disabled="creating"
        />
        <input 
          v-model="form.species" 
          placeholder="Species" 
          required 
          :disabled="creating"
        />
        <button type="submit" :disabled="creating">
          <span v-if="creating" class="btn-spinner"></span>
          {{ creating ? 'Creating...' : 'Create' }}
        </button>
      </form>
    </div>
    
    <div class="pet-list">
      <h2>All Pets</h2>
      
      <!-- Skeleton loading -->
      <template v-if="!pets">
        <div v-for="i in 3" :key="i" class="pet-skeleton">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </template>
      
      <!-- Actual data -->
      <template v-else>
        <div v-for="pet in pets" :key="pet.id" class="pet-item">
          <h3>{{ pet.name }}</h3>
          <p>{{ pet.species }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.create-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.create-form form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
}

.create-form input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.pet-item {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.pet-skeleton {
  padding: 15px;
  margin-bottom: 10px;
}

.skeleton-line {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

## Next Steps

- [Request Logging →](/examples/composables/callbacks/request-logging)
- [Global Callbacks →](/examples/composables/global-callbacks/)
- [Advanced Patterns →](/examples/composables/advanced/)
- [Callbacks Guide →](/guide/composables/callbacks)
