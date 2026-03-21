# User Context

Extract and use user information from authenticated requests in your server routes.

## What is User Context?

User context is the decoded JWT payload containing user information that's available in your server routes after authentication.

```typescript
// After verifyAuth()
const user = {
  id: 123,
  email: "user@example.com",
  role: "admin",
  permissions: ["read", "write"],
  // ... other claims
}
```

## Basic Usage

### Extract User

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  console.log(user.id)    // 123
  console.log(user.email) // "user@example.com"
  console.log(user.role)  // "admin"
  
  return fetchPetsForUser(user.id)
})
```

### Use in Queries

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  // Filter by user
  return $fetch(`${config.backendUrl}/pets`, {
    query: {
      ownerId: user.id
    }
  })
})
```

## User Interface

### Basic User

```typescript
export interface AuthUser {
  id: number
  email: string
  role: string
}
```

### Extended User

```typescript
export interface AuthUser {
  // Identity
  id: number
  email: string
  name: string
  
  // Authorization
  role: 'user' | 'admin' | 'moderator'
  permissions: string[]
  
  // Organization
  tenantId?: string
  organizationId?: number
  
  // JWT standard claims
  exp: number  // Expiration
  iat: number  // Issued at
  sub: number  // Subject (user ID)
  
  // Custom
  metadata?: Record<string, any>
}
```

## Common Patterns

### Filter by Ownership

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchAllPets()
  
  // Users see only their pets, admins see all
  if (user.role === 'admin') {
    return pets
  }
  
  return pets.filter(pet => pet.ownerId === user.id)
})
```

### Add User Context to Create

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const body = await readBody(event)
  
  // Automatically set owner
  return $fetch(`${config.backendUrl}/pets`, {
    method: 'POST',
    body: {
      ...body,
      ownerId: user.id,      // From auth
      createdBy: user.email   // From auth
    }
  })
})
```

### Verify Ownership

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const petId = getRouterParam(event, 'id')
  
  const pet = await fetchPet(petId)
  
  // Only owner or admin can edit
  if (pet.ownerId !== user.id && user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'You can only edit your own pets'
    })
  }
  
  const body = await readBody(event)
  return updatePet(petId, body)
})
```

### Add Permissions to Response

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchPets()
  
  // Add user-specific flags
  return pets.map(pet => ({
    ...pet,
    canEdit: pet.ownerId === user.id || user.role === 'admin',
    canDelete: user.role === 'admin',
    isOwner: pet.ownerId === user.id
  }))
})
```

## Role-Based Access

### Simple Role Check

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admin access required'
    })
  }
  
  return fetchAdminData()
})
```

### Multiple Roles

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  const allowedRoles = ['admin', 'moderator']
  if (!allowedRoles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      message: 'Insufficient permissions'
    })
  }
  
  return fetchModeratorData()
})
```

### Role Helper

```typescript
// server/utils/auth.ts
export function hasRole(user: AuthUser, ...roles: string[]): boolean {
  return roles.includes(user.role)
}

// Usage
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  if (!hasRole(user, 'admin', 'moderator')) {
    throw createError({ statusCode: 403 })
  }
  
  return fetchData()
})
```

## Permission-Based Access

### Check Permission

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  if (!user.permissions.includes('pets.delete')) {
    throw createError({
      statusCode: 403,
      message: 'You don\'t have permission to delete pets'
    })
  }
  
  return deletePet(petId)
})
```

### Check Multiple Permissions

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  const requiredPermissions = ['pets.read', 'orders.read']
  const hasAll = requiredPermissions.every(p => 
    user.permissions.includes(p)
  )
  
  if (!hasAll) {
    throw createError({ statusCode: 403 })
  }
  
  return fetchData()
})
```

### Permission Helper

```typescript
// server/utils/auth.ts
export function hasPermission(
  user: AuthUser,
  ...permissions: string[]
): boolean {
  return permissions.every(p => user.permissions.includes(p))
}

// Usage
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  if (!hasPermission(user, 'pets.write', 'pets.delete')) {
    throw createError({ statusCode: 403 })
  }
  
  return updateAndDeletePet()
})
```

## Multi-Tenancy

### Filter by Tenant

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  // Only return data for user's tenant
  return $fetch(`${config.backendUrl}/pets`, {
    query: {
      tenantId: user.tenantId
    },
    headers: {
      'X-Tenant-ID': user.tenantId
    }
  })
})
```

### Verify Tenant Access

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const petId = getRouterParam(event, 'id')
  
  const pet = await fetchPet(petId)
  
  // Verify tenant ownership
  if (pet.tenantId !== user.tenantId) {
    throw createError({
      statusCode: 404,  // Not 403 to avoid info leak
      message: 'Pet not found'
    })
  }
  
  return pet
})
```

## User Metadata

### Store Additional Data

```typescript
export interface AuthUser {
  id: number
  email: string
  role: string
  metadata: {
    preferences: {
      theme: 'light' | 'dark'
      language: string
    }
    subscription: {
      plan: 'free' | 'pro'
      expiresAt: string
    }
  }
}
```

### Use Metadata

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  // Check subscription
  if (user.metadata.subscription.plan === 'free') {
    const pets = await fetchPets()
    return pets.slice(0, 10)  // Free users limited to 10
  }
  
  return fetchPets()  // Pro users get all
})
```

## Contextual Responses

### User-Specific Data

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchPets()
  
  // Add context based on user
  return pets.map(pet => ({
    id: pet.id,
    name: pet.name,
    status: pet.status,
    
    // User-specific fields
    isMine: pet.ownerId === user.id,
    isFavorite: user.favorites?.includes(pet.id),
    canEdit: pet.ownerId === user.id,
    canDelete: user.role === 'admin',
    
    // Show price only if admin
    ...(user.role === 'admin' && { price: pet.price })
  }))
})
```

### Conditional Fields

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pet = await fetchPet(petId)
  
  // Base response
  const response: any = {
    id: pet.id,
    name: pet.name,
    status: pet.status
  }
  
  // Add fields based on permissions
  if (hasPermission(user, 'pets.view_price')) {
    response.price = pet.price
  }
  
  if (hasPermission(user, 'pets.view_cost')) {
    response.cost = pet.cost
  }
  
  if (user.role === 'admin') {
    response.internalNotes = pet.internalNotes
  }
  
  return response
})
```

## Logging with User Context

### Request Logging

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  // Log request with user info
  console.log({
    timestamp: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    request: {
      path: event.path,
      method: event.method,
      ip: getRequestIP(event)
    }
  })
  
  return await fetchData()
})
```

### Audit Trail

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const body = await readBody(event)
  
  // Perform action
  const result = await updatePet(petId, body)
  
  // Log to audit trail
  await auditLog({
    action: 'pet.update',
    userId: user.id,
    userEmail: user.email,
    resourceId: petId,
    changes: body,
    timestamp: new Date(),
    ip: getRequestIP(event)
  })
  
  return result
})
```

## Real-World Examples

### E-commerce: User-Specific Prices

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const products = await fetchProducts()
  
  // Apply user-specific pricing
  return products.map(product => ({
    ...product,
    price: calculatePrice(product, user),
    discount: getUserDiscount(user),
    memberPrice: user.metadata.membership === 'premium'
      ? product.price * 0.9
      : null
  }))
})
```

### SaaS: Feature Gating

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  // Check feature access
  const plan = user.metadata.subscription.plan
  
  if (plan === 'free' && event.path.includes('/advanced')) {
    throw createError({
      statusCode: 403,
      message: 'Upgrade to Pro to access this feature'
    })
  }
  
  return fetchAdvancedData()
})
```

### CMS: Draft Access

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const query = getQuery(event)
  
  // Only editors can see drafts
  const includeDrafts = query.status === 'draft' 
    && hasPermission(user, 'content.edit')
  
  return fetchContent({
    includeDrafts,
    authorId: user.id
  })
})
```

## Best Practices

### ✅ Do

```typescript
// ✅ Always verify auth first
const user = await verifyAuth(event)

// ✅ Use user context for filtering
return pets.filter(p => p.ownerId === user.id)

// ✅ Add user-specific flags
return { ...data, canEdit: data.ownerId === user.id }

// ✅ Log actions with user context
console.log(`User ${user.id} performed action`)
```

### ❌ Don't

```typescript
// ❌ Don't trust client-provided user ID
const userId = getQuery(event).userId  // Can be faked!

// ❌ Don't expose all user data
return { user }  // May contain sensitive data

// ❌ Don't skip ownership checks
return updatePet(petId, body)  // Without checking ownership

// ❌ Don't hardcode user IDs
if (user.id === 123) { }  // Use roles/permissions instead
```

## Next Steps

- [Passing Context →](/server/auth-context/passing-context)
- [Data Transformers →](/server/transformers/)
- [Examples →](/examples/server/auth-patterns/)
