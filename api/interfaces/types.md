# Generated Types

TypeScript types generated from OpenAPI schemas.

## Schema Types

Types generated from OpenAPI `components.schemas`.

### Example Schema

```yaml
# openapi.yaml
components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        category:
          type: string
        status:
          type: string
          enum: [available, pending, sold]
        tags:
          type: array
          items:
            $ref: '#/components/schemas/Tag'
```

### Generated Type

```typescript
export interface Pet {
  id: number
  name: string
  category?: string
  status?: 'available' | 'pending' | 'sold'
  tags?: Tag[]
}
```

## Request Body Types

Types for request bodies.

### POST Request

```yaml
# openapi.yaml
paths:
  /pets:
    post:
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
// Generated
export interface CreatePetRequest {
  name: string
  category?: string
}
```

### PUT Request

```yaml
# openapi.yaml
paths:
  /pets/{id}:
    put:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdatePetRequest'
```

```typescript
// Generated
export interface UpdatePetRequest {
  name?: string
  category?: string
  status?: 'available' | 'pending' | 'sold'
}
```

## Response Types

Types for API responses.

### Success Response

```yaml
# openapi.yaml
paths:
  /pets/{id}:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
```

```typescript
// Inferred from composable
const { data } = useFetchPet(1)
//      ^? Ref<Pet | null>
```

### List Response

```yaml
# openapi.yaml
paths:
  /pets:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/Pet'
                  total:
                    type: integer
```

```typescript
// Generated
export interface PetListResponse {
  items: Pet[]
  total: number
}

const { data } = useFetchPets()
//      ^? Ref<PetListResponse | null>
```

## Enum Types

String literal unions for enums.

```yaml
# openapi.yaml
components:
  schemas:
    PetStatus:
      type: string
      enum: [available, pending, sold]
```

```typescript
// Generated
export type PetStatus = 'available' | 'pending' | 'sold'

export interface Pet {
  status: PetStatus
}
```

## Nullable Types

Optional and nullable fields.

```yaml
# openapi.yaml
components:
  schemas:
    Pet:
      properties:
        category:
          type: string
          nullable: true
        description:
          type: string
```

```typescript
// Generated
export interface Pet {
  category?: string | null
  description?: string
}
```

## Nested Types

Referenced schemas.

```yaml
# openapi.yaml
components:
  schemas:
    Pet:
      properties:
        owner:
          $ref: '#/components/schemas/User'
        tags:
          type: array
          items:
            $ref: '#/components/schemas/Tag'
```

```typescript
// Generated
export interface Pet {
  owner?: User
  tags?: Tag[]
}

export interface User {
  id: number
  name: string
  email: string
}

export interface Tag {
  id: number
  name: string
}
```

## Union Types

OneOf and AnyOf schemas.

```yaml
# openapi.yaml
components:
  schemas:
    Pet:
      oneOf:
        - $ref: '#/components/schemas/Dog'
        - $ref: '#/components/schemas/Cat'
```

```typescript
// Generated
export type Pet = Dog | Cat

export interface Dog {
  type: 'dog'
  breed: string
}

export interface Cat {
  type: 'cat'
  color: string
}
```

## Generic Types

Reusable type patterns.

```yaml
# openapi.yaml
components:
  schemas:
    Page:
      type: object
      properties:
        items:
          type: array
          items: {}
        total:
          type: integer
        page:
          type: integer
```

```typescript
// Generated
export interface Page<T> {
  items: T[]
  total: number
  page: number
}

// Usage
export interface PetPage extends Page<Pet> {}
```

## Type Utilities

Helper types for common patterns.

```typescript
// Make all properties optional
export type PartialPet = Partial<Pet>

// Make all properties required
export type RequiredPet = Required<Pet>

// Pick specific properties
export type PetPreview = Pick<Pet, 'id' | 'name' | 'category'>

// Omit properties
export type PetWithoutId = Omit<Pet, 'id'>
```

## Next Steps

- [Composables Interfaces →](/api/interfaces/composables)
- [Server Interfaces →](/api/interfaces/server)
- [Type Safety Guide →](/guide/core-concepts#type-safety)
