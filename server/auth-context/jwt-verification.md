# JWT Verification

Deep dive into JSON Web Token (JWT) verification in server routes for secure authentication.

## What is JWT?

JWT (JSON Web Token) is a compact, URL-safe token format for securely transmitting information between parties.

### JWT Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0.signature
│                                      │                                            │
└─────────── Header ──────────────────┴─────────── Payload ───────────────────────┴── Signature
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "admin",
  "exp": 1709251200
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

## Installation

```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

## Basic Verification

### Simple Verification

```typescript
// server/utils/auth.ts
import jwt from 'jsonwebtoken'

export function verifyToken(token: string) {
  const config = useRuntimeConfig()
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    return decoded
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
}
```

### Full Implementation

```typescript
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export interface AuthUser {
  id: number
  email: string
  role: string
  exp: number
  iat: number
}

export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  const config = useRuntimeConfig()
  
  // 1. Extract token
  const token = extractToken(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'No token provided'
    })
  }
  
  // 2. Verify token
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser
    
    // 3. Check expiration (redundant but safe)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      throw createError({
        statusCode: 401,
        message: 'Token expired'
      })
    }
    
    return decoded
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        message: 'Token expired'
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        message: 'Invalid token'
      })
    }
    
    throw error
  }
}

function extractToken(event: H3Event): string | null {
  // Try cookie first
  const cookieToken = getCookie(event, 'auth-token')
  if (cookieToken) return cookieToken
  
  // Try Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}
```

## Verification Options

### Algorithm Specification

```typescript
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256']  // Only allow HMAC SHA256
})
```

**Supported algorithms:**
- `HS256`, `HS384`, `HS512` - HMAC
- `RS256`, `RS384`, `RS512` - RSA
- `ES256`, `ES384`, `ES512` - ECDSA

### Audience Verification

```typescript
const decoded = jwt.verify(token, secret, {
  audience: 'https://myapp.com'
})
```

### Issuer Verification

```typescript
const decoded = jwt.verify(token, secret, {
  issuer: 'https://auth.myapp.com'
})
```

### Maximum Age

```typescript
const decoded = jwt.verify(token, secret, {
  maxAge: '24h'  // Token max age
})
```

### Complete Options

```typescript
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  audience: 'https://myapp.com',
  issuer: 'https://auth.myapp.com',
  maxAge: '24h',
  clockTolerance: 10  // 10 seconds clock skew
})
```

## Error Handling

### Specific Error Types

```typescript
try {
  const decoded = jwt.verify(token, secret)
  return decoded
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    throw createError({
      statusCode: 401,
      message: 'Token expired. Please login again.'
    })
  }
  
  if (error.name === 'JsonWebTokenError') {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
  
  if (error.name === 'NotBeforeError') {
    throw createError({
      statusCode: 401,
      message: 'Token not yet valid'
    })
  }
  
  throw error
}
```

### User-Friendly Messages

```typescript
const ERROR_MESSAGES = {
  TokenExpiredError: 'Your session has expired. Please log in again.',
  JsonWebTokenError: 'Authentication failed. Please log in.',
  NotBeforeError: 'Token not yet active.',
}

try {
  return jwt.verify(token, secret)
} catch (error) {
  const message = ERROR_MESSAGES[error.name] || 'Authentication error'
  throw createError({ statusCode: 401, message })
}
```

## Token Extraction

### From Cookie

```typescript
function getTokenFromCookie(event: H3Event): string | null {
  return getCookie(event, 'auth-token')
}
```

### From Header

```typescript
function getTokenFromHeader(event: H3Event): string | null {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader) return null
  
  // "Bearer eyJhbGc..."
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}
```

### From Query Parameter

```typescript
function getTokenFromQuery(event: H3Event): string | null {
  const query = getQuery(event)
  return query.token as string || null
}
```

**⚠️ Warning:** Query parameters are logged and visible in URLs. Only use for specific cases (e.g., email links).

### Priority Order

```typescript
function extractToken(event: H3Event): string | null {
  // 1. Try cookie (most secure)
  const cookieToken = getCookie(event, 'auth-token')
  if (cookieToken) return cookieToken
  
  // 2. Try header (standard)
  const headerToken = getTokenFromHeader(event)
  if (headerToken) return headerToken
  
  // 3. Try query (least secure, special cases only)
  const queryToken = getTokenFromQuery(event)
  if (queryToken) return queryToken
  
  return null
}
```

## RSA/Public Key Verification

### Setup

```typescript
// Public key for verification
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`

const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256']
})
```

### With External Provider (e.g., Auth0)

```typescript
import { createRemoteJWKSet, jwtVerify } from 'jose'

const JWKS = createRemoteJWKSet(
  new URL('https://YOUR_DOMAIN/.well-known/jwks.json')
)

export async function verifyAuth(event: H3Event) {
  const token = extractToken(event)
  
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'https://YOUR_DOMAIN/',
    audience: 'YOUR_API_IDENTIFIER'
  })
  
  return payload as AuthUser
}
```

## Token Validation

### Manual Expiration Check

```typescript
function isTokenExpired(decoded: any): boolean {
  if (!decoded.exp) return false
  
  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}

// Usage
const decoded = jwt.decode(token)  // Don't verify yet
if (isTokenExpired(decoded)) {
  throw createError({ statusCode: 401, message: 'Token expired' })
}
```

### Custom Claims Validation

```typescript
function validateClaims(decoded: any) {
  // Check required fields
  if (!decoded.id || !decoded.email) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token claims'
    })
  }
  
  // Check role
  const validRoles = ['user', 'admin', 'moderator']
  if (!validRoles.includes(decoded.role)) {
    throw createError({
      statusCode: 401,
      message: 'Invalid role'
    })
  }
  
  return true
}
```

## Caching

### Cache Verified Tokens

```typescript
const tokenCache = new Map<string, { user: AuthUser, expiry: number }>()

export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  const token = extractToken(event)
  
  // Check cache
  const cached = tokenCache.get(token)
  if (cached && Date.now() < cached.expiry) {
    return cached.user
  }
  
  // Verify
  const user = jwt.verify(token, config.jwtSecret) as AuthUser
  
  // Cache for 5 minutes
  tokenCache.set(token, {
    user,
    expiry: Date.now() + 300000
  })
  
  return user
}
```

**Benefits:**
- Reduced CPU usage
- Faster responses
- Less crypto operations

**Cautions:**
- Memory usage
- Invalidation complexity
- Cache size management

### Cache Cleanup

```typescript
// Clean expired entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of tokenCache.entries()) {
    if (now > data.expiry) {
      tokenCache.delete(token)
    }
  }
}, 600000)
```

## Security Best Practices

### ✅ Do

```typescript
// ✅ Use strong secrets (32+ characters)
const secret = crypto.randomBytes(64).toString('hex')

// ✅ Specify algorithm explicitly
jwt.verify(token, secret, { algorithms: ['HS256'] })

// ✅ Short expiration times
jwt.sign(payload, secret, { expiresIn: '15m' })

// ✅ Verify issuer and audience
jwt.verify(token, secret, {
  issuer: 'myapp',
  audience: 'api'
})

// ✅ Use httpOnly cookies
setCookie(event, 'auth-token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})
```

### ❌ Don't

```typescript
// ❌ Don't use weak secrets
jwt.verify(token, 'secret')

// ❌ Don't allow 'none' algorithm
jwt.verify(token, secret, { algorithms: ['none'] })

// ❌ Don't use long expiration
jwt.sign(payload, secret, { expiresIn: '30d' })

// ❌ Don't ignore errors
try {
  jwt.verify(token, secret)
} catch {}  // Silent failure!

// ❌ Don't expose tokens in logs
console.log('Token:', token)  // Visible in logs!
```

## Debugging

```typescript
export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  const token = extractToken(event)
  
  console.log({
    hasToken: !!token,
    tokenLength: token?.length,
    source: token === getCookie(event, 'auth-token') ? 'cookie' : 'header'
  })
  
  if (!token) {
    console.log('No token found')
    throw createError({ statusCode: 401 })
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser
    console.log('Token verified for user:', decoded.id)
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error.message)
    throw createError({ statusCode: 401 })
  }
}
```

## Next Steps

- [User Context →](/server/auth-context/user-context)
- [Passing Context →](/server/auth-context/passing-context)
- [Data Transformers →](/server/transformers/)
- [Examples →](/examples/server/auth-patterns/)
