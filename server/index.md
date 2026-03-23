# Server API Routes

The `nuxtServer` generator creates Nuxt [server routes](https://nuxt.com/docs/guide/directory-structure/server) that act as a proxy layer between your frontend and your backend API. Each endpoint in your OpenAPI spec becomes a typed server route in `server/api/`.

```bash
nxh generate --generators nuxtServer
```

## What gets generated

```
server/
├── api/
│   ├── pet.post.ts              # POST /pet
│   ├── pet/
│   │   ├── findByStatus.get.ts  # GET /pet/findByStatus
│   │   └── [pet]/
│   │       ├── index.get.ts     # GET /pet/:pet
│   │       ├── index.post.ts    # POST /pet/:pet
│   │       └── index.delete.ts  # DELETE /pet/:pet
│   └── ...
├── auth/
│   ├── context.ts               # Auth context (edit this)
│   └── types.ts                 # AuthContext interface
└── bff/
    └── transformers/
        ├── pet.ts               # Transform pet responses (edit this)
        └── ...
```

Each generated route:
- Reads the request body / query params with full types
- Forwards the call to your backend using `$fetch` with `apiBaseUrl` from `runtimeConfig`
- Optionally loads auth context and passes it to your transformer
- Returns the (optionally transformed) response to the client

```typescript
// server/api/pet.post.ts  (auto-generated, do not edit)
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
      ...(config.apiSecret ? { Authorization: `Bearer ${config.apiSecret}` } : {}),
    },
  })

  const { transformPet } = await import('~/server/bff/transformers/pet')
  return transformPet(data, event, auth)
})
```

## BFF mode

When you enable BFF during generation, two additional things are generated alongside the routes:

- **`server/auth/context.ts`** — a stub where you implement how auth context is resolved per-request (e.g. read a JWT cookie). See [Auth Context →](/server/auth-context/)
- **`server/bff/transformers/*.ts`** — one stub per API tag where you add business logic before returning data to the client. See [Transformers →](/server/transformers/)

Both files are generated **once and never overwritten**, so your changes are safe across re-generations.

## Runtime config

The generated routes rely on two `runtimeConfig` keys:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL,  // Backend base URL
    apiSecret: process.env.API_SECRET,     // Optional bearer token
  }
})
```

## Next steps

- [Getting started →](/server/getting-started)
- [Route structure →](/server/route-structure)
- [BFF pattern →](/server/bff-pattern/)
- [Auth context →](/server/auth-context/)
- [Transformers →](/server/transformers/)
