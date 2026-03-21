# Getting Started with Server Routes

Learn how to generate and configure server routes for your Nuxt application.

## Prerequisites

- Nuxt 3 project
- OpenAPI/Swagger specification file
- nuxt-openapi-hyperfetch installed

## Installation

If you haven't installed nuxt-openapi-hyperfetch yet:

```bash
npm install -D nuxt-openapi-hyperfetch
```

## Generate Server Routes

### Interactive Mode

```bash
nxh generate
```

Select **nuxtServer** when prompted:

```
? Which generator would you like to use?
  nuxtUseFetch
❯ nuxtServer
  nuxtUseAsyncData
```

### Direct Command

```bash
nxh generate -g nuxtServer
```

### With Options

```bash
nxh generate \
  -i ./swagger.yaml \
  -o ./output \
  -g nuxtServer
```

## What Gets Generated

### Directory Structure

```
server/
├── api/
│   ├── pets/
│   │   ├── index.get.ts           # GET /api/pets
│   │   ├── index.post.ts          # POST /api/pets
│   │   └── [id]/
│   │       ├── index.get.ts       # GET /api/pets/:id
│   │       ├── index.put.ts       # PUT /api/pets/:id
│   │       └── index.delete.ts    # DELETE /api/pets/:id
│   └── orders/
│       └── ...
├── utils/
│   ├── auth.ts                    # Authentication helpers
│   ├── transformers.ts            # Data transformers
│   └── api-client.ts              # Backend API client
└── middleware/
    ├── auth.ts                    # Auth middleware
    └── error-handler.ts           # Error handling
```

## Configuration

### 1. Runtime Config

Create or update `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private: server-only
    backendUrl: process.env.BACKEND_URL || 'https://api.example.com',
    backendApiKey: process.env.BACKEND_API_KEY,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    
    public: {
      // Public: available to client
      apiBase: '/api'
    }
  }
})
```

### 2. Environment Variables

Create `.env` file:

```bash
# Backend API Configuration
BACKEND_URL=https://api.example.com
BACKEND_API_KEY=your-backend-api-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Optional
NODE_ENV=development
```

Add to `.gitignore`:

```
.env
.env.*
!.env.example
```

### 3. Environment Example

Create `.env.example`:

```bash
BACKEND_URL=https://api.example.com
BACKEND_API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret-here
```

## Copy Generated Files

Copy the generated files to your Nuxt project:

```bash
# Copy server directory
cp -r ./output/server ./server

# Or on Windows
xcopy /E /I .\output\server .\server
```

## Verify Installation

### 1. Check Files

```bash
# List generated API routes
ls server/api/

# On Windows
dir server\api\
```

### 2. Start Nuxt

```bash
npm run dev
```

### 3. Test Endpoint

Open browser or use curl:

```bash
# Test health check
curl http://localhost:3000/api/health

# Test pets endpoint
curl http://localhost:3000/api/pets
```

## Basic Usage

### Server Route Example

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Verify authentication
    const user = await verifyAuth(event)
    
    // Get query parameters
    const query = getQuery(event)
    
    // Call backend API
    const pets = await $fetch(`${config.backendUrl}/pets`, {
      query,
      headers: {
        'Authorization': `Bearer ${config.backendApiKey}`
      }
    })
    
    // Transform response
    return transformPetsResponse(pets, user)
    
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message
    })
  }
})
```

### Client Usage

```vue
<script setup lang="ts">
// Automatically uses /api/pets (your server route)
const { data: pets } = useFetchGetPets()
</script>

<template>
  <div>
    <div v-for="pet in pets" :key="pet.id">
      {{ pet.name }}
    </div>
  </div>
</template>
```

## Authentication Setup

### 1. Create Auth Utility

The generator creates `server/utils/auth.ts`:

```typescript
// server/utils/auth.ts
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export interface AuthUser {
  id: number
  email: string
  role: string
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

export function requireAuth(handler: (event: H3Event, user: AuthUser) => any) {
  return defineEventHandler(async (event) => {
    const user = await verifyAuth(event)
    return handler(event, user)
  })
}
```

### 2. Use in Routes

```typescript
// server/api/pets/index.post.ts
export default requireAuth(async (event, user) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  
  // User is automatically verified
  const pet = await $fetch(`${config.backendUrl}/pets`, {
    method: 'POST',
    body: {
      ...body,
      ownerId: user.id  // Add user context
    },
    headers: {
      'Authorization': `Bearer ${config.backendApiKey}`
    }
  })
  
  return pet
})
```

## Testing

### Manual Testing

```bash
# Without auth
curl http://localhost:3000/api/pets

# With auth token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/pets

# POST request
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Fluffy","status":"available"}' \
  http://localhost:3000/api/pets
```

### Automated Testing

```typescript
// tests/api/pets.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('Pets API', async () => {
  await setup()
  
  it('returns pets list', async () => {
    const pets = await $fetch('/api/pets')
    expect(pets).toBeInstanceOf(Array)
  })
  
  it('requires auth for POST', async () => {
    await expect($fetch('/api/pets', { 
      method: 'POST',
      body: { name: 'Test' }
    })).rejects.toThrow('401')
  })
})
```

## Troubleshooting

### CORS Issues

If you get CORS errors:

```typescript
// server/middleware/cors.ts
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': '*'
  })
  
  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
  }
})
```

### Environment Variables Not Working

```bash
# Check if .env file is loaded
npm run dev

# Verify in server route
console.log(useRuntimeConfig().backendUrl)
```

### 401 Errors

Check JWT secret matches between:
- Token generation (login)
- Token verification (server routes)

```typescript
// Debug auth
export async function verifyAuth(event: H3Event) {
  const token = getCookie(event, 'auth-token')
  console.log('Token:', token ? 'EXISTS' : 'MISSING')
  
  // ... rest of code
}
```

## Next Steps

- [Route Structure →](/server/route-structure)
- [What is BFF? →](/server/bff-pattern/what-is-bff)
- [Auth Context →](/server/auth-context/)
- [Data Transformers →](/server/transformers/)
- [Examples →](/examples/server/basic-bff/)
