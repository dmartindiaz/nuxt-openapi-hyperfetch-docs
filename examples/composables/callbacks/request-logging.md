# Request Logging

Log API requests for debugging, analytics, and monitoring using callbacks.

## Basic Request Logging

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

const { data: pets } = useFetchPets({
  onRequest: ({ url, options }) => {
    console.log('[Request]', url, options)
  },
  onResponse: ({ url, response }) => {
    console.log('[Response]', url, response.status)
  },
  onError: ({ url, error }) => {
    console.error('[Error]', url, error)
  }
})
</script>
```

## Structured Logger

```typescript
// composables/useLogger.ts
export function useLogger() {
  const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    }
    
    // Log to console
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[${timestamp}] [${level.toUpperCase()}]`,
      message,
      data
    )
    
    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // sendToLoggingService(logEntry)
    }
    
    return logEntry
  }
  
  return {
    info: (message: string, data?: any) => log('info', message, data),
    warn: (message: string, data?: any) => log('warn', message, data),
    error: (message: string, data?: any) => log('error', message, data)
  }
}
```

## Log API Requests

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useLogger } from '~/composables/useLogger'

const logger = useLogger()

const { data: pets } = useFetchPets({
  onRequest: ({ url, options }) => {
    logger.info('API Request', {
      url,
      method: options.method || 'GET',
      headers: options.headers
    })
  },
  onResponse: ({ url, response }) => {
    logger.info('API Response', {
      url,
      status: response.status,
      duration: response.headers.get('x-response-time')
    })
  },
  onError: ({ url, error }) => {
    logger.error('API Error', {
      url,
      status: error.statusCode,
      message: error.message
    })
  }
})
</script>
```

## Performance Monitoring

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'

let requestStartTime: number

const { data: pets } = useFetchPets({
  onRequest: ({ url }) => {
    requestStartTime = Date.now()
    console.log(`[${new Date().toISOString()}] Starting request to ${url}`)
  },
  onResponse: ({ url }) => {
    const duration = Date.now() - requestStartTime
    console.log(`[${new Date().toISOString()}] Request completed in ${duration}ms`)
    
    // Warn if slow
    if (duration > 1000) {
      console.warn(`Slow request detected: ${url} took ${duration}ms`)
    }
  }
})
</script>
```

## Analytics Tracking

```vue
<script setup lang="ts">
import { useCreatePet } from '~/composables/pets'
import { useAnalytics } from '~/composables/useAnalytics'

const analytics = useAnalytics()

const form = reactive({
  name: '',
  species: ''
})

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onRequest: () => {
    analytics.track('pet_create_started', {
      species: form.species
    })
  },
  onSuccess: (pet) => {
    analytics.track('pet_create_success', {
      petId: pet.id,
      species: pet.species
    })
  },
  onError: (error) => {
    analytics.track('pet_create_failed', {
      error: error.message,
      statusCode: error.statusCode
    })
  }
})
</script>
```

## Error Reporting Service

```typescript
// composables/useErrorReporter.ts
export function useErrorReporter() {
  const report = (error: any, context?: any) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      url: error.url,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...context
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', errorReport)
    }
    
    // Send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorReport })
    }
    
    return errorReport
  }
  
  return { report }
}
```

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useErrorReporter } from '~/composables/useErrorReporter'

const errorReporter = useErrorReporter()

const { data: pets } = useFetchPets({
  onError: ({ error }) => {
    errorReporter.report(error, {
      component: 'PetsPage',
      action: 'fetch_pets'
    })
  }
})
</script>
```

## Request History

```typescript
// composables/useRequestHistory.ts
interface RequestLog {
  id: string
  url: string
  method: string
  status?: number
  duration?: number
  error?: string
  timestamp: Date
}

export function useRequestHistory() {
  const history = useState<RequestLog[]>('requestHistory', () => [])
  
  const add = (log: Omit<RequestLog, 'id' | 'timestamp'>) => {
    const entry: RequestLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    history.value.unshift(entry)
    
    // Keep only last 100 requests
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }
  }
  
  const clear = () => {
    history.value = []
  }
  
  return {
    history: readonly(history),
    add,
    clear
  }
}
```

```vue
<script setup lang="ts">
import { useFetchPets } from '~/composables/pets'
import { useRequestHistory } from '~/composables/useRequestHistory'

const requestHistory = useRequestHistory()
let startTime: number

const { data: pets } = useFetchPets({
  onRequest: ({ url, options }) => {
    startTime = Date.now()
    requestHistory.add({
      url,
      method: options.method || 'GET'
    })
  },
  onResponse: ({ url, response }) => {
    const duration = Date.now() - startTime
    requestHistory.add({
      url,
      method: 'GET',
      status: response.status,
      duration
    })
  },
  onError: ({ url, error }) => {
    const duration = Date.now() - startTime
    requestHistory.add({
      url,
      method: 'GET',
      status: error.statusCode,
      duration,
      error: error.message
    })
  }
})
</script>
```

## Request History Viewer Component

```vue
<!-- components/RequestHistory.vue -->
<script setup lang="ts">
import { useRequestHistory } from '~/composables/useRequestHistory'

const { history, clear } = useRequestHistory()

const getStatusColor = (status?: number) => {
  if (!status) return 'gray'
  if (status >= 200 && status < 300) return 'green'
  if (status >= 400 && status < 500) return 'orange'
  if (status >= 500) return 'red'
  return 'gray'
}
</script>

<template>
  <div class="request-history">
    <div class="header">
      <h3>Request History</h3>
      <button @click="clear">Clear</button>
    </div>
    
    <div class="history-list">
      <div 
        v-for="log in history" 
        :key="log.id" 
        class="history-item"
      >
        <div class="item-header">
          <span class="method">{{ log.method }}</span>
          <span class="url">{{ log.url }}</span>
          <span 
            class="status" 
            :style="{ color: getStatusColor(log.status) }"
          >
            {{ log.status || 'Pending' }}
          </span>
        </div>
        
        <div class="item-footer">
          <span class="timestamp">
            {{ log.timestamp.toLocaleTimeString() }}
          </span>
          <span v-if="log.duration" class="duration">
            {{ log.duration }}ms
          </span>
          <span v-if="log.error" class="error">
            {{ log.error }}
          </span>
        </div>
      </div>
      
      <div v-if="history.length === 0" class="empty">
        No requests yet
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-history {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 500px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
}

.header h3 {
  margin: 0;
  font-size: 1em;
}

.header button {
  padding: 5px 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
}

.history-list {
  max-height: 440px;
  overflow-y: auto;
}

.history-item {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.method {
  padding: 2px 6px;
  background: #007bff;
  color: white;
  border-radius: 3px;
  font-size: 0.75em;
  font-weight: bold;
}

.url {
  flex: 1;
  font-size: 0.85em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  font-weight: bold;
  font-size: 0.85em;
}

.item-footer {
  display: flex;
  gap: 15px;
  font-size: 0.75em;
  color: #666;
}

.duration {
  font-weight: 600;
}

.error {
  color: #dc3545;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>
```

## Development Debug Panel

```vue
<!-- components/DebugPanel.vue -->
<script setup lang="ts">
import { useRequestHistory } from '~/composables/useRequestHistory'

const { history } = useRequestHistory()
const show = ref(false)

// Toggle with Ctrl+Shift+L
if (process.client) {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      show.value = !show.value
    }
  })
}
</script>

<template>
  <div v-if="show && process.env.NODE_ENV === 'development'" class="debug-panel">
    <div class="panel-header">
      <h3>Debug Panel</h3>
      <button @click="show = false">×</button>
    </div>
    
    <div class="panel-content">
      <RequestHistory />
    </div>
  </div>
</template>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background: white;
  border-top: 2px solid #007bff;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
  z-index: 9999;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #007bff;
  color: white;
}

.panel-header button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
}

.panel-content {
  height: calc(100% - 50px);
  overflow-y: auto;
  padding: 20px;
}
</style>
```

## Complete Example

```vue
<script setup lang="ts">
import { useFetchPets, useCreatePet } from '~/composables/pets'
import { useLogger } from '~/composables/useLogger'
import { useAnalytics } from '~/composables/useAnalytics'
import { useRequestHistory } from '~/composables/useRequestHistory'

const logger = useLogger()
const analytics = useAnalytics()
const requestHistory = useRequestHistory()

// Fetch pets with full logging
let fetchStartTime: number

const { data: pets, refresh } = useFetchPets({
  onRequest: ({ url, options }) => {
    fetchStartTime = Date.now()
    
    logger.info('Fetching pets', { url, method: options.method })
    analytics.track('pets_fetch_started')
    requestHistory.add({ url, method: 'GET' })
  },
  onResponse: ({ url, response }) => {
    const duration = Date.now() - fetchStartTime
    
    logger.info('Pets fetched successfully', {
      url,
      status: response.status,
      duration
    })
    
    analytics.track('pets_fetch_success', { duration })
    requestHistory.add({
      url,
      method: 'GET',
      status: response.status,
      duration
    })
  },
  onError: ({ url, error }) => {
    const duration = Date.now() - fetchStartTime
    
    logger.error('Failed to fetch pets', {
      url,
      error: error.message,
      status: error.statusCode,
      duration
    })
    
    analytics.track('pets_fetch_failed', {
      error: error.message,
      status: error.statusCode
    })
    
    requestHistory.add({
      url,
      method: 'GET',
      status: error.statusCode,
      duration,
      error: error.message
    })
  }
})

// Create pet with logging
const form = reactive({
  name: '',
  species: ''
})

let createStartTime: number

const { execute: createPet, loading } = useCreatePet({
  immediate: false,
  onRequest: ({ url, options }) => {
    createStartTime = Date.now()
    
    logger.info('Creating pet', {
      url,
      data: options.body
    })
    
    analytics.track('pet_create_started', {
      species: form.species
    })
  },
  onSuccess: (pet) => {
    const duration = Date.now() - createStartTime
    
    logger.info('Pet created', {
      petId: pet.id,
      duration
    })
    
    analytics.track('pet_create_success', {
      petId: pet.id,
      species: pet.species,
      duration
    })
    
    form.name = ''
    form.species = ''
    refresh()
  },
  onError: (error) => {
    const duration = Date.now() - createStartTime
    
    logger.error('Failed to create pet', {
      error: error.message,
      status: error.statusCode,
      duration
    })
    
    analytics.track('pet_create_failed', {
      error: error.message,
      status: error.statusCode
    })
  }
})

const handleSubmit = async () => {
  await createPet(form)
}
</script>

<template>
  <div class="pets-page">
    <h1>Pets Management</h1>
    
    <form @submit.prevent="handleSubmit">
      <input v-model="form.name" placeholder="Name" required />
      <input v-model="form.species" placeholder="Species" required />
      <button type="submit" :disabled="loading">Create</button>
    </form>
    
    <div class="pets-list">
      <div v-for="pet in pets" :key="pet.id">
        {{ pet.name }} - {{ pet.species }}
      </div>
    </div>
    
    <!-- Debug panel (development only) -->
    <DebugPanel v-if="process.env.NODE_ENV === 'development'" />
  </div>
</template>
```

## Next Steps

- [Global Callbacks →](/examples/composables/global-callbacks/)
- [Advanced Patterns →](/examples/composables/advanced/)
- [Callbacks Guide →](/guide/composables/callbacks)
