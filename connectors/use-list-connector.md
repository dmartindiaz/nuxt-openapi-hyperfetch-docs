# useListConnector

`useListConnector` wraps a `useAsyncData` list composable and provides everything a data table needs: rows, loading state, pagination, row selection, and action triggers to coordinate with forms and delete modals.

## In the generated connector

```ts
const table = useListConnector(useAsyncDataGetPets, { paginated: true, columns: petsColumns })
```

You don't call `useListConnector` directly — the generated connector calls it for you. You use `table` in your component.

---

## API reference

### State

| Property | Type | Description |
|---|---|---|
| `table.rows` | `ComputedRef<any[]>` | The list of items. Unwraps both `item[]` and `{ data: item[] }` response shapes automatically. |
| `table.loading` | `ComputedRef<boolean>` | `true` while the list request is in flight. |
| `table.error` | `ComputedRef<any>` | The error from the last failed request, or `null`. |
| `table.columns` | `ComputedRef<ColumnDef[]>` | Column definitions inferred from the OpenAPI schema, with any label overrides applied. |

### Column label translation

The generator infers column labels from the field names in your OpenAPI spec. You can override them from the component — safe from regenerations.

**Option 1: static map** — override specific labels by field key:

```ts
const { table } = usePetsConnector({
  columnLabels: {
    name: 'Nombre',
    status: 'Estado',
    createdAt: 'Fecha de alta',
  },
})
```

**Option 2: i18n function** — applied to every column key:

```ts
const { t } = useI18n()

const { table } = usePetsConnector({
  columnLabel: (key) => t(`pets.columns.${key}`),
})
```

Priority: **`columnLabel` function** > **`columnLabels` map** > **generated label**.

### Pagination

Only available when the list endpoint has a defined response schema and `paginated: true` is set (the generator sets this automatically).

| Property | Type | Description |
|---|---|---|
| `table.pagination` | `ComputedRef<PaginationState \| null>` | Current pagination state, or `null` if not paginated. |
| `table.pagination.value.currentPage` | `number` | |
| `table.pagination.value.totalPages` | `number` | |
| `table.pagination.value.total` | `number` | |
| `table.pagination.value.perPage` | `number` | |
| `table.pagination.value.hasNextPage` | `boolean` | |
| `table.pagination.value.hasPrevPage` | `boolean` | |
| `table.nextPage()` | `function` | Go to next page. No-op if already on the last page. |
| `table.prevPage()` | `function` | Go to previous page. No-op if already on the first page. |
| `table.goToPage(n)` | `function` | Jump to a specific page number. |
| `table.setPerPage(n)` | `function` | Change page size and reset to page 1. |

### Row selection

| Property | Type | Description |
|---|---|---|
| `table.selected` | `Ref<any[]>` | Currently selected rows. |
| `table.onRowSelect(row)` | `function` | Toggle-selects a row (adds if not selected, removes if selected). |
| `table.clearSelection()` | `function` | Clears the selection. |

### Actions

| Property | Type | Description |
|---|---|---|
| `table.refresh()` | `function` | Re-fetches the list. Call this after a successful create, update, or delete. |
| `table.create()` | `function` | Signals the parent to open a create form. Increments `_createTrigger`. |
| `table.update(row)` | `function` | Signals the parent to open an edit form for `row`. Sets `_updateTarget`. |
| `table.remove(row)` | `function` | Signals the parent to open a delete confirmation for `row`. Sets `_deleteTarget`. |

### Coordination refs

These are the reactive values your component `watch`es to react to table actions:

| Property | Type | Description |
|---|---|---|
| `table._createTrigger` | `Ref<number>` | Increments each time `table.create()` is called. Watch to open a create modal. |
| `table._updateTarget` | `ShallowRef<any \| null>` | Set to the row each time `table.update(row)` is called. Watch to open an edit modal. |
| `table._deleteTarget` | `ShallowRef<any \| null>` | Set to the row each time `table.remove(row)` is called. Watch to open a delete modal. |

---

## Examples

### Basic table

```vue
<script setup>
const { table } = usePetsConnector()
</script>

<template>
  <div v-if="table.loading">Loading...</div>
  <div v-else-if="table.error">Failed to load pets.</div>

  <table v-else>
    <tbody>
      <tr v-for="row in table.rows" :key="row.id">
        <td>{{ row.name }}</td>
        <td>{{ row.status }}</td>
      </tr>
    </tbody>
  </table>
</template>
```

### Table with pagination

```vue
<script setup>
const { table } = usePetsConnector()
</script>

<template>
  <table>
    <tbody>
      <tr v-for="row in table.rows" :key="row.id">
        <td>{{ row.name }}</td>
      </tr>
    </tbody>
  </table>

  <div v-if="table.pagination">
    <button :disabled="!table.pagination.hasPrevPage" @click="table.prevPage()">← Prev</button>
    <span>Page {{ table.pagination.currentPage }} of {{ table.pagination.totalPages }}</span>
    <button :disabled="!table.pagination.hasNextPage" @click="table.nextPage()">Next →</button>
  </div>
</template>
```

### Table with action buttons and CRUD wiring

```vue
<script setup>
const showCreateModal = ref(false)
const showEditModal = ref(false)

const { table, createForm, updateForm, deleteAction, detail } = usePetsConnector()

watch(table._createTrigger, () => {
  createForm.reset()
  showCreateModal.value = true
})

watch(table._updateTarget, (row) => {
  if (row) {
    detail.load(row.id)
    showEditModal.value = true
  }
})

watch(table._deleteTarget, (row) => {
  if (row) deleteAction.setTarget(row)
})
</script>

<template>
  <button @click="table.create()">New Pet</button>

  <table>
    <tbody>
      <tr v-for="row in table.rows" :key="row.id">
        <td>{{ row.name }}</td>
        <td>
          <button @click="table.update(row)">Edit</button>
          <button @click="table.remove(row)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### Row selection

```vue
<script setup>
const { table } = usePetsConnector()
</script>

<template>
  <p>{{ table.selected.length }} selected</p>
  <button @click="table.clearSelection()">Clear</button>

  <table>
    <tbody>
      <tr
        v-for="row in table.rows"
        :key="row.id"
        :class="{ selected: table.selected.includes(row) }"
        @click="table.onRowSelect(row)"
      >
        <td>{{ row.name }}</td>
      </tr>
    </tbody>
  </table>
</template>
```
