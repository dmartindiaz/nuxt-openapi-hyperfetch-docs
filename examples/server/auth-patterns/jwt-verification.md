# JWT Verification

Verify JWT tokens in your BFF routes.

## Basic JWT Verification

```typescript
// server/utils/jwt.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as { userId: number; role: string }
  } catch (error) {
    return null
  }
}
```

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const authHeader = getRequestHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      event.context.auth = decoded
    }
  }
})
```

## Protected Route

```typescript
// server/api/pets/index.post.ts
export default defineEventHandler(async (event) => {
  if (!event.context.auth) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  const body = await readBody(event)
  const pet = await createServerPet(event, body)
  
  return pet
})
```

## Auth Helper

```typescript
// server/utils/auth.ts
export function requireAuth(event: H3Event) {
  if (!event.context.auth) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }
  return event.context.auth
}
```

```typescript
// server/api/pets/index.post.ts
export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  
  const body = await readBody(event)
  const pet = await createServerPet(event, {
    ...body,
    ownerId: auth.userId
  })
  
  return pet
})
```

## Token Expiration Check

```typescript
// server/utils/jwt.ts
export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Check expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null
    }
    
    return decoded
  } catch (error) {
    return null
  }
}
```

## Next Steps

- [Role-Based Access →](/examples/server/auth-patterns/role-based)
- [Session Authentication →](/examples/server/auth-patterns/session-based)
