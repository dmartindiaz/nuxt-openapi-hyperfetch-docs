# Server Route Structure

How nuxt-openapi-hyperfetch maps your OpenAPI paths and HTTP methods to Nuxt server route files.

## File naming convention

The generator follows a deterministic naming rule:

- The **HTTP method** becomes the file extension: `.get.ts`, `.post.ts`, `.put.ts`, `.delete.ts`
- A **literal path segment** at the end becomes the filename: `findByStatus.get.ts`
- A **path parameter** at the end creates a `[param]/index.{method}.ts` folder
- A **root-level path** (`/pet`) creates `pet.{method}.ts` directly under `server/api/`

### Examples

| OpenAPI path | Method | Generated file |
|---|---|---|
| `/pet` | POST | `pet.post.ts` |
| `/pet` | PUT | `pet.put.ts` |
| `/pet/findByStatus` | GET | `pet/findByStatus.get.ts` |
| `/pet/{petId}` | GET | `pet/[pet]/index.get.ts` |
| `/pet/{petId}` | DELETE | `pet/[pet]/index.delete.ts` |
| `/pet/{petId}/uploadImage` | POST | `pet/[pet]/uploadImage.post.ts` |
| `/store/order` | POST | `store/order.post.ts` |
| `/store/order/{orderId}` | GET | `store/order/[order]/index.get.ts` |
| `/user/{username}` | PUT | `user/[username]/index.put.ts` |

### Parameter name simplification

OpenAPI path parameters with an `id` suffix are simplified: `{petId}` → `[pet]`, `{orderId}` → `[order]`. Parameters without the suffix keep their name: `{username}` → `[username]`.

## Real example — Petstore

Given the standard Petstore OpenAPI spec, the generator produces:

```
server/api/
├── _routes.ts                         ← route index (auto-generated, do not edit)
├── pet.post.ts                        ← POST /pet
├── pet.put.ts                         ← PUT /pet
├── pet/
│   ├── findByStatus.get.ts            ← GET /pet/findByStatus
│   ├── findByTags.get.ts              ← GET /pet/findByTags
│   └── [pet]/
│       ├── index.get.ts               ← GET /pet/:pet
│       ├── index.post.ts              ← POST /pet/:pet
│       ├── index.delete.ts            ← DELETE /pet/:pet
│       └── uploadImage.post.ts        ← POST /pet/:pet/uploadImage
├── store/
│   ├── inventory.get.ts               ← GET /store/inventory
│   ├── order.post.ts                  ← POST /store/order
│   └── order/
│       └── [order]/
│           ├── index.get.ts           ← GET /store/order/:order
│           └── index.delete.ts        ← DELETE /store/order/:order
└── user/
    ├── user.post.ts                   ← POST /user
    ├── createWithList.post.ts         ← POST /user/createWithList
    ├── login.get.ts                   ← GET /user/login
    ├── logout.get.ts                  ← GET /user/logout
    └── [username]/
        ├── index.get.ts               ← GET /user/:username
        ├── index.put.ts               ← PUT /user/:username
        └── index.delete.ts            ← DELETE /user/:username
```

## What the generated routes look like

### Route with query parameters

```typescript
// server/api/pet/findByStatus.get.ts  (auto-generated)
import { defineEventHandler, createError, getQuery } from 'h3'
import type { FindPetsByStatusRequest, Pet } from '~/swagger'

export default defineEventHandler(async (event): Promise<Pet[]> => {
  const query = getQuery(event)

  const { getAuthContext } = await import('~/server/auth/context')
  const auth = await getAuthContext(event)

  const config = useRuntimeConfig()
  const data = await $fetch<Pet[]>(`${config.apiBaseUrl}/pet/findByStatus`, {
    query,
    headers: {
      ...(config.apiSecret ? { Authorization: `Bearer ${config.apiSecret}` } : {}),
    },
  })

  const { transformPet } = await import('~/server/bff/transformers/pet')
  return transformPet(data, event, auth)
})
```

### Route with request body

```typescript
// server/api/pet.post.ts  (auto-generated)
import { defineEventHandler, createError, readBody } from 'h3'
import type { AddPetRequest, Pet } from '~/swagger'

export default defineEventHandler(async (event): Promise<Pet> => {
  const body = await readBody<AddPetRequest>(event)

  const { getAuthContext } = await import('~/server/auth/context')
  const auth = await getAuthContext(event)

  const config = useRuntimeConfig()
  const data = await $fetch<Pet>(`${config.apiBaseUrl}/pet`, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiSecret ? { Authorization: `Bearer ${config.apiSecret}` } : {}),
    },
  })

  const { transformPet } = await import('~/server/bff/transformers/pet')
  return transformPet(data, event, auth)
})
```

## The `_routes.ts` file

`server/api/_routes.ts` is generated alongside the routes and serves as an audit index — it lists every route that was generated with its file path. It exports nothing and is never executed; it exists only as a reference.

## Re-generation behaviour

All files under `server/api/` are **overwritten on every generation**. If you need to add custom logic to a route, do it in the transformer for that resource (`server/bff/transformers/{resource}.ts`) which is never overwritten. See [Transformers →](/server/transformers/)
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
