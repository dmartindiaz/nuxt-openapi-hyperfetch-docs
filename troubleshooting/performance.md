# Performance

Optimize generation, build, and runtime performance.

## Generation Performance

### Slow Code Generation

```bash
# Generation takes minutes instead of seconds
```

**Cause:** Large OpenAPI spec or inefficient parsing

**Solution:**

```bash
# 1. Split large specs into smaller files
# Instead of one 10MB file, use multiple smaller specs

# 2. Remove unused schemas
# Delete schemas not referenced by any endpoint

# 3. Use specific operations only
# Generate only what you need
nxh generate -i swagger.yaml -o ./composables --include getPet,createPet

# 4. Disable formatting during generation (if available)
nxh generate -i swagger.yaml -o ./composables --no-format

# Then format afterwards
prettier --write composables/**/*.ts
```

### Memory Usage During Generation

```bash
JavaScript heap out of memory during generation
```

**Cause:** Very large OpenAPI spec

**Solution:**

```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=8192"
nxh generate -i swagger.yaml

# Or split spec into smaller parts
# Generate separately for different API sections

# Optimize OpenAPI spec
# - Remove duplicate schemas
# - Use $ref instead of inline schemas
# - Remove unused definitions
```

## Build Performance

### Slow TypeScript Compilation

```bash
# tsc takes minutes to compile
```

**Cause:** Too many files or complex types

**Solution:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,        // ✅ Use incremental compilation
    "skipLibCheck": true,       // ✅ Skip checking node_modules
    "isolatedModules": true     // ✅ Faster parallel compilation
  },
  "exclude": [
    "node_modules",
    ".nuxt",
    ".output"
  ]
}
```

### Large Bundle Size

```bash
# .output/public/_nuxt/*.js files are huge
```

**Cause:** Importing too much code

**Solution:**

```typescript
// ❌ Bad - imports all composables
import * as api from '~/composables'

// ✅ Good - import only what you need
import { useFetchPet, useFetchOwner } from '~/composables/pets'

// nuxt.config.ts - enable code splitting
export default defineNuxtConfig({
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        composables: {
          test: /composables/,
          name: 'composables',
          chunks: 'all'
        }
      }
    }
  }
})
```

### Slow Dev Server Startup

```bash
# npm run dev takes long to start
```

**Cause:** Processing too many files

**Solution:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ✅ Disable features you don't need
  typescript: {
    typeCheck: false  // Disable type checking in dev
  },
  
  // ✅ Exclude unnecessary directories
  ignore: [
    'docs/**',
    'tests/**',
    '**/*.test.ts'
  ],
  
  // ✅ Use faster build tools
  vite: {
    optimizeDeps: {
      include: ['h3', 'ofetch']
    }
  }
})
```

## Runtime Performance

### Slow API Requests

```typescript
// Requests take seconds instead of milliseconds
```

**Cause:** No caching or inefficient requests

**Solution:**

```typescript
// ✅ Enable caching
const { data } = useFetchPets({
  key: 'pets-list',
  // Cached for 60 seconds
  getCachedData(key) {
    return useNuxtApp().payload.data[key]
  }
})

// ✅ Use lazy loading when appropriate
const { data, pending, execute } = useFetchPet(petId, {
  lazy: true,
  immediate: false
})

// Only fetch when needed
onMounted(() => {
  if (shouldFetch.value) {
    execute()
  }
})
```

### Too Many Parallel Requests

```typescript
// Dozens of requests on page load
```

**Cause:** Multiple composables fetching independently

**Solution:**

```typescript
// ❌ Bad - 50 separate requests
pets.value.forEach(pet => {
  useFetchPetDetails(pet.id)
})

// ✅ Good - batch request
const petIds = pets.value.map(p => p.id)
const { data: petDetails } = useFetchPetsBatch(petIds)

// Or use server endpoint to aggregate
// server/api/pets/batch.ts
export default defineEventHandler(async (event) => {
  const { ids } = await readBody(event)
  
  const pets = await Promise.all(
    ids.map(id => getServerPet(event, id))
  )
  
  return pets
})
```

### Slow Server-Side Rendering

```bash
# SSR takes seconds per page
```

**Cause:** Slow API calls during SSR

**Solution:**

```typescript
// ✅ Use caching for SSR
// server/api/pets.ts
import { defineCachedEventHandler } from '#nitro'

export default defineCachedEventHandler(
  async (event) => {
    return await getServerPets(event)
  },
  {
    maxAge: 60 * 60,  // ✅ Cache for 1 hour
    swr: true,        // ✅ Stale-while-revalidate
    getKey: (event) => {
      const query = getQuery(event)
      return `pets-${query.page}-${query.limit}`
    }
  }
)

// ✅ Or use static generation for some pages
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/pets': { swr: 60 * 60 },      // ISR - cache 1 hour
    '/pets/**': { swr: 60 * 60 },   // ISR for detail pages
    '/about': { prerender: true }   // Static generation
  }
})
```

### Memory Leaks in SPA

```bash
# Memory usage increases over time
```

**Cause:** Not cleaning up composables

**Solution:**

```typescript
// ✅ Always clean up
const { data, cancel } = useFetchPets()

onUnmounted(() => {
  cancel()  // ✅ Cancel pending requests
})

// ✅ Clear cache when needed
const clearPetsCache = () => {
  const nuxtApp = useNuxtApp()
  delete nuxtApp.payload.data['pets']
}

// ✅ Use weak references for large objects
const petCache = new WeakMap()
```

## Network Performance

### Large Response Payloads

```bash
# API returns 10MB JSON response
```

**Cause:** Over-fetching data

**Solution:**

```typescript
// ✅ Use pagination
const { data } = useFetchPets({
  query: {
    page: 1,
    limit: 20  // ✅ Limit results
  }
})

// ✅ Use field selection (if API supports)
const { data } = useFetchPet(1, {
  query: {
    fields: 'id,name,status'  // ✅ Only get needed fields
  }
})

// ✅ Use BFF to transform response
// server/api/pets/[id].ts
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const pet = await getServerPet(event, id)
  
  // ✅ Return only what frontend needs
  return {
    id: pet.id,
    name: pet.name,
    status: pet.status
    // Exclude large fields like images, full history, etc.
  }
})
```

### No Request Compression

```bash
# Responses not compressed
```

**Cause:** Backend not using compression

**Solution:**

```typescript
// Enable compression on backend
// Express:
import compression from 'compression'
app.use(compression())

// Or use Cloudflare/CDN compression

// Check if enabled:
// Response Headers should have: content-encoding: gzip
```

### Slow DNS Resolution

```bash
# DNS lookup takes seconds
```

**Cause:** Slow DNS server

**Solution:**

```bash
# Use faster DNS
# Google DNS: 8.8.8.8
# Cloudflare: 1.1.1.1

# Or use IP directly (testing only)
NUXT_PUBLIC_API_BASE=http://192.168.1.100:8080

# Or add to /etc/hosts
echo "192.168.1.100 api.example.com" >> /etc/hosts
```

## Type Performance

### Slow TypeScript Intellisense

```bash
# VSCode becomes slow with types
```

**Cause:** Too many complex types

**Solution:**

```typescript
// ✅ Simplify complex types
// Instead of deep intersections
type Pet = A & B & C & D & E & F

// Use interfaces
interface Pet extends A, B, C {
  // Additional properties
}

// ✅ Use type aliases for complex unions
type PetStatus = 'available' | 'pending' | 'sold'

// Instead of repeating
status: 'available' | 'pending' | 'sold'
```

## Optimization Checklist

### Generation Optimization

- [ ] Remove unused schemas from OpenAPI
- [ ] Use `$ref` instead of inline schemas
- [ ] Split large specs into smaller files
- [ ] Only generate needed operations

### Build Optimization

- [ ] Enable `incremental` compilation
- [ ] Use `skipLibCheck` in tsconfig
- [ ] Enable code splitting
- [ ] Minimize bundle size
- [ ] Use tree shaking

### Runtime Optimization

- [ ] Enable caching for repeated requests
- [ ] Use lazy loading where appropriate
- [ ] Batch parallel requests
- [ ] Implement pagination
- [ ] Use server-side caching
- [ ] Clean up on unmount

### Network Optimization

- [ ] Use CDN for static assets
- [ ] Enable HTTP/2
- [ ] Use compression
- [ ] Minimize payload size
- [ ] Use field selection

## Measuring Performance

### Measure Generation Time

```bash
time nxh generate -i swagger.yaml -o ./composables
```

### Measure Build Time

```bash
time npm run build
```

### Analyze Bundle Size

```bash
npm run build
npx nuxi analyze

# Or use webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
```

### Profile Runtime Performance

```typescript
// Use browser DevTools
// 1. Open DevTools (F12)
// 2. Go to Performance tab
// 3. Record while loading page
// 4. Analyze bottlenecks

// Or use Lighthouse
// 1. Open DevTools
// 2. Go to Lighthouse tab
// 3. Generate report
```

### Monitor API Performance

```typescript
// Add timing logs
const start = Date.now()
const { data } = await useFetchPet(1)
console.log(`Fetch took ${Date.now() - start}ms`)

// Or use global callback
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('apiCallbacks', {
    onRequest: (url) => {
      const start = Date.now()
      return { start }
    },
    onFinish: (context) => {
      const duration = Date.now() - context.start
      console.log(`${context.url} took ${duration}ms`)
    }
  })
})
```

## Caching Strategies

### Browser Cache

```typescript
// Use appropriate cache headers
// server/api/pets.ts
export default defineEventHandler(async (event) => {
  const pets = await getServerPets(event)
  
  // ✅ Cache in browser for 5 minutes
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
  
  return pets
})
```

### Application Cache

```typescript
// Use Nuxt payload cache
const { data } = useFetchPets({
  key: 'pets',
  getCachedData: (key) => {
    return useNuxtApp().payload.data[key]
  }
})

// Manual cache invalidation
const refreshPets = () => {
  const nuxtApp = useNuxtApp()
  delete nuxtApp.payload.data['pets']
  refresh()
}
```

### Server Cache

```typescript
// Use Nitro caching
import { defineCachedEventHandler } from '#nitro'

export default defineCachedEventHandler(
  async (event) => {
    return await getServerPets(event)
  },
  {
    maxAge: 60,
    swr: true
  }
)
```

## Next Steps

- [Build Issues →](/troubleshooting/build-issues)
- [Runtime Errors →](/troubleshooting/runtime-errors)
- [Nuxt Performance Guide](https://nuxt.com/docs/guide/going-further/performance)
