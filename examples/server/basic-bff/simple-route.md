# Simple BFF Route

Create a basic Backend-for-Frontend route that proxies to your backend API.

## Basic Proxy

```typescript
// server/api/pets/[id].get.ts
import { getServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // Call backend API
  const pet = await getServerPet(event, Number(id))
  
  return pet
})
```

## With Query Parameters

```typescript
// server/api/pets/index.get.ts
import { getServerPets } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const pets = await getServerPets(event, {
    status: query.status as string,
    category: query.category as string,
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10
  })
  
  return pets
})
```

## POST Request

```typescript
// server/api/pets/index.post.ts
import { createServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const pet = await createServerPet(event, body)
  
  return pet
})
```

## Error Handling

```typescript
// server/api/pets/[id].get.ts
import { getServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  try {
    const pet = await getServerPet(event, Number(id))
    return pet
  } catch (error: any) {
    // Forward backend error to client
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch pet'
    })
  }
})
```

## Response Transformation

```typescript
// server/api/pets/[id].get.ts
import { getServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const pet = await getServerPet(event, Number(id))
  
  // Add computed fields
  return {
    ...pet,
    displayName: `${pet.name} (${pet.category})`,
    isAvailable: pet.status === 'available'
  }
})
```

## Next Steps

- [Protected BFF Routes →](/examples/server/basic-bff/with-auth)
- [Transform Data →](/examples/server/transformers/add-permissions)
