# Combining Sources

Make additional `$fetch` calls inside a transformer to enrich the backend response with data from other endpoints before it reaches the client.

## Basic example

The transformer receives `event: H3Event`, so you can call `useRuntimeConfig()` and `$fetch` just like in a route:

```typescript
// server/bff/transformers/pet.ts
import type { H3Event } from 'h3'
import type { AuthContext } from '~/server/auth/types'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as any
  const config = useRuntimeConfig()

  // Fetch owner info from another endpoint
  const owner = await $fetch(`${config.apiBaseUrl}/owners/${pet.ownerId}`, {
    headers: { Authorization: `Bearer ${config.apiSecret}` },
  }).catch(() => null)

  return {
    ...pet,
    ownerName: owner?.name ?? null,
  } as T
}
```

## Parallel fetches

Use `Promise.all` to avoid sequential waterfall:

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as any
  const config = useRuntimeConfig()

  const [owner, medicalRecord] = await Promise.all([
    $fetch(`${config.apiBaseUrl}/owners/${pet.ownerId}`).catch(() => null),
    $fetch(`${config.apiBaseUrl}/medical-records?petId=${pet.id}`).catch(() => null),
  ])

  return {
    ...pet,
    ownerName: owner?.name ?? null,
    hasVaccinations: Array.isArray(medicalRecord) && medicalRecord.length > 0,
  } as T
}
```

## Only enrich when needed

Skip the extra fetch for unauthenticated requests to keep public endpoints fast:

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as any

  // Skip enrichment for unauthenticated users
  if (!auth?.isAuthenticated) return data

  const config = useRuntimeConfig()
  const owner = await $fetch(`${config.apiBaseUrl}/owners/${pet.ownerId}`).catch(() => null)

  return {
    ...pet,
    ownerName: owner?.name ?? null,
  } as T
}
```

::: warning
Extra fetches inside a transformer add latency to every call of that route. Always `catch` errors so a failure in an enrichment source does not crash the main response.
:::