# Full CRUD Example

This example shows all four connectors working together in a single page: a paginated table, a create modal, an edit modal with auto-fill, and a delete confirmation modal — all for the `Pet` resource.

No business logic is written manually. Everything is wired from `usePetsConnector()`.

---

## The page component

```vue
<!-- pages/pets/index.vue -->
<script setup>
const { table, detail, createForm, updateForm, deleteAction } = usePetsConnector()

const showCreateModal = ref(false)
const showEditModal = ref(false)

// ── Table → Create ──────────────────────────────────────────────────────────
// table.create() increments _createTrigger; we watch it to open the modal
watch(table._createTrigger, () => {
  createForm.reset()
  showCreateModal.value = true
})

createForm.onSuccess.value = () => {
  showCreateModal.value = false
  table.refresh()
}

// ── Table → Edit ────────────────────────────────────────────────────────────
// table.update(row) sets _updateTarget; we load the detail and open the modal
watch(table._updateTarget, (row) => {
  if (!row) return
  detail.load(row.id)   // triggers auto-fill of updateForm.model via loadWith
  showEditModal.value = true
})

updateForm.onSuccess.value = () => {
  showEditModal.value = false
  table.refresh()
}

// ── Table → Delete ──────────────────────────────────────────────────────────
// table.remove(row) sets _deleteTarget; we pass it to deleteAction
watch(table._deleteTarget, (row) => {
  if (row) deleteAction.setTarget(row)
})

deleteAction.onSuccess.value = () => {
  table.refresh()
}
</script>

<template>
  <!-- ── Toolbar ──────────────────────────────────────────────────────────── -->
  <div class="toolbar">
    <h1>Pets</h1>
    <button @click="table.create()">+ New Pet</button>
  </div>

  <!-- ── Table ────────────────────────────────────────────────────────────── -->
  <div v-if="table.loading">Loading...</div>
  <div v-else-if="table.error">Failed to load pets.</div>

  <table v-else>
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in table.rows" :key="row.id">
        <td>{{ row.name }}</td>
        <td>{{ row.status }}</td>
        <td>
          <button @click="table.update(row)">Edit</button>
          <button @click="table.remove(row)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- ── Pagination ───────────────────────────────────────────────────────── -->
  <div v-if="table.pagination" class="pagination">
    <button :disabled="!table.pagination.hasPrevPage" @click="table.prevPage()">← Prev</button>
    <span>Page {{ table.pagination.currentPage }} of {{ table.pagination.totalPages }}</span>
    <button :disabled="!table.pagination.hasNextPage" @click="table.nextPage()">Next →</button>
  </div>

  <!-- ── Create Modal ─────────────────────────────────────────────────────── -->
  <div v-if="showCreateModal" class="modal">
    <h2>New Pet</h2>

    <form @submit.prevent="createForm.submit()">
      <div>
        <label>Name</label>
        <input v-model="createForm.model.name" />
        <span v-if="createForm.errors.name" class="error">{{ createForm.errors.name }}</span>
      </div>

      <div>
        <label>Status</label>
        <select v-model="createForm.model.status">
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>
        <span v-if="createForm.errors.status" class="error">{{ createForm.errors.status }}</span>
      </div>

      <p v-if="createForm.submitError" class="error">Something went wrong. Please try again.</p>

      <div class="actions">
        <button type="button" @click="showCreateModal = false">Cancel</button>
        <button type="submit" :disabled="createForm.loading">
          {{ createForm.loading ? 'Saving...' : 'Create' }}
        </button>
      </div>
    </form>
  </div>

  <!-- ── Edit Modal ───────────────────────────────────────────────────────── -->
  <!-- updateForm.model is auto-filled when detail.load(id) resolves -->
  <div v-if="showEditModal" class="modal">
    <h2>Edit Pet</h2>

    <div v-if="detail.loading">Loading...</div>

    <form v-else @submit.prevent="updateForm.submit()">
      <div>
        <label>Name</label>
        <input v-model="updateForm.model.name" />
        <span v-if="updateForm.errors.name" class="error">{{ updateForm.errors.name }}</span>
      </div>

      <div>
        <label>Status</label>
        <select v-model="updateForm.model.status">
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>
        <span v-if="updateForm.errors.status" class="error">{{ updateForm.errors.status }}</span>
      </div>

      <p v-if="updateForm.submitError" class="error">Something went wrong. Please try again.</p>

      <div class="actions">
        <button type="button" @click="showEditModal = false">Cancel</button>
        <button type="submit" :disabled="updateForm.loading">
          {{ updateForm.loading ? 'Saving...' : 'Save changes' }}
        </button>
      </div>
    </form>
  </div>

  <!-- ── Delete Confirmation Modal ────────────────────────────────────────── -->
  <div v-if="deleteAction.isOpen" class="modal">
    <h2>Delete Pet</h2>
    <p>
      Are you sure you want to delete
      <strong>{{ deleteAction.target?.name }}</strong>?
      This action cannot be undone.
    </p>

    <p v-if="deleteAction.error" class="error">Something went wrong. Please try again.</p>

    <div class="actions">
      <button @click="deleteAction.cancel()" :disabled="deleteAction.loading">Cancel</button>
      <button @click="deleteAction.confirm()" :disabled="deleteAction.loading">
        {{ deleteAction.loading ? 'Deleting...' : 'Yes, delete' }}
      </button>
    </div>
  </div>
</template>
```

---

## What's happening

```
usePetsConnector()
│
├── table                    list + pagination + row action triggers
│   ├── rows                 rendered in <table>
│   ├── pagination           rendered below the table
│   ├── _createTrigger  ──── watched → opens create modal + resets form
│   ├── _updateTarget   ──── watched → calls detail.load(id) + opens edit modal
│   └── _deleteTarget   ──── watched → calls deleteAction.setTarget(row)
│
├── detail                   single-item fetch (not rendered directly)
│   └── load(id)        ──── triggered by _updateTarget watch
│                            auto-fills updateForm.model via loadWith
│
├── createForm               create form state + validation
│   ├── model                bound to create modal inputs
│   ├── errors               shown below each input
│   └── onSuccess       ──── closes modal + table.refresh()
│
├── updateForm               edit form state + auto-fill
│   ├── model                auto-filled when detail resolves
│   ├── errors               shown below each input
│   └── onSuccess       ──── closes modal + table.refresh()
│
└── deleteAction             delete confirmation state
    ├── isOpen               controls delete modal visibility
    ├── target               shown in confirmation message
    ├── confirm()            executes delete API call
    └── onSuccess       ──── table.refresh()
```

---

## Common customizations

### Show a toast instead of an inline error

```ts
const { createForm } = usePetsConnector()
const toast = useToast() // e.g. from your UI library

createForm.onSuccess.value = () => {
  toast.success('Pet created!')
  showCreateModal.value = false
  table.refresh()
}

createForm.onError.value = (err) => {
  toast.error(`Failed: ${err.message}`)
}
```

### Navigate to a detail page instead of a modal

```ts
const router = useRouter()

watch(table._updateTarget, (row) => {
  if (row) router.push(`/pets/${row.id}/edit`)
})
```

### Pre-fill create form from a route query

```ts
const route = useRoute()

watch(table._createTrigger, () => {
  createForm.reset()
  if (route.query.name) {
    createForm.setValues({ name: route.query.name })
  }
  showCreateModal.value = true
})
```
