# Data Transformers

Transform backend responses to optimize them for your frontend needs with data transformers.

## Overview

Data transformers modify backend responses to:

- **Add user-specific flags** (canEdit, canDelete, isOwner)
- **Filter sensitive data** (remove internal fields)
- **Add permissions** (based on user role)
- **Combine data sources** (aggregate multiple APIs)
- **Format data** (dates, currencies, etc.)

```typescript
// Backend response
{
  id: 1,
  name: "Fluffy",
  owner_id: 123,
  internal_status: "available_for_sale",
  cost_price: 500
}

// After transformation
{
  id: 1,
  name: "Fluffy",
  canEdit: true,      // Added
  canDelete: false,   // Added
  isOwner: true       // Added
  // Removed: owner_id, internal_status, cost_price
}
```

## Basic Transformation

### Simple Transform

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchFromBackend()
  
  // Transform response
  return pets.map(pet => ({
    id: pet.id,
    name: pet.name,
    status: pet.status,
    // Remove sensitive fields automatically
  }))
})
```

### With User Context

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchFromBackend()
  
  return pets.map(pet => ({
    ...pet,
    // Add user-specific flags
    isOwner: pet.ownerId === user.id,
    canEdit: pet.ownerId === user.id || user.role === 'admin',
    canDelete: user.role === 'admin'
  }))
})
```

## Transformer Utilities

### Create Transformer

```typescript
// server/utils/transformers.ts
export function transformPet(pet: any, user: AuthUser) {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    age: pet.age,
    status: pet.status,
    photoUrl: pet.photoUrls?.[0],
    
    // User-specific fields
    isOwner: pet.ownerId === user.id,
    canEdit: pet.ownerId === user.id || user.role === 'admin',
    canDelete: user.role === 'admin',
    isFavorite: user.favorites?.includes(pet.id) || false
  }
}

// Usage
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchFromBackend()
  
  return pets.map(pet => transformPet(pet, user))
})
```

### Collection Transformer

```typescript
export function transformPetCollection(
  pets: any[],
  user: AuthUser
) {
  return pets.map(pet => transformPet(pet, user))
}

// Usage
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchFromBackend()
  
  return transformPetCollection(pets, user)
})
```

## Common Transformations

### 1. Permission Flags

Add user-specific permission flags:

```typescript
export function addPermissionFlags(item: any, user: AuthUser) {
  return {
    ...item,
    canView: true,  // If user can see it, they can view it
    canEdit: item.ownerId === user.id || hasRole(user, 'admin', 'moderator'),
    canDelete: hasRole(user, 'admin'),
    canShare: hasPermission(user, 'items.share')
  }
}
```

### 2. Filter Sensitive Fields

Remove internal/sensitive data:

```typescript
export function removeSensitiveFields(item: any) {
  const {
    // Remove these fields
    internal_id,
    internal_status,
    cost_price,
    supplier_id,
    profit_margin,
    internal_notes,
    ...publicFields
  } = item
  
  return publicFields
}
```

### 3. Format Dates

```typescript
export function formatDates(item: any) {
  return {
    ...item,
    createdAt: new Date(item.created_at).toISOString(),
    updatedAt: new Date(item.updated_at).toISOString(),
    // Remove snake_case originals
    created_at: undefined,
    updated_at: undefined
  }
}
```

### 4. Format Currency

```typescript
export function formatPrice(item: any) {
  return {
    ...item,
    price: {
      amount: item.price,
      formatted: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(item.price)
    }
  }
}
```

### 5. Flatten Nested Data

```typescript
export function flattenOwner(pet: any) {
  return {
    id: pet.id,
    name: pet.name,
    // Flatten owner object
    ownerName: pet.owner?.name,
    ownerEmail: pet.owner?.email,
    ownerPhone: pet.owner?.phone
  }
}
```

## Chaining Transformers

### Compose Multiple Transformers

```typescript
export function transformPet(pet: any, user: AuthUser) {
  let transformed = pet
  
  // Apply transformations in order
  transformed = removeSensitiveFields(transformed)
  transformed = formatDates(transformed)
  transformed = formatPrice(transformed)
  transformed = addPermissionFlags(transformed, user)
  
  return transformed
}
```

### Pipeline Function

```typescript
export function pipe<T>(...fns: Array<(arg: T) => T>) {
  return (value: T) => fns.reduce((acc, fn) => fn(acc), value)
}

// Usage
export const transformPet = (user: AuthUser) => pipe(
  removeSensitiveFields,
  formatDates,
  formatPrice,
  (pet) => addPermissionFlags(pet, user)
)

// Apply
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchFromBackend()
  
  const transformer = transformPet(user)
  return pets.map(transformer)
})
```

## Role-Based Transformations

### Show Different Data by Role

```typescript
export function transformPet(pet: any, user: AuthUser) {
  const base = {
    id: pet.id,
    name: pet.name,
    status: pet.status
  }
  
  // Regular users
  if (user.role === 'user') {
    return {
      ...base,
      canEdit: pet.ownerId === user.id
    }
  }
  
  // Moderators see more
  if (user.role === 'moderator') {
    return {
      ...base,
      ownerEmail: pet.ownerEmail,
      reportCount: pet.reportCount,
      canEdit: true,
      canDelete: false
    }
  }
  
  // Admins see everything
  if (user.role === 'admin') {
    return {
      ...pet,  // All fields
      canEdit: true,
      canDelete: true
    }
  }
  
  return base
}
```

## Conditional Fields

### Include Fields Based on Permissions

```typescript
export function transformPet(pet: any, user: AuthUser) {
  const response: any = {
    id: pet.id,
    name: pet.name,
    status: pet.status
  }
  
  // Add price if user has permission
  if (hasPermission(user, 'pets.view_price')) {
    response.price = pet.price
  }
  
  // Add cost if admin
  if (user.role === 'admin') {
    response.cost = pet.cost
    response.profit = pet.price - pet.cost
  }
  
  // Add owner info if own pet
  if (pet.ownerId === user.id) {
    response.ownerNotes = pet.ownerNotes
  }
  
  return response
}
```

## TypeScript Support

### Typed Transformers

```typescript
interface BackendPet {
  id: number
  name: string
  owner_id: number
  internal_status: string
  cost_price: number
  sell_price: number
}

interface FrontendPet {
  id: number
  name: string
  canEdit: boolean
  canDelete: boolean
  isOwner: boolean
}

export function transformPet(
  pet: BackendPet,
  user: AuthUser
): FrontendPet {
  return {
    id: pet.id,
    name: pet.name,
    canEdit: pet.owner_id === user.id || user.role === 'admin',
    canDelete: user.role === 'admin',
    isOwner: pet.owner_id === user.id
  }
}
```

## Performance Considerations

### Memoize Expensive Operations

```typescript
const userPermissionsCache = new Map<number, Set<string>>()

export function getUserPermissions(user: AuthUser): Set<string> {
  if (userPermissionsCache.has(user.id)) {
    return userPermissionsCache.get(user.id)!
  }
  
  const permissions = new Set(user.permissions)
  userPermissionsCache.set(user.id, permissions)
  
  return permissions
}

// Use in transformer
export function transformPet(pet: any, user: AuthUser) {
  const permissions = getUserPermissions(user)  // Cached
  
  return {
    ...pet,
    canEdit: permissions.has('pets.edit'),
    canDelete: permissions.has('pets.delete')
  }
}
```

### Avoid Deep Copies

```typescript
// ❌ Slow: Deep copy everything
return JSON.parse(JSON.stringify(pet))

// ✅ Fast: Only copy what's needed
return {
  id: pet.id,
  name: pet.name,
  status: pet.status
}
```

## Real-World Examples

### E-commerce Product

```typescript
export function transformProduct(product: any, user: AuthUser) {
  // Base product
  const transformed: any = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    inStock: product.stock > 0,
    rating: product.averageRating,
    reviewCount: product.reviewCount
  }
  
  // Member pricing
  if (user.membership === 'premium') {
    transformed.memberPrice = product.price * 0.9
    transformed.savings = product.price * 0.1
  }
  
  // Admin data
  if (user.role === 'admin') {
    transformed.cost = product.cost
    transformed.profit = product.price - product.cost
    transformed.supplierInfo = product.supplier
  }
  
  // User-specific
  if (user.authenticated) {
    transformed.inWishlist = user.wishlist?.includes(product.id)
    transformed.hasPurchased = user.purchases?.includes(product.id)
  }
  
  return transformed
}
```

### Social Media Post

```typescript
export function transformPost(post: any, user: AuthUser) {
  return {
    id: post.id,
    content: post.content,
    author: {
      id: post.author.id,
      name: post.author.name,
      avatar: post.author.avatarUrl
    },
    createdAt: post.createdAt,
    
    // Engagement
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    shareCount: post.shareCount,
    
    // User-specific
    isLiked: post.likes?.includes(user.id),
    isBookmarked: user.bookmarks?.includes(post.id),
    isAuthor: post.author.id === user.id,
    
    // Actions
    canEdit: post.author.id === user.id,
    canDelete: post.author.id === user.id || user.role === 'admin',
    canReport: post.author.id !== user.id
  }
}
```

## Next Steps

- [Permission Flags →](/server/transformers/permission-flags)
- [Filtering Data →](/server/transformers/filtering-data)
- [Combining Sources →](/server/transformers/combining-sources)
- [Custom Transformers →](/server/transformers/custom-transformers)
- [Examples →](/examples/server/transformers/)
