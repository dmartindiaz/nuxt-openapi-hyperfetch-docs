# Server Issues

Solutions for server composable and BFF pattern problems.

## Import Errors

### Cannot Find Server Composable

```typescript
// server/api/pets.ts
import { getServerPet } from '~/server/composables/pets'
// Cannot find module
```

**Cause:** Server composables not generated or wrong path

**Solution:**

```bash
# 1. Generate server composables
echo nuxtServer | nxh generate -i swagger.yaml -o ./server/composables

# 2. Verify file exists
ls server/composables/pets.ts

# 3. Use correct import path
import { getServerPet } from '../composables/pets'
```

### Type Module Errors

```typescript
import { getServerPet } from '../composables/pets'
// ❌ Cannot use import statement outside module
```

**Cause:** Server files need proper TypeScript/ES module setup

**Solution:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

## H3Event Issues

### Event Parameter Missing

```typescript
// server/api/pets/[id].ts
export default defineEventHandler(async () => {
  const pet = await getServerPet(1)  // ❌ Missing event parameter
  return pet
})
```

**Cause:** Server composables require H3Event as first parameter

**Solution:**

```typescript
// server/api/pets/[id].ts
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const pet = await getServerPet(event, id)  // ✅ Pass event
  return pet
})
```

### Cannot Read Properties of Event

```typescript
const headers = event.headers
// ❌ Property 'headers' does not exist on type 'H3Event'
```

**Cause:** Wrong API for H3Event

**Solution:**

```typescript
import { getHeaders, getHeader } from 'h3'

// ✅ Use H3 utilities
const headers = getHeaders(event)
const auth = getHeader(event, 'authorization')
```

## Authentication Issues

### Authorization Header Not Forwarded

```typescript
// server/api/pets.ts
export default defineEventHandler(async (event) => {
  const pet = await getServerPet(event, 1)
  // API returns 401
})
```

**Cause:** Headers not forwarded to backend API

**Solution:**

```typescript
import { getProxyHeaders } from '../utils/headers'

export default defineEventHandler(async (event) => {
  const headers = getProxyHeaders(event)
  
  const pet = await getServerPet(event, 1, {
    headers  // ✅ Forward headers
  })
  
  return pet
})
```

### Missing Auth Token

```typescript
// Backend API returns 401
```

**Cause:** Token not in request or wrong header

**Solution:**

```typescript
// utils/headers.ts
import { getHeaders } from 'h3'

export function getProxyHeaders(event: H3Event) {
  const headers = getHeaders(event)
  
  return {
    authorization: headers.authorization,  // ✅ Forward auth header
    'x-api-key': process.env.API_KEY      // ✅ Add server API key
  }
}

// server/api/pets.ts
export default defineEventHandler(async (event) => {
  const pet = await getServerPet(event, 1, {
    headers: getProxyHeaders(event)
  })
  return pet
})
```

### Cannot Access User Context

```typescript
const user = event.context.user  // ❌ undefined
```

**Cause:** Auth middleware not setting user context

**Solution:**

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')
  
  if (token) {
    // Verify token and get user
    const user = await verifyToken(token)
    event.context.user = user  // ✅ Set context
  }
})

// server/api/pets.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user  // ✅ Now available
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  return await getServerPets(event)
})
```

## Error Handling

### Errors Not Properly Returned

```typescript
export default defineEventHandler(async (event) => {
  try {
    return await getServerPet(event, 1)
  } catch (error) {
    return { error: error.message }  // ❌ Wrong format
  }
})
```

**Cause:** Should use `createError` from H3

**Solution:**

```typescript
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    return await getServerPet(event, 1)
  } catch (error: any) {
    // ✅ Use createError
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal Server Error',
      data: error.data
    })
  }
})
```

### Backend Errors Not Transformed

```typescript
// Backend returns: { "error_code": "NOT_FOUND" }
// Want to return: { "message": "Pet not found" }
```

**Cause:** Error response needs transformation

**Solution:**

```typescript
export default defineEventHandler(async (event) => {
  try {
    return await getServerPet(event, 1)
  } catch (error: any) {
    // ✅ Transform backend errors
    const message = error.statusCode === 404 
      ? 'Pet not found'
      : 'Failed to fetch pet'
    
    throw createError({
      statusCode: error.statusCode || 500,
      message
    })
  }
})
```

## Query Parameters

### Query Params Not Passed

```typescript
// Client: /api/pets?limit=10
// Server composable doesn't receive params
```

**Cause:** Query params not extracted and passed

**Solution:**

```typescript
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)  // ✅ Get query params
  
  const pets = await getServerPets(event, {
    query: {
      limit: Number(query.limit) || 10,
      offset: Number(query.offset) || 0
    }
  })
  
  return pets
})
```

### Query Validation Failing

```typescript
const query = getQuery(event)
const limit = query.limit  // ❌ Type: string | string[] | undefined
```

**Cause:** Query params need validation

**Solution:**

```typescript
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // ✅ Validate and convert
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10))
  const offset = Math.max(0, Number(query.offset) || 0)
  
  return await getServerPets(event, {
    query: { limit, offset }
  })
})
```

## Response Transformation

### Cannot Modify Response

```typescript
export default defineEventHandler(async (event) => {
  const pet = await getServerPet(event, 1)
  pet.newField = 'value'  // ❌ Cannot add to readonly
  return pet
})
```

**Cause:** Response type is readonly

**Solution:**

```typescript
export default defineEventHandler(async (event) => {
  const pet = await getServerPet(event, 1)
  
  // ✅ Create new object
  return {
    ...pet,
    newField: 'value'
  }
})
```

### Sensitive Data Not Filtered

```typescript
// Accidentally returning password hash
```

**Cause:** Backend returns sensitive fields

**Solution:**

```typescript
export default defineEventHandler(async (event) => {
  const user = await getServerUser(event, 1)
  
  // ✅ Filter sensitive fields
  const { password, apiKey, ...safeUser } = user
  
  return safeUser
})
```

## Performance Issues

### Slow BFF Routes

```typescript
export default defineEventHandler(async (event) => {
  // Multiple serial requests
  const pet = await getServerPet(event, 1)
  const owner = await getServerOwner(event, pet.ownerId)
  const vet = await getServerVet(event, pet.vetId)
  
  return { pet, owner, vet }
})
```

**Cause:** Serial requests instead of parallel

**Solution:**

```typescript
export default defineEventHandler(async (event) => {
  const petId = 1
  
  // ✅ Parallel requests
  const [pet, owner, vet] = await Promise.all([
    getServerPet(event, petId),
    getServerOwner(event, petId),
    getServerVet(event, petId)
  ])
  
  return { pet, owner, vet }
})
```

### No Caching

```typescript
// Same request called multiple times
```

**Cause:** No caching layer

**Solution:**

```typescript
import { defineCachedEventHandler } from '#nitro'

export default defineCachedEventHandler(
  async (event) => {
    return await getServerPets(event)
  },
  {
    maxAge: 60,  // ✅ Cache for 60 seconds
    getKey: (event) => {
      const query = getQuery(event)
      return `pets-${query.limit}-${query.offset}`
    }
  }
)
```

## Route Parameters

### Cannot Access Route Params

```typescript
// /api/pets/[id].ts
const id = event.params.id  // ❌ Property 'params' does not exist
```

**Cause:** Wrong API for accessing route params

**Solution:**

```typescript
// ✅ Use event.context.params
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ID'
    })
  }
  
  return await getServerPet(event, id)
})
```

### Params Type Wrong

```typescript
const id = event.context.params?.id  // Type: string
// Need: number
```

**Cause:** Route params are strings

**Solution:**

```typescript
export default defineEventHandler(async (event) => {
  const idStr = event.context.params?.id
  
  // ✅ Validate and convert
  const id = Number(idStr)
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID must be a number'
    })
  }
  
  return await getServerPet(event, id)
})
```

## CORS Issues

### CORS Errors in Development

```bash
Access to fetch at 'http://localhost:3000/api/pets' blocked by CORS
```

**Cause:** CORS not configured

**Solution:**

```typescript
// server/middleware/cors.ts
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  })
  
  if (event.method === 'OPTIONS') {
    return ''
  }
})
```

## Debugging

### Enable Server Logging

```typescript
export default defineEventHandler(async (event) => {
  console.log('→ Request:', event.path)
  console.log('→ Method:', event.method)
  console.log('→ Headers:', getHeaders(event))
  console.log('→ Query:', getQuery(event))
  
  try {
    const result = await getServerPet(event, 1)
    console.log('✓ Success:', result)
    return result
  } catch (error) {
    console.error('✗ Error:', error)
    throw error
  }
})
```

### Check Nitro Logs

```bash
# Development mode shows all server logs
npm run dev

# Check for:
# - Request paths
# - Error messages
# - Console.logs from server
```

## Next Steps

- [Runtime Errors →](/troubleshooting/runtime-errors)
- [Server Guide →](/guide/server/)
- [BFF Pattern →](/architecture/patterns/bff-pattern)
