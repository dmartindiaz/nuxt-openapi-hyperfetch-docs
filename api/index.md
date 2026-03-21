# API Reference

Complete reference documentation for nuxt-openapi-hyperfetch APIs, interfaces, and configuration.

## CLI Commands

The command-line interface for generating composables from OpenAPI specifications.

- [CLI Overview →](/api/cli/index) - Command-line usage
- [Generate Command →](/api/cli/generate) - Main generation command
- [CLI Options →](/api/cli/options) - All available options

## TypeScript Interfaces

Type definitions for generated composables and configuration.

- [Composables Interfaces →](/api/interfaces/composables) - Client composable types
- [Server Interfaces →](/api/interfaces/server) - Server composable types
- [Generated Types →](/api/interfaces/types) - OpenAPI-derived types

## Parser API

Programmatic API for parsing OpenAPI and generating code.

- [Parser Overview →](/api/parser/index) - Parser architecture
- [OpenAPI Parsing →](/api/parser/openapi) - Spec parsing logic
- [Template Generation →](/api/parser/templates) - Code generation

## Runtime API

Configuration and plugin APIs for runtime behavior.

- [Runtime Config →](/api/runtime/config) - Nuxt runtime configuration
- [Plugin Config →](/api/runtime/plugins) - Plugin options

## Quick Reference

### Generate Composables

```bash
npx nxh generate -i swagger.yaml -o ./composables
```

### Generate Server Composables

```bash
echo nuxtServer | npx nxh generate -i swagger.yaml -o ./server
```

### Programmatic Usage

```typescript
import { parseOpenAPI, generateComposables } from 'nuxt-openapi-hyperfetch'

const spec = await parseOpenAPI('./swagger.yaml')
const code = await generateComposables(spec, {
  mode: 'client',
  outputDir: './composables'
})
```

## Type Safety

All generated code is fully typed:

```typescript
// Generated composable with full type inference
const { data, loading, error } = useFetchPet(1)
//      ^? Ref<Pet | null>

// Request body is typed
await useCreatePet({ name: 'Fluffy', species: 'cat' })
//                   ^? CreatePetRequest

// Response is typed
data.value?.name
//          ^? string | undefined
```

## Next Steps

- [CLI Reference →](/api/cli/index)
- [TypeScript Interfaces →](/api/interfaces/composables)
- [Examples →](/examples/)
