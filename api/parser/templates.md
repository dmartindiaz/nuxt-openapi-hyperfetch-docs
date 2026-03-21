# Template Generation

How Nuxt OpenAPI Hyperfetch generates code from OpenAPI specifications.

## Generation Process

### 1. Parse Operation

Read operation details from OpenAPI spec:

```yaml
paths:
  /pets/{id}:
    get:
      operationId: getPet
      tags: [pets]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
```

### 2. Generate Function Name

From operation ID or path + method:

```typescript
// From operationId
operationId: 'getPet' → useFetchPet()

// From path + method
GET /pets/{id} → useFetchPet()
POST /pets → useCreatePet()
PUT /pets/{id} → useUpdatePet()
DELETE /pets/{id} → useDeletePet()
```

### 3. Generate Parameters

Convert OpenAPI parameters to TypeScript:

```typescript
// Path parameter
parameters:
  - name: id
    in: path

→ function useFetchPet(id: MaybeRef<number>)

// Query parameters
parameters:
  - name: status
    in: query
  - name: limit
    in: query

→ function useFetchPets(params: MaybeRef<{ 
    status?: string
    limit?: number 
  }>)
```

### 4. Generate Types

Create TypeScript interfaces:

```yaml
schemas:
  Pet:
    type: object
    properties:
      id: { type: integer }
      name: { type: string }
```

```typescript
export interface Pet {
  id: number
  name: string
}
```

### 5. Generate Composable

Create the full composable function:

```typescript
export function useFetchPet(
  id: MaybeRef<number>,
  options?: UseFetchOptions<Pet>
) {
  return useFetch<Pet>(() => `/pets/${unref(id)}`, {
    ...options,
    baseURL: useRuntimeConfig().public.apiBase
  })
}
```

## Client Mode Templates

### GET Request (useFetch)

```typescript
export function useFetchPet(
  id: MaybeRef<number>,
  options?: UseFetchOptions<Pet>
) {
  return useFetch<Pet>(
    () => `/pets/${unref(id)}`,
    options
  )
}
```

### GET Request (useAsyncData)

```typescript
export function useAsyncDataPet(
  id: MaybeRef<number>,
  options?: UseAsyncDataOptions<Pet>
) {
  return useAsyncData(
    `pet-${unref(id)}`,
    () => $fetch<Pet>(`/pets/${unref(id)}`),
    options
  )
}
```

### POST Request

```typescript
export function useCreatePet(
  options?: UseFetchOptions<Pet>
) {
  return useFetch<Pet>('/pets', {
    method: 'POST',
    immediate: false,
    ...options
  })
}
```

### PUT Request

```typescript
export function useUpdatePet(
  id: MaybeRef<number>,
  options?: UseFetchOptions<Pet>
) {
  return useFetch<Pet>(
    () => `/pets/${unref(id)}`,
    {
      method: 'PUT',
      immediate: false,
      ...options
    }
  )
}
```

### DELETE Request

```typescript
export function useDeletePet(
  id: MaybeRef<number>,
  options?: UseFetchOptions<void>
) {
  return useFetch<void>(
    () => `/pets/${unref(id)}`,
    {
      method: 'DELETE',
      immediate: false,
      ...options
    }
  )
}
```

## Server Mode Templates

### GET Request

```typescript
export async function getServerPet(
  event: H3Event,
  id: number,
  options?: ServerComposableOptions<Pet>
): Promise<Pet> {
  return await $fetch<Pet>(`/pets/${id}`, {
    baseURL: useRuntimeConfig().apiBase,
    headers: getProxyHeaders(event)
  })
}
```

### POST Request

```typescript
export async function createServerPet(
  event: H3Event,
  body: CreatePetRequest,
  options?: ServerComposableOptions<Pet>
): Promise<Pet> {
  return await $fetch<Pet>('/pets', {
    method: 'POST',
    body,
    baseURL: useRuntimeConfig().apiBase,
    headers: getProxyHeaders(event)
  })
}
```

## File Organization

Generated files are organized by tag:

```
composables/
├── pets/
│   ├── useFetchPet.ts
│   ├── useFetchPets.ts
│   ├── useCreatePet.ts
│   ├── useUpdatePet.ts
│   └── useDeletePet.ts
├── users/
│   ├── useFetchUser.ts
│   └── useCreateUser.ts
├── types.ts
└── index.ts
```

### Index File

```typescript
// composables/index.ts
export * from './pets'
export * from './users'
export * from './types'
```

### Tag File

```typescript
// composables/pets/index.ts
export { useFetchPet } from './useFetchPet'
export { useFetchPets } from './useFetchPets'
export { useCreatePet } from './useCreatePet'
export { useUpdatePet } from './useUpdatePet'
export { useDeletePet } from './useDeletePet'
```

## Next Steps

- [Parser Overview →](/api/parser/index)
- [OpenAPI Parsing →](/api/parser/openapi)
- [Generated Types →](/api/interfaces/types)
