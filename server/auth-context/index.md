# Authentication Context

When you run the generator in BFF mode, it creates two files in `server/auth/` that you implement once and are never overwritten:

```
server/auth/
├── types.ts      ← AuthContext interface + helper functions
└── context.ts    ← getAuthContext() stub — you implement this
```

## How it works

Every generated BFF route calls `getAuthContext(event)` automatically before executing your transformer:

```typescript
// Generated route (excerpt) — server/api/pet.post.ts
const { getAuthContext } = await import('~/server/auth/context')
auth = await getAuthContext(event)
```

The result is passed to your transformer as the third argument:

```typescript
const result = await transformPet(data, event, auth)
```

If `getAuthContext` throws, the route catches the error gracefully and `auth` is `null` — the transformer still runs with `auth: null`.

## AuthContext interface

`server/auth/types.ts` defines the shape of the auth context:

```typescript
export interface AuthContext {
  isAuthenticated: boolean
  userId: string | null
  roles: string[]
  permissions: string[]

  // Extend as needed:
  // email?: string
  // name?: string
  // organizationId?: string
  // features?: string[]
}
```

This file is **never overwritten**. Add any field you need.

## Implementing getAuthContext

`server/auth/context.ts` is generated with a default no-op and ready-to-use examples in comments. Replace the default with your auth library of choice.

### @sidebase/nuxt-auth

```typescript
import { getServerSession } from '#auth'
import type { H3Event } from 'h3'
import type { AuthContext } from './types.js'

export async function getAuthContext(event: H3Event): Promise<AuthContext> {
  const session = await getServerSession(event)

  if (!session) {
    return { isAuthenticated: false, userId: null, roles: [], permissions: [] }
  }

  return {
    isAuthenticated: true,
    userId: session.user.id,
    roles: session.user.roles || [],
    permissions: session.user.permissions || [],
  }
}
```

### Custom JWT

```typescript
import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import type { AuthContext } from './types.js'

export async function getAuthContext(event: H3Event): Promise<AuthContext> {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    return { isAuthenticated: false, userId: null, roles: [], permissions: [] }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return {
      isAuthenticated: true,
      userId: decoded.sub,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
    }
  } catch {
    return { isAuthenticated: false, userId: null, roles: [], permissions: [] }
  }
}
```

### Session cookies

```typescript
import { getCookie } from 'h3'
import type { H3Event } from 'h3'
import type { AuthContext } from './types.js'

export async function getAuthContext(event: H3Event): Promise<AuthContext> {
  const sessionId = getCookie(event, 'session-id')

  if (!sessionId) {
    return { isAuthenticated: false, userId: null, roles: [], permissions: [] }
  }

  const session = await db.sessions.findOne({ id: sessionId })

  if (!session || session.expiresAt < Date.now()) {
    return { isAuthenticated: false, userId: null, roles: [], permissions: [] }
  }

  return {
    isAuthenticated: true,
    userId: session.userId,
    roles: session.roles || [],
    permissions: session.permissions || [],
  }
}
```

::: tip
`getAuthContext` should **return** an unauthenticated context instead of throwing — routes handle `auth: null` gracefully. Only throw if you want the entire route to fail with a non-401 error.
:::

## Helper functions

`server/auth/types.ts` also exports four helpers you can use in your transformers:

```typescript
import { hasPermission, hasRole, hasAnyRole, hasAllRoles } from '~/server/auth/types'

// Single checks
hasPermission(auth, 'pet:write')       // auth.isAuthenticated && permissions includes 'pet:write'
hasRole(auth, 'admin')                 // auth.isAuthenticated && roles includes 'admin'

// Multi-role checks
hasAnyRole(auth, ['admin', 'editor'])  // any of the roles
hasAllRoles(auth, ['admin', 'editor']) // all of the roles
```

## Using auth in transformers

Your transformer receives `auth` as the third argument — use it to filter or enrich the response:

```typescript
// server/bff/transformers/pet.ts
import { hasRole } from '~/server/auth/types'
import type { AuthContext } from '~/server/auth/types'
import type { H3Event } from 'h3'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  const pet = data as any
  return {
    ...pet,
    canEdit: auth?.userId === pet.ownerId || hasRole(auth!, 'admin'),
  } as T
}
```

## Next Steps

- [Transformers →](/server/transformers/)
- [Getting Started →](/server/getting-started)
