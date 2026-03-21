# Protected BFF Routes

Add authentication to your Backend-for-Frontend routes.

## JWT Token Verification

```typescript
// server/api/pets/index.post.ts
import { createServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  // Get token from Authorization header
  const token = getRequestHeader(event, 'authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  // Verify token (implement your verification logic)
  const user = await verifyToken(token)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
  
  // Add user to event context
  event.context.user = user
  
  const body = await readBody(event)
  const pet = await createServerPet(event, body)
  
  return pet
})
```

## Auth Context Middleware

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const token = getRequestHeader(event, 'authorization')?.replace('Bearer ', '')
  
  if (token) {
    try {
      const user = await verifyToken(token)
      event.context.user = user
    } catch (error) {
      // Invalid token, but don't throw yet
      event.context.user = null
    }
  }
})
```

```typescript
// server/api/pets/index.post.ts
export default defineEventHandler(async (event) => {
  // Require authentication
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }
  
  const body = await readBody(event)
  const pet = await createServerPet(event, body)
  
  return pet
})
```

## Auth Utility

```typescript
// server/utils/auth.ts
export function requireAuth(event: H3Event) {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }
  
  return event.context.user
}
```

```typescript
// server/api/pets/index.post.ts
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const body = await readBody(event)
  const pet = await createServerPet(event, body)
  
  return pet
})
```

## Inject Auth Token

```typescript
// server/composables/pets.ts
export async function createServerPet(event: H3Event, body: CreatePetRequest) {
  const token = getRequestHeader(event, 'authorization')
  
  return await $fetch('https://api.backend.com/pets', {
    method: 'POST',
    headers: {
      Authorization: token || ''
    },
    body
  })
}
```

## Next Steps

- [Add Permissions →](/examples/server/transformers/add-permissions)
- [JWT Verification →](/examples/server/auth-patterns/jwt-verification)
- [Role-Based Access →](/examples/server/auth-patterns/role-based)
