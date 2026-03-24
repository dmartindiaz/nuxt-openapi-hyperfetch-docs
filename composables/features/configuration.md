# Configuration File (nxh.config.js)

Configure generation options for `useFetch` and `useAsyncData` composables using a configuration file instead of CLI arguments.

## Overview

The configuration file allows you to:

- ✅ Set default generation options
- ✅ Configure `baseURL` for all generated composables
- ✅ Specify which generators to use
- ✅ Filter by OpenAPI tags
- ✅ Automate generation without interactive prompts

::: tip For useFetch and useAsyncData Only
**Important**: The configuration file (especially `baseUrl`) applies to:
- ✅ **useFetch** composables
- ✅ **useAsyncData** composables

It does **NOT** apply to:
- ❌ **nuxtServer** routes (server routes use Nuxt's `runtimeConfig` instead)

See [Server Routes Configuration](#server-routes-use-different-config) for nuxtServer configuration.
:::

## Creating the Config File

Create a configuration file in the **root of your project** (same level as `package.json`):

### Supported File Names

The CLI will look for these files in order:

1. `nxh.config.js` ← **Recommended**
2. `nxh.config.mjs`
3. `nuxt-openapi-hyperfetch.js`
4. `nuxt-openapi-hyperfetch.mjs`

**Example:**

```javascript
// nxh.config.js (in project root)
export default {
  input: './openapi.yaml',
  output: './swagger',              // OpenAPI files + composables go here
  generator: 'heyapi',              // 'openapi' (requires Java) | 'heyapi' (Node.js only)
  baseUrl: 'https://api.example.com',
  generators: ['useFetch', 'useAsyncData', 'nuxtServer'],
  serverRoutePath: './server/api',  // nuxtServer routes go here (separate)
}
```

## Configuration Options

### input

**Type:** `string`  
**Required:** Yes (or provide via CLI)

Path or URL to your OpenAPI/Swagger specification.

```javascript
// Local file
input: './openapi.yaml'
input: './specs/api-v2.json'

// Remote URL
input: 'https://api.example.com/openapi.json'
input: 'https://petstore3.swagger.io/api/v3/openapi.json'
```

### output

**Type:** `string`  
**Default:** `'./composables'`

Output directory where generated files will be placed.

```javascript
output: './composables'
output: './src/api'
output: './api/generated'
```

**Generated structure:**

The top-level structure differs depending on the backend chosen during generation.

_OpenAPI Generator (official):_

```
output/                            # e.g. ./swagger
├── apis/                          # API classes (one per tag)
│   ├── PetApi.ts
│   └── ...
├── models/                        # Model types
│   ├── Pet.ts
│   └── ...
└── composables/                   # Our generated composables
    ├── use-fetch/
    │   ├── composables/
    │   ├── runtime/
    │   ├── shared/
    │   └── index.ts
    └── use-async-data/
        ├── composables/
        ├── runtime/
        ├── shared/
        └── index.ts
```

_@hey-api/openapi-ts:_

```
output/                            # e.g. ./swagger
├── client/                        # HTTP client implementation
├── core/                          # Core runtime utilities
├── client.gen.ts
├── index.ts
├── sdk.gen.ts                     # All SDK operations
├── types.gen.ts                   # All model types
└── composables/                   # Our generated composables
    ├── use-fetch/
    │   ├── composables/
    │   ├── runtime/
    │   ├── shared/
    │   └── index.ts
    └── use-async-data/
        ├── composables/
        ├── runtime/
        ├── shared/
        └── index.ts
```

::: tip
`composables/` lives alongside the backend-generated files inside the same `output` directory.
:::

### baseUrl

**Type:** `string`  
**Optional**  
**Applies to:** useFetch and useAsyncData only

Base URL that will be automatically added to all generated composables.

::: warning Only for Client Composables
`baseUrl` is **only used** by `useFetch` and `useAsyncData` generators.

For `nuxtServer` routes, configure the API base URL via Nuxt's `runtimeConfig` instead. See [Server Routes](#server-routes-use-different-config).
:::

**Without baseUrl:**

```typescript
// Generated composable
export const useFetchGetPets = (params, options) => {
  return useApiRequest('/pets', {
    method: 'GET',
    ...options
  })
}

// Usage - must specify full URL or rely on Nuxt's proxy
const { data } = useFetchGetPets({})
// Calls: /pets (relative)
```

**With baseUrl:**

```javascript
// nxh.config.js
export default {
  baseUrl: 'https://api.example.com'
}
```

```typescript
// Generated composable
export const useFetchGetPets = (params, options) => {
  return useApiRequest('/pets', {
    method: 'GET',
    baseURL: 'https://api.example.com', // ✅ Automatically added
    ...options
  })
}

// Usage - works immediately
const { data } = useFetchGetPets({})
// Calls: https://api.example.com/pets
```

**Common baseUrl patterns:**

```javascript
// Development
baseUrl: 'http://localhost:3001'

// Production
baseUrl: 'https://api.example.com'

// With API version
baseUrl: 'https://api.example.com/v1'

// Subdomain
baseUrl: 'https://api.myapp.com'
```

### generators

**Type:** `Array<'useFetch' | 'useAsyncData' | 'nuxtServer'>`  
**Default:** `['useFetch', 'useAsyncData']`

Which generators to use when creating composables.

```javascript
// Generate only useFetch
generators: ['useFetch']

// Generate useFetch and useAsyncData
generators: ['useFetch', 'useAsyncData']

// Generate server routes only
generators: ['nuxtServer']

// Generate everything
generators: ['useFetch', 'useAsyncData', 'nuxtServer']
```

**What each generator creates:**

- **`useFetch`**: Composables using Nuxt's `useFetch` (simpler, auto cache keys)
- **`useAsyncData`**: Composables using Nuxt's `useAsyncData` (more control, manual cache keys, includes Raw variant with headers)
- **`nuxtServer`**: Nuxt server API routes (BFF pattern)

### generator

**Type:** `'openapi' | 'heyapi'`  
**Default:** interactive prompt (first run)

The backend engine used to generate the API client code before composables are created.

```javascript
// Use OpenAPI Generator (official) — requires Java 11+
generator: 'openapi'

// Use @hey-api/openapi-ts — Node.js only, no Java required
generator: 'heyapi'
```

| Value | Tool | Requirement | Output |
|-------|------|-------------|--------|
| `'openapi'` | OpenAPI Generator (official) | Java 11+ | `apis/`, `models/` |
| `'heyapi'` | @hey-api/openapi-ts | Node.js only | `client/`, `core/`, `sdk.gen.ts`, `types.gen.ts` |

::: tip
If `generator` is omitted from the config, the CLI will prompt you to choose interactively on the first run. Set it explicitly to skip the prompt in CI/CD or team setups.
:::

### tags

**Type:** `string[]`  
**Optional**

Generate only endpoints with specific OpenAPI tags.

```javascript
// Only generate pets and users endpoints
tags: ['pets', 'users']

// Only public APIs
tags: ['public']
```

**OpenAPI example:**

```yaml
paths:
  /pets:
    get:
      tags: ['pets']  # ← Will be included if tags: ['pets']
  /users:
    get:
      tags: ['users'] # ← Will be excluded
  /orders:
    get:
      tags: ['orders'] # ← Will be excluded
```

### excludeTags

**Type:** `string[]`  
**Optional**

Exclude endpoints with specific OpenAPI tags.

```javascript
// Exclude internal and deprecated endpoints
excludeTags: ['internal', 'deprecated']

// Exclude admin endpoints
excludeTags: ['admin']
```

**Use case:**

```javascript
// Generate everything except admin and internal
export default {
  input: './openapi.yaml',
  output: './composables',
  excludeTags: ['admin', 'internal'],
  generators: ['useFetch']
}
```

### overwrite

**Type:** `boolean`  
**Default:** `false`

Overwrite existing files without prompting.

```javascript
// Prompt before overwriting
overwrite: false

// Always overwrite without asking
overwrite: true
```

**Useful for:**
- CI/CD pipelines
- Automated regeneration
- Development workflows

### dryRun

**Type:** `boolean`  
**Default:** `false`

Preview what would be generated without writing files.

```javascript
dryRun: true
```

**Useful for:**
- Testing configuration
- Seeing what will be generated
- Validating OpenAPI spec

### verbose

**Type:** `boolean`  
**Default:** `false`

Enable detailed logging.

```javascript
verbose: true
```

**Shows:**
- Configuration loaded
- Files being processed
- Generation progress
- Detailed error messages

### watch

**Type:** `boolean`  
**Default:** `false`

Watch OpenAPI file for changes and regenerate automatically.

```javascript
watch: true
```

**Useful for:**
- Development
- API design workflow
- Keeping composables in sync

## Complete Examples

### Example 1: Basic Setup

```javascript
// nxh.config.js
export default {
  input: './openapi.yaml',
  output: './composables',
  generator: 'heyapi',              // no Java required
  baseUrl: 'https://api.example.com',
  generators: ['useFetch', 'useAsyncData']
}
```

**Usage:**

```bash
# Just run generate - no arguments needed
npx nxh generate
```

### Example 2: Development + Production

**Development:**

```javascript
// nxh.config.dev.js
export default {
  input: 'http://localhost:3001/openapi.json',
  output: './composables',
  generator: 'heyapi',
  baseUrl: 'http://localhost:3001',
  generators: ['useFetch'],
  watch: true,
  verbose: true
}
```

**Production:**

```javascript
// nxh.config.js
export default {
  input: 'https://api.example.com/openapi.json',
  output: './composables',
  generator: 'heyapi',
  baseUrl: 'https://api.example.com',
  generators: ['useFetch', 'useAsyncData'],
  overwrite: true
}
```

**Usage:**

```bash
# Development
npx nxh generate --config nxh.config.dev.js --watch

# Production
npx nxh generate
```

### Example 3: Selective Generation

```javascript
// nxh.config.js
export default {
  input: './openapi.yaml',
  output: './composables',
  baseUrl: 'https://api.example.com',
  
  // Only generate public endpoints
  tags: ['public', 'users', 'products'],
  
  // Exclude admin and internal
  excludeTags: ['admin', 'internal'],
  
  // Only useFetch (simpler)
  generators: ['useFetch']
}
```

### Example 4: Multi-Environment

Use environment variables:

```javascript
// nxh.config.js
const apiUrl = process.env.API_URL || 'http://localhost:3001'

export default {
  input: './openapi.yaml',
  output: './composables',
  baseUrl: apiUrl,
  generators: ['useFetch', 'useAsyncData']
}
```

**Usage:**

```bash
# Development
API_URL=http://localhost:3001 npx nxh generate

# Staging
API_URL=https://staging-api.example.com npx nxh generate

# Production
API_URL=https://api.example.com npx nxh generate
```

### Example 5: Monorepo

```javascript
// packages/api-client/nxh.config.js
export default {
  input: '../../specs/openapi.yaml',
  output: './src/generated',
  baseUrl: 'https://api.example.com',
  generators: ['useFetch'],
  overwrite: true
}
```

## CLI Override Behavior

**CLI arguments always override config file settings**.

```javascript
// nxh.config.js
export default {
  input: './openapi.yaml',
  output: './composables',
  baseUrl: 'https://api.example.com'
}
```

```bash
# Override baseUrl via CLI
npx nxh generate --base-url https://staging-api.example.com

# Override output via CLI
npx nxh generate -o ./src/api

# Override input via CLI
npx nxh generate -i ./specs/api-v2.yaml
```

**Priority order:**

1. CLI arguments ← Highest priority
2. Config file
3. Default values ← Lowest priority

## Server Routes Use Different Config

::: warning Different Configuration Method
The `baseUrl` option in `nxh.config.js` does **NOT** affect `nuxtServer` routes.

Server routes use Nuxt's `runtimeConfig` instead:
:::

**Why?** Server routes run on the Nuxt server and need dynamic configuration based on environment.

### Configuring nuxtServer baseUrl

Use Nuxt's `runtimeConfig` in `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private (server-side only)
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.example.com'
  }
})
```

**Environment variables:**

```bash
# .env
API_BASE_URL=https://api.example.com
```

**Generated server routes automatically use this:**

```typescript
// server/api/pets.get.ts (generated)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.apiBaseUrl // ✅ From runtimeConfig
  
  const data = await $fetch(`${baseUrl}/pets`)
  return data
})
```

**Why separate configuration?**

- ✅ Server routes need environment-based URLs (dev/staging/prod)
- ✅ API URLs should be private (not exposed to client)
- ✅ Server-side configuration is more secure
- ✅ Follows Nuxt best practices

**Summary:**

| Generator | Configuration Method | Config Location |
|-----------|---------------------|-----------------|
| **useFetch** | `baseUrl` in nxh.config.js | Project root |
| **useAsyncData** | `baseUrl` in nxh.config.js | Project root |
| **nuxtServer** | `apiBaseUrl` in runtimeConfig | nuxt.config.ts |

## Package.json Alternative

You can also configure in `package.json`:

```json
{
  "name": "my-app",
  "nuxt-generator": {
    "input": "./openapi.yaml",
    "output": "./composables",
    "baseUrl": "https://api.example.com",
    "generators": ["useFetch"]
  }
}
```

**Note:** Config file (`nxh.config.js`) takes precedence over `package.json`.

## Best Practices

### ✅ Do

- Use `nxh.config.js` for consistent team setup
- Commit config file to version control
- Use environment variables for dynamic values
- Set `overwrite: true` in CI/CD
- Use `watch: true` during development

```javascript
// ✅ Good - environment aware
export default {
  input: './openapi.yaml',
  output: './composables',
  baseUrl: process.env.API_URL || 'http://localhost:3001',
  generators: ['useFetch'],
  overwrite: process.env.CI === 'true' // Auto-overwrite in CI
}
```

### ❌ Don't

- Don't hardcode secrets/tokens in config file
- Don't commit environment-specific URLs
- Don't use relative paths for remote APIs
- Don't mix config file with heavy CLI arguments

```javascript
// ❌ Bad - hardcoded production URL
export default {
  baseUrl: 'https://api.production.com' // Should use env var
}
```

## Troubleshooting

### Config Not Loading

**Check:**

1. File is in project root (same level as `package.json`)
2. File name is correct (`nxh.config.js`, not `nxh-config.js`)
3. File has valid JavaScript syntax
4. File exports default object

```javascript
// ✅ Correct
export default {
  input: './openapi.yaml'
}

// ❌ Wrong - no export
const config = {
  input: './openapi.yaml'
}
```

### baseUrl Not Working in Server Routes

Remember: `baseUrl` in `nxh.config.js` **only works for useFetch and useAsyncData**.

For server routes, use `runtimeConfig` in `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL
  }
})
```

### CLI Arguments Not Overriding

Make sure you're using the correct argument format:

```bash
# ✅ Correct
npx nxh generate --base-url https://api.example.com

# ❌ Wrong
npx nxh generate --baseUrl https://api.example.com
```

### Watch Mode Not Working

Ensure:
1. File path is correct
2. File exists
3. You have permissions to read the file

```javascript
// ✅ Good - absolute or relative path
input: './openapi.yaml'
input: '/absolute/path/to/openapi.yaml'

// ❌ Bad - invalid path
input: 'openapi.yaml' // Missing ./
```

## Migration from CLI-Only

**Before (CLI only):**

```bash
npx nxh generate \
  -i ./openapi.yaml \
  -o ./composables \
  --base-url https://api.example.com \
  --generators useFetch,useAsyncData
```

**After (with config):**

```javascript
// nxh.config.js
export default {
  input: './openapi.yaml',
  output: './composables',
  baseUrl: 'https://api.example.com',
  generators: ['useFetch', 'useAsyncData']
}
```

```bash
# Much cleaner!
npx nxh generate
```

## TypeScript Config

You can use TypeScript for your config file:

```typescript
// nxh.config.mts
import type { GeneratorConfig } from 'nuxt-generator'

export default {
  input: './openapi.yaml',
  output: './composables',
  baseUrl: 'https://api.example.com',
  generators: ['useFetch', 'useAsyncData']
} satisfies GeneratorConfig
```

**Note:** Rename file to `.mts` for TypeScript.

## Next Steps

- [Global Headers →](/composables/features/global-headers)
- [useFetch Basic Usage →](/composables/use-fetch/basic-usage)
- [useAsyncData Basic Usage →](/composables/use-async-data/basic-usage)
- [Server Routes Documentation →](/server/)
