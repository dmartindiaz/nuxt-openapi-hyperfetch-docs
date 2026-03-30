# Connectors — Getting Started

## What are connectors?

Connectors are **headless UI composables** generated directly from your OpenAPI spec. They bridge the gap between your API and your UI components — handling the data, state, and logic so you can focus on the interface.

For each resource in your spec (e.g. `Pet`, `Order`, `User`), the generator creates a single composable — `usePetsConnector()` — that contains everything needed to build a complete CRUD UI:

| Sub-connector | What it manages |
|---|---|
| `table` | List data, pagination, row selection, action triggers |
| `createForm` | Create form model, Zod validation, submission state |
| `updateForm` | Edit form with auto-fill from the loaded item |
| `deleteAction` | Confirmation flow for deletion |
| `detail` | Single-item fetch (used internally to pre-fill the edit form) |

**Connectors are headless.** They have no opinion about what your UI looks like. Use them with any component library: Shadcn, PrimeVue, Vuetify, plain HTML. You bring the template; the connector brings the logic.

---

## What problem do they solve?

Without connectors, building a CRUD page for `Pets` means wiring up manually:

- A `useAsyncData` call for the list
- A second one for the edit form detail fetch
- A third one for create, a fourth for update, a fifth for delete
- Zod schemas and per-field error mapping
- Pagination state synced to the list
- "Which row am I editing?" state to coordinate between table and form
- "Which row am I deleting?" state for the confirmation modal
- Loading and error state for each operation independently

Connectors generate all of that from your spec and expose it as a single composable. You call `usePetsConnector()` and destructure what you need.

---

## Requirements

- `useAsyncData` composables must already be generated (`nxh generate` with `useAsyncData` selected)
- `zod` must be installed in your project:

```bash
npm install zod
```

---

## Generating connectors

### Interactive CLI

```bash
nxh generate
```

After selecting `useAsyncData`, the CLI asks:

```
Generate headless UI connectors? (tables, pagination, forms & delete logic built on top of useAsyncData)
● Yes  ○ No
```

### Non-interactive CLI

```bash
nxh generate -i ./swagger.yaml -o ./composables --generators useAsyncData --connectors --backend heyapi
```

### Via `nxh.config.js`

```js
// nxh.config.js
export default {
  input: './swagger.yaml',
  output: './composables',
  generators: ['useAsyncData'],
  createUseAsyncDataConnectors: true,
  generator: 'heyapi',
}
```

### Via `nuxt.config.ts` (Nuxt module)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  openApiHyperFetch: {
    input: './swagger.yaml',
    output: './composables',
    generators: ['useAsyncData'],
    createUseAsyncDataConnectors: true,
  },
})
```

---

## What gets generated

After running the generator, your output directory will contain:

```
composables/
  use-async-data/          ← your existing useAsyncData composables
    use-async-data-get-pets.ts
    use-async-data-get-pet-by-id.ts
    ...
  connectors/              ← new
    use-pets-connector.ts
    use-orders-connector.ts
    index.ts               ← re-exports all connectors
  runtime/                 ← runtime helpers (copied once, never overwritten)
    useListConnector.ts
    useDetailConnector.ts
    useFormConnector.ts
    useDeleteConnector.ts
    zod-error-merger.ts
```

Each connector file is auto-generated and **will be overwritten** on the next run. The `runtime/` helpers are copied once and are yours to keep — they are never overwritten.

---

## A first look at a generated connector

```ts
// composables/connectors/use-pets-connector.ts
// ⚠️ AUTO-GENERATED — DO NOT EDIT MANUALLY

import { z } from 'zod'
import { useListConnector } from '#nxh/runtime/useListConnector'
import { useDetailConnector } from '#nxh/runtime/useDetailConnector'
import { useFormConnector } from '#nxh/runtime/useFormConnector'
import { useDeleteConnector } from '#nxh/runtime/useDeleteConnector'
import { useAsyncDataGetPets } from '../use-async-data/use-async-data-get-pets'
import { useAsyncDataGetPetById } from '../use-async-data/use-async-data-get-pet-by-id'
import { useAsyncDataCreatePet } from '../use-async-data/use-async-data-create-pet'
import { useAsyncDataUpdatePet } from '../use-async-data/use-async-data-update-pet'
import { useAsyncDataDeletePet } from '../use-async-data/use-async-data-delete-pet'

const PetCreateSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['available', 'pending', 'sold']).optional(),
})

const PetUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['available', 'pending', 'sold']).optional(),
})

export function usePetsConnector() {
  const table = useListConnector(useAsyncDataGetPets, { paginated: true })
  const detail = useDetailConnector(useAsyncDataGetPetById)
  const createForm = useFormConnector(useAsyncDataCreatePet, { schema: PetCreateSchema })
  const updateForm = useFormConnector(useAsyncDataUpdatePet, { schema: PetUpdateSchema, loadWith: detail })
  const deleteAction = useDeleteConnector(useAsyncDataDeletePet)

  return { table, detail, createForm, updateForm, deleteAction }
}
```

---

## Minimal usage in a component

```vue
<script setup>
const { table, createForm, updateForm, deleteAction } = usePetsConnector()

// When the table signals "create", reset and show the form
watch(table._createTrigger, () => {
  createForm.reset()
  showCreateModal.value = true
})

// When the table signals "edit a row", load it and show the edit form
watch(table._updateTarget, (row) => {
  if (row) {
    detail.load(row.id)
    showEditModal.value = true
  }
})

// When the table signals "delete a row", open confirmation
watch(table._deleteTarget, (row) => {
  if (row) deleteAction.setTarget(row)
})

// After successful operations, close modals and refresh the table
createForm.onSuccess.value = () => {
  showCreateModal.value = false
  table.refresh()
}
updateForm.onSuccess.value = () => {
  showEditModal.value = false
  table.refresh()
}
deleteAction.onSuccess.value = () => {
  table.refresh()
}
</script>
```

For a complete, working example see the [Full CRUD Example](./full-example.md).

---

## Next steps

- [useListConnector](./use-list-connector.md) — table data, pagination, row selection
- [useFormConnector](./use-form-connector.md) — create/edit forms, Zod validation, error translation
- [useDeleteConnector](./use-delete-connector.md) — deletion confirmation flow
- [Full CRUD Example](./full-example.md) — all connectors working together in a single page
