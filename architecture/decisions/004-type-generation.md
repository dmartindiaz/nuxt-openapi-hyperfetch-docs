# ADR 004: Type Generation

**Status:** Accepted

**Date:** 2024-02-15

## Context

OpenAPI schemas need to be converted to TypeScript interfaces for type-safe composables. We need to decide how to generate these types.

## Requirements

1. **Accurate** - Types match OpenAPI schemas exactly
2. **Complete** - Handle all OpenAPI features
3. **Readable** - Generated types are clear
4. **Maintainable** - Easy to understand generated code
5. **Standards** - Follow TypeScript best practices

## Decision

**Generate TypeScript interfaces directly from OpenAPI schemas with the following approach:**

1. **Schemas → Interfaces** - Each schema becomes an interface
2. **Required vs Optional** - Use `?` for optional properties
3. **Enums → Union Types** - String literal unions instead of enums
4. **References → Imports** - Resolved inline or imported
5. **Nested Types** - Inline for simple, separate for complex

## Implementation

### Schema to Interface

```yaml
# openapi.yaml
components:
  schemas:
    Pet:
      type: object
      required: [id, name]
      properties:
        id:
          type: integer
        name:
          type: string
        status:
          type: string
          enum: [available, pending, sold]
        tags:
          type: array
          items:
            $ref: '#/components/schemas/Tag'
```

```typescript
// Generated types.ts
export interface Pet {
  id: number
  name: string
  status?: 'available' | 'pending' | 'sold'
  tags?: Tag[]
}

export interface Tag {
  id: number
  name: string
}
```

### Type Mapping

| OpenAPI Type | TypeScript Type |
|--------------|-----------------|
| `integer` | `number` |
| `number` | `number` |
| `string` | `string` |
| `boolean` | `boolean` |
| `array` | `T[]` |
| `object` | `interface` |
| `enum` | Union type |
| `nullable` | `T \| null` |
| `$ref` | Interface name |

### Naming Conventions

```typescript
// Schema name → Interface name (PascalCase)
Pet → interface Pet

// Request body → [Method][Operation]Request
POST /pets → interface CreatePetRequest

// Response → [Operation]Response (if needed)
GET /pets → interface PetListResponse
```

### Optional vs Required

```yaml
# OpenAPI
required: [id, name]
properties:
  id: { type: integer }
  name: { type: string }
  category: { type: string }
```

```typescript
// Generated
interface Pet {
  id: number        // required
  name: string      // required
  category?: string // optional
}
```

### Enums

```yaml
# OpenAPI
status:
  type: string
  enum: [available, pending, sold]
```

```typescript
// Generated (union type, not enum)
status?: 'available' | 'pending' | 'sold'
```

**Why not TypeScript enums?**
- More verbose
- Require import
- Runtime overhead
- Less flexible

### Nested Types

```yaml
# Simple nested object - inline
Pet:
  properties:
    location:
      type: object
      properties:
        lat: { type: number }
        lng: { type: number }
```

```typescript
interface Pet {
  location?: {
    lat: number
    lng: number
  }
}
```

```yaml
# Complex nested object - separate interface
Pet:
  properties:
    owner:
      $ref: '#/components/schemas/User'
```

```typescript
interface Pet {
  owner?: User
}

interface User {
  id: number
  name: string
}
```

## Consequences

### Positive

- **Type Safety** - Full compile-time checking
- **Autocomplete** - IDE suggestions for all properties
- **Documentation** - Types serve as documentation
- **Refactoring** - TypeScript catches breaking changes
- **Standards** - Follows TypeScript conventions
- **Tree-Shakeable** - Interfaces have no runtime cost

### Negative

- **Generated Code** - Types are not hand-written
- **Verbosity** - Large schemas → large type files
- **Complexity** - Complex schemas → complex types
- **Maintenance** - Must regenerate when schema changes

## Type Safety Examples

### Request Body

```typescript
const { execute } = useCreatePet()

// ✅ Valid
await execute({
  body: {
    name: 'Fluffy',
    category: 'cat'
  }
})

// ❌ Type error - missing required field
await execute({
  body: {
    category: 'cat' // Error: missing 'name'
  }
})

// ❌ Type error - invalid field
await execute({
  body: {
    name: 'Fluffy',
    invalid: 'field' // Error: unknown property
  }
})
```

### Response Type

```typescript
const { data: pet } = useFetchPet(1)

// ✅ Type-safe access
if (pet.value) {
  console.log(pet.value.name) // string
  console.log(pet.value.id)   // number
}

// ❌ Type error - wrong type
pet.value?.status = 'invalid' // Error: not in union
```

### Query Parameters

```typescript
// ✅ Valid
const { data } = useFetchPets({
  status: 'available',
  limit: 10
})

// ❌ Type error - invalid status
const { data } = useFetchPets({
  status: 'invalid' // Error: not in union
})
```

## Alternatives Considered

### Alternative 1: Runtime Validation

Use Zod or similar for runtime type checking.

**Rejected:**
- Runtime overhead
- Larger bundle size
- Duplicates OpenAPI validation
- More complex generated code

### Alternative 2: TypeScript Enums

Use `enum` instead of union types.

**Rejected:**
- Requires runtime code
- More verbose to use
- Import overhead
- Less idiomatic

### Alternative 3: Type Aliases

Use `type` instead of `interface`.

**Rejected:**
- Interfaces are more extensible
- Better error messages
- Conventional for object shapes

## Related

- [Generated Types Reference](/api/interfaces/types)
- [Type Safety Guide](/guide/concepts#type-safety)
