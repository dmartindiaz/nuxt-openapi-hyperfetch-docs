# Pick Fields

Select specific fields from API responses to reduce data transfer and improve performance.

## Overview

The `pick` option allows you to extract only the fields you need from API responses. This is a **CLI-specific feature** that works with both `useFetch` and `useAsyncData` composables.

**Key Benefits:**
- 📦 **Reduced Bundle Size**: Transfer only the data you need
- ⚡ **Better Performance**: Less data to parse and process
- 🎯 **Focused Data**: Get exactly what your component needs
- 🔄 **Dot Notation**: Access nested fields easily

::: tip CLI Feature
The `pick` option is implemented by the CLI in the generated runtime helpers. It's applied **before** Nuxt's `transform` option.
:::

## Why Use Pick?

### Without Pick

```typescript
const { data: user } = useFetchGetUser({ id: 1 })

// Full user object (lots of unnecessary data):
// {
//   id: 1,
//   name: "John Doe",
//   email: "john@example.com",
//   profile: {
//     avatar: "https://...",
//     bio: "Lorem ipsum...",
//     location: "New York",
//     website: "https://...",
//     socialLinks: {...}
//   },
//   settings: {...},
//   preferences: {...},
//   metadata: {...}
// }
```

### With Pick

```typescript
const { data: user } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'name', 'email'] as const
})

// Only what you need:
// {
//   id: 1,
//   name: "John Doe",
//   email: "john@example.com"
// }
```

## Basic Usage

### Simple Fields

Pick top-level fields from the response:

```typescript
// useFetch example
const { data: pet } = useFetchGetPet({ petId: 123 }, {
  pick: ['id', 'name', 'status'] as const
})

// Result: { id: 123, name: "Fluffy", status: "available" }
```

```typescript
// useAsyncData example
const { data: order } = useAsyncDataGetOrder(
  'order-123',
  { orderId: '123' },
  {
    pick: ['id', 'total', 'status'] as const
  }
)

// Result: { id: "123", total: 99.99, status: "completed" }
```

### Nested Fields with Dot Notation

Access nested fields using dot notation:

```typescript
const { data: user } = useFetchGetUser({ id: 1 }, {
  pick: [
    'id',
    'profile.name',
    'profile.avatar',
    'settings.theme'
  ] as const
})

// Result:
// {
//   id: 1,
//   profile: {
//     name: "John Doe",
//     avatar: "https://..."
//   },
//   settings: {
//     theme: "dark"
//   }
// }
```

### Arrays of Objects

Pick fields from items in an array:

```typescript
const { data: pets } = useFetchGetPets({}, {
  pick: ['id', 'name', 'status'] as const
})

// If API returns: [
//   { id: 1, name: "Fluffy", status: "available", category: {...}, tags: [...] },
//   { id: 2, name: "Rex", status: "pending", category: {...}, tags: [...] }
// ]

// Result: [
//   { id: 1, name: "Fluffy", status: "available" },
//   { id: 2, name: "Rex", status: "pending" }
// ]
```

## Advanced Usage

### Deep Nesting

Pick fields from deeply nested objects:

```typescript
const { data: user } = useFetchGetUser({ id: 1 }, {
  pick: [
    'id',
    'profile.personal.firstName',
    'profile.personal.lastName',
    'profile.contact.email',
    'profile.contact.phone',
    'account.subscription.plan',
    'account.subscription.expiresAt'
  ] as const
})

// Result maintains nested structure:
// {
//   id: 1,
//   profile: {
//     personal: {
//       firstName: "John",
//       lastName: "Doe"
//     },
//     contact: {
//       email: "john@example.com",
//       phone: "+1234567890"
//     }
//   },
//   account: {
//     subscription: {
//       plan: "premium",
//       expiresAt: "2025-12-31"
//     }
//   }
// }
```

### Combining with Transform

The `pick` option is applied **before** the `transform` option:

```typescript
const { data: userNames } = useAsyncDataGetUsers(
  'user-names',
  {},
  {
    // Step 1: Pick only needed fields
    pick: ['id', 'profile.name'] as const,
    
    // Step 2: Transform the picked data
    transform: (users) => users.map(user => ({
      id: user.id,
      displayName: user.profile.name.toUpperCase()
    }))
  }
)

// Result: [
//   { id: 1, displayName: "JOHN DOE" },
//   { id: 2, displayName: "JANE SMITH" }
// ]
```

::: tip Execution Order
1. API returns full response
2. **Pick** extracts specified fields
3. **Transform** modifies the picked data
4. Final data is returned to your component
:::

### Conditional Picking

Use TypeScript's `as const` for type safety:

```typescript
// Define picks based on component needs
const basicFields = ['id', 'name', 'email'] as const
const detailedFields = ['id', 'name', 'email', 'profile.avatar', 'profile.bio'] as const

// Use conditionally
const { data: user } = useFetchGetUser({ id: 1 }, {
  pick: isDetailedView ? detailedFields : basicFields
})
```

## Performance Benefits

### Reduced Network Transfer

```typescript
// Without pick: ~15KB response
const { data: fullUser } = useFetchGetUser({ id: 1 })

// With pick: ~1KB response (93% reduction)
const { data: minimalUser } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'name', 'email'] as const
})
```

### Faster Parsing

Smaller responses mean:
- ✅ Less data to download
- ✅ Faster JSON parsing
- ✅ Lower memory usage
- ✅ Improved render performance

### Example: List Views

Perfect for list views where you only need summary data:

```typescript
// Product list - only show essentials
const { data: products } = useFetchGetProducts({}, {
  pick: ['id', 'name', 'price', 'thumbnail'] as const
})

// Full product details loaded on click
const loadDetails = async (id: number) => {
  const { data: product } = await useFetchGetProduct({ id })
  // Load full product data only when needed
}
```

## Type Safety

### TypeScript Inference

While TypeScript can't fully infer the exact shape after picking (especially with nested paths), you can define types:

```typescript
interface PickedUser {
  id: number
  name: string
  email: string
}

const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'name', 'email'] as const
})

// Cast if needed for strict typing
const user = data.value as unknown as PickedUser
```

### Type-Safe Paths

Use template literal types for auto-completion:

```typescript
type UserPaths = 
  | 'id'
  | 'name'
  | 'email'
  | 'profile.name'
  | 'profile.avatar'
  | 'profile.bio'
  | 'settings.theme'
  | 'settings.language'

const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'profile.name'] as const satisfies UserPaths[]
})
```

## Works with Both Generators

### useFetch

```typescript
const { data, pending, error } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'name'] as const
})
```

### useAsyncData

```typescript
const { data, pending, error } = useAsyncDataGetUser(
  'user-1',
  { id: 1 },
  {
    pick: ['id', 'name'] as const
  }
)
```

### useAsyncData Raw Variant

```typescript
const { data, pending, error } = useAsyncDataGetUserRaw(
  'user-1-raw',
  { id: 1 },
  {
    pick: ['id', 'name'] as const
  }
)

// Result:
// {
//   data: { id: 1, name: "John" },
//   headers: {...},
//   status: 200,
//   statusText: "OK"
// }
```

## Common Use Cases

### 1. Dashboard Cards

```typescript
// Only load summary data for dashboard cards
const { data: stats } = useFetchGetUserStats({ userId: 1 }, {
  pick: [
    'totalOrders',
    'totalSpent',
    'accountStatus'
  ] as const
})
```

### 2. Autocomplete/Search

```typescript
// Minimal data for search results
const { data: results } = useFetchSearchUsers({ query: searchTerm.value }, {
  pick: ['id', 'name', 'email', 'profile.avatar'] as const
})
```

### 3. Navigation Menus

```typescript
// Only load what's needed for navigation
const { data: menuItems } = useFetchGetCategories({}, {
  pick: ['id', 'name', 'slug', 'icon'] as const
})
```

### 4. Mobile Optimization

```typescript
// Load less data on mobile devices
const isMobile = useMediaQuery('(max-width: 768px)')

const { data: products } = useFetchGetProducts({}, {
  pick: isMobile.value
    ? ['id', 'name', 'price'] as const
    : ['id', 'name', 'price', 'description', 'images'] as const
})
```

## Comparison with Transform

### When to Use Pick

Use `pick` when you want to:
- ✅ **Reduce network transfer**: Extract only needed fields
- ✅ **Improve performance**: Less data to process
- ✅ **Simplify data structure**: Remove unnecessary nesting

```typescript
// Pick: Extract fields
const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'name', 'email'] as const
})
```

### When to Use Transform

Use `transform` when you want to:
- ✅ **Modify data**: Change values or structure
- ✅ **Compute derived values**: Calculate based on response
- ✅ **Format data**: Convert types or formats

```typescript
// Transform: Modify data
const { data } = useAsyncDataGetUser({ id: 1 }, {
  transform: (user) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    createdAt: new Date(user.createdAt)
  })
})
```

### Use Both Together

Combine for maximum efficiency:

```typescript
const { data } = useAsyncDataGetUsers({}, {
  // Step 1: Pick only needed fields (reduces transfer)
  pick: ['id', 'firstName', 'lastName', 'createdAt'] as const,
  
  // Step 2: Transform picked data (computation)
  transform: (users) => users.map(user => ({
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    createdAt: new Date(user.createdAt)
  }))
})
```

## Best Practices

### ✅ Do's

```typescript
// ✅ Use `as const` for type inference
pick: ['id', 'name'] as const

// ✅ Pick only what you need
pick: ['id', 'name', 'status'] as const

// ✅ Use dot notation for nested fields
pick: ['profile.name', 'profile.avatar'] as const

// ✅ Combine with transform for complex transformations
{
  pick: ['id', 'firstName', 'lastName'] as const,
  transform: (data) => ({ ...data, fullName: `${data.firstName} ${data.lastName}` })
}
```

### ❌ Don'ts

```typescript
// ❌ Don't pick without `as const` (loses type inference)
pick: ['id', 'name']

// ❌ Don't pick everything (defeats the purpose)
pick: ['id', 'name', 'email', 'profile', 'settings', 'metadata', ...] as const

// ❌ Don't use pick for complex transformations (use transform instead)
pick: ['id', 'name'] as const
// Then manually transform in component
```

## Implementation Details

### How It Works

The CLI generates runtime helpers that implement the `pick` functionality:

```typescript
// Generated in apiHelpers.ts
export function applyPick<T>(data: T, paths: ReadonlyArray<string>): any {
  const result: any = {}

  for (const path of paths) {
    const keys = path.split('.')
    let value: any = data
    let exists = true

    // Navigate to nested value
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        exists = false
        break
      }
    }

    // Set value maintaining nested structure
    if (exists) {
      let current = result
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!(key in current)) {
          current[key] = {}
        }
        current = current[key]
      }
      current[keys[keys.length - 1]] = value
    }
  }

  return result
}
```

### Execution Flow

```
┌─────────────────────────────────────────┐
│         API Response Received           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Global Headers Applied (if any)      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Pick Fields Applied             │ ◄── CLI Feature
│    (extracts specified fields)          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Transform Applied (if any)        │ ◄── Nuxt Feature
│      (modifies picked data)             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      onSuccess Callback Triggered       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Data Returned to Component        │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Field Not Appearing

**Problem:** Picked field is `undefined` in result

```typescript
const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['profile.name'] as const
})
// data.value.profile.name is undefined
```

**Solution:** Check if the field exists in API response

```typescript
// Debug: Check full response first
const { data: fullUser } = useFetchGetUser({ id: 1 })
console.log('Full response:', fullUser.value)

// Verify field path matches API structure
const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['profile.firstName'] as const // Correct path
})
```

### Type Errors

**Problem:** TypeScript complains about picked data type

```typescript
const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'name'] as const
})
// Type error when accessing data.value.name
```

**Solution:** Use type casting or define interface

```typescript
interface PickedUser {
  id: number
  name: string
}

const { data } = useFetchGetUser({ id: 1 }, {
  pick: ['id', 'name'] as const
})

const user = data.value as unknown as PickedUser
console.log(user.name) // No error
```

### Array Handling

**Problem:** Pick doesn't work as expected with arrays

```typescript
// This picks from the array wrapper, not the items
const { data } = useFetchGetPets({}, {
  pick: ['id', 'name'] as const
})
```

**Solution:** Pick applies to each item automatically

```typescript
// Correct: Pick fields from each pet in the array
const { data: pets } = useFetchGetPets({}, {
  pick: ['id', 'name', 'status'] as const
})
// Each pet object will have only id, name, and status
```

## Related Features

- [Global Headers](/composables/features/global-headers) - Set headers globally for all requests
- [Request Interception](/composables/features/request-interception) - Modify requests before sending
- [Server Transformers](/server/transformers/) - Transform response data server-side
- [useFetch Basic Usage](/composables/use-fetch/basic-usage) - Pick examples with useFetch
- [useAsyncData Basic Usage](/composables/use-async-data/basic-usage) - Pick examples with useAsyncData
