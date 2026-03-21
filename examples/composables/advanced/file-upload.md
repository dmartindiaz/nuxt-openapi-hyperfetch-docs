# File Upload

Upload files with progress tracking and validation.

## Basic File Upload

```vue
<script setup lang="ts">
import { useUploadPetPhoto } from '~/composables/pets'

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const { execute: upload, loading, error } = useUploadPetPhoto({
  immediate: false,
  onSuccess: () => {
    selectedFile.value = null
    previewUrl.value = null
  }
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  
  const formData = new FormData()
  formData.append('photo', selectedFile.value)
  
  await upload(1, formData)
}
</script>

<template>
  <div>
    <input type="file" accept="image/*" @change="handleFileSelect" />
    
    <div v-if="previewUrl" class="preview">
      <img :src="previewUrl" alt="Preview" />
    </div>
    
    <button @click="handleUpload" :disabled="!selectedFile || loading">
      {{ loading ? 'Uploading...' : 'Upload' }}
    </button>
    
    <div v-if="error" class="error">{{ error.message }}</div>
  </div>
</template>
```

## Upload with Progress

```vue
<script setup lang="ts">
const selectedFile = ref<File | null>(null)
const uploadProgress = ref(0)
const uploading = ref(false)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

const uploadFile = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  uploadProgress.value = 0
  
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  
  // Use XMLHttpRequest for progress tracking
  const xhr = new XMLHttpRequest()
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      uploadProgress.value = Math.round((e.loaded / e.total) * 100)
    }
  })
  
  xhr.addEventListener('load', () => {
    uploading.value = false
    if (xhr.status === 200) {
      useToast().success('File uploaded successfully!')
      selectedFile.value = null
      uploadProgress.value = 0
    }
  })
  
  xhr.open('POST', '/api/upload')
  xhr.send(formData)
}
</script>

<template>
  <div>
    <input type="file" @change="handleFileSelect" :disabled="uploading" />
    
    <div v-if="uploading" class="progress">
      <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
      <span>{{ uploadProgress }}%</span>
    </div>
    
    <button @click="uploadFile" :disabled="!selectedFile || uploading">
      Upload
    </button>
  </div>
</template>
```

## Multiple Files Upload

```vue
<script setup lang="ts">
const files = ref<File[]>([])
const uploadingFiles = ref<Map<string, number>>(new Map())

const handleFilesSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    files.value = Array.from(target.files)
  }
}

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  uploadingFiles.value.set(file.name, 0)
  
  const xhr = new XMLHttpRequest()
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const progress = Math.round((e.loaded / e.total) * 100)
      uploadingFiles.value.set(file.name, progress)
    }
  })
  
  xhr.addEventListener('load', () => {
    uploadingFiles.value.delete(file.name)
  })
  
  xhr.open('POST', '/api/upload')
  xhr.send(formData)
}

const uploadAll = async () => {
  await Promise.all(files.value.map(file => uploadFile(file)))
}
</script>

<template>
  <div>
    <input type="file" multiple @change="handleFilesSelect" />
    
    <ul>
      <li v-for="file in files" :key="file.name">
        {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
        <div v-if="uploadingFiles.has(file.name)" class="progress">
          {{ uploadingFiles.get(file.name) }}%
        </div>
      </li>
    </ul>
    
    <button @click="uploadAll" :disabled="files.length === 0">
      Upload All
    </button>
  </div>
</template>
```

## File Validation

```vue
<script setup lang="ts">
const maxSize = 5 * 1024 * 1024 // 5MB
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

const validateFile = (file: File): string | null => {
  if (file.size > maxSize) {
    return `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`
  }
  
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Only JPEG, PNG, and GIF are allowed'
  }
  
  return null
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const error = validateFile(file)
    if (error) {
      useToast().error(error)
      target.value = ''
      return
    }
    
    selectedFile.value = file
  }
}
</script>
```

## Drag and Drop Upload

```vue
<script setup lang="ts">
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}
</script>

<template>
  <div 
    class="dropzone"
    :class="{ dragging: isDragging }"
    @drop.prevent="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <p v-if="!selectedFile">
      Drag and drop a file here or click to select
    </p>
    <p v-else>
      {{ selectedFile.name }}
    </p>
    <input type="file" @change="handleFileSelect" hidden ref="fileInput" />
    <button @click="$refs.fileInput.click()">Select File</button>
  </div>
</template>

<style scoped>
.dropzone {
  border: 2px dashed #ccc;
  padding: 40px;
  text-align: center;
  cursor: pointer;
}

.dropzone.dragging {
  border-color: #007bff;
  background: #f0f8ff;
}
</style>
```

## Next Steps

- [Pagination →](/examples/composables/advanced/pagination)
- [Caching →](/examples/composables/advanced/caching)
- [Authentication Flow →](/examples/composables/advanced/authentication-flow)
