# Runtime Errors

Solutions for errors that occur during application runtime.

## Network Errors

### API Not Reachable

```bash
FetchError: Failed to fetch
cause: Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Cause:** Backend API not running or wrong URL

**Solution:**

```typescript
// 1. Verify backend is running
// curl http://localhost:8080/api/pets

// 2. Configure correct baseURL
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8080'  // ✅ Correct URL
    }
  }
})

// 3. Use in composable
const config = useRuntimeConfig()
const { data } = useFetchPets({
  baseURL: config.public.apiBase
})
```

### CORS Error

```bash
Access to fetch at 'https://api.example.com/pets' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Cause:** Backend doesn't allow requests from your origin

**Solution:**

```typescript
// Option 1: Configure CORS on backend (preferred)
// Express example:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

// Option 2: Use server route as proxy
// server/api/pets.ts
export default defineEventHandler(async (event) => {
  const data = await $fetch('https://api.example.com/pets', {
    headers: getProxyHeaders(event)
  })
  return data
})

// Then use local endpoint
const { data } = useFetch('/api/pets')  // ✅ No CORS issue
```

### DNS Resolution Failed

```bash
FetchError: getaddrinfo ENOTFOUND api.example.com
```

**Cause:** Invalid domain or network issue

**Solution:**

```bash
# Test DNS resolution
ping api.example.com
nslookup api.example.com

# Check URL is correct
echo $NUXT_PUBLIC_API_BASE

# Try with IP address temporarily
NUXT_PUBLIC_API_BASE=http://192.168.1.100:8080 npm run dev
```

## HTTP Status Errors

### 404 Not Found

```bash
FetchError: 404 Not Found
```

**Cause:** Wrong endpoint or resource doesn't exist

**Solution:**

```typescript
// Check endpoint path
const { data, error } = useFetchPet(1)

if (error.value?.statusCode === 404) {
  // ✅ Handle 404 gracefully
  console.error('Pet not found')
}

// Verify endpoint in OpenAPI spec matches backend
// swagger.yaml:
paths:
  /pets/{id}:  # ✅ Must match actual backend route
    get:
      operationId: getPetById
```

### 401 Unauthorized

```bash
FetchError: 401 Unauthorized
```

**Cause:** Missing or invalid authentication

**Solution:**

```typescript
// Client-side auth
const { data } = useFetchPet(1, {
  onRequest({ options }) {
    const token = localStorage.getItem('token')
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    }
  }
})

// Or use global callback plugin
// plugins/auth.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('apiCallbacks', {
    onRequest: (url, options) => {
      const token = localStorage.getItem('token')
      if (token) {
        options.headers.set('Authorization', `Bearer ${token}`)
      }
    },
    onError: (error) => {
      if (error.statusCode === 401) {
        // Redirect to login
        navigateTo('/login')
      }
    }
  })
})
```

### 403 Forbidden

```bash
FetchError: 403 Forbidden
```

**Cause:** User doesn't have permission

**Solution:**

```typescript
const { data, error } = useFetchPet(1)

if (error.value?.statusCode === 403) {
  // ✅ Handle permission error
  console.error('You do not have permission to view this pet')
  
  // Show error to user
  showError({
    statusCode: 403,
    message: 'Access denied'
  })
}
```

### 422 Validation Error

```bash
FetchError: 422 Unprocessable Entity
{
  "errors": {
    "name": ["Name is required"],
    "age": ["Age must be positive"]
  }
}
```

**Cause:** Request body validation failed

**Solution:**

```typescript
const { data, error } = useAsyncDataCreatePet('create', {
  name: '',  // ❌ Empty name
  age: -1    // ❌ Negative age
})

if (error.value?.statusCode === 422) {
  // ✅ Handle validation errors
  const errors = error.value.data?.errors
  
  if (errors) {
    Object.keys(errors).forEach(field => {
      console.error(`${field}: ${errors[field].join(', ')}`)
    })
  }
}

// Or validate before sending
const validatePet = (pet: CreatePetRequest) => {
  const errors: Record<string, string> = {}
  
  if (!pet.name?.trim()) {
    errors.name = 'Name is required'
  }
  
  if (pet.age < 0) {
    errors.age = 'Age must be positive'
  }
  
  return Object.keys(errors).length > 0 ? errors : null
}
```

### 500 Internal Server Error

```bash
FetchError: 500 Internal Server Error
```

**Cause:** Backend crashed or error

**Solution:**

```typescript
const { data, error } = useFetchPet(1, {
  onError(error) {
    if (error.statusCode === 500) {
      // ✅ Show user-friendly message
      console.error('Server error, please try again later')
      
      // Log for debugging
      console.error('Full error:', error)
    }
  }
})

// Add retry logic
const { data, error, execute } = useFetchPet(1, {
  immediate: false
})

const fetchWithRetry = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    await execute()
    
    if (!error.value || error.value.statusCode !== 500) {
      break
    }
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
  }
}
```

## Timeout Errors

### Request Timeout

```bash
FetchError: Request timeout
```

**Cause:** Request took too long

**Solution:**

```typescript
// Increase timeout
const { data } = useFetchPets({
  timeout: 30000  // ✅ 30 seconds
})

// Or handle timeout gracefully
const { data, error } = useFetchPets({
  timeout: 5000,
  onError(error) {
    if (error.message.includes('timeout')) {
      console.error('Request timed out, try again')
    }
  }
})
```

## Data Errors

### Invalid JSON Response

```bash
SyntaxError: Unexpected token < in JSON at position 0
```

**Cause:** Server returned HTML instead of JSON

**Solution:**

```typescript
// Check response content type
const { data, error } = useFetchPet(1, {
  onResponse({ response }) {
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      console.error('Expected JSON, got:', contentType)
      console.error('Response:', response._data)
    }
  }
})

// Backend should return proper content type
res.setHeader('Content-Type', 'application/json')
res.send(JSON.stringify(data))
```

### Type Mismatch at Runtime

```typescript
const { data } = useFetchPet(1)
// Expected: { id: 1, name: "Fluffy" }
// Got: { pet_id: 1, pet_name: "Fluffy" }
```

**Cause:** Backend response doesn't match OpenAPI spec

**Solution:**

```typescript
// Option 1: Fix backend to match spec

// Option 2: Transform response
const { data } = useFetchPet(1, {
  transform: (data: any) => ({
    id: data.pet_id,
    name: data.pet_name
  })
})

// Option 3: Update OpenAPI spec to match backend
Pet:
  properties:
    pet_id:    # ✅ Match actual response
      type: integer
    pet_name:  # ✅ Match actual response
      type: string
```

### Undefined Property Access

```bash
TypeError: Cannot read property 'name' of undefined
```

**Cause:** Accessing data before it's loaded

**Solution:**

```vue
<script setup lang="ts">
const { data, pending } = useFetchPet(1)
</script>

<template>
  <!-- ❌ Bad - data might be null -->
  <div>{{ data.name }}</div>

  <!-- ✅ Good - check if data exists -->
  <div v-if="data">{{ data.name }}</div>

  <!-- ✅ Good - show loading state -->
  <div v-if="pending">Loading...</div>
  <div v-else-if="data">{{ data.name }}</div>

  <!-- ✅ Good - optional chaining -->
  <div>{{ data?.name ?? 'Unknown' }}</div>
</template>
```

## SSR Errors

### Window is Not Defined

```bash
ReferenceError: window is not defined
```

**Cause:** Accessing browser-only API during SSR

**Solution:**

```typescript
// ❌ Bad - window not available in SSR
const token = window.localStorage.getItem('token')

// ✅ Good - check if client-side
if (process.client) {
  const token = window.localStorage.getItem('token')
}

// ✅ Or use onMounted
onMounted(() => {
  const token = window.localStorage.getItem('token')
})

// ✅ Or use cookie instead (works in SSR)
const token = useCookie('token')
```

### Hydration Mismatch

```bash
Hydration node mismatch
```

**Cause:** Server and client render different content

**Solution:**

```vue
<script setup lang="ts">
const { data, pending } = useFetchPet(1)
</script>

<template>
  <!-- ❌ Bad - different on server/client -->
  <ClientOnly>
    <div v-if="data">{{ data.name }}</div>
  </ClientOnly>

  <!-- ✅ Good - same on both -->
  <div v-if="!pending && data">{{ data.name }}</div>
  <div v-else-if="pending">Loading...</div>
</template>
```

## Memory Leaks

### Composable Not Cleaning Up

```bash
# Memory usage keeps increasing
```

**Cause:** Event listeners or timers not cleaned up

**Solution:**

```typescript
const { data, cancel } = useFetchPets()

// ✅ Clean up on unmount
onUnmounted(() => {
  cancel()
})

// ✅ Clean up intervals
const intervalId = setInterval(() => {
  execute()
}, 5000)

onUnmounted(() => {
  clearInterval(intervalId)
})
```

## Debugging Runtime Errors

### Enable Error Logging

```typescript
// plugins/error-logger.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (error) => {
    console.error('App error:', error)
  })
  
  nuxtApp.provide('apiCallbacks', {
    onError: (error, url) => {
      console.error('API error:', {
        url,
        status: error.statusCode,
        message: error.message,
        data: error.data
      })
    }
  })
})
```

### Use Browser DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Check failed requests
4. Look at **Response** tab
5. Check **Console** for errors

### Add Error Boundaries

```vue
<template>
  <NuxtErrorBoundary>
    <YourComponent />
    
    <template #error="{ error, clearError }">
      <div class="error">
        <p>Error: {{ error.message }}</p>
        <button @click="clearError">Try again</button>
      </div>
    </template>
  </NuxtErrorBoundary>
</template>
```

## Next Steps

- [Composables Issues →](/troubleshooting/composables-issues)
- [Server Issues →](/troubleshooting/server-issues)
- [Performance →](/troubleshooting/performance)
