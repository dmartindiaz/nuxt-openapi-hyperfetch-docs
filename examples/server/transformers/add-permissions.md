# Add Permissions

Transform backend responses to include user-specific permissions.

## Basic Permissions

```typescript
// server/api/pets/[id].get.ts
import { getServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const pet = await getServerPet(event, Number(id))
  
  const user = event.context.user
  
  return {
    ...pet,
    canEdit: user?.id === pet.ownerId,
    canDelete: user?.id === pet.ownerId || user?.role === 'admin'
  }
})
```

## Permission Helper

```typescript
// server/utils/permissions.ts
export function addPetPermissions(pet: Pet, user: User | null) {
  return {
    ...pet,
    permissions: {
      canView: true,
      canEdit: user?.id === pet.ownerId,
      canDelete: user?.id === pet.ownerId || user?.role === 'admin',
      canShare: !!user
    }
  }
}
```

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const pet = await getServerPet(event, Number(id))
  
  return addPetPermissions(pet, event.context.user)
})
```

## List with Permissions

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const result = await getServerPets(event, query)
  
  return {
    ...result,
    items: result.items.map(pet => 
      addPetPermissions(pet, event.context.user)
    )
  }
})
```

## Complex Permissions

```typescript
// server/utils/permissions.ts
export function canEditPet(pet: Pet, user: User | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.id === pet.ownerId) return true
  if (pet.collaborators?.includes(user.id)) return true
  return false
}

export function canDeletePet(pet: Pet, user: User | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.id === pet.ownerId) return true
  return false
}

export function addPetPermissions(pet: Pet, user: User | null) {
  return {
    ...pet,
    canEdit: canEditPet(pet, user),
    canDelete: canDeletePet(pet, user),
    canShare: !!user && canEditPet(pet, user)
  }
}
```

## Use Permissions in Frontend

```vue
<script setup lang="ts">
import { useFetchPet } from '~/composables/pets'

const route = useRoute()
const { data: pet } = useFetchPet(() => Number(route.params.id))
</script>

<template>
  <div>
    <h1>{{ pet?.name }}</h1>
    
    <button v-if="pet?.canEdit" @click="editPet">Edit</button>
    <button v-if="pet?.canDelete" @click="deletePet">Delete</button>
    <button v-if="pet?.canShare" @click="sharePet">Share</button>
  </div>
</template>
```

## Next Steps

- [Filter Sensitive Data →](/examples/server/transformers/filter-sensitive)
- [Combine Multiple Sources →](/examples/server/transformers/combine-sources)
