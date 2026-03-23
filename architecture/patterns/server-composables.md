# Server Composable Patterns

Design patterns for generated server-side composables.

## Server Composable Structure

### Basic Pattern

```typescript
export async function getServerPet(
  event: H3Event,
  id: number,
  options?: ServerComposableOptions<Pet>
): Promise<Pet> {
  return await $fetch<Pet>(`/pets/${id}`, {
    baseURL: useRuntimeConfig().apiBase,
    headers: getProxyHeaders(event)
  })
}
```

### HTTP Methods

```typescript
// GET
export async function getServerPet(
  event: H3Event,
  id: number
): Promise<Pet>

// POST
export async function createServerPet(
  event: H3Event,
  body: CreatePetRequest
): Promise<Pet>

// PUT
export async function updateServerPet(
  event: H3Event,
  id: number,
  body: UpdatePetRequest
): Promise<Pet>

// DELETE
export async function deleteServerPet(
  event: H3Event,
  id: number
): Promise<void>
```

## BFF Route Patterns

### Simple Proxy

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  return await getServerPet(event, Number(id))
})
```

### With Transformation

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const pet = await getServerPet(event, Number(id))
  
  return {
    ...pet,
    canEdit: event.context.user?.id === pet.ownerId
  }
})
```

### Aggregate Multiple Sources

```typescript
// server/api/pets/[id]/full.get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const [pet, owner] = await Promise.all([
    getServerPet(event, Number(id)),
    getServerUser(event, pet.ownerId)
  ])
  
  return { pet, owner }
})
```

## Authentication Patterns

### Header Forwarding

```typescript
export async function getServerPet(event: H3Event, id: number) {
  return await $fetch(`/pets/${id}`, {
    headers: getProxyHeaders(event, {
      include: ['authorization', 'cookie']
    })
  })
}
```

### Token Injection

```typescript
export async function getServerPet(event: H3Event, id: number) {
  const token = getRequestHeader(event, 'authorization')
  
  return await $fetch(`/pets/${id}`, {
    headers: {
      Authorization: token || ''
    }
  })
}
```

### Auth Context

```typescript
// server/api/pets/index.post.ts
export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  
  const body = await readBody(event)
  return await createServerPet(event, {
    ...body,
    ownerId: auth.userId
  })
})
```

## Error Handling Patterns

### Basic Error Handling

```typescript
export default defineEventHandler(async (event) => {
  try {
    const pet = await getServerPet(event, 1)
    return pet
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message
    })
  }
})
```

### Error Transformation

```typescript
export default defineEventHandler(async (event) => {
  try {
    return await getServerPet(event, 1)
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: 'Pet not found'
      })
    }
    throw error
  }
})
```

## Transformation Patterns

### Add Permissions

```typescript
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

### Filter Sensitive Data

```typescript
export default defineEventHandler(async (event) => {
  const user = await getServerUser(event, 1)
  
  const { password, ssn, ...publicData } = user
  return publicData
})
```

### Combine Sources

```typescript
export default defineEventHandler(async (event) => {
  const pets = await getServerPets(event)
  
  // Fetch all owners in parallel
  const ownerIds = [...new Set(pets.map(p => p.ownerId))]
  const owners = await Promise.all(
    ownerIds.map(id => getServerUser(event, id))
  )
  
  const ownerMap = new Map(owners.map(o => [o.id, o]))
  
  return pets.map(pet => ({
    ...pet,
    owner: ownerMap.get(pet.ownerId)
  }))
})
```

## Caching Patterns

### Route Caching

```typescript
export default defineCachedEventHandler(
  async (event) => {
    return await getServerPets(event)
  },
  {
    maxAge: 60 * 5 // 5 minutes
  }
)
```

### Conditional Caching

```typescript
export default defineCachedEventHandler(
  async (event) => {
    const auth = event.context.auth
    
    // Don't cache authenticated requests
    if (auth) {
      return await getServerPets(event)
    }
    
    return await getServerPets(event)
  },
  {
    maxAge: 60,
    getKey: (event) => {
      const auth = event.context.auth
      return auth ? `pets-${auth.userId}` : 'pets-public'
    }
  }
)
```

## Query Parameter Patterns

### Forward Query Params

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  return await getServerPets(event, {
    status: query.status,
    limit: Number(query.limit) || 10
  })
})
```

### Validate Query Params

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const status = query.status
  if (status && !['available', 'pending', 'sold'].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid status'
    })
  }
  
  return await getServerPets(event, { status })
})
```

## Next Steps

- [Client Composables →](/architecture/patterns/client-composables)
- [BFF Pattern →](/architecture/patterns/bff-pattern)
- [BFF Pattern Guide →](/server/bff-pattern/)
