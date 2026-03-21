# Data Transformation

Transform response data before it's returned to your components using the `transform` option.

## Overview

Data transformation is available in **both `useFetch` and `useAsyncData`** composables:

```typescript
// useFetch - Extract single property from object
const { data: name } = useFetchGetPerson({ id: 1 }, {
  transform: (person) => person.name
})
// data is Ref<string> = "John Doe"

// useAsyncData - Transform array to extract names
const { data: names } = useAsyncDataGetPets({}, {
  transform: (pets) => pets.map(pet => pet.name)
})
// data is Ref<string[]> = ["Fluffy", "Rex", "Mittens"]
```

## Basic Transformations

### Extract Single Property

Extract a single property from an object:

```typescript
// useFetch - Extract person's name
const { data: name } = useFetchGetPerson({ id: 1 }, {
  transform: (person) => person.name
})
// data.value = "John Doe" (string)

// useFetch - Extract person's email
const { data: email } = useFetchGetUser({ userId: '123' }, {
  transform: (user) => user.profile.email
})
// data.value = "john@example.com" (string)
```

### Extract Fields from Array

Map an array to extract specific fields:

```typescript
// useAsyncData - Extract names from pets array
const { data: names } = useAsyncDataGetPets({}, {
  transform: (pets) => pets.map(pet => pet.name)
})
// data.value = ["Fluffy", "Rex", "Mittens"] (string[])

// useFetch - Extract IDs
const { data: ids } = useFetchGetOrders({}, {
  transform: (orders) => orders.map(order => order.id)
})
// data.value = [1, 2, 3, 4, 5] (number[])
```

### Map to Different Structure

```typescript
const { data: petCards } = useAsyncDataGetPets(
  'cards',
  {},
  {
    transform: (pets) => pets.map(pet => ({
      id: pet.id,
      title: pet.name,
      subtitle: pet.status,
      image: pet.photoUrl
    }))
  }
)
```

### Filter Data

```typescript
const { data: availablePets } = useAsyncDataGetPets(
  'available',
  {},
  {
    transform: (pets) => pets.filter(pet => pet.status === 'available')
  }
)
```

### Sort Data

```typescript
const { data: sortedPets } = useAsyncDataGetPets(
  'sorted',
  {},
  {
    transform: (pets) => [...pets].sort((a, b) => 
      a.name.localeCompare(b.name)
    )
  }
)
```

## Common Use Cases

### Display Names

```typescript
const { data: displayNames } = useAsyncDataGetPets(
  'display-names',
  {},
  {
    transform: (pets) => pets.map(pet => 
      `${pet.name} (${pet.id})`
    )
  }
)

// ["Fluffy (1)", "Rex (2)", "Mittens (3)"]
```

### Group By Category

```typescript
const { data: groupedPets } = useAsyncDataGetPets(
  'grouped',
  {},
  {
    transform: (pets) => {
      return pets.reduce((acc, pet) => {
        const status = pet.status
        if (!acc[status]) acc[status] = []
        acc[status].push(pet)
        return acc
      }, {} as Record<string, Pet[]>)
    }
  }
)

// { available: [...], pending: [...], sold: [...] }
```

### Add Computed Properties

```typescript
const { data: enrichedPets } = useAsyncDataGetPets(
  'enriched',
  {},
  {
    transform: (pets) => pets.map(pet => ({
      ...pet,
      displayName: `${pet.name} (#${pet.id})`,
      isAvailable: pet.status === 'available',
      age: calculateAge(pet.birthDate)
    }))
  }
)
```

### Flatten Nested Data

```typescript
const { data: flatOrders } = useAsyncDataGetOrders(
  'flat-orders',
  {},
  {
    transform: (orders) => orders.flatMap(order =>
      order.items.map(item => ({
        orderId: order.id,
        orderDate: order.date,
        itemName: item.name,
        itemPrice: item.price
      }))
    )
  }
)
```

### Pick Specific Fields

```typescript
const { data: minimal } = useAsyncDataGetPets(
  'minimal',
  {},
  {
    transform: (pets) => pets.map(({ id, name, status }) => ({
      id,
      name,
      status
    }))
  }
)
```

### Convert Dates

```typescript
const { data: petsWithDates } = useAsyncDataGetPets(
  'with-dates',
  {},
  {
    transform: (pets) => pets.map(pet => ({
      ...pet,
      createdAt: new Date(pet.createdAt),
      updatedAt: new Date(pet.updatedAt)
    }))
  }
)
```

## Advanced Transformations

### Pagination

```typescript
interface PaginatedResponse {
  items: Pet[]
  total: number
  page: number
}

const { data: paginatedPets } = useAsyncDataGetPets(
  'paginated',
  { page: 1, limit: 20 },
  {
    transform: (response: PaginatedResponse) => ({
      pets: response.items,
      totalPages: Math.ceil(response.total / 20),
      currentPage: response.page,
      hasMore: response.page * 20 < response.total
    })
  }
)
```

### Normalize Data

```typescript
const { data: normalized } = useAsyncDataGetPets(
  'normalized',
  {},
  {
    transform: (pets) => {
      const byId = pets.reduce((acc, pet) => {
        acc[pet.id] = pet
        return acc
      }, {} as Record<number, Pet>)
      
      const allIds = pets.map(pet => pet.id)
      
      return { byId, allIds }
    }
  }
)

// Access: normalized.value.byId[123]
```

### Aggregate Data

```typescript
const { data: stats } = useAsyncDataGetPets(
  'stats',
  {},
  {
    transform: (pets) => ({
      total: pets.length,
      available: pets.filter(p => p.status === 'available').length,
      pending: pets.filter(p => p.status === 'pending').length,
      sold: pets.filter(p => p.status === 'sold').length,
      averageAge: pets.reduce((sum, p) => sum + p.age, 0) / pets.length
    })
  }
)
```

### Join Related Data

```typescript
const { data: enriched } = useAsyncData(
  'pets-with-owners',
  async () => {
    // Load both in parallel
    const [pets, owners] = await Promise.all([
      $fetch('/api/pets'),
      $fetch('/api/owners')
    ])
    
    // Join data
    return pets.map(pet => ({
      ...pet,
      owner: owners.find(o => o.id === pet.ownerId)
    }))
  }
)
```

## TypeScript Support

Transformations are fully typed:

```typescript
const { data } = useAsyncDataGetPets(
  'transformed',
  {},
  {
    // Input: Pet[]
    // Output: string[]
    transform: (pets: Pet[]) => pets.map(pet => pet.name)
  }
)

// data is Ref<string[]>
data.value?.[0]  // ✅ string
```

### Type Inference

```typescript
const { data } = useAsyncDataGetPets(
  'cards',
  {},
  {
    transform: (pets) => pets.map(pet => ({
      id: pet.id,
      name: pet.name
    }))
  }
)

// TypeScript infers: Ref<{ id: number; name: string }[]>
```

## Limitations

### Cannot Transform Errors

```typescript
// ❌ Transform only runs on success
useAsyncDataGetPets('pets', {}, {
  transform: (pets) => {
    // This won't run on error
    return pets.map(p => p.name)
  },
  onError: (error) => {
    // Use onError for error handling
  }
})
```

## Performance Considerations

### Memoization

```typescript
// ❌ Recreates array every time
transform: (pets) => pets.map(p => p.name)

// ✅ Use computed for memoization
const { data: pets } = useAsyncDataGetPets('pets')

const names = computed(() => 
  pets.value?.map(p => p.name) ?? []
)
```

### Heavy Computations

```typescript
// For heavy transformations, consider doing them server-side
const { data } = useAsyncData('heavy-transform', async () => {
  const result = await $fetch('/api/heavy-computation')
  return result  // Already transformed on server
})
```

## Real-World Examples

### E-commerce Product List

```typescript
const { data: products } = useAsyncDataGetProducts(
  'products',
  {},
  {
    transform: (products) => products.map(product => ({
      id: product.id,
      name: product.name,
      price: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(product.price),
      image: product.images[0] || '/placeholder.png',
      inStock: product.stock > 0,
      discount: product.discountPercent > 0 
        ? `${product.discountPercent}% OFF`
        : null
    }))
  }
)
```

### Dashboard Stats

```typescript
const { data: dashboard } = useAsyncDataGetOrders(
  'dashboard',
  {},
  {
    transform: (orders) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      return {
        total: orders.length,
        todayCount: orders.filter(o => 
          new Date(o.createdAt) >= today
        ).length,
        revenue: orders.reduce((sum, o) => sum + o.total, 0),
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length
      }
    }
  }
)
```

## Next Steps

- [useAsyncData Guide →](/composables/use-async-data/)
- [Raw Responses →](/composables/use-async-data/raw-responses)
- [Examples →](/examples/composables/advanced/pagination)
