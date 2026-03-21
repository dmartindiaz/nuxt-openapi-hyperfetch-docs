# Server Route Structure

Understanding the file-based routing system for Nuxt server routes and how nuxt-openapi-hyperfetch organizes generated API endpoints.

## Nuxt Server Routes

Nuxt uses file-based routing for server routes in the `/server` directory.

### Basic Structure

```
server/
├── api/              ← API routes
├── routes/           ← Server routes
├── middleware/       ← Server middleware
└── utils/            ← Server utilities
```

## API Routes (Generated)

### File Naming Convention

```
server/api/
├── pets/
│   ├── index.get.ts        ← GET /api/pets
│   ├── index.post.ts       ← POST /api/pets
│   └── [id]/
│       ├── index.get.ts    ← GET /api/pets/:id
│       ├── index.put.ts    ← PUT /api/pets/:id
│       └── index.delete.ts ← DELETE /api/pets/:id
```

### HTTP Method Mapping

| File | Route | Method |
|------|-------|--------|
| `index.get.ts` | `/api/pets` | GET |
| `index.post.ts` | `/api/pets` | POST |
| `[id]/index.get.ts` | `/api/pets/:id` | GET |
| `[id]/index.put.ts` | `/api/pets/:id` | PUT |
| `[id]/index.patch.ts` | `/api/pets/:id` | PATCH |
| `[id]/index.delete.ts` | `/api/pets/:id` | DELETE |

## Path Parameters

### Dynamic Routes

```
server/api/
└── pets/
    └── [id]/
        └── index.get.ts
```

```typescript
// Accessible as: GET /api/pets/123
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  // id = "123"
  
  return fetchPet(parseInt(id))
})
```

### Multiple Parameters

```
server/api/
└── pets/
    └── [id]/
        └── photos/
            └── [photoId]/
                └── index.get.ts
```

```typescript
// Accessible as: GET /api/pets/123/photos/456
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')        // "123"
  const photoId = getRouterParam(event, 'photoId')  // "456"
  
  return fetchPetPhoto(parseInt(id), parseInt(photoId))
})
```

### Catch-all Routes

```
server/api/
└── [...slug].ts
```

```typescript
// Matches: /api/anything/here/works
export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  // slug = "anything/here/works"
})
```

## Generated Structure Example

### From OpenAPI

```yaml
# swagger.yaml
paths:
  /pets:
    get:
      operationId: getPets
    post:
      operationId: createPet
  /pets/{id}:
    get:
      operationId: getPet
    put:
      operationId: updatePet
    delete:
      operationId: deletePet
  /pets/{id}/photos:
    get:
      operationId: getPetPhotos
```

### Generated Files

```
server/api/
└── pets/
    ├── index.get.ts           ← GET /pets
    ├── index.post.ts          ← POST /pets
    └── [id]/
        ├── index.get.ts       ← GET /pets/:id
        ├── index.put.ts       ← PUT /pets/:id
        ├── index.delete.ts    ← DELETE /pets/:id
        └── photos/
            └── index.get.ts   ← GET /pets/:id/photos
```

## Route File Template

### Basic Route

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // 1. Verify authentication
  const user = await verifyAuth(event)
  
  // 2. Get query parameters
  const query = getQuery(event)
  
  // 3. Call backend
  const pets = await $fetch(`${config.backendUrl}/pets`, {
    query,
    headers: {
      'X-API-Key': config.backendApiKey,
      'X-User-ID': user.id.toString()
    }
  })
  
  // 4. Transform response
  return transformPetsForUser(pets, user)
})
```

### With Path Parameters

```typescript
// server/api/pets/[id]/index.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await verifyAuth(event)
  
  // Extract path parameter
  const id = getRouterParam(event, 'id')
  
  const pet = await $fetch(`${config.backendUrl}/pets/${id}`, {
    headers: {
      'X-API-Key': config.backendApiKey,
      'X-User-ID': user.id.toString()
    }
  })
  
  return transformPet(pet, user)
})
```

### With Request Body

```typescript
// server/api/pets/index.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await verifyAuth(event)
  
  // Read request body
  const body = await readBody(event)
  
  // Validate
  if (!body.name) {
    throw createError({
      statusCode: 400,
      message: 'Name is required'
    })
  }
  
  // Call backend
  const pet = await $fetch(`${config.backendUrl}/pets`, {
    method: 'POST',
    body: {
      ...body,
      ownerId: user.id
    },
    headers: {
      'X-API-Key': config.backendApiKey
    }
  })
  
  return transformPet(pet, user)
})
```

## Middleware

### Global Middleware

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // Skip auth for public endpoints
  if (event.path.startsWith('/api/public')) {
    return
  }
  
  // Verify auth for all other routes
  await verifyAuth(event)
})
```

### Route-Specific Middleware

```typescript
// server/middleware/admin.ts
export default defineEventHandler(async (event) => {
  // Only runs for /api/admin/* routes
  if (event.path.startsWith('/api/admin')) {
    const user = await verifyAuth(event)
    
    if (user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Admin access required'
      })
    }
  }
})
```

## Utilities Structure

```
server/utils/
├── auth.ts              ← Authentication helpers
├── transformers.ts      ← Data transformers
├── api-client.ts        ← Backend API client
├── validators.ts        ← Input validation
└── helpers.ts           ← Common utilities
```

### Example Utilities

```typescript
// server/utils/auth.ts
export async function verifyAuth(event: H3Event): Promise<AuthUser> {
  // ...
}

export function requireRole(role: string) {
  // ...
}
```

```typescript
// server/utils/transformers.ts
export function transformPet(pet: any, user: AuthUser) {
  // ...
}

export function transformPetCollection(pets: any[], user: AuthUser) {
  // ...
}
```

```typescript
// server/utils/api-client.ts
export async function callBackend<T>(
  path: string,
  event: H3Event,
  options?: RequestInit
): Promise<T> {
  // ...
}
```

## Complete Example

### Project Structure

```
server/
├── api/
│   ├── auth/
│   │   ├── login.post.ts
│   │   ├── logout.post.ts
│   │   └── refresh.post.ts
│   ├── pets/
│   │   ├── index.get.ts
│   │   ├── index.post.ts
│   │   └── [id]/
│   │       ├── index.get.ts
│   │       ├── index.put.ts
│   │       ├── index.delete.ts
│   │       └── photos/
│   │           ├── index.get.ts
│   │           └── index.post.ts
│   └── orders/
│       ├── index.get.ts
│       ├── index.post.ts
│       └── [id]/
│           └── index.get.ts
├── middleware/
│   ├── auth.ts
│   ├── cors.ts
│   └── error-handler.ts
└── utils/
    ├── auth.ts
    ├── transformers.ts
    ├── api-client.ts
    └── validators.ts
```

### Route Mappings

| Route | Method | File |
|-------|--------|------|
| `/api/auth/login` | POST | `api/auth/login.post.ts` |
| `/api/auth/logout` | POST | `api/auth/logout.post.ts` |
| `/api/pets` | GET | `api/pets/index.get.ts` |
| `/api/pets` | POST | `api/pets/index.post.ts` |
| `/api/pets/123` | GET | `api/pets/[id]/index.get.ts` |
| `/api/pets/123` | PUT | `api/pets/[id]/index.put.ts` |
| `/api/pets/123` | DELETE | `api/pets/[id]/index.delete.ts` |
| `/api/pets/123/photos` | GET | `api/pets/[id]/photos/index.get.ts` |
| `/api/pets/123/photos` | POST | `api/pets/[id]/photos/index.post.ts` |
| `/api/orders` | GET | `api/orders/index.get.ts` |
| `/api/orders` | POST | `api/orders/index.post.ts` |
| `/api/orders/456` | GET | `api/orders/[id]/index.get.ts` |

## Best Practices

### ✅ Do

```typescript
// ✅ Use descriptive folder names
server/api/pets/
server/api/orders/

// ✅ Follow HTTP method conventions
index.get.ts   ← GET
index.post.ts  ← POST
index.put.ts   ← PUT
index.delete.ts ← DELETE

// ✅ Extract common logic to utils
import { verifyAuth } from '~/server/utils/auth'

// ✅ Use TypeScript
export default defineEventHandler(async (event): Promise<Pet[]> => {
  // ...
})
```

### ❌ Don't

```typescript
// ❌ Don't mix methods in one file
// index.ts with if (method === 'GET')

// ❌ Don't hardcode configuration
const url = 'https://api.example.com'  // Use runtimeConfig

// ❌ Don't skip authentication
// Always verify user unless public endpoint

// ❌ Don't expose internal structure
// Transform responses before returning
```

## URL Patterns

### Simple Path

```
File: server/api/pets/index.get.ts
URL: /api/pets
```

### With Parameter

```
File: server/api/pets/[id]/index.get.ts
URL: /api/pets/123
Parameter: id = "123"
```

### Multiple Parameters

```
File: server/api/pets/[id]/photos/[photoId]/index.get.ts
URL: /api/pets/123/photos/456
Parameters: id = "123", photoId = "456"
```

### Nested Resources

```
File: server/api/users/[userId]/posts/[postId]/comments/index.get.ts
URL: /api/users/1/posts/2/comments
Parameters: userId = "1", postId = "2"
```

## Next Steps

- [Getting Started →](/server/getting-started)
- [BFF Pattern →](/server/bff-pattern/)
- [Auth Context →](/server/auth-context/)
- [Data Transformers →](/server/transformers/)
- [Examples →](/examples/server/)
