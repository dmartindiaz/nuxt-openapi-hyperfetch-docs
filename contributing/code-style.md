# Code Style Guide

Code style and formatting guidelines for nuxt-openapi-hyperfetch.

## General Principles

- **Consistency** - Follow existing patterns
- **Readability** - Code is read more than written
- **Simplicity** - Prefer simple solutions
- **TypeScript** - Use types everywhere

## TypeScript

### Type Annotations

```typescript
// ✅ Good - explicit return type
function parseSpec(input: string): ParsedSpec {
  return { /* ... */ }
}

// ❌ Bad - implicit return type
function parseSpec(input: string) {
  return { /* ... */ }
}
```

### Interfaces vs Types

```typescript
// ✅ Good - use interface for objects
interface Pet {
  id: number
  name: string
}

// ✅ Good - use type for unions
type Status = 'available' | 'pending' | 'sold'

// ❌ Bad - type for object shape
type Pet = {
  id: number
  name: string
}
```

### Avoid `any`

```typescript
// ✅ Good - specific type
function processData(data: Pet): void { }

// ❌ Bad - any type
function processData(data: any): void { }

// ✅ Acceptable - unknown for truly unknown data
function processData(data: unknown): void {
  if (isPet(data)) {
    // Type guard narrows to Pet
  }
}
```

## Naming Conventions

### Variables and Functions

```typescript
// camelCase for variables and functions
const petName = 'Fluffy'
function getPetById(id: number) { }
```

### Classes and Interfaces

```typescript
// PascalCase for classes and interfaces
class PetParser { }
interface Pet { }
```

### Constants

```typescript
// UPPER_SNAKE_CASE for constants
const MAX_RETRIES = 3
const API_BASE_URL = 'https://api.example.com'
```

### Private Members

```typescript
class PetService {
  // # for private fields
  #apiKey: string
  
  // _ prefix for private methods (if # not available)
  private _fetchData() { }
}
```

## File Organization

### Imports

```typescript
// 1. Node built-ins
import { readFile } from 'fs/promises'

// 2. External packages
import { parse } from 'yaml'

// 3. Internal modules
import { parseOpenAPI } from '~/parser'
import { generateCode } from '~/generator'

// 4. Types
import type { OpenAPIObject } from '~/types'
```

### Exports

```typescript
// Named exports preferred
export function parseSpec() { }
export class Parser { }

// Default export for single main export
export default class Parser { }
```

## Functions

### Function Length

Keep functions short and focused:

```typescript
// ✅ Good - single responsibility
function parsePaths(paths: Paths): Operation[] {
  return Object.entries(paths).flatMap(parsePathItem)
}

function parsePathItem([path, item]: [string, PathItem]): Operation[] {
  return Object.entries(item).map(([method, op]) => ({
    path,
    method,
    ...op
  }))
}

// ❌ Bad - too long, multiple responsibilities
function parsePathsAndGenerateCode(paths: Paths): string {
  // 100+ lines of mixed parsing and generation
}
```

### Parameters

```typescript
// ✅ Good - max 3 parameters
function generateComposable(
  operation: Operation,
  options: GeneratorOptions
): string

// ❌ Bad - too many parameters
function generateComposable(
  path: string,
  method: string,
  operationId: string,
  parameters: Parameter[],
  requestBody: RequestBody,
  responses: Responses,
  mode: 'client' | 'server'
): string

// ✅ Good - use options object for many parameters
interface GenerateOptions {
  path: string
  method: string
  operationId: string
  // ... more options
}

function generateComposable(options: GenerateOptions): string
```

## Comments

### JSDoc

```typescript
/**
 * Parse OpenAPI specification from file or URL
 * 
 * @param input - Path to file or URL
 * @returns Parsed OpenAPI specification
 * @throws {Error} If spec is invalid
 * 
 * @example
 * ```ts
 * const spec = await parseOpenAPI('./swagger.yaml')
 * ```
 */
export async function parseOpenAPI(input: string): Promise<ParsedSpec> {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ Good - explain WHY, not WHAT
// Use exponential backoff to avoid rate limiting
await retry(fetchData, { delay: retries => Math.pow(2, retries) * 1000 })

// ❌ Bad - obvious from code
// Call retry function with fetchData and options
await retry(fetchData, { delay: retries => Math.pow(2, retries) * 1000 })
```

## Error Handling

### Throw Errors

```typescript
// ✅ Good - descriptive error
if (!spec.openapi) {
  throw new Error('Invalid OpenAPI spec: missing "openapi" field')
}

// ❌ Bad - generic error
if (!spec.openapi) {
  throw new Error('Invalid spec')
}
```

### Custom Errors

```typescript
// ✅ Good - custom error class
class ParseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'ParseError'
  }
}

throw new ParseError('Failed to parse schema', originalError)
```

## Formatting

### Line Length

```typescript
// ✅ Good - max 100 characters
const result = someFunction(
  firstParameter,
  secondParameter,
  thirdParameter
)

// ❌ Bad - too long
const result = someFunction(firstParameter, secondParameter, thirdParameter, fourthParameter, fifthParameter)
```

### Indentation

```typescript
// 2 spaces for indentation
function example() {
  if (condition) {
    doSomething()
  }
}
```

### Trailing Commas

```typescript
// ✅ Good - trailing comma
const options = {
  mode: 'client',
  outputDir: './composables',
}

// ❌ Bad - no trailing comma
const options = {
  mode: 'client',
  outputDir: './composables'
}
```

## Async/Await

```typescript
// ✅ Good - async/await
async function fetchPet(id: number): Promise<Pet> {
  const response = await fetch(`/pets/${id}`)
  return await response.json()
}

// ❌ Bad - promise chains
function fetchPet(id: number): Promise<Pet> {
  return fetch(`/pets/${id}`)
    .then(response => response.json())
}
```

## Tools

### Prettier

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

### ESLint

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## Running Formatters

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Next Steps

- [Testing Guide →](/contributing/testing)
- [Pull Request Guidelines →](/contributing/pull-requests)
