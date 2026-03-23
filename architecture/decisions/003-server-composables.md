# ADR 003: Server Composables

**Status:** Accepted

**Date:** 2024-02-10

## Context

Users want to create Backend-for-Frontend (BFF) routes in their Nuxt apps that proxy requests to backend APIs while adding transformations, permissions, and validation.

## Problem

How should we generate server-side code for Nitro routes?

### Requirements

1. **Type Safety** - Server functions must be typed
2. **Auth Context** - Access to H3Event for auth headers
3. **Transformation** - Easy to modify responses
4. **Consistency** - Similar API to client composables
5. **Flexibility** - Can be used in any server route

## Decision

**Generate server-side composables (not routes) that can be used in user-defined Nitro routes.**

Generate composables like:

```typescript
export async function getServerPet(
  event: H3Event,
  id: number,
  options?: ServerComposableOptions<Pet>
): Promise<Pet>
```

Instead of generating routes directly:

```typescript
// Not this
export default defineEventHandler(...)
```

## Rationale

### Why Composables, Not Routes?

1. **Flexibility** - Users can add custom logic before/after
2. **Composability** - Combine multiple calls in one route
3. **No Magic** - Clear what the route does
4. **Testing** - Easier to test composables separately
5. **Incremental** - Can adopt gradually

### Why H3Event First Parameter?

1. **Auth Context** - Access to headers, cookies, user context
2. **Request Info** - Access to full request details
3. **Nitro Standard** - Matches Nitro patterns
4. **Type Safety** - Event context is typed

## Implementation

### Generation

```bash
echo nuxtServer | npx nxh generate -i swagger.yaml -o ./server/composables
```

### Generated Structure

```
server/
├── composables/
│   ├── pets/
│   │   ├── getServerPet.ts
│   │   ├── getServerPets.ts
│   │   ├── createServerPet.ts
│   │   ├── updateServerPet.ts
│   │   └── deleteServerPet.ts
│   └── types.ts
└── api/
    └── pets/
        └── [id].get.ts (user creates this)
```

### Generated Code

```typescript
// server/composables/pets/getServerPet.ts
export async function getServerPet(
  event: H3Event,
  id: number,
  options?: ServerComposableOptions<Pet>
): Promise<Pet> {
  const config = useRuntimeConfig()
  
  return await $fetch<Pet>(`/pets/${id}`, {
    baseURL: config.apiBase,
    headers: getProxyHeaders(event, {
      include: ['authorization', 'cookie']
    })
  })
}
```

### User Route

```typescript
// server/api/pets/[id].get.ts
import { getServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const pet = await getServerPet(event, Number(id))
  
  // Add custom logic
  return {
    ...pet,
    canEdit: event.context.user?.id === pet.ownerId
  }
})
```

## Consequences

### Positive

- **Flexibility** - Users control route structure
- **Composability** - Can combine multiple API calls
- **Clear Intent** - Route code is explicit
- **No Magic** - No hidden route generation
- **Testable** - Can test composables independently
- **Type Safe** - Full TypeScript support
- **Auth Integration** - Event context available

### Negative

- **Manual Routes** - Users must create route files
- **Boilerplate** - Each route needs handler wrapper
- **No Auto Routes** - Can't discover routes automatically
- **Learning Curve** - Need to understand both composables and routes

## Alternatives Considered

### Alternative 1: Generate Routes Directly

Generate `server/api/**/*.ts` files with full handlers.

**Rejected:**
- Too rigid - hard to customize
- Coupling - ties users to specific route structure
- Testing - harder to test route handlers
- Overrides - difficult to add custom logic

### Alternative 2: Middleware Pattern

Use Nuxt server middleware for transformation.

**Rejected:**
- Global - affects all routes
- Complex - harder to reason about
- Order - middleware execution order issues
- Limited - can't easily combine multiple APIs

### Alternative 3: Route Wrappers

Generate wrapper functions that create handlers.

**Rejected:**
- Complex - adds abstraction layer
- Unclear - harder to understand what route does
- Debugging - more difficult to debug

## Usage Patterns

### Simple Proxy

```typescript
export default defineEventHandler(async (event) => {
  return await getServerPet(event, 1)
})
```

### Add Permissions

```typescript
export default defineEventHandler(async (event) => {
  const pet = await getServerPet(event, 1)
  return {
    ...pet,
    canEdit: event.context.user?.id === pet.ownerId
  }
})
```

### Aggregate Data

```typescript
export default defineEventHandler(async (event) => {
  const [pet, owner] = await Promise.all([
    getServerPet(event, 1),
    getServerUser(event, pet.ownerId)
  ])
  return { pet, owner }
})
```

### Transform Response

```typescript
export default defineEventHandler(async (event) => {
  const pet = await getServerPet(event, 1)
  return {
    id: pet.id,
    displayName: `${pet.name} (${pet.category})`
  }
})
```

## Related

- [Server Composables Guide](/server/)
- [BFF Pattern](/architecture/patterns/bff-pattern)
- [Server Routes →](/server/route-structure)
