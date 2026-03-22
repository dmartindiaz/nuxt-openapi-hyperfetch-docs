# POST Request

Creating resources with POST requests using generated composables.

## Basic POST Request

```vue
<script setup lang="ts">
import { useFetchCreatePet } from '~/composables/pets'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  name: '',
  species: '',
  age: 0,
  status: 'available'
})

const { execute: createPet, loading, error } = useFetchCreatePet({
  immediate: false,
  onSuccess: (pet) => {
    router.push(`/pets/${pet.id}`)
  }
})

const handleSubmit = async () => {
  await createPet(form)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>Name</label>
      <input v-model="form.name" required />
    </div>
    
    <div>
      <label>Species</label>
      <input v-model="form.species" required />
    </div>
    
    <div>
      <label>Age</label>
      <input v-model.number="form.age" type="number" min="0" />
    </div>
    
    <div>
      <label>Status</label>
      <select v-model="form.status">
        <option value="available">Available</option>
        <option value="pending">Pending</option>
        <option value="sold">Sold</option>
      </select>
    </div>
    
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Creating...' : 'Create Pet' }}
    </button>
  </form>
</template>
```

## With Validation

```vue
<script setup lang="ts">
import { useFetchCreatePet } from '~/composables/pets'

const form = reactive({
  name: '',
  species: '',
  age: 0,
  description: ''
})

const validationErrors = reactive({
  name: '',
  species: '',
  age: ''
})

const validateForm = (): boolean => {
  // Reset errors
  validationErrors.name = ''
  validationErrors.species = ''
  validationErrors.age = ''
  
  let isValid = true
  
  // Validate name
  if (!form.name.trim()) {
    validationErrors.name = 'Name is required'
    isValid = false
  } else if (form.name.length < 2) {
    validationErrors.name = 'Name must be at least 2 characters'
    isValid = false
  }
  
  // Validate species
  if (!form.species.trim()) {
    validationErrors.species = 'Species is required'
    isValid = false
  }
  
  // Validate age
  if (form.age < 0) {
    validationErrors.age = 'Age must be positive'
    isValid = false
  } else if (form.age > 50) {
    validationErrors.age = 'Age seems too high'
    isValid = false
  }
  
  return isValid
}

const { execute: createPet, loading, error } = useFetchCreatePet({
  immediate: false,
  onSuccess: () => {
    // Reset form
    form.name = ''
    form.species = ''
    form.age = 0
    form.description = ''
    
    alert('Pet created successfully!')
  }
})

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  await createPet(form)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="pet-form">
    <div class="form-group">
      <label>Name *</label>
      <input v-model="form.name" />
      <span v-if="validationErrors.name" class="error">
        {{ validationErrors.name }}
      </span>
    </div>
    
    <div class="form-group">
      <label>Species *</label>
      <input v-model="form.species" />
      <span v-if="validationErrors.species" class="error">
        {{ validationErrors.species }}
      </span>
    </div>
    
    <div class="form-group">
      <label>Age</label>
      <input v-model.number="form.age" type="number" min="0" />
      <span v-if="validationErrors.age" class="error">
        {{ validationErrors.age }}
      </span>
    </div>
    
    <div class="form-group">
      <label>Description</label>
      <textarea v-model="form.description" rows="4"></textarea>
    </div>
    
    <div v-if="error" class="api-error">
      {{ error.message }}
    </div>
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Creating...' : 'Create Pet' }}
    </button>
  </form>
</template>

<style scoped>
.pet-form {
  max-width: 500px;
  margin: 0 auto;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error {
  display: block;
  color: #dc3545;
  font-size: 0.85em;
  margin-top: 5px;
}

.api-error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

button {
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

## File Upload

```vue
<script setup lang="ts">
import { useFetchCreatePet, useFetchUploadPetPhoto } from '~/composables/pets'

const form = reactive({
  name: '',
  species: '',
  age: 0
})

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

// Create pet
const { 
  execute: createPet, 
  loading: creating, 
  error: createError 
} = useFetchCreatePet({ immediate: false })

// Upload photo
const { 
  execute: uploadPhoto, 
  loading: uploading,
  error: uploadError 
} = useFetchUploadPetPhoto({ immediate: false })

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleSubmit = async () => {
  // First, create the pet
  const pet = await createPet(form)
  
  if (!pet) return
  
  // Then upload photo if selected
  if (selectedFile.value) {
    const formData = new FormData()
    formData.append('photo', selectedFile.value)
    
    await uploadPhoto(pet.id, formData)
  }
  
  // Navigate to pet detail
  navigateTo(`/pets/${pet.id}`)
}

const loading = computed(() => creating.value || uploading.value)
const error = computed(() => createError.value || uploadError.value)
</script>

<template>
  <form @submit.prevent="handleSubmit" class="upload-form">
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
      <input v-model.number="form.age" type="number" />
    </div>
    
    <div class="form-group">
      <label>Photo</label>
      <input 
        type="file" 
        accept="image/*" 
        @change="handleFileSelect"
      />
      
      <div v-if="previewUrl" class="preview">
        <img :src="previewUrl" alt="Preview" />
      </div>
    </div>
    
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
    
    <button type="submit" :disabled="loading">
      <span v-if="creating">Creating pet...</span>
      <span v-else-if="uploading">Uploading photo...</span>
      <span v-else>Create Pet</span>
    </button>
  </form>
</template>

<style scoped>
.preview {
  margin-top: 10px;
}

.preview img {
  max-width: 200px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
</style>
```

## Multi-Step Form

```vue
<script setup lang="ts">
import { useFetchCreatePet } from '~/composables/pets'

const currentStep = ref(1)

const form = reactive({
  // Step 1: Basic Info
  name: '',
  species: '',
  breed: '',
  
  // Step 2: Details
  age: 0,
  weight: 0,
  color: '',
  
  // Step 3: Additional
  description: '',
  specialNeeds: '',
  vaccinated: false
})

const { execute: createPet, loading, error } = useFetchCreatePet({
  immediate: false,
  onSuccess: (pet) => {
    navigateTo(`/pets/${pet.id}`)
  }
})

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  await createPet(form)
}
</script>

<template>
  <div class="multi-step-form">
    <!-- Progress Indicator -->
    <div class="steps">
      <div :class="['step', { active: currentStep >= 1 }]">
        1. Basic Info
      </div>
      <div :class="['step', { active: currentStep >= 2 }]">
        2. Details
      </div>
      <div :class="['step', { active: currentStep >= 3 }]">
        3. Additional
      </div>
    </div>
    
    <form @submit.prevent="handleSubmit">
      <!-- Step 1: Basic Info -->
      <div v-show="currentStep === 1" class="form-step">
        <h2>Basic Information</h2>
        
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
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Breed</label>
          <input v-model="form.breed" />
        </div>
        
        <div class="form-actions">
          <button type="button" @click="nextStep">
            Next →
          </button>
        </div>
      </div>
      
      <!-- Step 2: Details -->
      <div v-show="currentStep === 2" class="form-step">
        <h2>Pet Details</h2>
        
        <div class="form-group">
          <label>Age (years)</label>
          <input v-model.number="form.age" type="number" min="0" />
        </div>
        
        <div class="form-group">
          <label>Weight (kg)</label>
          <input v-model.number="form.weight" type="number" min="0" step="0.1" />
        </div>
        
        <div class="form-group">
          <label>Color</label>
          <input v-model="form.color" />
        </div>
        
        <div class="form-actions">
          <button type="button" @click="prevStep">
            ← Back
          </button>
          <button type="button" @click="nextStep">
            Next →
          </button>
        </div>
      </div>
      
      <!-- Step 3: Additional -->
      <div v-show="currentStep === 3" class="form-step">
        <h2>Additional Information</h2>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="4"></textarea>
        </div>
        
        <div class="form-group">
          <label>Special Needs</label>
          <textarea v-model="form.specialNeeds" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <label>
            <input v-model="form.vaccinated" type="checkbox" />
            Vaccinated
          </label>
        </div>
        
        <div v-if="error" class="error">
          {{ error.message }}
        </div>
        
        <div class="form-actions">
          <button type="button" @click="prevStep">
            ← Back
          </button>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Pet' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.multi-step-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.step {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  text-align: center;
  border-radius: 4px;
  margin: 0 5px;
  opacity: 0.5;
}

.step.active {
  background: #007bff;
  color: white;
  opacity: 1;
}

.form-step {
  min-height: 400px;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-top: 30px;
}

.form-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.form-actions button[type="button"] {
  background: #6c757d;
  color: white;
}

.form-actions button[type="submit"] {
  background: #28a745;
  color: white;
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}
</style>
```

## Optimistic Update

```vue
<script setup lang="ts">
import { useFetchGetPets, useFetchCreatePet } from '~/composables/pets'

// Fetch existing pets
const { data: pets, refresh } = await useFetchGetPets()

const form = reactive({
  name: '',
  species: '',
  status: 'available'
})

const { execute: createPet, loading, error } = useFetchCreatePet({
  immediate: false
})

const handleSubmit = async () => {
  // Store form data
  const newPet = { ...form, id: Date.now() }
  
  // Optimistic update: Add to list immediately
  if (pets.value) {
    pets.value = [...pets.value, newPet]
  }
  
  // Clear form
  form.name = ''
  form.species = ''
  
  try {
    // Make actual API call
    const createdPet = await createPet(newPet)
    
    // Update with real data
    if (pets.value && createdPet) {
      const index = pets.value.findIndex(p => p.id === newPet.id)
      if (index > -1) {
        pets.value[index] = createdPet
      }
    }
  } catch (err) {
    // Revert optimistic update on error
    if (pets.value) {
      pets.value = pets.value.filter(p => p.id !== newPet.id)
    }
  }
}
</script>

<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="form.name" placeholder="Name" required />
      <input v-model="form.species" placeholder="Species" required />
      <button type="submit" :disabled="loading">Add Pet</button>
    </form>
    
    <div v-if="error" class="error">{{ error.message }}</div>
    
    <ul>
      <li v-for="pet in pets" :key="pet.id">
        {{ pet.name }} - {{ pet.species }}
      </li>
    </ul>
  </div>
</template>
```

## Next Steps

- [Callbacks →](/examples/composables/callbacks/)
- [Global Callbacks →](/examples/composables/global-callbacks/)
- [Advanced Patterns →](/examples/composables/advanced/)
- [Composables Guide →](/composables/)
