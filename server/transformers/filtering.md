# Filtering Data

Remove sensitive or internal fields from backend responses inside your transformer so they never reach the client.

## Basic: destructuring to remove fields

```typescript
// server/bff/transformers/pet.ts
import type { H3Event } from 'h3'
import type { AuthContext } from '~/server/auth/types'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const { internalId, costPrice, supplierNotes, ...safe } = data as any
  return safe as T
}
```

## Whitelist: only expose specific fields

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as any

  return {
    id: pet.id,
    name: pet.name,
    status: pet.status,
    photoUrls: pet.photoUrls,
    tags: pet.tags,
  } as T
}
```

Safer than blacklisting — new backend fields are excluded by default.

## Permission-based filtering

Show different fields depending on the user role or permissions:

```typescript
import { hasRole } from '~/server/auth/types'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as any

  // Base fields for everyone
  const result: any = {
    id: pet.id,
    name: pet.name,
    status: pet.status,
  }

  // Admin-only fields
  if (hasRole(auth!, 'admin')) {
    result.costPrice = pet.costPrice
    result.internalNotes = pet.internalNotes
  }

  return result as T
}
```

## Filtering nested objects

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as any

  return {
    id: pet.id,
    name: pet.name,
    // Only expose safe subset of category
    category: pet.category ? {
      id: pet.category.id,
      name: pet.category.name,
    } : null,
  } as T
}
```