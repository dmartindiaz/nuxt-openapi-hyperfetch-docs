# Backend for Frontend (BFF) Pattern

When you enable BFF mode during generation, the `nuxtServer` generator creates an intermediate layer between your Nuxt frontend and your backend API. Instead of calling the backend directly from the browser, every request goes through a server route that can verify identity, forward credentials securely, and transform the response.

## How it works

```
Browser  →  Nuxt server route  →  Backend API
                   ↑
         (auth + transform here)
```

Each generated route:
1. Reads the request (body, query params)
2. Calls `getAuthContext(event)` — your stub in `server/auth/context.ts`
3. Forwards the call to the backend using `apiBaseUrl` from `runtimeConfig`
4. Passes the raw response through your transformer in `server/bff/transformers/{resource}.ts`
5. Returns the result to the browser

## The two files you implement

### `server/auth/context.ts`

Generated once, never overwritten. You implement `getAuthContext` to resolve who is making the request:

```typescript
// server/auth/context.ts
import type { H3Event } from 'h3'
import type { AuthContext } from './types.js'

export async function getAuthContext(event: H3Event): Promise<AuthContext> {
  // Example with a JWT cookie:
  const token = getCookie(event, 'auth-token')
  if (!token) {
    return { isAuthenticated: false, userId: null, roles: [], permissions: [] }
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  return {
    isAuthenticated: true,
    userId: decoded.sub,
    roles: decoded.roles ?? [],
    permissions: decoded.permissions ?? [],
  }
}
```

The `AuthContext` type is defined in `server/auth/types.ts` (also generated once).

### `server/bff/transformers/{resource}.ts`

One file per API tag, generated once, never overwritten. You implement `transform{Resource}` to shape the data before it reaches the browser:

```typescript
// server/bff/transformers/pet.ts
import type { H3Event } from 'h3'
import type { AuthContext } from '~/server/auth/types'

export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  if (typeof data === 'object' && data !== null) {
    return {
      ...data,
      canEdit: auth?.permissions.includes('pet:write') ?? false,
      canDelete: auth?.permissions.includes('pet:delete') ?? false,
    } as T
  }
  return data
}
```

If you don't implement a transformer (or it throws), the route returns raw data — BFF mode degrades gracefully.

## Without BFF mode

If you skip BFF during generation, no `server/auth/` or `server/bff/` directories are created. Routes still proxy the backend, but without auth context or data transformation.

## Next steps

- [Auth Context →](/server/auth-context/)
- [Transformers →](/server/transformers/)

