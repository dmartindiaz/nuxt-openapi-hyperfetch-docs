# Generate Command

Generate type-safe Nuxt composables from OpenAPI specifications.

## Syntax

```bash
npx nxh generate [options]
```

## Options

### `-i, --input <path>`

**Required.** Path or URL to OpenAPI specification file.

```bash
# Local file
npx nxh generate -i ./swagger.yaml

# Remote URL
npx nxh generate -i https://api.example.com/openapi.json

# Swagger UI endpoint
npx nxh generate -i http://localhost:3001/api-docs
```

Supported formats:
- YAML (`.yaml`, `.yml`)
- JSON (`.json`)
- Remote URLs (HTTP/HTTPS)

### `-o, --output <path>`

**Required.** Output directory for generated composables.

```bash
npx nxh generate -i swagger.yaml -o ./composables
```

Directory structure:
```
composables/
├── auth/
│   ├── useFetchCurrentUser.ts
│   └── useAuthLogin.ts
├── pets/
│   ├── useFetchPet.ts
│   ├── useFetchPets.ts
│   ├── useCreatePet.ts
│   └── useUpdatePet.ts
└── index.ts
```

### `--baseUrl <url>`

Override the base URL for API requests.

```bash
npx nxh generate \
  -i swagger.yaml \
  -o ./composables \
  --baseUrl https://api.staging.com
```

If not provided, uses the server URL from the OpenAPI spec.

### `--mode <client|server>`

Generation mode. Default: `client`.

```bash
# Client composables (default)
npx nxh generate -i swagger.yaml -o ./composables --mode client

# Server composables
echo nuxtServer | npx nxh generate -i swagger.yaml -o ./server
```

**Client mode:**
- Generates `useFetch*` and `useAsyncData*` composables
- For use in Vue components
- Supports SSR and client-side data fetching

**Server mode:**
- Generates server-side composables for Nitro routes
- For use in `server/` directory
- Access to H3Event context

### `--tags <tags>`

Generate composables only for specific OpenAPI tags.

```bash
# Single tag
npx nxh generate -i swagger.yaml -o ./composables --tags pets

# Multiple tags
npx nxh generate -i swagger.yaml -o ./composables --tags pets,users,orders
```

### `--exclude-tags <tags>`

Exclude specific tags from generation.

```bash
npx nxh generate -i swagger.yaml -o ./composables --exclude-tags internal,admin
```

### `--overwrite`

Overwrite existing files without prompting.

```bash
npx nxh generate -i swagger.yaml -o ./composables --overwrite
```

By default, the CLI prompts before overwriting files.

### `--dry-run`

Show what would be generated without writing files.

```bash
npx nxh generate -i swagger.yaml -o ./composables --dry-run
```

Output:
```
Would generate:
  composables/pets/useFetchPet.ts
  composables/pets/useFetchPets.ts
  composables/pets/useCreatePet.ts
  composables/pets/useUpdatePet.ts
  composables/index.ts

Total: 5 files
```

## Examples

### Basic Generation

```bash
npx nxh generate -i openapi.yaml -o ./composables
```

### Production with Custom Base URL

```bash
npx nxh generate \
  -i ./specs/api-v1.yaml \
  -o ./composables/api-v1 \
  --baseUrl https://api.production.com/v1
```

### Server Composables

```bash
echo nuxtServer | npx nxh generate \
  -i openapi.yaml \
  -o ./server/composables
```

### Selective Generation

```bash
# Only pets and users
npx nxh generate \
  -i swagger.yaml \
  -o ./composables \
  --tags pets,users

# Exclude internal APIs
npx nxh generate \
  -i swagger.yaml \
  -o ./composables \
  --exclude-tags internal,deprecated
```

## Exit Codes

- `0` - Success
- `1` - Invalid OpenAPI spec
- `1` - File system errors
- `1` - Invalid options

## Next Steps

- [CLI Options →](/api/cli/options)
- [Composables Reference →](/api/interfaces/composables)
- [Server Reference →](/api/interfaces/server)
