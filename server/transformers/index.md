# Transformers

When you generate in BFF mode, the CLI creates one transformer file per resource in `server/bff/transformers/`. These files are generated once and **never overwritten** — they are where you put your business logic.

## Generated files

For a Petstore API the generator creates:

```
server/bff/transformers/
├── pet.ts
├── store.ts
└── user.ts
```

Each file exports one async function with this signature:

```typescript
// server/bff/transformers/pet.ts
import type { H3Event } from 'h3'
import type { AuthContext } from '~/server/auth/types'
import type { Pet, ModelApiResponse } from '~/swagger/models'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  // Default: return data unchanged
  return data
}
```

## How it gets called

Every generated BFF route calls the transformer automatically after fetching data from your backend:

```typescript
// Generated route (excerpt) — server/api/pet.post.ts
const result = await $fetch(...)
const { transformPet } = await import('~/server/bff/transformers/pet')
return await transformPet(result, event, auth)
```

You never call the transformer manually — just implement it.

## What you can do in a transformer

### Add computed / permission flags

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  if (typeof data !== 'object' || data === null) return data

  return {
    ...data,
    canEdit: auth?.permissions.includes('pet:write') ?? false,
    canDelete: auth?.permissions.includes('pet:delete') ?? false,
  } as T
}
```

### Filter sensitive fields

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const { internalId, costPrice, ...safe } = data as any
  return safe as T
}
```

### Filter based on permissions

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  if (!auth?.permissions.includes('pet:read:all')) {
    const { sensitiveField, ...safe } = data as any
    return safe as T
  }
  return data
}
```

### Add computed fields

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  return {
    ...(data as any),
    displayName: `${(data as any).name} (${(data as any).status})`,
  } as T
}
```

## Using typed models

The generated imports give you the exact types from your OpenAPI spec. You can cast and use them:

```typescript
import type { Pet } from '~/swagger/models'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as unknown as Pet

  return {
    ...pet,
    canEdit: auth?.permissions.includes('pet:write') ?? false,
  } as unknown as T
}
```

## When auth is null

`auth` is `null` when `getAuthContext` threw an error (the route caught it silently). Always guard with optional chaining:

```typescript
canEdit: auth?.permissions.includes('pet:write') ?? false
```

## Next Steps

- [Permission Flags →](/server/transformers/permissions)
- [Filtering Data →](/server/transformers/filtering)
- [Combining Sources →](/server/transformers/combining)
