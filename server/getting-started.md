# Getting Started with Server Routes

## Prerequisites

- Nuxt 3 project
- OpenAPI/Swagger specification file
- `nuxt-openapi-hyperfetch` installed

## Generate server routes

Run the generator and select **Nuxt Server Routes** when prompted:

```bash
nxh generate
```

The CLI will ask in this order:

1. Which generators to use → select `Nuxt Server Routes`
2. Path to your OpenAPI spec (e.g. `./swagger.yaml`)
3. Where to output the OpenAPI client files (e.g. `./swagger`)
4. Where to generate server routes (e.g. `server/api`)
5. Whether to enable BFF mode (transformers + auth stubs)

Or pass everything directly:

```bash
nxh generate \
  --input ./swagger.yaml \
  --output ./swagger \
  --generators nuxtServer \
  --server-route-path server/api \
  --enable-bff
```

The routes are generated directly into your project — no copying needed.

## Configure runtime variables

The generated routes use two `runtimeConfig` keys to reach your backend. Add them to `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL,  // Backend base URL
    apiSecret: process.env.API_SECRET,     // Bearer token (optional)
  }
})
```

And set the values in your `.env`:

```bash
API_BASE_URL=https://api.example.com
API_SECRET=your-backend-api-key
```

## Start the dev server

```bash
npm run dev
```

The generated routes are immediately available under `/api/`. For example, a `GET /pet/{petId}` endpoint in your spec becomes accessible at `http://localhost:3000/api/pet/[petId]`.

## Next steps

- [Route structure →](/server/route-structure)
- [BFF pattern →](/server/bff-pattern/)
- [Auth context →](/server/auth-context/)
- [Transformers →](/server/transformers/)

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
- [BFF Pattern →](/server/bff-pattern/)
- [Auth Context →](/server/auth-context/)
- [Data Transformers →](/server/transformers/)
