# CLI Reference

Command-line interface for generating type-safe composables from OpenAPI specifications.

## Installation

```bash
npm install -D nuxt-openapi-hyperfetch
```

## Usage

```bash
npx nxh generate [options]
```

## Basic Examples

### Generate Client Composables

```bash
npx nxh generate -i swagger.yaml -o ./composables
```

### Generate Server Composables

```bash
echo nuxtServer | npx nxh generate -i swagger.yaml -o ./server
```

### Specify Base URL

```bash
npx nxh generate -i swagger.yaml -o ./composables --baseUrl https://api.example.com
```

## Commands

### `generate`

Generate composables from OpenAPI specification.

```bash
npx nxh generate [options]
```

See [Generate Command →](/api/cli/generate) for details.

## Global Options

### `-h, --help`

Show help information.

```bash
npx nxh --help
```

### `-v, --version`

Show version number.

```bash
npx nxh --version
```

## Common Workflows

### Local Development

```bash
# Generate composables for local API
npx nxh generate \
  -i http://localhost:3001/api-docs \
  -o ./composables \
  --baseUrl http://localhost:3001
```

### Production Build

```bash
# Generate with production URL
npx nxh generate \
  -i ./openapi.yaml \
  -o ./composables \
  --baseUrl https://api.production.com
```

### Server-Side Only

```bash
# Generate server composables
echo nuxtServer | npx nxh generate \
  -i ./openapi.yaml \
  -o ./server/composables
```

## Exit Codes

- `0` - Success
- `1` - Error (invalid spec, file errors, etc.)

## Next Steps

- [Generate Command →](/api/cli/generate)
- [CLI Options →](/api/cli/options)
- [Getting Started →](/guide/getting-started)
