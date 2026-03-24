# Type Errors

Solutions for TypeScript compilation and type errors.

## Generated Type Errors

### Type Not Found

```typescript
import type { Pet } from '~/composables/pets'
// ❌ Cannot find name 'Pet'
```

**Cause:** Types not generated or wrong import path

**Solution:**

```bash
# 1. Regenerate to ensure types are created
nxh generate -i swagger.yaml -o ./composables

# 2. Check file contains type export
cat composables/pets.ts | grep "export interface Pet"

# 3. Restart TypeScript server in VSCode
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Circular Type Reference

```typescript
export interface Pet {
  owner: Owner
}

export interface Owner {
  pets: Pet[]
}
// ❌ Type instantiation is excessively deep
```

**Cause:** Circular reference in schema

**Solution:** Fix OpenAPI spec to break circular reference:

```yaml
# ✅ Option 1: Use IDs
components:
  schemas:
    Pet:
      properties:
        ownerId:
          type: number
    Owner:
      properties:
        petIds:
          type: array
          items:
            type: number

# ✅ Option 2: Make one optional
components:
  schemas:
    Pet:
      properties:
        owner:
          $ref: '#/components/schemas/Owner'
    Owner:
      properties:
        pets:
          type: array
          items:
            $ref: '#/components/schemas/PetSummary'  # Lighter version
```

### Union Type Not Working

```typescript
type Status = 'available' | 'pending' | 'sold'
const status: Status = pet.status
// ❌ Type 'string' is not assignable to type 'Status'
```

**Cause:** OpenAPI enum not generating union type

**Solution:** Ensure enum in spec:

```yaml
# ❌ Bad - generates string
Pet:
  properties:
    status:
      type: string

# ✅ Good - generates union type
Pet:
  properties:
    status:
      type: string
      enum:
        - available
        - pending
        - sold
```

## Composable Type Errors

### Ref Type Mismatch

```vue
<script setup lang="ts">
const { data } = useFetchPet(1)
const pet: Pet = data  // ❌ Type 'Ref<Pet | null>' is not assignable to 'Pet'
</script>
```

**Cause:** `data` is a Ref, not direct value

**Solution:**

```vue
<script setup lang="ts">
const { data } = useFetchPet(1)

// ✅ Option 1: Use .value
const pet: Pet | null = data.value

// ✅ Option 2: Use Ref type
const pet: Ref<Pet | null> = data

// ✅ Option 3: Use in template (auto-unwrapped)
</script>

<template>
  <div v-if="data">
    {{ data.name }}  <!-- ✅ Auto-unwrapped -->
  </div>
</template>
```

### Nullable Type Not Handled

```typescript
const { data } = useFetchPet(1)
const name = data.value.name  // ❌ Object is possibly 'null'
```

**Cause:** TypeScript strict null checks

**Solution:**

```typescript
// ✅ Option 1: Optional chaining
const name = data.value?.name

// ✅ Option 2: Nullish coalescing
const name = data.value?.name ?? 'Unknown'

// ✅ Option 3: Type guard
if (data.value) {
  const name = data.value.name  // ✅ Narrowed to non-null
}

// ✅ Option 4: Non-null assertion (if you're sure)
const name = data.value!.name
```

### Generic Constraint Error

```typescript
function processPet<T>(pet: T) {
  return pet.name  // ❌ Property 'name' does not exist on type 'T'
}
```

**Cause:** Generic needs constraint

**Solution:**

```typescript
import type { Pet } from '~/composables/pets'

// ✅ Add constraint
function processPet<T extends Pet>(pet: T) {
  return pet.name  // ✅ TypeScript knows T has name
}

// ✅ Or use specific type
function processPet(pet: Pet) {
  return pet.name
}
```

## Parameter Type Errors

### Wrong Parameter Type

```typescript
const { data } = useFetchPet('1')
// ❌ Argument of type 'string' is not assignable to parameter 'number'
```

**Cause:** Parameter type mismatch

**Solution:**

```typescript
// ❌ Wrong type
const id = '1'
useFetchPet(id)

// ✅ Convert to correct type
const id = '1'
useFetchPet(Number(id))

// ✅ Or from route params
const route = useRoute()
useFetchPet(Number(route.params.id))
```

### Missing Required Parameter

```typescript
const { data } = useFetchPet()
// ❌ Expected 1 argument, but got 0
```

**Cause:** Required parameter not provided

**Solution:**

```typescript
// ✅ Provide required parameter
const { data } = useFetchPet(1)

// ✅ Or use from variable
const petId = ref(1)
const { data } = useFetchPet(petId)
```

### Optional vs Required Confusion

```typescript
interface PetQuery {
  limit?: number
  offset?: number
  search: string  // Required
}

const { data } = useFetchPets({
  limit: 10
})
// ❌ Property 'search' is missing
```

**Cause:** Required field not provided

**Solution:**

```typescript
// ✅ Provide all required fields
const { data } = useFetchPets({
  limit: 10,
  offset: 0,
  search: ''  // ✅ Required
})

// Or fix OpenAPI spec if search should be optional:
components:
  schemas:
    PetQuery:
      properties:
        search:
          type: string
      required: []  # ✅ Make search optional
```

## Response Type Errors

### Response Type Too Generic

```typescript
const { data } = useFetchPet(1)
// data: Ref<any>
```

**Cause:** Response schema not defined in OpenAPI

**Solution:** Add response schema:

```yaml
paths:
  /pets/{id}:
    get:
      operationId: getPetById
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'  # ✅ Add schema
```

### Array Response Not Typed

```typescript
const { data } = useFetchPets()
// Need: Pet[]
// Got: unknown[]
```

**Cause:** Array items not typed in spec

**Solution:**

```yaml
paths:
  /pets:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'  # ✅ Type array items
```

### Nested Object Not Typed

```typescript
const pet = data.value
const owner = pet.owner  // ❌ Type 'unknown'
```

**Cause:** Nested object not defined

**Solution:** Define nested schema:

```yaml
components:
  schemas:
    Pet:
      properties:
        owner:
          $ref: '#/components/schemas/Owner'  # ✅ Reference type
    
    Owner:  # ✅ Define type
      type: object
      properties:
        name:
          type: string
```

## Request Body Type Errors

### Body Type Mismatch

```typescript
const { data } = useAsyncDataCreatePet({
  name: 'Fluffy',
  age: '3'  // ❌ Type 'string' is not assignable to type 'number'
})
```

**Cause:** Wrong type for property

**Solution:**

```typescript
// ✅ Use correct types
const { data } = useAsyncDataCreatePet({
  name: 'Fluffy',
  age: 3  // ✅ number
})

// ✅ Or convert
const ageStr = '3'
const { data } = useAsyncDataCreatePet({
  name: 'Fluffy',
  age: Number(ageStr)
})
```

### Extra Properties Not Allowed

```typescript
const { data } = useAsyncDataCreatePet({
  name: 'Fluffy',
  color: 'orange'  // ❌ Object literal may only specify known properties
})
```

**Cause:** TypeScript strict mode doesn't allow extra properties

**Solution:**

```typescript
// ✅ Option 1: Only use defined properties
const { data } = useAsyncDataCreatePet({
  name: 'Fluffy'
})

// ✅ Option 2: Add to schema if needed
// Update OpenAPI spec:
Pet:
  properties:
    name:
      type: string
    color:  # ✅ Add property
      type: string

// ✅ Option 3: Type assertion (not recommended)
const { data } = useAsyncDataCreatePet({
  name: 'Fluffy',
  color: 'orange'
} as CreatePetRequest)
```

## Enum Type Errors

### String Literal Type Error

```typescript
const status = 'available'
const { data } = useAsyncDataUpdatePet({
  status  // ❌ Type 'string' is not assignable to type '"available" | "pending"'
})
```

**Cause:** TypeScript widens string to type `string`

**Solution:**

```typescript
// ✅ Option 1: Use const assertion
const status = 'available' as const
const { data } = useAsyncDataUpdatePet({ status })

// ✅ Option 2: Type the variable
const status: 'available' | 'pending' | 'sold' = 'available'
const { data } = useAsyncDataUpdatePet({ status })

// ✅ Option 3: Inline literal
const { data } = useAsyncDataUpdatePet({
  status: 'available'
})
```

## Fix Strategies

### 1. Regenerate Types

```bash
# Clean output directory
rm -rf ./composables

# Regenerate
nxh generate -i swagger.yaml -o ./composables

# Restart TypeScript
# VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### 2. Check Generated Types

```typescript
// Open generated file and verify types
// composables/pets.ts

export interface Pet {
  id: number
  name: string
  status: 'available' | 'pending' | 'sold'
}

// ✅ Types should match OpenAPI schema
```

### 3. Use Type Guards

```typescript
// Create type guard
function isPet(value: unknown): value is Pet {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}

// Use type guard
const { data } = useFetchPet(1)
if (data.value && isPet(data.value)) {
  const pet: Pet = data.value  // ✅ Type narrowed
}
```

### 4. Fix OpenAPI Spec

Most type errors come from incomplete OpenAPI spec:

```yaml
# ✅ Complete type definition
Pet:
  type: object
  required:        # ✅ Specify required fields
    - id
    - name
  properties:
    id:
      type: integer
    name:
      type: string
    status:
      type: string
      enum:        # ✅ Use enums for literals
        - available
        - pending
        - sold
    owner:
      $ref: '#/components/schemas/Owner'  # ✅ Reference types
```

## TypeScript Config

Ensure proper TypeScript configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "moduleResolution": "bundler",
    "types": ["@nuxt/types"]
  }
}
```

## Debugging Type Errors

### 1. Hover for Type Info

In VSCode, hover over variables to see inferred type

### 2. Use Type Assertions Temporarily

```typescript
// See what TypeScript thinks type is
const pet = data.value as any
console.log(typeof pet)
```

### 3. Check Error Message

```typescript
// Error message shows what TypeScript expects:
// Type 'X' is not assignable to type 'Y'
//      ^^^                             ^^^
//      What you have                What's expected
```

## Next Steps

- [Generation Errors →](/troubleshooting/generation-errors)
- [Build Issues →](/troubleshooting/build-issues)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
