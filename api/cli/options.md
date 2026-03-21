# CLI Options Reference

Complete reference of all command-line options.

## Required Options

### `-i, --input <path>`

Path or URL to OpenAPI specification.

- **Type:** `string`
- **Required:** Yes
- **Examples:**
  - `./swagger.yaml`
  - `https://api.example.com/openapi.json`
  - `http://localhost:3001/api-docs`

### `-o, --output <path>`

Output directory for generated files.

- **Type:** `string`
- **Required:** Yes
- **Default:** None
- **Example:** `./composables`

## Optional Options

### `--baseUrl <url>`

Override base URL for API requests.

- **Type:** `string`
- **Required:** No
- **Default:** Server URL from OpenAPI spec
- **Example:** `https://api.production.com`

### `--mode <client|server>`

Generation mode.

- **Type:** `'client' | 'server'`
- **Required:** No
- **Default:** `'client'`
- **Values:**
  - `client` - Vue composables (useFetch/useAsyncData)
  - `server` - Server composables for Nitro routes

### `--tags <tags>`

Generate only specific tags (comma-separated).

- **Type:** `string`
- **Required:** No
- **Default:** All tags
- **Example:** `pets,users,orders`

### `--exclude-tags <tags>`

Exclude specific tags (comma-separated).

- **Type:** `string`
- **Required:** No
- **Default:** None
- **Example:** `internal,deprecated`

### `--overwrite`

Overwrite existing files without prompting.

- **Type:** `boolean`
- **Required:** No
- **Default:** `false`

### `--dry-run`

Preview generation without writing files.

- **Type:** `boolean`
- **Required:** No
- **Default:** `false`

### `--watch`

Watch input file for changes and regenerate.

- **Type:** `boolean`
- **Required:** No
- **Default:** `false`

### `--verbose`

Enable verbose logging.

- **Type:** `boolean`
- **Required:** No
- **Default:** `false`

## Global Options

### `-h, --help`

Display help information.

- **Type:** `boolean`
- **Example:** `npx nxh --help`

### `-v, --version`

Display version number.

- **Type:** `boolean`
- **Example:** `npx nxh --version`

## Environment Variables

### `NUXT_GENERATOR_BASE_URL`

Default base URL for all requests.

```bash
export NUXT_GENERATOR_BASE_URL=https://api.staging.com
npx nxh generate -i swagger.yaml -o ./composables
```

### `NUXT_GENERATOR_MODE`

Default generation mode.

```bash
export NUXT_GENERATOR_MODE=server
npx nxh generate -i swagger.yaml -o ./server
```

## Configuration File

Create `nuxt-openapi-hyperfetch.config.js` or `nxh.config.js` in project root:

```javascript
export default {
  input: './openapi.yaml',
  output: './composables',
  baseUrl: 'https://api.example.com',
  tags: ['pets', 'users'],
  excludeTags: ['internal'],
  overwrite: true
}
```

Use config file:

```bash
npx nxh generate
```

## Examples

### Development

```bash
npx nxh generate \
  -i http://localhost:3001/api-docs \
  -o ./composables \
  --baseUrl http://localhost:3001 \
  --watch \
  --verbose
```

### Production

```bash
npx nxh generate \
  -i ./specs/openapi.yaml \
  -o ./composables \
  --baseUrl https://api.production.com \
  --exclude-tags internal \
  --overwrite
```

### Preview

```bash
npx nxh generate \
  -i swagger.yaml \
  -o ./composables \
  --dry-run \
  --verbose
```

## Next Steps

- [Generate Command →](/api/cli/generate)
- [Runtime Config →](/api/runtime/config)
