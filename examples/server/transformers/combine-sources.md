# Combine Multiple Sources

Aggregate data from multiple backend APIs into a single response.

## Basic Combination

```typescript
// server/api/pets/[id]/full.get.ts
import { getServerPet } from '~/server/composables/pets'
import { getServerUser } from '~/server/composables/users'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // Fetch pet
  const pet = await getServerPet(event, Number(id))
  
  // Fetch owner details
  const owner = await getServerUser(event, pet.ownerId)
  
  return {
    ...pet,
    owner: {
      id: owner.id,
      name: owner.name,
      avatar: owner.avatar
    }
  }
})
```

## Parallel Requests

```typescript
// server/api/dashboard.get.ts
import { getServerPets } from '~/server/composables/pets'
import { getServerOrders } from '~/server/composables/orders'
import { getServerUser } from '~/server/composables/users'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  // Fetch all data in parallel
  const [pets, orders, profile] = await Promise.all([
    getServerPets(event, { ownerId: user.id }),
    getServerOrders(event, { userId: user.id }),
    getServerUser(event, user.id)
  ])
  
  return {
    pets,
    orders,
    profile,
    summary: {
      totalPets: pets.length,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0)
    }
  }
})
```

## Aggregate List Data

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const pets = await getServerPets(event)
  
  // Get unique owner IDs
  const ownerIds = [...new Set(pets.items.map(p => p.ownerId))]
  
  // Fetch all owners
  const owners = await Promise.all(
    ownerIds.map(id => getServerUser(event, id))
  )
  
  // Create owner lookup map
  const ownerMap = new Map(owners.map(o => [o.id, o]))
  
  // Add owner data to each pet
  return {
    ...pets,
    items: pets.items.map(pet => ({
      ...pet,
      owner: ownerMap.get(pet.ownerId)
    }))
  }
})
```

## Error Handling

```typescript
// server/api/pets/[id]/full.get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const pet = await getServerPet(event, Number(id))
  
  // Fetch owner, but don't fail if it errors
  let owner = null
  try {
    owner = await getServerUser(event, pet.ownerId)
  } catch (error) {
    console.error('Failed to fetch owner:', error)
  }
  
  return {
    ...pet,
    owner
  }
})
```

## Cached Aggregation

```typescript
// server/api/stats.get.ts
export default defineCachedEventHandler(async (event) => {
  const [pets, orders, users] = await Promise.all([
    getServerPets(event),
    getServerOrders(event),
    getServerUsers(event)
  ])
  
  return {
    totalPets: pets.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0)
  }
}, {
  maxAge: 60 * 5 // Cache for 5 minutes
})
```

## Next Steps

- [Add Permissions →](/examples/server/transformers/add-permissions)
- [Filter Sensitive Data →](/examples/server/transformers/filter-sensitive)
