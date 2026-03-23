# Generating Composables

Learn how to generate composables from your OpenAPI specification.

## Interactive Mode

The simplest way to generate composables is using **interactive mode**:

```bash
nxh generate
```

The CLI will prompt you for:

1. **Input file path**: Location of your OpenAPI/Swagger file
2. **Output directory**: Where to generate files
3. **Generator type**: `useFetch`, `useAsyncData`, or `nuxtServer`

### Example Session

**For useFetch/useAsyncData:**

```bash
$ nxh generate

? Enter path to OpenAPI specification file: swagger.yaml
? Enter output directory: ./composables/api
? Select generator type: useFetch

✓ Parsed OpenAPI specification
✓ Found 15 operations
✓ Generated 15 composables
✓ Copied runtime files

Done! Generated files in ./composables/api
```

**For nuxtServer:**

```bash
$ nxh generate

? Enter path to OpenAPI specification file: swagger.yaml
? Enter output directory: ./server/api
? Select generator type: nuxtServer
? Enable BFF pattern? (y/n): y

✓ Parsed OpenAPI specification
✓ Found 15 operations
✓ Generated 15 server routes
✓ Generated BFF structure (auth + transformers)
✓ Generated configuration files

Done! Generated files in ./server/api
Next steps:
1. Copy .env.example to .env and configure your backend URL
2. Update nuxt.config.ts with runtimeConfig
3. Implement authentication in server/auth/context.ts
4. See SERVER_ROUTES.md for documentation
```

## Command-Line Arguments

For automation or scripts, provide all arguments:

**useFetch/useAsyncData:**

```bash
nxh generate \
  --input swagger.yaml \
  --output ./composables/api \
  --generator useFetch
```

**nuxtServer:**

```bash
nxh generate \
  --input swagger.yaml \
  --output ./server/api \
  --generator nuxtServer
```

**nuxtServer with BFF:**

```bash
nxh generate \
  --input swagger.yaml \
  --output ./server/api \
  --generator nuxtServer \
  --bff
```

### Short Aliases

```bash
# useFetch
nxh generate -i swagger.yaml -o ./composables/api -g useFetch

# nuxtServer
nxh generate -i swagger.yaml -o ./server/api -g nuxtServer

# nuxtServer with BFF
nxh generate -i swagger.yaml -o ./server/api -g nuxtServer --bff
```

## Input File Formats

Nuxt OpenAPI Hyperfetch supports multiple OpenAPI formats:

### YAML (Recommended)

```bash
nxh generate -i swagger.yaml -o ./api
```

YAML is more readable and commonly used for OpenAPI specs.

### JSON

```bash
nxh generate -i openapi.json -o ./api
```

JSON works identically to YAML.

### Remote URLs

```bash
nxh generate -i https://petstore.swagger.io/v2/swagger.json -o ./api
```

The generator can fetch specs from URLs (useful for CI/CD).

## Output Structure

Generated files follow different structures depending on the generator type:

### useFetch Generator

Composables are generated inside `composables/use-fetch/` within the same `output` directory as the backend-generated files. The top-level structure differs depending on the backend:

#### OpenAPI Generator (official)

```
output/                              # e.g. ./swagger
├── apis/                            # API classes (one per tag)
│   ├── PetApi.ts
│   └── ...
├── models/                          # Model types
│   ├── Pet.ts
│   └── ...
└── composables/
    └── use-fetch/
        ├── index.ts                 # Exports all composables
        ├── composables/             # Generated composables
        │   ├── useFetchGetPets.ts
        │   ├── useFetchGetPetById.ts
        │   └── ...                  # One file per operation
        ├── runtime/                 # Runtime helpers (copied once)
        │   └── useApiRequest.ts     # Core wrapper for useFetch
        └── shared/
            └── runtime/
                └── apiHelpers.ts   # Helpers for callbacks
```

#### @hey-api/openapi-ts

```
output/                              # e.g. ./swagger
├── client/                          # HTTP client implementation
│   ├── client.gen.ts
│   ├── index.ts
│   ├── types.gen.ts
│   └── utils.gen.ts
├── core/                            # Core runtime utilities
│   ├── auth.gen.ts
│   ├── bodySerializer.gen.ts
│   ├── params.gen.ts
│   ├── pathSerializer.gen.ts
│   ├── queryKeySerializer.gen.ts
│   ├── serverSentEvents.gen.ts
│   ├── types.gen.ts
│   └── utils.gen.ts
├── client.gen.ts
├── index.ts
├── sdk.gen.ts                       # All SDK operations
├── types.gen.ts                     # All model types
└── composables/
    └── use-fetch/
        ├── index.ts                 # Exports all composables
        ├── composables/             # Generated composables
        │   ├── useFetchGetPets.ts
        │   ├── useFetchGetPetById.ts
        │   └── ...                  # One file per operation
        ├── runtime/                 # Runtime helpers (copied once)
        │   └── useApiRequest.ts     # Core wrapper for useFetch
        └── shared/
            └── runtime/
                └── apiHelpers.ts   # Helpers for callbacks
```

### useAsyncData Generator

#### OpenAPI Generator (official)

```
output/
├── apis/  ...  (same as useFetch above)
└── composables/
    └── use-async-data/
        ├── index.ts                 # Exports all composables
        ├── composables/             # Generated composables
        │   ├── useAsyncDataGetPets.ts
        │   ├── useAsyncDataGetPetById.ts
        │   ├── useAsyncDataGetPetsRaw.ts  # Raw variant
        │   └── ...                        # One or two files per operation
        ├── runtime/                       # Runtime helpers (copied once)
        │   ├── useApiAsyncData.ts         # Core wrapper for useAsyncData
        │   └── useApiAsyncDataRaw.ts      # Raw variant wrapper
        └── shared/
            └── runtime/
                └── apiHelpers.ts
```

#### @hey-api/openapi-ts

```
output/
├── client/  ...  (same as useFetch above)
├── core/    ...  (same as useFetch above)
├── sdk.gen.ts
├── types.gen.ts
└── composables/
    └── use-async-data/
        ├── index.ts
        ├── composables/
        │   ├── useAsyncDataGetPets.ts
        │   ├── useAsyncDataGetPetById.ts
        │   └── ...
        ├── runtime/
        │   ├── useApiAsyncData.ts
        │   └── useApiAsyncDataRaw.ts
        └── shared/
            └── runtime/
                └── apiHelpers.ts
```

### nuxtServer Generator

**Basic Mode (without BFF):**

```
server/
└── api/                        # Server routes (generated)
    ├── _routes.ts              # Documentation file (list of all routes)
    ├── pet/
    │   ├── index.get.ts        # GET /api/pet
    │   ├── index.post.ts       # POST /api/pet
    │   ├── [id].get.ts         # GET /api/pet/:id
    │   ├── [id].put.ts         # PUT /api/pet/:id
    │   └── [id].delete.ts      # DELETE /api/pet/:id
    ├── store/
    │   └── inventory.get.ts    # GET /api/store/inventory
    └── user/
        ├── index.post.ts       # POST /api/user
        └── [username].get.ts   # GET /api/user/:username

# Also generates in project root:
└── nuxt.config.example.ts      # Example runtime config
```

**BFF Mode (with --bff flag):**

```
server/
├── api/                        # Server routes (same as basic)
│   ├── _routes.ts
│   └── ...
├── auth/                       # Authentication (generated once)
│   ├── context.ts              # Extract auth from request
│   └── types.ts                # AuthContext interface
└── bff/                        # Backend-for-Frontend logic
    ├── README.md               # BFF documentation
    ├── _transformers.example.ts # Example transformers
    └── transformers/           # Resource transformers (generated once)
        ├── pet.ts              # Transform pet data
        ├── store.ts            # Transform store data
        └── user.ts             # Transform user data

# Also generates in project root:
└── nuxt.config.example.ts
```

::: tip Path Params Conversion
The nuxtServer generator converts OpenAPI path params to Nuxt conventions:
- `{petId}` → `[id]`
- `{username}` → `[username]`
- `/pet` → `pet/index.{method}.ts`
- `/pet/{petId}` → `pet/[id].{method}.ts`
:::

### Key Files

**For useFetch/useAsyncData:**

| File | Description | Editable? |
|------|-------------|-----------|
| `index.ts` | Exports all composables | ❌ Regenerated |
| `composables/*.ts` | Individual composables | ❌ Regenerated |
| `runtime/*.ts` | Core wrappers (useFetch/useAsyncData) | ✅ Yes (copied once) |
| `shared/runtime/apiHelpers.ts` | Callback helpers | ✅ Yes (copied once) |

**For nuxtServer:**

| File | Description | Editable? |
|------|-------------|-----------|
| `api/**/*.ts` | Server route handlers | ❌ Regenerated |
| `api/_routes.ts` | Routes documentation | ❌ Regenerated |
| `auth/*.ts` | Authentication logic | ✅ Yes (generated once) |
| `bff/transformers/*.ts` | Data transformers | ✅ Yes (generated once) |
| `nuxt.config.example.ts` | Config template | ❌ Regenerated |

::: warning
For **useFetch/useAsyncData**: Files in `composables/` and `index.ts` are regenerated. Files in `runtime/` and `shared/runtime/` are copied once and preserved.

For **nuxtServer**: Route files in `api/` are regenerated. Auth and transformer files are generated once and preserved for customization.
:::

## Regeneration

**When to regenerate:**

- ✅ OpenAPI spec changes (new endpoints, updated schemas)
- ✅ Switching generator types (`useFetch` → `useAsyncData`)
- ✅ Fixing generation errors

**What gets regenerated:**

**useFetch/useAsyncData:**
- ✅ `composables/*.ts` (all composable files)
- ✅ `index.ts` (barrel export)

**nuxtServer:**
- ✅ `api/**/*.ts` (all server route files)
- ✅ `api/_routes.ts` (documentation)
- ✅ `nuxt.config.example.ts` (project root)

**What doesn't get regenerated:**

**useFetch/useAsyncData:**
- ✅ `runtime/*.ts` files (copied once, preserved)
- ✅ `shared/runtime/apiHelpers.ts` (copied once, preserved)

**nuxtServer:**
- ✅ `auth/*.ts` (authentication logic - generated once)
- ✅ `bff/transformers/*.ts` (data transformers - generated once)
- ✅ Your `.env` file (only `.env.example` is regenerated)

**All generators:**
- ✅ Your custom plugins, components, pages

### Regenerating Safely

**For useFetch/useAsyncData:**

```bash
# Runtime files are preserved by default
# Just regenerate when needed
nxh generate -i swagger.yaml -o ./composables/api -g useFetch

# If you want to restore original runtime files, delete them first
rm -rf composables/api/runtime composables/api/shared
nxh generate -i swagger.yaml -o ./composables/api -g useFetch
```

**For nuxtServer:**

```bash
# Auth and transformer files are preserved by default
# Just regenerate when needed
nxh generate -i swagger.yaml -o ./server/api -g nuxtServer --bff

# If you want to regenerate auth or transformers, delete them first
rm -rf server/auth server/bff
nxh generate -i swagger.yaml -o ./server/api -g nuxtServer --bff
```

**Using version control (recommended):**

```bash
# Commit before regenerating
git add -A
git commit -m "Before regeneration"

# Regenerate
nxh generate -i swagger.yaml -o ./composables/api -g useFetch

# Review changes
git diff

# Revert runtime changes if needed (useFetch/useAsyncData)
git checkout -- composables/api/runtime composables/api/shared

# Revert auth/transformers if needed (nuxtServer)
git checkout -- server/auth server/bff
```

## Generator-Specific Output

### useFetch Output

```typescript
// composables/useFetchGetPetById.ts
import type { GetPetByIdRequest, Pet } from '../../..';
import {
  useApiRequest,
  type ApiRequestOptions,
} from '../runtime/useApiRequest';

/**
 * Returns a single pet.
 * Find pet by ID.
 */
export const useFetchGetPetById = (
  params: GetPetByIdRequest,
  options?: ApiRequestOptions<Pet>
) => {
  return useApiRequest<Pet>(`/pet/${params.petId}`, {
    method: 'GET',
    ...options,
  });
};
```

**Key characteristics:**
- Simple function signature: `(params, options)`
- No cache key needed (useFetch handles it)
- Direct path interpolation: `` `/pet/${params.petId}` ``

### useAsyncData Output

```typescript
// composables/useAsyncDataGetPetById.ts
import type { GetPetByIdRequest, Pet } from '../../..';
import {
  useApiAsyncData,
  type ApiAsyncDataOptions,
} from '../runtime/useApiAsyncData';

/**
 * Returns a single pet.
 * Find pet by ID.
 */
export const useAsyncDataGetPetById = (
  params: GetPetByIdRequest,
  options?: ApiAsyncDataOptions<Pet>
) => {
  return useApiAsyncData<Pet>(
    'useAsyncDataGetPetById',  // Auto-generated unique cache key
    `/pet/${params.petId}`,
    {
      method: 'GET',
      ...options,
    }
  );
};
```

**Key characteristics:**
- Includes auto-generated cache key: `'useAsyncDataGetPetById'`
- Supports `transform`, `immediate`, `lazy` options
- May generate `*Raw` variant for endpoints with request body

### nuxtServer Output

**Basic Mode:**

```typescript
// server/api/pet/[id].get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import type { Pet } from '~/swagger/models'

/**
 * Returns a single pet
 * Find pet by ID
 */
export default defineEventHandler(async (event): Promise<Pet> => {
  // 1. Extract and validate path parameter
  const petId = getRouterParam(event, 'id')
  if (!petId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'petId is required'
    })
  }
  
  // 2. Get API configuration from runtime config
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl
  
  try {
    // 3. Call external API from your Nuxt server
    const data = await $fetch<Pet>(`${baseUrl}/pet/${petId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    // 4. Return data directly
    return data
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Request failed'
    })
  }
})
```

**BFF Mode (with --bff flag):**

```typescript
// server/api/pet/[id].get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import type { Pet } from '~/swagger/models'
import { getAuthContext } from '~/server/auth/context'
import { transformPet } from '~/server/bff/transformers/pet'

export default defineEventHandler(async (event): Promise<Pet> => {
  const petId = getRouterParam(event, 'id')
  if (!petId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'petId is required'
    })
  }
  
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl
  
  // 1. Get authentication context
  const auth = await getAuthContext(event)
  
  try {
    // 2. Call external API
    const data = await $fetch<Pet>(`${baseUrl}/pet/${petId}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers if available
        ...(auth?.token ? { 'Authorization': `Bearer ${auth.token}` } : {})
      }
    })
    
    // 3. Transform data with BFF logic (if transformer exists)
    if (transformPet) {
      return await transformPet(data, event, auth)
    }
    
    return data
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Request failed'
    })
  }
})
```

**Key characteristics:**
- Generates actual server routes (not composables)
- Follows Nuxt file-based routing: `[param].method.ts`
- Includes parameter validation and error handling
- BFF mode adds auth context and transformers
- Uses `useRuntimeConfig()` for API base URL and secrets

See [Choosing a Generator](/guide/choosing-a-generator) for detailed comparison.

## Partial Generation

If you only need composables for **specific endpoints**, manually edit the generated `index.ts` to export only what you need:

```typescript
// index.ts - Remove unused exports
export { useFetchGetPets } from './composables/useFetchGetPets'
export { useFetchGetPetById } from './composables/useFetchGetPetById'
// Remove: export { useFetchDeletePet } from './composables/useFetchDeletePet'
```

Or delete unused files:

```bash
rm composables/api/composables/useFetchDeletePet.ts
```

::: tip
The generator creates a composable for **every operation** in your OpenAPI spec. If your spec is large, consider splitting it or using tools like [openapi-generator-cli](https://github.com/OpenAPITools/openapi-generator-cli) for more granular control.
:::

## Validation

After generation, verify that everything works:

### 1. Check Types

```typescript
// useFetch example
const { data, pending, error } = useFetchGetPets()

// TypeScript should autocomplete
data.value?.[0].name // ✅ Autocomplete works
```

### 2. Import in Component

```vue
<script setup lang="ts">
const { data: pets } = useFetchGetPets()
</script>

<template>
  <ul v-if="pets">
    <li v-for="pet in pets" :key="pet.id">
      {{ pet.name }}
    </li>
  </ul>
</template>
```

### 3. Run TypeScript Check

```bash
npx nuxi typecheck
```

Should pass without errors.

## Troubleshooting Generation

### "Invalid OpenAPI specification"

**Cause:** OpenAPI spec has syntax errors or missing required fields.

**Solution:**

1. Validate at [Swagger Editor](https://editor.swagger.io/)
2. Ensure all `$ref` references are valid
3. Check for missing `operationId` fields

### "No operations found"

**Cause:** OpenAPI spec doesn't define any `paths`.

**Solution:**

Ensure your spec has a `paths` section:

```yaml
paths:
  /pets:
    get:
      operationId: getPets
      # ...
```

### Generated files have TypeScript errors

**Cause:** Types are not correctly generated from schemas.

**Solution:**

1. Run `npx nuxi prepare` to regenerate Nuxt types
2. Check that schemas in OpenAPI are valid
3. Restart TypeScript server in your IDE

See [Troubleshooting](/troubleshooting/generation-errors) for more issues.

## Next Steps

- **Choose a Generator**: Learn [which generator to use](/guide/choosing-a-generator)
- **See Examples**: Browse [basic usage](/composables/use-fetch/basic-usage)
- **Add Callbacks**: Learn about [lifecycle callbacks](/composables/features/callbacks/overview)
