# Error Toast

Display error notifications using callbacks when requests fail.

## Basic Error Toast

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const { data: pets, error, loading } = useFetchPets({
  onError: (error) => {
    toast.error(`Failed to load pets: ${error.message}`)
  }
})
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }}
      </div>
    </div>
  </div>
</template>
```

## Error Toast with Actions

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const form = reactive({
  name: '',
  species: ''
})

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onError: (error) => {
    toast.error(error.message, {
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => createPet(form)
      }
    })
  },
  onSuccess: () => {
    toast.success('Pet created successfully!')
    form.name = ''
    form.species = ''
  }
})
</script>

<template>
  <form @submit.prevent="() => createPet(form)">
    <input v-model="form.name" placeholder="Name" required />
    <input v-model="form.species" placeholder="Species" required />
    <button type="submit" :disabled="loading">Create Pet</button>
  </form>
</template>
```

## Custom Error Messages by Status Code

```vue
<script setup lang="ts">
import { useFetchPet } from '~/composables/pets'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()

const { data: pet, loading } = useFetchPet(route.params.id, {
  onError: (error) => {
    let message = 'An error occurred'
    
    switch (error.statusCode) {
      case 404:
        message = 'Pet not found'
        break
      case 403:
        message = 'You do not have permission to view this pet'
        break
      case 500:
        message = 'Server error. Please try again later.'
        break
      case 401:
        message = 'Please login to continue'
        break
      default:
        message = error.message || 'Unknown error'
    }
    
    toast.error(message)
  }
})
</script>
```

## Simple Toast Composable

```typescript
// composables/useToast.ts
export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])
  
  const show = (message: string, type: 'success' | 'error' | 'info' | 'warning', options = {}) => {
    const id = Date.now()
    const toast = {
      id,
      message,
      type,
      duration: options.duration || 3000,
      action: options.action
    }
    
    toasts.value.push(toast)
    
    // Auto remove after duration
    setTimeout(() => {
      remove(id)
    }, toast.duration)
    
    return id
  }
  
  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  return {
    toasts: readonly(toasts),
    success: (message: string, options?) => show(message, 'success', options),
    error: (message: string, options?) => show(message, 'error', options),
    info: (message: string, options?) => show(message, 'info', options),
    warning: (message: string, options?) => show(message, 'warning', options),
    remove
  }
}
```

## Toast Container Component

```vue
<!-- components/ToastContainer.vue -->
<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        <div class="toast-content">
          <span class="toast-icon">
            <span v-if="toast.type === 'success'">✓</span>
            <span v-else-if="toast.type === 'error'">✕</span>
            <span v-else-if="toast.type === 'warning'">⚠</span>
            <span v-else>ℹ</span>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        
        <div class="toast-actions">
          <button 
            v-if="toast.action"
            @click="toast.action.onClick"
            class="toast-action-btn"
          >
            {{ toast.action.label }}
          </button>
          <button @click="remove(toast.id)" class="toast-close">
            ×
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background: white;
  min-width: 300px;
}

.toast-success {
  border-left: 4px solid #28a745;
}

.toast-error {
  border-left: 4px solid #dc3545;
}

.toast-warning {
  border-left: 4px solid #ffc107;
}

.toast-info {
  border-left: 4px solid #17a2b8;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toast-icon {
  font-size: 1.2em;
  font-weight: bold;
}

.toast-success .toast-icon {
  color: #28a745;
}

.toast-error .toast-icon {
  color: #dc3545;
}

.toast-warning .toast-icon {
  color: #ffc107;
}

.toast-info .toast-icon {
  color: #17a2b8;
}

.toast-message {
  flex: 1;
  font-size: 0.95em;
}

.toast-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.toast-action-btn {
  padding: 4px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.toast-close:hover {
  color: #000;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
```

## Add to App Layout

```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
    <ToastContainer />
  </div>
</template>
```

## Validation Errors Toast

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const form = reactive({
  name: '',
  species: '',
  age: 0
})

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onError: (error) => {
    // Handle validation errors
    if (error.statusCode === 422 && error.data?.errors) {
      const validationErrors = error.data.errors
      
      Object.entries(validationErrors).forEach(([field, messages]) => {
        toast.error(`${field}: ${messages[0]}`)
      })
    } else {
      toast.error(error.message)
    }
  },
  onSuccess: () => {
    toast.success('Pet created successfully!')
  }
})
</script>
```

## Network Error Toast

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const { data: pets, loading, refresh } = useFetchPets({
  onError: (error) => {
    // Check if network error
    if (!navigator.onLine) {
      toast.error('No internet connection', {
        action: {
          label: 'Retry',
          onClick: () => refresh()
        }
      })
    } else {
      toast.error(`Failed to load pets: ${error.message}`, {
        action: {
          label: 'Retry',
          onClick: () => refresh()
        }
      })
    }
  }
})

// Listen for online/offline events
if (process.client) {
  window.addEventListener('online', () => {
    toast.info('Connection restored')
    refresh()
  })
  
  window.addEventListener('offline', () => {
    toast.warning('Connection lost')
  })
}
</script>
```

## Complete Example with Form

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'
import { useToast } from '~/composables/useToast'

const router = useRouter()
const toast = useToast()

const form = reactive({
  name: '',
  species: '',
  age: 0,
  description: ''
})

const formErrors = reactive({
  name: '',
  species: '',
  age: ''
})

const validateForm = (): boolean => {
  formErrors.name = ''
  formErrors.species = ''
  formErrors.age = ''
  
  let isValid = true
  
  if (!form.name.trim()) {
    formErrors.name = 'Name is required'
    isValid = false
  }
  
  if (!form.species.trim()) {
    formErrors.species = 'Species is required'
    isValid = false
  }
  
  if (form.age < 0) {
    formErrors.age = 'Age cannot be negative'
    isValid = false
  }
  
  return isValid
}

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onSuccess: (pet) => {
    toast.success('Pet created successfully!', {
      duration: 3000
    })
    
    setTimeout(() => {
      router.push(`/pets/${pet.id}`)
    }, 1000)
  },
  onError: (error) => {
    if (error.statusCode === 422) {
      toast.error('Please check the form for errors')
    } else if (error.statusCode === 409) {
      toast.error('A pet with this name already exists')
    } else if (error.statusCode === 500) {
      toast.error('Server error. Please try again later.', {
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: handleSubmit
        }
      })
    } else {
      toast.error(`Error: ${error.message}`)
    }
  }
})

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.warning('Please fix the form errors')
    return
  }
  
  await createPet(form)
}
</script>

<template>
  <div class="create-pet-form">
    <h1>Create New Pet</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Name *</label>
        <input v-model="form.name" :class="{ error: formErrors.name }" />
        <span v-if="formErrors.name" class="error-text">
          {{ formErrors.name }}
        </span>
      </div>
      
      <div class="form-group">
        <label>Species *</label>
        <input v-model="form.species" :class="{ error: formErrors.species }" />
        <span v-if="formErrors.species" class="error-text">
          {{ formErrors.species }}
        </span>
      </div>
      
      <div class="form-group">
        <label>Age</label>
        <input 
          v-model.number="form.age" 
          type="number" 
          :class="{ error: formErrors.age }"
        />
        <span v-if="formErrors.age" class="error-text">
          {{ formErrors.age }}
        </span>
      </div>
      
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="form.description" rows="4"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating...' : 'Create Pet' }}
        </button>
        <NuxtLink to="/pets">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-pet-form {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input.error {
  border-color: #dc3545;
}

.error-text {
  display: block;
  color: #dc3545;
  font-size: 0.85em;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.form-actions button {
  flex: 1;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions a {
  flex: 1;
  padding: 12px;
  background: #6c757d;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
}
</style>
```

## Next Steps

- [Loading Spinner →](/examples/composables/callbacks/loading-spinner)
- [Request Logging →](/examples/composables/callbacks/request-logging)
- [Global Callbacks →](/examples/composables/global-callbacks/)
- [Callbacks Guide →](/composables/features/callbacks/overview)
