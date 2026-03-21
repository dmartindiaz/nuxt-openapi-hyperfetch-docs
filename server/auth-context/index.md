# Authentication Context

Add user context to your server routes with automatic JWT verification and user information extraction.

## Overview

Authentication context provides:

- **JWT Verification** - Validate tokens from cookies or headers
- **User Extraction** - Get user ID, role, permissions
- **Auto-Injection** - User context available in all routes
- **Error Handling** - Automatic 401 responses

```typescript
// Automatic user context
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  //     ^? { id: number, email: string, role: string }
  
  // Use user context
  return fetchPetsForUser(user.id)
})
```

## Quick Start

### 1. Install JWT Library

```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

### 2. Configure JWT Secret

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
  }
})
```

```bash
# .env
JWT_SECRET=your-super-secret-key-here
```

### 3. Create Auth Utility

```typescript
// server/utils/auth.ts
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export interface AuthUser {
  id: number
  email: string
  role: string
  permissions: string[]
}

export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  const config = useRuntimeConfig()
  
  // Get token from cookie or header
  const token = getCookie(event, 'auth-token')
    || getHeader(event, 'authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser
    return decoded
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    })
  }
}
```

### 4. Use in Routes

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  // User context available!
  console.log(`User ${user.id} requested pets`)
  
  return fetchPetsForUser(user.id)
})
```

## Authentication Methods

### Cookie-Based

```typescript
export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  // Get from cookie (httpOnly, secure)
  const token = getCookie(event, 'auth-token')
  
  if (!token) {
    throw createError({ statusCode: 401 })
  }
  
  return jwt.verify(token, config.jwtSecret) as AuthUser
}
```

**Benefits:**
- Secure (httpOnly, can't be accessed by JS)
- Automatic with requests
- CSRF protection available

### Header-Based

```typescript
export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  // Get from Authorization header
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    throw createError({ statusCode: 401 })
  }
  
  return jwt.verify(token, config.jwtSecret) as AuthUser
}
```

**Benefits:**
- Standard HTTP pattern
- Works with mobile apps
- No cookie storage needed

### Hybrid Approach

```typescript
export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  // Try cookie first, then header
  const token = getCookie(event, 'auth-token')
    || getHeader(event, 'authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw createError({ statusCode: 401 })
  }
  
  return jwt.verify(token, config.jwtSecret) as AuthUser
}
```

**Benefits:**
- Flexible (works with both)
- Web and mobile support
- Best of both worlds

## User Context Structure

### Basic User

```typescript
export interface AuthUser {
  id: number
  email: string
  role: 'user' | 'admin'
}
```

### Extended User

```typescript
export interface AuthUser {
  id: number
  email: string
  name: string
  role: 'user' | 'admin' | 'moderator'
  permissions: string[]
  tenantId?: string
  metadata?: Record<string, any>
}
```

### Custom Claims

```typescript
export interface AuthUser {
  // Standard JWT claims
  sub: number        // User ID
  exp: number        // Expiration
  iat: number        // Issued at
  
  // Custom claims
  email: string
  role: string
  organizationId: number
  features: string[]
}
```

## Authorization

### Role-Based

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admin access required'
    })
  }
  
  return fetchAdminData()
})
```

### Permission-Based

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  if (!user.permissions.includes('pets.delete')) {
    throw createError({
      statusCode: 403,
      message: 'Permission denied'
    })
  }
  
  return deletePet(petId)
})
```

### Resource-Based

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const petId = getRouterParam(event, 'id')
  
  const pet = await fetchPet(petId)
  
  // Check ownership
  if (pet.ownerId !== user.id && user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'You can only edit your own pets'
    })
  }
  
  return updatePet(petId, body)
})
```

## Helper Functions

### Require Auth

```typescript
// server/utils/auth.ts
export function requireAuth(
  handler: (event: H3Event, user: AuthUser) => any
) {
  return defineEventHandler(async (event) => {
    const user = await verifyAuth(event)
    return handler(event, user)
  })
}
```

```typescript
// Usage
export default requireAuth(async (event, user) => {
  // User is automatically verified
  return fetchUserData(user.id)
})
```

### Require Role

```typescript
// server/utils/auth.ts
export function requireRole(role: string) {
  return (handler: (event: H3Event, user: AuthUser) => any) => {
    return defineEventHandler(async (event) => {
      const user = await verifyAuth(event)
      
      if (user.role !== role) {
        throw createError({ statusCode: 403 })
      }
      
      return handler(event, user)
    })
  }
}
```

```typescript
// Usage
export default requireRole('admin')(async (event, user) => {
  // Only admins reach here
  return fetchAdminData()
})
```

### Require Permission

```typescript
export function requirePermission(permission: string) {
  return (handler: (event: H3Event, user: AuthUser) => any) => {
    return defineEventHandler(async (event) => {
      const user = await verifyAuth(event)
      
      if (!user.permissions.includes(permission)) {
        throw createError({ statusCode: 403 })
      }
      
      return handler(event, user)
    })
  }
}
```

```typescript
// Usage
export default requirePermission('pets.write')(
  async (event, user) => {
    return createPet(body, user.id)
  }
)
```

## Optional Authentication

```typescript
// Get user if authenticated, otherwise null
export async function getAuthUser(event: H3Event): Promise<AuthUser | null> {
  try {
    return await verifyAuth(event)
  } catch {
    return null
  }
}
```

```typescript
// Usage: Public endpoint with optional auth
export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  
  const pets = await fetchPets()
  
  // Add user-specific data if authenticated
  return pets.map(pet => ({
    ...pet,
    isFavorite: user ? user.favorites.includes(pet.id) : false,
    canEdit: user ? pet.ownerId === user.id : false
  }))
})
```

## Token Refresh

```typescript
// server/api/auth/refresh.post.ts
export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh-token')
  
  if (!refreshToken) {
    throw createError({ statusCode: 401 })
  }
  
  try {
    const decoded = jwt.verify(refreshToken, config.refreshSecret)
    
    // Generate new access token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      config.jwtSecret,
      { expiresIn: '15m' }
    )
    
    // Set new cookie
    setCookie(event, 'auth-token', newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 900  // 15 minutes
    })
    
    return { success: true }
  } catch (error) {
    throw createError({ statusCode: 401 })
  }
})
```

## Caching User Context

```typescript
// Cache user data to avoid repeated JWT verification
const userCache = new Map()

export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  const token = getToken(event)
  
  // Check cache
  const cached = userCache.get(token)
  if (cached && Date.now() < cached.expiry) {
    return cached.user
  }
  
  // Verify and cache
  const user = jwt.verify(token, config.jwtSecret) as AuthUser
  userCache.set(token, {
    user,
    expiry: Date.now() + 60000  // 1 minute
  })
  
  return user
}
```

## Security Best Practices

### ✅ Do

```typescript
// ✅ Use httpOnly cookies
setCookie(event, 'auth-token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})

// ✅ Short token expiration
jwt.sign(payload, secret, { expiresIn: '15m' })

// ✅ Validate token expiration
if (decoded.exp * 1000 < Date.now()) {
  throw createError({ statusCode: 401 })
}

// ✅ Use environment variables for secrets
const secret = useRuntimeConfig().jwtSecret
```

### ❌ Don't

```typescript
// ❌ Don't hardcode secrets
jwt.verify(token, 'my-secret')

// ❌ Don't expose tokens in URLs
const url = `/api/data?token=${token}`

// ❌ Don't use long expiration
jwt.sign(payload, secret, { expiresIn: '30d' })

// ❌ Don't store tokens in localStorage
localStorage.setItem('token', token)  // Use httpOnly cookies!
```

## Next Steps

- [JWT Verification →](/server/auth-context/jwt-verification)
- [User Context →](/server/auth-context/user-context)
- [Passing Context →](/server/auth-context/passing-context)
- [Examples →](/examples/server/auth-patterns/)
