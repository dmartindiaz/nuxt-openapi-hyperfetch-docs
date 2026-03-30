# useFormConnector

`useFormConnector` manages the state of a create or update form: the reactive model, Zod validation, per-field error messages, submission, and optional auto-fill from a detail fetch.

## In the generated connector

The generator creates two form connectors per resource — one for create, one for update:

```ts
const createForm = useFormConnector(useAsyncDataCreatePet, { schema: PetCreateSchema, schemaOverride: createSchema })
const updateForm = useFormConnector(useAsyncDataUpdatePet, { schema: PetUpdateSchema, schemaOverride: updateSchema, loadWith: detail })
```

`updateForm` receives `loadWith: detail`, which means it automatically pre-fills the form model whenever `detail` loads an item (e.g. when the user clicks "Edit" on a row).

The `schemaOverride` option lets you extend or replace the generated Zod schema from the component — without editing the auto-generated file.

---

## API reference

### State

| Property | Type | Description |
|---|---|---|
| `createForm.model` | `Ref<Record<string, any>>` | The reactive form data. Bind this to your inputs. |
| `createForm.errors` | `Ref<Record<string, string>>` | Per-field validation error messages. Keyed by field name. |
| `createForm.loading` | `Ref<boolean>` | `true` while the API request is in flight. |
| `createForm.submitError` | `Ref<any>` | Top-level error from a failed API call (not a field error). |
| `createForm.submitted` | `Ref<boolean>` | `true` after `submit()` has been called at least once. |
| `createForm.isValid` | `ComputedRef<boolean>` | `true` when the model passes Zod validation (or when no schema is provided). |
| `createForm.hasErrors` | `ComputedRef<boolean>` | `true` when `errors` has at least one entry. |
| `createForm.fields` | `ComputedRef<FormFieldDef[]>` | Field definitions inferred from the OpenAPI schema. |

### Callbacks

Set these before calling `submit()`, typically in `<script setup>`:

| Property | Type | Description |
|---|---|---|
| `createForm.onSuccess` | `Ref<(data: any) => void>` | Called with the API response data on success. |
| `createForm.onError` | `Ref<(err: any) => void>` | Called with the error on API failure. |

### Actions

| Property | Type | Description |
|---|---|---|
| `createForm.submit()` | `async function` | Validates the model with Zod, then calls the API composable. Does nothing if validation fails. |
| `createForm.reset()` | `function` | Clears model, errors, and submission state. |
| `createForm.setValues(data)` | `function` | Shallow-merges `data` into the model. Used internally by `loadWith`, but also useful for programmatic pre-fill. |

---

## Validation and error messages

### How validation works

When `submit()` is called:
1. The model is validated against the Zod schema
2. If invalid, `errors` is populated with per-field messages and the API is not called
3. If valid, the API composable is called with the model as payload

Errors are cleared on the next successful validation.

### Translating error messages globally

The recommended way to translate all Zod errors at once is with `z.setErrorMap()` in a Nuxt plugin:

```ts
// plugins/zod-i18n.ts
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import translation from 'zod-i18n-map/locales/es/zod.json'

z.setErrorMap(zodI18nMap)

export default defineNuxtPlugin(() => {})
```

Install: `npm install zod-i18n-map`

### Overriding errors per field with `errorConfig`

For custom messages on specific fields, pass `errorConfig` when calling `useFormConnector` directly:

```ts
const createForm = useFormConnector(useAsyncDataCreatePet, {
  schema: PetCreateSchema,
  errorConfig: {
    name: {
      required: 'Name is required',
      min: 'Must be at least 1 character',
      max: 'Cannot exceed 100 characters',
    },
    status: {
      enum: 'Please select a valid status',
    },
  },
})
```

Priority order: **`errorConfig` per-field override** > **`z.setErrorMap()` global** > **Zod defaults**.

---

## Extending or replacing the generated schema

The Zod schemas (e.g. `PetCreateSchema`) are generated inside the auto-generated connector file and will be overwritten on the next `nxh generate`. To add validations or replace the schema entirely, use the `createSchema` / `updateSchema` options on the connector — never edit the generated file.

### Extending with `.extend()`

Add fields that aren’t in the spec, or tighten constraints:

```ts
import { z } from 'zod'

const { createForm } = usePetsConnector({
  createSchema: (base) => base.extend({
    email: z.string().email('Invalid email'),
    confirmName: z.string(),
  }),
})
```

### Adding cross-field validation with `.refine()`

```ts
const { createForm } = usePetsConnector({
  createSchema: (base) => base.refine(
    (data) => data.name !== 'unknown',
    { message: 'Name cannot be "unknown"', path: ['name'] }
  ),
  updateSchema: (base) => base.superRefine((data, ctx) => {
    if (data.status === 'sold' && !data.soldAt) {
      ctx.addIssue({ code: 'custom', path: ['soldAt'], message: 'Required when status is sold' })
    }
  }),
})
```

### Replacing the schema entirely

Pass a full Zod schema instead of a function to replace the generated one:

```ts
const mySchema = z.object({
  name: z.string().min(1),
  status: z.enum(['available', 'pending']),
  internalCode: z.string().regex(/^[A-Z]{3}\d{4}$/),
})

const { createForm } = usePetsConnector({ createSchema: mySchema })
```

Priority: **`createSchema` / `updateSchema` override** > **generated schema**.

---

## Examples

### Create form

```vue
<script setup>
const { createForm } = usePetsConnector()

createForm.onSuccess.value = () => {
  emit('close')
  // table.refresh() in parent
}
</script>

<template>
  <form @submit.prevent="createForm.submit()">
    <div>
      <label>Name</label>
      <input v-model="createForm.model.name" />
      <span v-if="createForm.errors.name">{{ createForm.errors.name }}</span>
    </div>

    <div>
      <label>Status</label>
      <select v-model="createForm.model.status">
        <option value="available">Available</option>
        <option value="pending">Pending</option>
        <option value="sold">Sold</option>
      </select>
      <span v-if="createForm.errors.status">{{ createForm.errors.status }}</span>
    </div>

    <p v-if="createForm.submitError">Something went wrong. Please try again.</p>

    <button type="submit" :disabled="createForm.loading">
      {{ createForm.loading ? 'Saving...' : 'Create' }}
    </button>
  </form>
</template>
```

### Edit form (auto-fill via `loadWith`)

The `updateForm` in the generated connector is already wired to `detail` via `loadWith`. When `detail.load(id)` is called, `updateForm.model` is automatically populated.

```vue
<script setup>
const { updateForm, detail } = usePetsConnector()

// In the parent, when a row is selected for editing:
// detail.load(row.id)   ← triggers auto-fill of updateForm.model

updateForm.onSuccess.value = () => {
  emit('close')
}
</script>

<template>
  <form @submit.prevent="updateForm.submit()">
    <div>
      <label>Name</label>
      <input v-model="updateForm.model.name" />
      <span v-if="updateForm.errors.name">{{ updateForm.errors.name }}</span>
    </div>

    <button type="submit" :disabled="updateForm.loading">
      {{ updateForm.loading ? 'Saving...' : 'Save changes' }}
    </button>
  </form>
</template>
```

### Dynamic form from `fields`

`createForm.fields` contains the field definitions inferred from the OpenAPI schema. You can use them to render the form dynamically:

```vue
<template>
  <form @submit.prevent="createForm.submit()">
    <div v-for="field in createForm.fields" :key="field.key">
      <label>{{ field.label }}</label>

      <textarea v-if="field.type === 'textarea'" v-model="createForm.model[field.key]" />

      <select v-else-if="field.type === 'select'" v-model="createForm.model[field.key]">
        <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <input
        v-else
        :type="field.type === 'number' ? 'number' : field.type === 'datepicker' ? 'date' : 'text'"
        v-model="createForm.model[field.key]"
      />

      <span v-if="createForm.errors[field.key]">{{ createForm.errors[field.key] }}</span>
    </div>

    <button type="submit" :disabled="createForm.loading">Create</button>
  </form>
</template>
```

### Programmatic pre-fill

`setValues()` does a shallow merge — useful for setting defaults or pre-filling from a route param:

```ts
const { createForm } = usePetsConnector()

// Pre-set a default status
createForm.setValues({ status: 'available' })

// Or fill from a route query param
const route = useRoute()
if (route.query.name) {
  createForm.setValues({ name: route.query.name })
}
```
