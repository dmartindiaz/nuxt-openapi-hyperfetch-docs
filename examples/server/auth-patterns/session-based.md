# Session-Based Authentication

Use sessions instead of JWT tokens for authentication.

## Session Setup

```typescript
// server/utils/session.ts
import { SessionConfig, useSession } from 'h3'

const sessionConfig: SessionConfig = {
  password: process.env.SESSION_SECRET || 'your-session-secret-min-32-chars',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

export async function getUserSession(event: H3Event) {
  const session = await useSession(event, sessionConfig)
  return session.data
}

export async function setUserSession(event: H3Event, data: any) {
  const session = await useSession(event, sessionConfig)
  await session.update(data)
}

export async function clearUserSession(event: H3Event) {
  const session = await useSession(event, sessionConfig)
  await session.clear()
}
```

## Login Endpoint

```typescript
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  
  // Verify credentials
  const user = await verifyCredentials(email, password)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }
  
  // Set session
  await setUserSession(event, {
    userId: user.id,
    role: user.role,
    email: user.email
  })
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
})
```

## Logout Endpoint

```typescript
// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { success: true }
})
```

## Auth Middleware

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (session.userId) {
    event.context.auth = {
      userId: session.userId,
      role: session.role,
      email: session.email
    }
  }
})
```

## Protected Route

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

## Get Current User

```typescript
// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  
  const user = await getServerUser(event, auth.userId)
  
  return user
})
```

## Next Steps

- [JWT Verification →](/examples/server/auth-patterns/jwt-verification)
- [Role-Based Access →](/examples/server/auth-patterns/role-based)
