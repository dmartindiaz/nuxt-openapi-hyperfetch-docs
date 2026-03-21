# Server Interfaces

TypeScript interfaces for generated server composables.

## Server Composable

Generated server composables for Nitro routes.

### Type Signature

```typescript
function getServerPet(
  event: H3Event,
  id: number,
  options?: ServerComposableOptions<Pet>
): Promise<Pet>
```

### ServerComposableOptions

```typescript
interface ServerComposableOptions<T> {
  // Request options
  headers?: Record<string, string>
  query?: Record<string, any>
  
  // Transform response
  transform?: (data: T) => T | Promise<T>
  
  // Callbacks
  onRequest?: (ctx: ServerRequestContext) => void | Promise<void>
  onSuccess?: (data: T, ctx: ServerRequestContext) => void | Promise<void>
  onError?: (error: Error, ctx: ServerRequestContext) => void | Promise<void>
  
  // Skip global callbacks
  skipGlobalRequest?: boolean
  skipGlobalSuccess?: boolean
  skipGlobalError?: boolean
}
```

## Server Request Context

Context for server-side callbacks.

```typescript
interface ServerRequestContext {
  event: H3Event
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, any>
  body?: any
  headers?: Record<string, string>
  timestamp: number
}
```

## H3Event

Nitro event object (from `h3`).

```typescript
interface H3Event {
  node: {
    req: IncomingMessage
    res: ServerResponse
  }
  context: {
    // Your custom context
    user?: User
    auth?: AuthContext
    [key: string]: any
  }
}
```

## Generated Server Composables

### GET Request

```typescript
export async function getServerPet(
  event: H3Event,
  id: number,
  options?: ServerComposableOptions<Pet>
): Promise<Pet>
```

### POST Request

```typescript
export async function createServerPet(
  event: H3Event,
  body: CreatePetRequest,
  options?: ServerComposableOptions<Pet>
): Promise<Pet>
```

### PUT Request

```typescript
export async function updateServerPet(
  event: H3Event,
  id: number,
  body: UpdatePetRequest,
  options?: ServerComposableOptions<Pet>
): Promise<Pet>
```

### DELETE Request

```typescript
export async function deleteServerPet(
  event: H3Event,
  id: number,
  options?: ServerComposableOptions<void>
): Promise<void>
```

## Usage in Routes

### Basic Route

```typescript
// server/api/pets/[id].get.ts
import { getServerPet } from '~/server/composables/pets'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const pet = await getServerPet(event, Number(id))
  return pet
})
```

### With Transform

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const pet = await getServerPet(event, Number(id), {
    transform: (data) => ({
      ...data,
      displayName: `${data.name} (${data.category})`
    })
  })
  
  return pet
})
```

### With Auth Headers

```typescript
// server/api/pets/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = getRequestHeader(event, 'authorization')
  
  const pet = await createServerPet(event, body, {
    headers: {
      Authorization: token || ''
    }
  })
  
  return pet
})
```

## Auth Context

Custom auth context added by middleware.

```typescript
interface AuthContext {
  userId: number
  role: string
  email: string
}

// Access in routes
export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  //    ^? AuthContext | undefined
  
  if (!auth) {
    throw createError({ statusCode: 401 })
  }
})
```

## Examples

### Type-Safe Route

```typescript
import type { Pet, UpdatePetRequest } from '~/server/composables/pets'

export default defineEventHandler(async (event): Promise<Pet> => {
  const id = getRouterParam(event, 'id')
  const body: UpdatePetRequest = await readBody(event)
  
  return await updateServerPet(event, Number(id), body)
})
```

### Error Handling

```typescript
export default defineEventHandler(async (event) => {
  try {
    const pet = await getServerPet(event, 1)
    return pet
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message
    })
  }
})
```

## Next Steps

- [Composables Interfaces →](/api/interfaces/composables)
- [Generated Types →](/api/interfaces/types)
- [Server Examples →](/examples/server/basic-bff/simple-route)
