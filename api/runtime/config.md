# Runtime Configuration

Configure runtime behavior of generated composables in your Nuxt app.

## Nuxt Config

Configure in `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-side only
    apiSecret: process.env.API_SECRET,
    
    // Exposed to client
    public: {
      apiBase: process.env.API_BASE_URL || 'https://api.example.com'
    }
  }
})
```

## Base URL Configuration

### Static Base URL

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: 'https://api.production.com'
    }
  }
})
```

### Environment Variables

```bash
# .env
API_BASE_URL=http://localhost:3001
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL
    }
  }
})
```

### Multiple Environments

```bash
# .env.development
API_BASE_URL=http://localhost:3001

# .env.production
API_BASE_URL=https://api.production.com

# .env.staging
API_BASE_URL=https://api.staging.com
```

## Access Runtime Config

### In Composables

```typescript
// composables/pets/useFetchPet.ts
export function useFetchPet(id: MaybeRef<number>) {
  const config = useRuntimeConfig()
  
  return useFetch<Pet>(
    () => `/pets/${unref(id)}`,
    {
      baseURL: config.public.apiBase
    }
  )
}
```

### In Components

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
console.log('API Base:', config.public.apiBase)

const { data: pet } = useFetchPet(1)
</script>
```

### In Server Routes

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const pet = await $fetch(`/pets/${id}`, {
    baseURL: config.apiBase // Server-side config
  })
  
  return pet
})
```

## Custom Configuration

Add custom options for generated composables:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      api: {
        base: 'https://api.example.com',
        timeout: 30000,
        retries: 3
      }
    }
  }
})
```

```typescript
// composables/pets/useFetchPet.ts
export function useFetchPet(id: MaybeRef<number>) {
  const config = useRuntimeConfig()
  
  return useFetch<Pet>(
    () => `/pets/${unref(id)}`,
    {
      baseURL: config.public.api.base,
      timeout: config.public.api.timeout,
      retry: config.public.api.retries
    }
  )
}
```

## Override at Runtime

### Per Request

```vue
<script setup lang="ts">
const { data: pet } = useFetchPet(1, {
  baseURL: 'https://api.staging.com' // Override
})
</script>
```

### Global Override

```typescript
// plugins/api-config.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Override based on hostname
  if (window.location.hostname.includes('staging')) {
    config.public.apiBase = 'https://api.staging.com'
  }
})
```

## Type Safety

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: ''
    }
  }
})
```

```typescript
// Access with type safety
const config = useRuntimeConfig()
config.public.apiBase
//            ^? string
```

## Next Steps

- [Plugin Configuration →](/api/runtime/plugins)
- [CLI Options →](/api/cli/options)
- [Getting Started →](/guide/getting-started)
