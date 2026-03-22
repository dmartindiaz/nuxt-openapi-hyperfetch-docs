# Success Navigation

Automatically navigate to another page after successful requests using callbacks.

## Basic Navigation

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'

const router = useRouter()

const form = reactive({
  name: '',
  species: ''
})

const { execute: createPet, loading, error } = useCreatePet({
  immediate: false,
  onSuccess: (pet) => {
    // Navigate to pet detail page
    router.push(`/pets/${pet.id}`)
  }
})

const handleSubmit = async () => {
  await createPet(form)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" placeholder="Name" required />
    <input v-model="form.species" placeholder="Species" required />
    
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Creating...' : 'Create Pet' }}
    </button>
  </form>
</template>
```

## Navigate After Update

```vue
<script setup lang="ts">
import { useUpdatePet } from '~/composables/pets'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const form = reactive({
  name: 'Fluffy',
  species: 'Cat',
  age: 3
})

const { execute: updatePet, loading } = useUpdatePet(id, {
  immediate: false,
  onSuccess: () => {
    // Navigate back to detail page after update
    router.push(`/pets/${id}`)
  }
})

const handleSubmit = async () => {
  await updatePet(form)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Form fields -->
    <button type="submit" :disabled="loading">
      Save Changes
    </button>
    <NuxtLink :to="`/pets/${id}`">Cancel</NuxtLink>
  </form>
</template>
```

## Navigate After Delete

```vue
<script setup lang="ts">
import { useDeletePet } from '~/composables/pets'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const showConfirm = ref(false)

const { execute: deletePet, loading } = useDeletePet(id, {
  immediate: false,
  onSuccess: () => {
    // Navigate to list after delete
    router.push('/pets')
  }
})

const handleDelete = async () => {
  if (showConfirm.value) {
    await deletePet()
  } else {
    showConfirm.value = true
  }
}
</script>

<template>
  <div>
    <h1>Delete Pet</h1>
    
    <div v-if="!showConfirm">
      <p>Are you sure you want to delete this pet?</p>
      <button @click="handleDelete" class="danger">
        Delete
      </button>
    </div>
    
    <div v-else>
      <p>Really delete? This cannot be undone.</p>
      <button @click="handleDelete" :disabled="loading" class="danger">
        {{ loading ? 'Deleting...' : 'Yes, Delete' }}
      </button>
      <button @click="showConfirm = false">Cancel</button>
    </div>
  </div>
</template>
```

## Navigate with Query Parameters

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'

const router = useRouter()

const form = reactive({
  name: '',
  species: '',
  status: 'available'
})

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onSuccess: (pet) => {
    // Navigate with query params
    router.push({
      path: `/pets/${pet.id}`,
      query: {
        created: 'true',
        timestamp: Date.now().toString()
      }
    })
  }
})
</script>
```

## Navigate with Success Message

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'

const router = useRouter()

const form = reactive({
  name: '',
  species: ''
})

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onSuccess: async (pet) => {
    // Navigate with state
    await router.push({
      path: `/pets/${pet.id}`,
      state: {
        message: 'Pet created successfully!',
        type: 'success'
      }
    })
  }
})
</script>
```

## Back Navigation

```vue
<script setup lang="ts">
import { useUpdatePet } from '~/composables/pets'

const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const form = reactive({
  name: '',
  species: ''
})

const { execute: updatePet, loading } = useUpdatePet(id, {
  immediate: false,
  onSuccess: () => {
    // Go back to previous page
    router.back()
  }
})
</script>

<template>
  <form @submit.prevent="() => updatePet(form)">
    <input v-model="form.name" required />
    <input v-model="form.species" required />
    
    <button type="submit" :disabled="loading">
      Save Changes
    </button>
    <button type="button" @click="router.back()">
      Cancel
    </button>
  </form>
</template>
```

## Conditional Navigation

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'

const router = useRouter()
const route = useRoute()

const form = reactive({
  name: '',
  species: ''
})

const continueCreating = ref(false)

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onSuccess: (pet) => {
    if (continueCreating.value) {
      // Stay on form and reset
      form.name = ''
      form.species = ''
    } else {
      // Navigate to pet detail
      router.push(`/pets/${pet.id}`)
    }
  }
})

const handleSubmit = async () => {
  await createPet(form)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" required />
    <input v-model="form.species" required />
    
    <label>
      <input v-model="continueCreating" type="checkbox" />
      Create another pet after saving
    </label>
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Creating...' : 'Create Pet' }}
    </button>
  </form>
</template>
```

## Navigate to External URL

```vue
<script setup lang="ts">
import { useCreateOrder } from '~/composables/orders'

const form = reactive({
  petId: 1,
  quantity: 1
})

const { execute: createOrder, loading } = useCreateOrder({
  immediate: false,
  onSuccess: (order) => {
    // Redirect to payment gateway
    window.location.href = order.paymentUrl
  }
})
</script>
```

## Multiple Navigation Options

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'

const router = useRouter()

const form = reactive({
  name: '',
  species: ''
})

const action = ref<'view' | 'edit' | 'list'>('view')

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onSuccess: (pet) => {
    switch (action.value) {
      case 'view':
        router.push(`/pets/${pet.id}`)
        break
      case 'edit':
        router.push(`/pets/${pet.id}/edit`)
        break
      case 'list':
        router.push('/pets')
        break
    }
  }
})

const handleSubmit = async () => {
  await createPet(form)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" required />
    <input v-model="form.species" required />
    
    <div class="actions">
      <button type="submit" @click="action = 'view'" :disabled="loading">
        Save & View
      </button>
      <button type="submit" @click="action = 'edit'" :disabled="loading">
        Save & Edit
      </button>
      <button type="submit" @click="action = 'list'" :disabled="loading">
        Save & Go to List
      </button>
    </div>
  </form>
</template>
```

## Navigate with Route Guard

```vue
<script setup lang="ts">
import { useUpdatePet } from '~/composables/pets'

const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const form = reactive({
  name: 'Fluffy',
  species: 'Cat'
})

const hasChanges = ref(false)

watch(form, () => {
  hasChanges.value = true
}, { deep: true })

const { execute: updatePet, loading } = useUpdatePet(id, {
  immediate: false,
  onSuccess: () => {
    hasChanges.value = false
    router.push(`/pets/${id}`)
  }
})

// Warn before leaving if unsaved changes
onBeforeRouteLeave((to, from) => {
  if (hasChanges.value && !loading.value) {
    const answer = window.confirm('You have unsaved changes. Leave anyway?')
    if (!answer) return false
  }
})
</script>

<template>
  <form @submit.prevent="() => updatePet(form)">
    <input v-model="form.name" required />
    <input v-model="form.species" required />
    
    <button type="submit" :disabled="loading">
      Save Changes
    </button>
  </form>
</template>
```

## Complete Example

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'

const router = useRouter()

const form = reactive({
  name: '',
  species: '',
  age: 0,
  status: 'available'
})

const action = ref<'view' | 'create-another' | 'list'>('view')
const navigating = ref(false)

const { execute: createPet, loading, error } = useCreatePet({
  immediate: false,
  onSuccess: async (pet) => {
    navigating.value = true
    
    // Small delay for feedback
    await new Promise(resolve => setTimeout(resolve, 500))
    
    switch (action.value) {
      case 'view':
        router.push(`/pets/${pet.id}`)
        break
      
      case 'create-another':
        // Reset form
        form.name = ''
        form.species = ''
        form.age = 0
        form.status = 'available'
        navigating.value = false
        break
      
      case 'list':
        router.push('/pets')
        break
    }
  },
  onError: () => {
    navigating.value = false
  }
})

const handleSubmit = async () => {
  await createPet(form)
}

const isSubmitting = computed(() => loading.value || navigating.value)
</script>

<template>
  <div class="create-pet-page">
    <h1>Create New Pet</h1>
    
    <form @submit.prevent="handleSubmit" class="pet-form">
      <div class="form-group">
        <label>Name *</label>
        <input v-model="form.name" required />
      </div>
      
      <div class="form-group">
        <label>Species *</label>
        <select v-model="form.species" required>
          <option value="">Select species</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
        </select>
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
      
      <div v-if="error" class="error-message">
        {{ error.message }}
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          @click="action = 'view'"
          :disabled="isSubmitting"
          class="btn-primary"
        >
          <span v-if="loading">Creating...</span>
          <span v-else-if="navigating">Redirecting...</span>
          <span v-else>Create & View</span>
        </button>
        
        <button 
          type="submit"
          @click="action = 'create-another'"
          :disabled="isSubmitting"
          class="btn-secondary"
        >
          Create & Add Another
        </button>
        
        <button 
          type="submit"
          @click="action = 'list'"
          :disabled="isSubmitting"
          class="btn-secondary"
        >
          Create & Go to List
        </button>
        
        <NuxtLink to="/pets" class="btn-cancel">
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-pet-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.pet-form {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c00;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 30px;
}

.form-actions button,
.form-actions a {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  grid-column: 1 / -1;
  background: #28a745;
  color: white;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: #218838;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-cancel {
  background: white;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-cancel:hover {
  background: #f8f9fa;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

## Next Steps

- [Error Toast →](/examples/composables/callbacks/error-toast)
- [Request Logging →](/examples/composables/callbacks/request-logging)
- [Callbacks Guide →](/composables/features/callbacks/overview)
