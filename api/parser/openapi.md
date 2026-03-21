# OpenAPI Parsing

How Nuxt OpenAPI Hyperfetch parses and validates OpenAPI specifications.

## Supported Versions

- OpenAPI 3.0.x
- OpenAPI 3.1.x
- Swagger 2.0 (converted to OpenAPI 3.0)

## Parsing Process

### 1. Load Specification

```typescript
import { parseOpenAPI } from 'nuxt-openapi-hyperfetch'

// File path
const spec = await parseOpenAPI('./openapi.yaml')

// URL
const spec = await parseOpenAPI('https://api.example.com/openapi.json')

// Object
const spec = await parseOpenAPI(openApiObject)
```

### 2. Resolve References

All `$ref` references are resolved:

```yaml
# Before
paths:
  /pets/{id}:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'

components:
  schemas:
    Pet:
      type: object
      properties:
        id:
          type: integer
```

```typescript
// After resolution
const petSchema = spec.components.schemas.Pet
// Fully resolved schema object
```

### 3. Validate Schema

Validates against OpenAPI specification:

- Required fields present
- Valid HTTP methods
- Valid response codes
- Schema types valid
- References resolvable

```typescript
try {
  const spec = await parseOpenAPI('./openapi.yaml')
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid OpenAPI spec:', error.message)
  }
}
```

## Path Parsing

### Operations

Each HTTP method becomes a composable:

```yaml
paths:
  /pets/{id}:
    get:
      operationId: getPet
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
```

```typescript
// Generated
export function useFetchPet(id: MaybeRef<number>) { ... }
```

### Parameters

#### Path Parameters

```yaml
parameters:
  - name: id
    in: path
    required: true
    schema:
      type: integer
```

```typescript
function useFetchPet(id: MaybeRef<number>)
```

#### Query Parameters

```yaml
parameters:
  - name: status
    in: query
    schema:
      type: string
      enum: [available, pending, sold]
  - name: limit
    in: query
    schema:
      type: integer
```

```typescript
function useFetchPets(params: MaybeRef<{
  status?: 'available' | 'pending' | 'sold'
  limit?: number
}>)
```

## Schema Parsing

### Object Schema

```yaml
schemas:
  Pet:
    type: object
    required: [id, name]
    properties:
      id:
        type: integer
      name:
        type: string
      age:
        type: integer
```

```typescript
export interface Pet {
  id: number
  name: string
  age?: number
}
```

### Array Schema

```yaml
schemas:
  PetList:
    type: array
    items:
      $ref: '#/components/schemas/Pet'
```

```typescript
export type PetList = Pet[]
```

### Enum Schema

```yaml
schemas:
  PetStatus:
    type: string
    enum: [available, pending, sold]
```

```typescript
export type PetStatus = 'available' | 'pending' | 'sold'
```

### Nested Schema

```yaml
schemas:
  Pet:
    type: object
    properties:
      owner:
        $ref: '#/components/schemas/User'
      tags:
        type: array
        items:
          $ref: '#/components/schemas/Tag'
```

```typescript
export interface Pet {
  owner?: User
  tags?: Tag[]
}
```

## Response Parsing

### Success Response

```yaml
responses:
  '200':
    description: Successful response
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Pet'
```

```typescript
// Return type inferred
const { data } = useFetchPet(1)
//      ^? Ref<Pet | null>
```

### Error Response

```yaml
responses:
  '404':
    description: Pet not found
  '500':
    description: Server error
```

Error responses are handled by the error property:

```typescript
const { error } = useFetchPet(1)
//      ^? Ref<Error | null>
```

## Request Body Parsing

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required: [name]
        properties:
          name:
            type: string
          category:
            type: string
```

```typescript
export interface CreatePetRequest {
  name: string
  category?: string
}

function useCreatePet(body: CreatePetRequest) { ... }
```

## Next Steps

- [Template Generation →](/api/parser/templates)
- [Generated Types →](/api/interfaces/types)
