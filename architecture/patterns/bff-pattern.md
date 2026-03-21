# BFF Pattern

Backend-for-Frontend pattern with nuxt-openapi-hyperfetch.

## What is BFF?

Backend-for-Frontend (BFF) is a pattern where you create an API layer specifically designed for your frontend needs, sitting between your frontend and backend services.

## Why BFF?

### Problems It Solves

1. **Backend API Mismatch** - Backend APIs designed for multiple clients
2. **Overfetching** - Frontend gets more data than needed
3. **Multiple Requests** - Need to aggregate data from multiple endpoints
4. **Security** - Keep API keys and secrets on server
5. **Transform Data** - Backend format doesn't match frontend needs

### Benefits

- **Type Safety** - Server routes are fully typed
- **Performance** - Aggregate calls, reduce round trips
- **Security** - API keys stay server-side
- **Flexibility** - Transform responses for frontend needs
- **Permissions** - Add user-specific fields (canEdit, canDelete)

## Implementation

### Generate Server Composables

```bash
echo nuxtServer | npx nxh generate -i swagger.yaml -o ./server/composables
```

### Create BFF Route

```typescript
// server/api/pets/[id].get.ts
import { getServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const pet = await getServerPet(event, Number(id))
  
  return pet
})
```

### Use from Frontend

```vue
<script setup lang="ts">
// Calls YOUR BFF route, not the backend directly
const { data: pet } = await useFetch('/api/pets/1')
</script>
```

## Common Patterns

### 1. Add Permissions

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const pet = await getServerPet(event, 1)
  const user = event.context.user
  
  return {
    ...pet,
    canEdit: user?.id === pet.ownerId,
    canDelete: user?.role === 'admin'
  }
})
```

```vue
<script setup lang="ts">
const { data: pet } = await useFetch('/api/pets/1')
</script>

<template>
  <button v-if="pet?.canEdit">Edit</button>
  <button v-if="pet?.canDelete">Delete</button>
</template>
```

### 2. Filter Sensitive Data

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const user = await getServerUser(event, 1)
  
  // Remove sensitive fields
  const { password, ssn, ...safeUser } = user
  
  return safeUser
})
```

### 3. Aggregate Multiple APIs

```typescript
// server/api/dashboard.get.ts
export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id
  
  const [pets, orders, profile] = await Promise.all([
    getServerPets(event, { ownerId: userId }),
    getServerOrders(event, { userId }),
    getServerUser(event, userId)
  ])
  
  return {
    pets,
    orders,
    profile,
    stats: {
      totalPets: pets.length,
      totalOrders: orders.length
    }
  }
})
```

### 4. Transform Response Format

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const pet = await getServerPet(event, 1)
  
  // Transform to match frontend needs
  return {
    id: pet.id,
    displayName: `${pet.name} (${pet.category})`,
    image: pet.photoUrls?.[0],
    isAvailable: pet.status === 'available'
  }
})
```

### 5. Add Computed Fields

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const pets = await getServerPets(event)
  
  return pets.map(pet => ({
    ...pet,
    age: calculateAge(pet.birthDate),
    nextVaccination: getNextVaccinationDate(pet.vaccinations)
  }))
})
```

## Architecture Flow

```
┌──────────────┐
│   Browser    │
│  (Vue App)   │
└──────┬───────┘
       │ 1. useFetch('/api/pets/1')
       ▼
┌──────────────────────┐
│  Nuxt Server (BFF)   │
│                      │
│  server/api/         │
│  └── pets/           │
│      └── [id].get.ts │
└──────┬───────────────┘
       │ 2. getServerPet(event, 1)
       │    ├─ Add permissions
       │    ├─ Filter data
       │    └─ Transform
       ▼
┌──────────────┐
│   Backend    │
│     API      │
│ (api.com)    │
└──────────────┘
```

## Authentication Flow

### Forward Auth Headers

```typescript
// server/composables/pets.ts
export async function getServerPet(event: H3Event, id: number) {
  return await $fetch(`/pets/${id}`, {
    headers: getProxyHeaders(event, {
      include: ['authorization']
    })
  })
}
```

### Server-Side Auth

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const pet = await getServerPet(event, 1)
  
  // User context available
  if (pet.ownerId !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403 })
  }
  
  return pet
})
```

## Best Practices

### 1. Keep API Keys Server-Side

```typescript
// ✅ Good - API key on server
export async function getServerPet(event: H3Event, id: number) {
  return await $fetch(`/pets/${id}`, {
    headers: {
      'X-API-Key': process.env.BACKEND_API_KEY
    }
  })
}

// ❌ Bad - API key exposed to client
const pet = await $fetch('/backend/pets/1', {
  headers: {
    'X-API-Key': 'secret-key' // Exposed!
  }
})
```

### 2. Transform at BFF Layer

```typescript
// ✅ Good - Transform at BFF
// server/api/pets/[id].get.ts
const pet = await getServerPet(event, 1)
return { ...pet, displayName: pet.name }

// ❌ Bad - Transform in component
const { data: pet } = await useFetch('/api/pets/1')
const displayName = computed(() => pet.value.name) // Extra work
```

### 3. Type Your BFF Routes

```typescript
// ✅ Good - Typed response
export default defineEventHandler(async (event): Promise<PetWithPermissions> => {
  return { ...pet, canEdit: true }
})

// Frontend gets types automatically
const { data: pet } = await useFetch('/api/pets/1')
//      ^? Ref<PetWithPermissions | null>
```

## Next Steps

- [Server Composables →](/architecture/patterns/server-composables)
- [Server Examples →](/examples/server/basic-bff/simple-route)
- [Authentication →](/examples/server/basic-bff/with-auth)
