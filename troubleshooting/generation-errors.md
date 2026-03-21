# Generation Errors

Solutions for OpenAPI parsing and code generation issues.

## OpenAPI Parsing Errors

### Invalid OpenAPI Version

```bash
Error: Unsupported OpenAPI version: 2.0
```

**Cause:** Using Swagger 2.0 instead of OpenAPI 3.0

**Solution:**

```bash
# Convert Swagger 2.0 to OpenAPI 3.0
npx swagger2openapi swagger.json -o openapi.yaml

# Then generate
nxh generate -i openapi.yaml
```

### Missing Required Fields

```bash
Error: Missing required field: openapi
```

**Cause:** Invalid OpenAPI specification

**Solution:** Ensure your spec has required fields:

```yaml
openapi: 3.0.0  # ✅ Required
info:            # ✅ Required
  title: My API
  version: 1.0.0
paths: {}        # ✅ Required
```

### Invalid Schema Reference

```bash
Error: Cannot resolve reference: #/components/schemas/InvalidRef
```

**Cause:** Referenced schema doesn't exist

**Solution:**

```yaml
# ❌ Bad - Pet schema doesn't exist
paths:
  /pets:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'  # Error: doesn't exist

# ✅ Good - Define the schema
components:
  schemas:
    Pet:
      type: object
      properties:
        name:
          type: string
```

### Circular References

```bash
Error: Circular reference detected: Pet -> Owner -> Pet
```

**Cause:** Schema references itself

**Solution:** Use `allOf` or break circular reference:

```yaml
# ✅ Option 1: Break reference
components:
  schemas:
    Pet:
      type: object
      properties:
        name:
          type: string
        ownerId:           # ✅ Store ID instead
          type: number
    
    Owner:
      type: object
      properties:
        name:
          type: string
        petIds:            # ✅ Store IDs instead
          type: array
          items:
            type: number

# ✅ Option 2: Use allOf (if needed)
components:
  schemas:
    Pet:
      type: object
      properties:
        name:
          type: string
        owner:
          allOf:
            - $ref: '#/components/schemas/OwnerSummary'
    
    OwnerSummary:        # ✅ Limited version
      type: object
      properties:
        id:
          type: number
        name:
          type: string
```

## Path Parsing Errors

### Missing operationId

```bash
Warning: Missing operationId for GET /pets, using default: getPets
```

**Cause:** No operationId defined

**Solution:** Add operationId to each operation:

```yaml
# ❌ Bad - no operationId
paths:
  /pets/{id}:
    get:
      summary: Get pet

# ✅ Good - explicit operationId
paths:
  /pets/{id}:
    get:
      operationId: getPetById  # ✅ Generates useFetchPetById
      summary: Get pet by ID
```

### Invalid Path Parameters

```bash
Error: Path parameter 'id' not defined in parameters
```

**Cause:** Path has `{id}` but no parameter definition

**Solution:**

```yaml
# ❌ Bad - parameter not defined
paths:
  /pets/{id}:
    get:
      operationId: getPetById

# ✅ Good - parameter defined
paths:
  /pets/{id}:
    get:
      operationId: getPetById
      parameters:
        - name: id              # ✅ Must match path param
          in: path
          required: true
          schema:
            type: number
```

### Duplicate operationIds

```bash
Error: Duplicate operationId: getPet
```

**Cause:** Multiple operations with same operationId

**Solution:** Use unique operationIds:

```yaml
# ❌ Bad - duplicate
paths:
  /pets/{id}:
    get:
      operationId: getPet      # ❌ Duplicate
  /pets/featured:
    get:
      operationId: getPet      # ❌ Duplicate

# ✅ Good - unique
paths:
  /pets/{id}:
    get:
      operationId: getPetById  # ✅ Unique
  /pets/featured:
    get:
      operationId: getFeaturedPets  # ✅ Unique
```

## Schema Validation Errors

### Invalid Type

```bash
Error: Invalid type: unknown
```

**Cause:** Unsupported type in schema

**Solution:** Use valid OpenAPI types:

```yaml
# ❌ Bad - invalid types
Pet:
  type: object
  properties:
    id:
      type: int        # ❌ Should be 'integer'
    name:
      type: text       # ❌ Should be 'string'

# ✅ Good - valid types
Pet:
  type: object
  properties:
    id:
      type: integer    # ✅ Valid
    name:
      type: string     # ✅ Valid
```

Valid types: `string`, `number`, `integer`, `boolean`, `array`, `object`

### Missing Response Schema

```bash
Warning: No response schema for GET /pets
```

**Cause:** Response has no content schema

**Solution:**

```yaml
# ❌ Bad - no schema
paths:
  /pets:
    get:
      responses:
        '200':
          description: Success

# ✅ Good - with schema
paths:
  /pets:
    get:
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
```

## File System Errors

### Output Directory Errors

```bash
Error: EACCES: permission denied, mkdir '/generated'
```

**Cause:** No write permission

**Solution:**

```bash
# Use directory you have permission to write
nxh generate -i swagger.yaml -o ./composables

# Or fix permissions
chmod 755 /path/to/output
```

### File Already Exists

```bash
Error: Output directory not empty
```

**Cause:** Directory contains files

**Solution:**

```bash
# Clear directory first
rm -rf ./generated/*

# Or use different directory
nxh generate -i swagger.yaml -o ./new-composables
```

## Generation Warnings

### Unused Schemas

```bash
Warning: Schema 'OldPet' defined but not used
```

**Cause:** Schema exists but no operation references it

**Solution:** Remove unused schemas or ignore warning:

```yaml
# Remove if truly unused
components:
  schemas:
    # Pet:  # ✅ Remove if not used
```

### Deprecated Operations

```bash
Warning: Operation 'getPet' is deprecated
```

**Cause:** Operation marked as deprecated in spec

**Solution:**

```yaml
# Still generates code with deprecation comment
paths:
  /pets/{id}:
    get:
      operationId: getPetById
      deprecated: true  # ⚠️ Generates with @deprecated comment
```

## Validation Tools

### Validate OpenAPI Spec

```bash
# Using Swagger Editor online
# https://editor.swagger.io/

# Or use CLI validator
npx @apidevtools/swagger-cli validate swagger.yaml

# Or use redocly
npx @redocly/cli lint swagger.yaml
```

### Check Generated Code

```bash
# Build TypeScript to check for errors
npm run build

# Run type checker
npm run type-check
```

## Common Fixes

### Fix 1: Ensure Valid OpenAPI 3.0

```yaml
openapi: 3.0.0  # ✅ Must be 3.0.x
info:
  title: My API
  version: 1.0.0
paths: {}
```

### Fix 2: Add operationIds

```bash
# Use this pattern:
# {verb}{Resource}[By{Param}]

GET /pets → getPets
GET /pets/{id} → getPetById
POST /pets → createPet
PUT /pets/{id} → updatePet
DELETE /pets/{id} → deletePet
```

### Fix 3: Define All Schemas

```yaml
# Every $ref must have corresponding definition
components:
  schemas:
    Pet:  # ✅ Defined
      type: object
    Owner:  # ✅ Defined
      type: object
```

## Debug Tips

### 1. Start Simple

```yaml
# Minimal valid spec
openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths:
  /test:
    get:
      operationId: getTest
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
```

### 2. Add Complexity Gradually

1. Start with one endpoint
2. Add more endpoints
3. Add schemas
4. Add parameters
5. Add request bodies

### 3. Use Linter

```bash
# Install OpenAPI linter
npm install -g @redocly/cli

# Lint your spec
redocly lint swagger.yaml
```

## Next Steps

- [Type Errors →](/troubleshooting/type-errors)
- [Build Issues →](/troubleshooting/build-issues)
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.0)
