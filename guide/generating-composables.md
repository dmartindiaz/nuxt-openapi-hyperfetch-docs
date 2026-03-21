# Generating Composables

Learn how to generate composables from your OpenAPI specification.

## Interactive Mode

The simplest way to generate composables is using **interactive mode**:

```bash
nxh generate
```

The CLI will prompt you for:

1. **Input file path**: Location of your OpenAPI/Swagger file
2. **Output directory**: Where to generate files
3. **Generator type**: `useFetch`, `useAsyncData`, or `nuxtServer`

### Example Session

```bash
$ nxh generate

? Enter path to OpenAPI specification file: swagger.yaml
? Enter output directory: ./composables/api
? Select generator type: useFetch

✓ Parsed OpenAPI specification
✓ Found 15 operations
✓ Generated 15 composables
✓ Copied runtime files
✓ Generated types

Done! Generated files in ./composables/api
```

## Command-Line Arguments

For automation or scripts, provide all arguments:

```bash
nxh generate \
  --input swagger.yaml \
  --output ./composables/api \
  --generator useFetch
```

### Short Aliases

```bash
nxh generate -i swagger.yaml -o ./composables/api -g useFetch
```

## Input File Formats

Nuxt Generator supports multiple OpenAPI formats:

### YAML (Recommended)

```bash
nxh generate -i swagger.yaml -o ./api
```

YAML is more readable and commonly used for OpenAPI specs.

### JSON

```bash
nxh generate -i openapi.json -o ./api
```

JSON works identically to YAML.

### Remote URLs

```bash
nxh generate -i https://petstore.swagger.io/v2/swagger.json -o ./api
```

The generator can fetch specs from URLs (useful for CI/CD).

## Output Structure

Generated files follow a consistent structure:

```
<output-directory>/
├── index.ts                    # Exports all composables
├── types.d.ts                  # Generated TypeScript types
├── runtime/                    # Helper functions (copied)
│   ├── use-api-request.ts      # Core wrapper
│   ├── use-api-async-data.ts   # AsyncData variant
│   ├── callbacks.ts            # Callback types
│   └── global-callbacks.ts     # Global callback utilities
└── composables/                # Generated composables (or routes/)
    ├── getPets.ts
    ├── getPetById.ts
    ├── createPet.ts
    └── ...
```

### Key Files

| File | Description | Editable? |
|------|-------------|-----------|
| `index.ts` | Exports all composables | ❌ Regenerated |
| `types.d.ts` | TypeScript types from schemas | ❌ Regenerated |
| `runtime/*.ts` | Helper functions | ✅ Yes (changes persist) |
| `composables/*.ts` | Individual composables | ❌ Regenerated |

::: warning
Files in `composables/` and root-level `index.ts`/`types.d.ts` are **regenerated** every time you run the generator. Any manual edits will be lost.

To customize behavior, edit files in `runtime/` instead.
:::

## Regeneration

**When to regenerate:**

- ✅ OpenAPI spec changes (new endpoints, updated schemas)
- ✅ Switching generator types (`useFetch` → `useAsyncData`)
- ✅ Fixing generation errors

**What gets regenerated:**

- ✅ `composables/` or `routes/` (all composable/route files)
- ✅ `index.ts` (barrel export)
- ✅ `types.d.ts` (TypeScript types)

**What doesn't get regenerated:**

- ✅ `runtime/` files (unless they don't exist)
- ✅ Your custom plugins, components, pages

### Regenerating Safely

```bash
# Backup runtime directory if you made changes
cp -r composables/api/runtime composables/api/runtime.backup

# Regenerate
nxh generate -i swagger.yaml -o ./composables/api -g useFetch

# Restore custom runtime changes if needed
diff composables/api/runtime composables/api/runtime.backup
```

Or use version control:

```bash
# Commit before regenerating
git add -A
git commit -m "Before regeneration"

# Regenerate
nxh generate -i swagger.yaml -o ./composables/api

# Review changes
git diff

# Revert runtime changes if needed
git checkout -- composables/api/runtime
```

## Generator-Specific Output

### useFetch Output

```typescript
// composables/getPets.ts
export function useFetchGetPets(
  params?: {},
  options?: ApiRequestOptions<Pet[]>
) {
  return useApiRequest<Pet[]>('/pets', {
    method: 'GET',
    ...options
  })
}
```

### useAsyncData Output

```typescript
// composables/getPets.ts
export function useAsyncDataGetPets(
  key: string,
  params?: {},
  options?: ApiAsyncDataOptions<Pet[]>
) {
  return useApiAsyncData<Pet[]>(key, '/pets', {
    method: 'GET',
    ...options
  })
}
```

### nuxtServer Output

```typescript
// routes/pets/index.get.ts
export default defineEventHandler(async (event) => {
  // Server-side route
  const pets = await $fetch('https://api.external.com/pets')
  return pets
})
```

See [Choosing a Generator](/guide/choosing-a-generator) for detailed comparison.

## Partial Generation

If you only need composables for **specific endpoints**, manually edit the generated `index.ts` to export only what you need:

```typescript
// index.ts - Remove unused exports
export { useFetchGetPets } from './composables/getPets'
export { useFetchGetPetById } from './composables/getPetById'
// Remove: export { useFetchDeletePet } from './composables/deletePet'
```

Or delete unused files:

```bash
rm composables/api/composables/deletePet.ts
```

::: tip
The generator creates a composable for **every operation** in your OpenAPI spec. If your spec is large, consider splitting it or using tools like [openapi-generator-cli](https://github.com/OpenAPITools/openapi-generator-cli) for more granular control.
:::

## Validation

After generation, verify that everything works:

### 1. Check Types

```typescript
// Should have full type support
const { data, pending, error } = useFetchGetPets()

// TypeScript should autocomplete
data.value?.[0].name // ✅ Autocomplete works
```

### 2. Import in Component

```vue
<script setup lang="ts">
const { data: pets } = useFetchGetPets()
</script>

<template>
  <div>{{ pets }}</div>
</template>
```

### 3. Run TypeScript Check

```bash
npx nuxi typecheck
```

Should pass without errors.

## Troubleshooting Generation

### "Invalid OpenAPI specification"

**Cause:** OpenAPI spec has syntax errors or missing required fields.

**Solution:**

1. Validate at [Swagger Editor](https://editor.swagger.io/)
2. Ensure all `$ref` references are valid
3. Check for missing `operationId` fields

### "No operations found"

**Cause:** OpenAPI spec doesn't define any `paths`.

**Solution:**

Ensure your spec has a `paths` section:

```yaml
paths:
  /pets:
    get:
      operationId: getPets
      # ...
```

### Generated files have TypeScript errors

**Cause:** Types are not correctly generated from schemas.

**Solution:**

1. Run `npx nuxi prepare` to regenerate Nuxt types
2. Check that schemas in OpenAPI are valid
3. Restart TypeScript server in your IDE

See [Troubleshooting](/troubleshooting/generation-errors) for more issues.

## Next Steps

- **Choose a Generator**: Learn [which generator to use](/guide/choosing-a-generator)
- **See Examples**: Browse [practical examples](/examples/composables/basic/simple-get)
- **Add Callbacks**: Learn about [lifecycle callbacks](/composables/features/callbacks/overview)
