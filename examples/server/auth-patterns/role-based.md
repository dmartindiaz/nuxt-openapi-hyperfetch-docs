# Role-Based Access Control

Implement role-based permissions in your BFF routes.

## Basic Role Check

```typescript
// server/utils/auth.ts
export function requireRole(event: H3Event, allowedRoles: string[]) {
  const auth = requireAuth(event)
  
  if (!allowedRoles.includes(auth.role)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Insufficient permissions'
    })
  }
  
  return auth
}
```

```typescript
// server/api/admin/users.get.ts
export default defineEventHandler(async (event) => {
  // Only admins can access
  requireRole(event, ['admin'])
  
  const users = await getServerUsers(event)
  return users
})
```

## Multiple Roles

```typescript
// server/api/pets/[id].delete.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // Allow admin and moderator
  requireRole(event, ['admin', 'moderator'])
  
  await deleteServerPet(event, Number(id))
  
  return { success: true }
})
```

## Owner or Admin Check

```typescript
// server/api/pets/[id].put.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const auth = requireAuth(event)
  
  const pet = await getServerPet(event, Number(id))
  
  // Check if user is owner or admin
  const canEdit = pet.ownerId === auth.userId || auth.role === 'admin'
  
  if (!canEdit) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to edit this pet'
    })
  }
  
  const body = await readBody(event)
  const updated = await updateServerPet(event, Number(id), body)
  
  return updated
})
```

## Permission Helper

```typescript
// server/utils/permissions.ts
export function hasPermission(
  auth: Auth,
  resource: any,
  action: 'create' | 'read' | 'update' | 'delete'
) {
  // Admin can do everything
  if (auth.role === 'admin') return true
  
  // Owner can do everything with their resources
  if (resource.ownerId === auth.userId) return true
  
  // Moderator can read and update
  if (auth.role === 'moderator' && ['read', 'update'].includes(action)) {
    return true
  }
  
  return false
}
```

```typescript
// server/api/pets/[id].delete.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const auth = requireAuth(event)
  const pet = await getServerPet(event, Number(id))
  
  if (!hasPermission(auth, pet, 'delete')) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden'
    })
  }
  
  await deleteServerPet(event, Number(id))
  return { success: true }
})
```

## Next Steps

- [Session Authentication →](/examples/server/auth-patterns/session-based)
- [JWT Verification →](/examples/server/auth-patterns/jwt-verification)
