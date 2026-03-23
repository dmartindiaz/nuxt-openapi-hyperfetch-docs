# Permission Flags

Add boolean flags to API responses so the frontend knows what actions the current user can perform, without duplicating permission logic in every component.

## Why use permission flags?

Instead of replicating permission logic in every Vue component:

```vue
<!-- ❌ Repeated logic in every component -->
<button v-if="user.role === 'admin' || pet.ownerId === user.id">Edit</button>
<button v-if="user.role === 'admin'">Delete</button>
```

The BFF computes it once and the component just reads the flag:

```vue
<!-- ✅ Clean, no permission logic in the frontend -->
<button v-if="pet.canEdit">Edit</button>
<button v-if="pet.canDelete">Delete</button>
```

## Adding flags in the transformer

Use `auth?.permissions.includes()` or the helpers from `~/server/auth/types`:

```typescript
// server/bff/transformers/pet.ts
import type { H3Event } from 'h3'
import type { AuthContext } from '~/server/auth/types'
import { hasPermission, hasRole } from '~/server/auth/types'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  if (typeof data !== 'object' || data === null) return data

  return {
    ...(data as any),
    canEdit: hasPermission(auth!, 'pet:write'),
    canDelete: hasPermission(auth!, 'pet:delete'),
  } as T
}
```

::: tip
`hasPermission` returns `false` when `auth` is `null` or `isAuthenticated` is `false` — no extra null guard needed.
:::

## Role-based flags

```typescript
import { hasRole, hasAnyRole } from '~/server/auth/types'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  return {
    ...(data as any),
    canEdit: hasAnyRole(auth!, ['admin', 'editor']),
    canDelete: hasRole(auth!, 'admin'),
  } as T
}
```

## Conditional fields based on permissions

Only expose a field if the user has the right permission:

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as any

  const result: any = {
    id: pet.id,
    name: pet.name,
    status: pet.status,
    canEdit: hasPermission(auth!, 'pet:write'),
  }

  // Only admins see cost price
  if (hasRole(auth!, 'admin')) {
    result.costPrice = pet.costPrice
  }

  return result as T
}
```

## Available helpers

All helpers are exported from `~/server/auth/types`:

```typescript
import { hasPermission, hasRole, hasAnyRole, hasAllRoles } from '~/server/auth/types'

hasPermission(auth, 'pet:write')            // single permission
hasRole(auth, 'admin')                       // single role
hasAnyRole(auth, ['admin', 'editor'])        // any of the roles
hasAllRoles(auth, ['admin', 'editor'])       // all of the roles
```

All return `false` when `auth` is `null` or `auth.isAuthenticated` is `false`.