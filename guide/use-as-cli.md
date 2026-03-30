# Use as CLI

Use the CLI when you want explicit control over generation from the terminal.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **Nuxt**: v3.0.0 or higher
- **OpenAPI**: v3.0.0 or Swagger v2.0 specification file
- **Java**: v11.0.0 or higher _(only required if using OpenAPI Generator official)_

## Installation

Install globally via npm:

```bash
npm install -g nuxt-openapi-hyperfetch
```

Or run with npx (no global install required):

```bash
npx nxh generate -i swagger.yaml -o ./api
```

Verify installation:

```bash
nxh --version
```

## Quick Start

### Step 1: Prepare your OpenAPI spec

Ensure you have an OpenAPI specification file in YAML or JSON format.

### Step 2: Generate composables or server routes

Run in interactive mode:

```bash
nxh generate
```

The CLI prompts for:

1. **Backend**: `OpenAPI Generator (official)` or `@hey-api/openapi-ts (Node.js)`
2. **Input file**: path to your OpenAPI spec
3. **Output directory**: where files are generated
4. **Generator type**: `useFetch`, `useAsyncData`, or `nuxtServer`

Direct arguments are also supported:

```bash
nxh generate -i swagger.yaml -o ./composables/api --generator useFetch
```

### Step 3: Use generated composables

```vue
<script setup lang="ts">
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

### For useFetch and useAsyncData generators

Composables are generated inside your `output` directory, together with backend-generated files.

#### OpenAPI Generator (official)

```
output/                                # e.g. ./swagger
|-- apis/                              # API classes (one per tag)
|   |-- PetApi.ts
|   \-- ...
|-- models/                            # Model types
|   |-- Pet.ts
|   \-- ...
\-- composables/
    \-- use-fetch/                     # or use-async-data/
        |-- index.ts                   # Exports all composables
        |-- composables/               # Generated composables
        |   |-- useFetchGetPets.ts     # GET /pets
        |   |-- useFetchGetPetById.ts  # GET /pets/{id}
        |   \-- ...                    # One file per operation
        |-- runtime/                   # Runtime helpers (copied once)
        |   \-- useApiRequest.ts
        \-- shared/
            \-- runtime/
                \-- apiHelpers.ts
```

#### @hey-api/openapi-ts

```
output/                                # e.g. ./swagger
|-- client/                            # HTTP client implementation
|   |-- client.gen.ts
|   |-- index.ts
|   |-- types.gen.ts
|   \-- utils.gen.ts
|-- core/                              # Core runtime utilities
|   |-- auth.gen.ts
|   |-- bodySerializer.gen.ts
|   |-- params.gen.ts
|   |-- pathSerializer.gen.ts
|   |-- queryKeySerializer.gen.ts
|   |-- serverSentEvents.gen.ts
|   |-- types.gen.ts
|   \-- utils.gen.ts
|-- client.gen.ts
|-- index.ts
|-- sdk.gen.ts                         # All SDK operations
|-- types.gen.ts                       # All model types
\-- composables/
    \-- use-fetch/                     # or use-async-data/
        |-- index.ts
        |-- composables/
        |   |-- useFetchGetPets.ts
        |   |-- useFetchGetPetById.ts
        |   \-- ...
        |-- runtime/
        |   \-- useApiRequest.ts
        \-- shared/
            \-- runtime/
                \-- apiHelpers.ts
```

::: tip
Files in `runtime/` are copied into your project, so you can customize them.
:::

### For nuxtServer generator

```
server/api/                            # Nuxt server routes (your serverRoutePath)
|-- _routes.ts                         # Documentation of all routes
|-- pets/
|   |-- index.get.ts                   # GET /api/pets
|   |-- [id].get.ts                    # GET /api/pets/{id}
|   \-- [id].delete.ts                 # DELETE /api/pets/{id}
|-- store/
|   \-- inventory.get.ts               # GET /api/store/inventory
\-- user/
    |-- [username].get.ts              # GET /api/user/{username}
    \-- login.get.ts                   # GET /api/user/login

# Generated in project root:
\-- nuxt.config.example.ts            # Example Nuxt configuration
```

::: tip BFF Mode (Backend-for-Frontend)
If you enable BFF mode with `--bff`, additional files are generated:

```
server/
|-- api/                               # Server routes
|-- auth/                              # Authentication context
|   |-- context.ts                     # Implement auth logic here
|   \-- types.ts                       # Auth types
\-- bff/                               # BFF pattern structure
    |-- README.md
    |-- examples.ts
    \-- transformers/
        |-- pets.ts
        |-- store.ts
        \-- user.ts
```

Transformers allow you to:
- Add business logic before or after calling the API
- Transform data between frontend and backend
- Implement caching or custom validations
- Add authentication context to requests
:::

## CLI Options

### Generate command

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

Generate with `useFetch`:

```bash
nxh generate -i api-spec.yaml -o ./composables/api -g useFetch
```

Generate server routes:

```bash
nxh generate -i api-spec.yaml -o ./server/api -g nuxtServer
```

Use YAML or JSON specs:

```bash
nxh generate -i openapi.json -o ./api
```

## CLI Config File (`nxh.config`)

If you use CLI mode frequently, keep defaults in a config file at project root.

Supported names:

- `nxh.config.js`
- `nxh.config.mjs`
- `nxh.config.mts` (TypeScript)

```ts
// nxh.config.ts (or nxh.config.mts)
export default {
  input: './swagger.yaml',
  output: './swagger',
  generator: 'heyapi',
  generators: ['useFetch', 'useAsyncData'],
  baseUrl: 'https://api.example.com',
  tags: ['pets', 'users'],
  excludeTags: ['internal'],
  overwrite: false,
  verbose: false,
  watch: false
}
```

### Main options (summary)

| Option | Description |
|--------|-------------|
| `input` | Path or URL to the OpenAPI spec. |
| `output` | Directory where generated files are written. |
| `generator` | Engine: `heyapi` (Node) or `openapi` (Java 11+). |
| `generators` | Outputs to generate: `useFetch`, `useAsyncData`, `nuxtServer`. |
| `baseUrl` | Base URL for generated client composables. |
| `serverRoutePath` | Output path for `nuxtServer` routes. |
| `tags` / `excludeTags` | Include or exclude endpoints by OpenAPI tags. |
| `overwrite` | Overwrite files without asking. |
| `dryRun` | Preview generation without writing files. |
| `verbose` | Enable detailed logs. |
| `watch` | Regenerate when the OpenAPI file changes. |

::: warning
`baseUrl` from `nxh.config` applies to `useFetch` and `useAsyncData`. For `nuxtServer`, use Nuxt `runtimeConfig`.
:::

## Troubleshooting

### Generation fails

**Error: "Cannot find module 'swagger.yaml'"**

- Ensure your OpenAPI spec path is correct
- Try an absolute path if a relative path fails

**Error: "Invalid OpenAPI specification"**

- Validate the spec in [Swagger Editor](https://editor.swagger.io/)
- Ensure all `$ref` references are valid

### Runtime issues

**Error: "useFetchGetPets is not defined"**

- Confirm import path points to generated output
- Verify the composable exists in generated `index.ts`

**TypeScript errors on generated code**

- Run `npx nuxi prepare` to regenerate Nuxt types
- Restart your IDE TypeScript server

See [Troubleshooting](/troubleshooting/) for more issues.

## Related

- [Use as Nuxt Module](/guide/use-as-nuxt-module)
- [Getting Started](/guide/getting-started)
