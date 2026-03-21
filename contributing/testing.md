# Testing Guide

Testing standards and best practices for nuxt-openapi-hyperfetch.

## Test Framework

We use **Vitest** for testing:

- Fast execution
- TypeScript support
- Compatible with Vite
- Jest-compatible API
- Built-in coverage

## Test Structure

```
test/
├── unit/              # Unit tests
│   ├── parser/       # Parser tests
│   ├── generator/    # Generator tests
│   └── cli/          # CLI tests
├── integration/       # Integration tests
├── fixtures/          # Test fixtures
│   ├── petstore.yaml
│   └── expected/
└── helpers/           # Test utilities
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- parser.spec.ts

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Writing Tests

### Unit Tests

Test individual functions in isolation:

```typescript
// test/unit/parser/parseSchema.spec.ts
import { describe, it, expect } from 'vitest'
import { parseSchema } from '~/src/parser/schema'

describe('parseSchema', () => {
  it('should parse object schema', () => {
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' }
      },
      required: ['id']
    }
    
    const result = parseSchema(schema)
    
    expect(result).toEqual({
      type: 'interface',
      name: 'Pet',
      properties: [
        { name: 'id', type: 'number', required: true },
        { name: 'name', type: 'string', required: false }
      ]
    })
  })
  
  it('should handle enum', () => {
    const schema = {
      type: 'string',
      enum: ['available', 'pending', 'sold']
    }
    
    const result = parseSchema(schema)
    
    expect(result.type).toBe("'available' | 'pending' | 'sold'")
  })
})
```

### Integration Tests

Test entire workflows:

```typescript
// test/integration/generate.spec.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { rm, mkdir } from 'fs/promises'
import { generateComposables } from '~/src/generator'
import { parseOpenAPI } from '~/src/parser'

describe('generateComposables', () => {
  const outputDir = './test/tmp'
  
  beforeEach(async () => {
    await mkdir(outputDir, { recursive: true })
  })
  
  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true })
  })
  
  it('should generate client composables', async () => {
    const spec = await parseOpenAPI('./test/fixtures/petstore.yaml')
    
    const files = await generateComposables(spec, {
      mode: 'client',
      outputDir
    })
    
    expect(files.length).toBeGreaterThan(0)
    expect(files.some(f => f.path.includes('useFetchPet'))).toBe(true)
  })
})
```

## Test Fixtures

Use consistent test data:

```typescript
// test/fixtures/schemas.ts
export const petSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    status: {
      type: 'string',
      enum: ['available', 'pending', 'sold']
    }
  }
}

// test/fixtures/openapi.ts
export const petstoreSpec = {
  openapi: '3.0.0',
  info: { title: 'Petstore', version: '1.0.0' },
  paths: {
    '/pets/{id}': {
      get: {
        operationId: 'getPet',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pet' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Pet: petSchema
    }
  }
}
```

## Mocking

### Mock External Dependencies

```typescript
import { describe, it, expect, vi } from 'vitest'
import { readFile } from 'fs/promises'

// Mock fs module
vi.mock('fs/promises', () => ({
  readFile: vi.fn()
}))

describe('loadSpec', () => {
  it('should load spec from file', async () => {
    const mockContent = 'openapi: 3.0.0'
    vi.mocked(readFile).mockResolvedValue(mockContent)
    
    const result = await loadSpec('./swagger.yaml')
    
    expect(readFile).toHaveBeenCalledWith('./swagger.yaml', 'utf-8')
    expect(result).toBeDefined()
  })
})
```

### Mock API Calls

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('fetchSpec', () => {
  it('should fetch spec from URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ openapi: '3.0.0' })
    })
    
    const result = await fetchSpec('https://api.example.com/openapi.json')
    
    expect(fetch).toHaveBeenCalled()
    expect(result.openapi).toBe('3.0.0')
  })
})
```

## Snapshot Testing

Test generated code with snapshots:

```typescript
import { describe, it, expect } from 'vitest'
import { generateComposable } from '~/src/generator'

describe('generateComposable', () => {
  it('should generate correct code', () => {
    const operation = {
      operationId: 'getPet',
      method: 'GET',
      path: '/pets/{id}',
      parameters: [
        { name: 'id', in: 'path', type: 'number' }
      ]
    }
    
    const code = generateComposable(operation, { mode: 'client' })
    
    expect(code).toMatchSnapshot()
  })
})
```

## Coverage

### Target Coverage

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Check Coverage

```bash
npm run test:coverage
```

### Coverage Report

```
File              | % Stmts | % Branch | % Funcs | % Lines
------------------|---------|----------|---------|--------
All files         |   85.2  |   78.4   |   82.1  |   85.5
parser/           |   90.1  |   85.2   |   88.3  |   90.4
  index.ts        |   92.3  |   88.1   |   91.2  |   92.5
  schema.ts       |   88.5  |   82.7   |   86.1  |   89.1
generator/        |   82.4  |   74.8   |   79.2  |   83.1
  index.ts        |   85.1  |   78.3   |   82.4  |   85.7
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ Good - tests behavior
it('should return formatted pet name', () => {
  const result = formatPetName({ name: 'fluffy', category: 'cat' })
  expect(result).toBe('Fluffy (cat)')
})

// ❌ Bad - tests implementation
it('should call capitalize and concatenate', () => {
  const spy = vi.spyOn(utils, 'capitalize')
  formatPetName({ name: 'fluffy', category: 'cat' })
  expect(spy).toHaveBeenCalled()
})
```

### 2. Use Descriptive Test Names

```typescript
// ✅ Good - descriptive
it('should throw error when OpenAPI version is missing', () => {
  expect(() => parseSpec({})).toThrow('missing "openapi" field')
})

// ❌ Bad - vague
it('should throw error', () => {
  expect(() => parseSpec({})).toThrow()
})
```

### 3. One Assertion Per Test (Generally)

```typescript
// ✅ Good - focused test
it('should parse required properties correctly', () => {
  const result = parseSchema(schema)
  expect(result.properties.find(p => p.name === 'id')?.required).toBe(true)
})

it('should parse optional properties correctly', () => {
  const result = parseSchema(schema)
  expect(result.properties.find(p => p.name === 'category')?.required).toBe(false)
})

// ❌ Bad - multiple unrelated assertions
it('should parse schema', () => {
  const result = parseSchema(schema)
  expect(result.name).toBe('Pet')
  expect(result.properties.length).toBe(3)
  expect(result.type).toBe('interface')
})
```

### 4. Clean Up After Tests

```typescript
import { afterEach } from 'vitest'

afterEach(async () => {
  // Clean up test files
  await rm('./test/tmp', { recursive: true, force: true })
  
  // Reset mocks
  vi.restoreAllMocks()
})
```

## Next Steps

- [Code Style →](/contributing/code-style)
- [Pull Requests →](/contributing/pull-requests)
