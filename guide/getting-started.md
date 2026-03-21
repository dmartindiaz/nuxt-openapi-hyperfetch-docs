# Getting Started

Get up and running with Nuxt Generator in under 5 minutes.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **Nuxt**: v3.0.0 or higher
- **OpenAPI**: v3.0.0 or Swagger v2.0 specification file

## Installation

Install globally via npm:

```bash
npm install -g nuxt-openapi-hyperfetch
```

Or use with npx (no installation required):

```bash
npx nxh generate -i swagger.yaml -o ./api
```

Verify installation:

```bash
nxh --version
```

## Quick Start

### Step 1: Prepare Your OpenAPI Spec

Ensure you have an OpenAPI specification file (YAML or JSON):

```yaml
# swagger.yaml
openapi: 3.0.0
info:
  title: Pet Store API
  version: 1.0.0
paths:
  /pets:
    get:
      operationId: getPets
      responses:
        200:
          description: List of pets
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
        name:
          type: string
        status:
          type: string
          enum: [available, pending, sold]
```

### Step 2: Generate Composables

Run the generator in interactive mode:

```bash
nxh generate
```

The CLI will prompt you for:

1. **Input file**: Path to your OpenAPI spec
2. **Output directory**: Where to generate files (e.g., `./composables/api`)
3. **Generator type**: Choose from `useFetch`, `useAsyncData`, or `nuxtServer`

Or provide arguments directly:

```bash
nxh generate -i swagger.yaml -o ./composables/api --generator useFetch
```

### Step 3: Use Generated Composables

Import and use in your components:

```vue
<script setup lang="ts">
// Import the generated composable
const { data: pets, pending, error } = useFetchGetPets()
</script>

<template>
  <div>
    <div v-if="pending">Loading pets...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="pet in pets" :key="pet.id">
        {{ pet.name }} - {{ pet.status }}
      </li>
    </ul>
  </div>
</template>
```

## Generated Files Structure

After generation, your output directory will contain:

```
composables/api/
├── index.ts                    # Main entry point, exports all composables
├── types.d.ts                  # Generated TypeScript types from schemas
├── runtime/                    # Helper functions (copied, not imported)
│   ├── use-api-request.ts      # Core composable wrapper
│   ├── callbacks.ts            # Callback types and utilities
│   └── global-callbacks.ts     # Global callback registration
└── composables/                # (or routes/ for nuxtServer)
    ├── getPets.ts              # useFetchGetPets composable
    ├── getPetById.ts           # useFetchGetPetById composable
    └── ...                     # One file per operation
```

## CLI Options

### Generate Command

```bash
nxh generate [options]
```

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--input <path>` | `-i` | Path to OpenAPI spec file | Interactive prompt |
| `--output <path>` | `-o` | Output directory for generated files | `./generated` |
| `--generator <type>` | `-g` | Generator type: `useFetch`, `useAsyncData`, `nuxtServer` | Interactive prompt |
| `--help` | `-h` | Show help | - |

### Examples

**Generate with useFetch:**
```bash
nxh generate -i api-spec.yaml -o ./composables/api -g useFetch
```

**Generate server routes:**
```bash
nxh generate -i api-spec.yaml -o ./server/api -g nuxtServer
```

**Use YAML or JSON:**
```bash
nxh generate -i openapi.json -o ./api
```

## Configuration in Nuxt

After generating composables, you may need to configure your Nuxt app:

### 1. Set Base URL

Create a `.env` file:

```bash
# .env
NUXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Use in your app:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    }
  }
})
```

Reference in generated composables (if needed):

```typescript
const config = useRuntimeConfig()
const baseUrl = config.public.apiBaseUrl
```

### 2. Setup Global Callbacks (Optional)

Create a plugin for global callbacks:

```typescript
// plugins/api-global-callbacks.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      // Add auth token to all requests
      const token = useCookie('auth-token').value
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    },
    onError: (error) => {
      // Global error handling
      if (error.status === 401) {
        navigateTo('/login')
      }
    }
  })
})
```

### 3. TypeScript Configuration (Optional)

If TypeScript can't find types, add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["./composables/api/types"]
  }
}
```

## Verification

Test that everything works:

```vue
<script setup lang="ts">
// This should have full type support
const { data, pending, error } = useFetchGetPets()

// TypeScript should autocomplete properties
watch(data, (pets) => {
  pets?.forEach(pet => {
    console.log(pet.name) // ✅ Autocomplete works
  })
})
</script>
```

## Troubleshooting

### Generation Fails

**Error: "Cannot find module 'swagger.yaml'"**

- Ensure the path to your OpenAPI spec is correct
- Use absolute paths if relative paths fail: `/full/path/to/swagger.yaml`

**Error: "Invalid OpenAPI specification"**

- Validate your spec at [Swagger Editor](https://editor.swagger.io/)
- Ensure all `$ref` references are valid

### Runtime Issues

**Error: "useFetchGetPets is not defined"**

- Check that you're importing from the correct path: `~/composables/api`
- Verify the composable was generated in `index.ts`

**TypeScript errors on generated code:**

- Run `npx nuxi prepare` to regenerate Nuxt types
- Restart your IDE/TypeScript server

See [Troubleshooting](/troubleshooting/) for more common issues.

## Next Steps

Now that you have generated composables:

- **Learn Core Concepts**: Understand [key concepts](/guide/core-concepts) behind the generator
- **Choose a Generator**: Learn about [different generator types](/guide/choosing-a-generator)
- **See Examples**: Browse [practical examples](/examples/composables/basic/simple-get)
- **Add Callbacks**: Learn about [lifecycle callbacks](/composables/features/callbacks/overview)
