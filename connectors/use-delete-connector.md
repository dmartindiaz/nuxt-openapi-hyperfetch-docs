# useDeleteConnector

`useDeleteConnector` manages the confirmation flow for DELETE operations: which item is being deleted, whether the confirmation modal is open, and the state of the delete request itself.

## In the generated connector

```ts
const deleteAction = useDeleteConnector(useAsyncDataDeletePet)
```

---

## API reference

### State

| Property | Type | Description |
|---|---|---|
| `deleteAction.target` | `Ref<any \| null>` | The item pending deletion. Set by `setTarget(item)`. |
| `deleteAction.isOpen` | `Ref<boolean>` | Whether the confirmation modal should be shown. |
| `deleteAction.loading` | `Ref<boolean>` | `true` while the delete request is in flight. |
| `deleteAction.error` | `Ref<any>` | Error from the last failed delete, or `null`. |
| `deleteAction.hasTarget` | `ComputedRef<boolean>` | `true` when `target` is not null. |

### Callbacks

| Property | Type | Description |
|---|---|---|
| `deleteAction.onSuccess` | `Ref<(deletedItem: any) => void>` | Called with the deleted item after a successful delete. Use this to refresh the table. |
| `deleteAction.onError` | `Ref<(err: any) => void>` | Called with the error on failure. |

### Actions

| Property | Type | Description |
|---|---|---|
| `deleteAction.setTarget(item)` | `function` | Sets `target` to `item` and opens the confirmation modal (`isOpen = true`). |
| `deleteAction.cancel()` | `function` | Clears `target` and closes the modal. |
| `deleteAction.confirm()` | `async function` | Calls the delete composable with `target`, then fires `onSuccess` or `onError`. |

---

## How it wires to the table

The typical flow is:

1. User clicks "Delete" on a table row → `table.remove(row)` is called
2. Parent watches `table._deleteTarget` → calls `deleteAction.setTarget(row)`
3. `deleteAction.isOpen` becomes `true` → your modal appears
4. User confirms → `deleteAction.confirm()` → API call → `onSuccess` → `table.refresh()`
5. User cancels → `deleteAction.cancel()` → `isOpen` becomes `false`

```ts
// Parent component
watch(table._deleteTarget, (row) => {
  if (row) deleteAction.setTarget(row)
})

deleteAction.onSuccess.value = () => {
  table.refresh()
}
```

---

## Examples

### Confirmation modal

```vue
<script setup>
const { table, deleteAction } = usePetsConnector()

watch(table._deleteTarget, (row) => {
  if (row) deleteAction.setTarget(row)
})

deleteAction.onSuccess.value = () => {
  table.refresh()
}
</script>

<template>
  <!-- Table -->
  <table>
    <tbody>
      <tr v-for="row in table.rows" :key="row.id">
        <td>{{ row.name }}</td>
        <td>
          <button @click="table.remove(row)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Confirmation modal -->
  <div v-if="deleteAction.isOpen" class="modal">
    <p>
      Are you sure you want to delete
      <strong>{{ deleteAction.target?.name }}</strong>?
    </p>

    <p v-if="deleteAction.error" class="error">
      Something went wrong. Please try again.
    </p>

    <button @click="deleteAction.cancel()" :disabled="deleteAction.loading">
      Cancel
    </button>
    <button @click="deleteAction.confirm()" :disabled="deleteAction.loading">
      {{ deleteAction.loading ? 'Deleting...' : 'Yes, delete' }}
    </button>
  </div>
</template>
```

### Inline delete without a modal

If you don't need a confirmation step, skip the modal wiring and call `confirm()` directly:

```vue
<script setup>
const { deleteAction, table } = usePetsConnector()

deleteAction.onSuccess.value = () => table.refresh()

async function deletePet(row) {
  deleteAction.setTarget(row)
  await deleteAction.confirm()
}
</script>

<template>
  <tr v-for="row in table.rows" :key="row.id">
    <td>{{ row.name }}</td>
    <td>
      <button @click="deletePet(row)" :disabled="deleteAction.loading">
        Delete
      </button>
    </td>
  </tr>
</template>
```
