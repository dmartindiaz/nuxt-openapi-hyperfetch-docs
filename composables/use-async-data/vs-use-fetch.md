# useAsyncData vs useFetch

Understanding the differences between `useAsyncData` and `useFetch` generators helps you choose the right one for your use case.

## Quick Comparison

| Feature | useFetch | useAsyncData |
|---------|----------|--------------|
| **API Simplicity** | ⭐⭐⭐ Simple | ⭐⭐ Medium |
| **Cache Key** | Automatic | Manual |
| **Raw Response** | ❌ No | ✅ Yes |
| **Response Headers** | ❌ No | ✅ Yes (Raw variant) |
| **Reactive Params** | ✅ Native (watchEffect) | ✅ CLI-added |
| **Data Transform** | ✅ Full | ✅ Full |
| **Type Safety** | ✅ Full | ✅ Full |
| **SSR Support** | ✅ Full | ✅ Full |
| **Callbacks** | ✅ Full | ✅ Full |
| **Global Callbacks** | ✅ Yes | ✅ Yes |
| **Best For** | 80% of cases | Complex logic |

::: tip Reactive Params — how each one works
**useFetch**: Nuxt uses `watchEffect` internally, so it auto-detects any ref/computed read inside the URL function or `query`/`body` options.

**useAsyncData**: Nuxt's native `useAsyncData` requires explicit `watch` sources and doesn't track the fetch function. The CLI-generated composables add this automatically — pass a `ref` or `computed` as params and they wire up the watch sources for you.
:::

## API Differences

### useFetch

```typescript
// No cache key required
const { data, pending, error } = useFetchGetPets()
```

### useAsyncData

```typescript
// Cache key required
const { data, pending, error } = useAsyncDataGetPets('pets-key')
```

## When to Use Each

### Use useFetch When:

✅ **Simple GET Requests**
```typescript
// ✅ Good - simple data loading
const { data: pets } = useFetchGetPets()
```

✅ **Forms (POST/PUT/DELETE)**
```typescript
// ✅ Good - straightforward submission
const { execute: submit } = useFetchCreatePet(
  { body: formData.value },
  { immediate: false }
)
```

✅ **You Don't Need Headers/Status**
```typescript
// ✅ Good - just need the data
const { data: pet } = useFetchGetPetById({ petId: 123 })
```

✅ **Auto Cache Keys Are Fine**
```typescript
// ✅ Good - cache key handled automatically
const { data } = useFetchGetPets()
```

### Use useAsyncData When:

✅ **Need Response Headers/Status**
```typescript
// ✅ Good - raw response access
const { data: response } = useAsyncDataGetPetsRaw('pets')
console.log(response.value?.headers.get('X-Total-Count'))
```

✅ **Complex Multi-Step Data Processing**
```typescript
// ✅ Good - advanced transformations with multiple steps
const { data } = useAsyncDataGetPets('processed-pets', {}, {
  transform: (pets) => {
    const grouped = groupByStatus(pets)
    const sorted = sortByName(grouped)
    return calculateStats(sorted)
  }
})
```

✅ **Multiple API Calls**
```typescript
// ✅ Good - combine multiple calls
const { data } = useAsyncData('pet-details', async () => {
  const [pet, owner] = await Promise.all([...])
  return { pet, owner }
})
```

✅ **Fine-Grained Cache Control**
```typescript
// ✅ Good - precise cache keys
const { data } = useAsyncDataGetPets(
  `pets-${status}-${page}`,
  { status, page }
)
```

## Transform Support

**Both composables support `transform`**, but with different use cases:

### useFetch Transform

Best for **simple, direct transformations**:

```typescript
// ✅ Extract single property
const { data: name } = useFetchGetPerson({ id: 1 }, {
  transform: (person) => person.name
})

// ✅ Map array to extract fields
const { data: names } = useFetchGetPets({}, {
  transform: (pets) => pets.map(p => p.name)
})

// ✅ Filter and transform
const { data: available } = useFetchGetPets({}, {
  transform: (pets) => pets
    .filter(p => p.status === 'available')
    .map(p => ({ id: p.id, name: p.name }))
})
```

### useAsyncData Transform

Best for **complex transformations or when you need cache keys**:

```typescript
// ✅ Multi-step processing
const { data: stats } = useAsyncDataGetPets('pet-stats', {}, {
  transform: (pets) => ({
    total: pets.length,
    byStatus: groupByStatus(pets),
    averageAge: calculateAverage(pets)
  })
})
```

**Rule of thumb**: Use useFetch's transform for simple cases, useAsyncData when you need more control or cache management.

## Real-World Examples

### Example 1: Simple List Page

```vue
<!-- Use useFetch - it's simpler -->
<script setup lang="ts">
const { data: pets, pending } = useFetchGetPets()
</script>

<template>
  <ul>
    <li v-for="pet in pets" :key="pet.id">{{ pet.name }}</li>
  </ul>
</template>
```

### Example 2: Search with Filters

```vue
<!-- Use useFetch - simple filtering -->
<script setup lang="ts">
const filters = ref({ status: 'available', limit: 20 })

const { data: pets } = useFetchGetPets(filters.value)
</script>

<template>
  <div>
    <select v-model="filters.status">
      <option>available</option>
      <option>sold</option>
    </select>
    <ul>
      <li v-for="pet in pets" :key="pet.id">{{ pet.name }}</li>
    </ul>
  </div>
</template>
```

### Example 3: Paginated List with Total Count

```vue
<!-- Use useAsyncData - need headers -->
<script setup lang="ts">
const page = ref(1)

const { data: response } = useAsyncDataGetPetsRaw(
  `pets-page-${page.value}`,
  { page: page.value, limit: 20 }
)

const totalCount = computed(() => 
  response.value?.headers.get('X-Total-Count')
)

const totalPages = computed(() => 
  Math.ceil(Number(totalCount.value) / 20)
)
</script>

<template>
  <div>
    <ul>
      <li v-for="pet in response?._data" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
    <p>Page {{ page }} of {{ totalPages }}</p>
  </div>
</template>
```

### Example 4: Display Names Only

```vue
<!-- Use useAsyncData - data transformation -->
<script setup lang="ts">
const { data: petNames } = useAsyncDataGetPets(
  'pet-names',
  {},
  {
    transform: (pets) => pets.map(p => p.name.toUpperCase())
  }
)
</script>

<template>
  <ul>
    <!-- petNames is string[], not Pet[] -->
    <li v-for="name in petNames" :key="name">{{ name }}</li>
  </ul>
</template>
```

### Example 5: Form Submission

```vue
<!-- Use useFetch - simple submission -->
<script setup lang="ts">
const form = ref({ name: '', email: '' })

const { execute: submit, pending } = useFetchCreateUser(
  { body: form.value },
  {
    immediate: false,
    onSuccess: () => {
      showToast('User created!', 'success')
    }
  }
)
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="form.name" />
    <input v-model="form.email" />
    <button :disabled="pending">Submit</button>
  </form>
</template>
```

### Example 6: Complex Dashboard

```vue
<!-- Use useAsyncData - multiple calls -->
<script setup lang="ts">
const { data: dashboard } = useAsyncData('dashboard', async () => {
  // Load multiple resources in parallel
  const [pets, owners, appointments] = await Promise.all([
    $fetch('/api/pets'),
    $fetch('/api/owners'),
    $fetch('/api/appointments')
  ])
  
  // Combine and transform
  return {
    totalPets: pets.length,
    totalOwners: owners.length,
    upcomingAppointments: appointments.filter(a => a.date > Date.now()),
    recentPets: pets.slice(0, 5)
  }
})
</script>

<template>
  <div>
    <div>Total Pets: {{ dashboard?.totalPets }}</div>
    <div>Total Owners: {{ dashboard?.totalOwners }}</div>
    <ul>
      <li v-for="pet in dashboard?.recentPets" :key="pet.id">
        {{ pet.name }}
      </li>
    </ul>
  </div>
</template>
```

## Migration Guide

### From useFetch to useAsyncData

**Before (useFetch):**
```typescript
const { data: pets } = useFetchGetPets()
```

**After (useAsyncData):**
```typescript
const { data: pets } = useAsyncDataGetPets('pets-key')
```

Add a unique cache key, that's it!

### From useAsyncData to useFetch

**Before (useAsyncData):**
```typescript
const { data: pets } = useAsyncDataGetPets('pets-key')
```

**After (useFetch):**
```typescript
const { data: pets } = useFetchGetPets()
```

Remove the cache key, simpler!

## Performance

Both have similar performance:

- ✅ Both are SSR-compatible
- ✅ Both use Nuxt's built-in caching
- ✅ Both support lazy loading
- ✅ Both deduplicate requests

**No performance difference** - choose based on features needed.

## Decision Tree

```
  Need response headers/status?
            │
       ┌────┴────┐
       │         │
      Yes        No
       │         │
       ▼         ▼
 useAsyncData  Multiple API calls?
                    │
               ┌────┴────┐
               │         │
              Yes        No
               │         │
               ▼         ▼
        useAsyncData  Need fine-grained cache control?
                           │
                      ┌────┴────┐
                      │         │
                     Yes        No
                      │         │
                      ▼         ▼
               useAsyncData  useFetch ✅
```

## Recommendations

### For Beginners

Start with **useFetch**:
- Simpler API
- No cache keys to manage
- Covers 80% of use cases

### For Advanced Users

Use **useAsyncData** when you need:
- Response headers/status (Raw variant)
- Multiple API calls combined
- Fine-grained cache control
- Custom cache keys for specific scenarios

### For Teams

Default to **useFetch**, upgrade to **useAsyncData** only when needed:

```typescript
// ✅ Start here
const { data } = useFetchGetPets()

// ⬆️ Upgrade if needed
const { data: response } = useAsyncDataGetPetsRaw('pets')
```

## Next Steps

- [useFetch Guide](/composables/use-fetch/)
- [useAsyncData Guide](/composables/use-async-data/)
