# Parser API

Programmatic API for parsing OpenAPI specifications and generating composables.

## Overview

The parser API allows you to generate composables programmatically from your code instead of using the CLI.

## Installation

```bash
npm install nuxt-openapi-hyperfetch
```

## Basic Usage

```typescript
import { parseOpenAPI, generateComposables } from 'nuxt-openapi-hyperfetch'

// Parse OpenAPI spec
const spec = await parseOpenAPI('./swagger.yaml')

// Generate composables
await generateComposables(spec, {
  mode: 'client',
  outputDir: './composables',
  baseUrl: 'https://api.example.com'
})
```

## API Reference

### `parseOpenAPI()`

Parse OpenAPI specification from file or URL.

```typescript
function parseOpenAPI(
  input: string | OpenAPIObject
): Promise<ParsedSpec>
```

**Parameters:**
- `input` - Path to file, URL, or OpenAPI object

**Returns:** `Promise<ParsedSpec>` - Parsed specification

**Example:**

```typescript
// From file
const spec = await parseOpenAPI('./openapi.yaml')

// From URL
const spec = await parseOpenAPI('https://api.example.com/openapi.json')

// From object
const spec = await parseOpenAPI({
  openapi: '3.0.0',
  info: { title: 'My API', version: '1.0.0' },
  paths: { /* ... */ }
})
```

### `generateComposables()`

Generate composables from parsed spec.

```typescript
function generateComposables(
  spec: ParsedSpec,
  options: GeneratorOptions
): Promise<GeneratedFiles>
```

**Parameters:**
- `spec` - Parsed OpenAPI specification
- `options` - Generation options

**Returns:** `Promise<GeneratedFiles>` - Generated file information

**Example:**

```typescript
const files = await generateComposables(spec, {
  mode: 'client',
  outputDir: './composables',
  baseUrl: 'https://api.example.com',
  tags: ['pets', 'users']
})

console.log(`Generated ${files.length} files`)
```

## Types

### ParsedSpec

```typescript
interface ParsedSpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers: Server[]
  paths: Record<string, PathItem>
  components?: {
    schemas?: Record<string, Schema>
    parameters?: Record<string, Parameter>
  }
}
```

### GeneratorOptions

```typescript
interface GeneratorOptions {
  mode: 'client' | 'server'
  outputDir: string
  baseUrl?: string
  tags?: string[]
  excludeTags?: string[]
  overwrite?: boolean
}
```

### GeneratedFiles

```typescript
interface GeneratedFiles {
  files: GeneratedFile[]
  stats: {
    total: number
    composables: number
    types: number
  }
}

interface GeneratedFile {
  path: string
  content: string
  size: number
}
```

## Advanced Usage

### Custom Template

```typescript
import { parseOpenAPI, generateFromTemplate } from 'nuxt-openapi-hyperfetch'

const spec = await parseOpenAPI('./openapi.yaml')

const code = await generateFromTemplate(spec, {
  template: 'custom',
  templateDir: './templates'
})
```

### Filter Operations

```typescript
const spec = await parseOpenAPI('./openapi.yaml')

// Filter by tag
const petOps = spec.paths.filter(p => p.tags?.includes('pets'))

await generateComposables({ ...spec, paths: petOps }, {
  mode: 'client',
  outputDir: './composables/pets'
})
```

## Next Steps

- [OpenAPI Parsing →](/api/parser/openapi)
- [Template Generation →](/api/parser/templates)
- [CLI Reference →](/api/cli/generate)
