# Permission Flags

Add user-specific permission flags to your API responses to control UI elements on the frontend.

## What are Permission Flags?

Permission flags are boolean fields added to responses that indicate what actions a user can perform on a resource:

```typescript
{
  id: 1,
  name: "Fluffy",
  // Permission flags
  canEdit: true,
  canDelete: false,
  canShare: true,
  isOwner: true
}
```

## Why Use Permission Flags?

### Traditional Approach

```vue
<template>
  <!-- ❌ Complex client-side logic -->
  <button v-if="user.role === 'admin' || pet.ownerId === user.id">
    Edit
  </button>
  <button v-if="user.role === 'admin'">
    Delete
  </button>
</template>
```

**Problems:**
- UI logic duplicated everywhere
- Hard to maintain
- Permission changes require frontend updates
- Inconsistent across components

### With Permission Flags

```vue
<template>
  <!-- ✅ Simple, declarative -->
  <button v-if="pet.canEdit">Edit</button>
  <button v-if="pet.canDelete">Delete</button>
</template>
```

**Benefits:**
- Single source of truth (server)
- Consistent across app
- Easy to change permissions
- Clean, simple UI code

## Basic Implementation

### Add Flags in Transformer

```typescript
// server/utils/transformers.ts
export function addPermissionFlags(pet: any, user: AuthUser) {
  return {
    ...pet,
    canEdit: pet.ownerId === user.id || user.role === 'admin',
    canDelete: user.role === 'admin',
    canShare: true,  // All users can share
    isOwner: pet.ownerId === user.id
  }
}
```

### Use in Route

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchFromBackend()
  
  return pets.map(pet => addPermissionFlags(pet, user))
})
```

## Common Permission Flags

### CRUD Operations

```typescript
export function addCrudPermissions(item: any, user: AuthUser) {
  return {
    ...item,
    canCreate: hasPermission(user, 'items.create'),
    canRead: true,  // If user can see it, they can read it
    canUpdate: item.ownerId === user.id || hasRole(user, 'admin'),
    canDelete: hasRole(user, 'admin')
  }
}
```

### Ownership Flags

```typescript
export function addOwnershipFlags(item: any, user: AuthUser) {
  const isOwner = item.ownerId === user.id
  const isAdmin = user.role === 'admin'
  
  return {
    ...item,
    isOwner,
    canEdit: isOwner || isAdmin,
    canDelete: isAdmin,
    canTransfer: isOwner
  }
}
```

### Social Features

```typescript
export function addSocialFlags(post: any, user: AuthUser) {
  return {
    ...post,
    canLike: post.authorId !== user.id,
    canComment: true,
    canShare: true,
    canReport: post.authorId !== user.id,
    canPin: user.role === 'admin' || user.role === 'moderator',
    isLiked: post.likes?.includes(user.id),
    isBookmarked: user.bookmarks?.includes(post.id)
  }
}
```

### Visibility Flags

```typescript
export function addVisibilityFlags(item: any, user: AuthUser) {
  return {
    ...item,
    canViewPrice: hasPermission(user, 'items.view_price'),
    canViewCost: user.role === 'admin',
    canViewPrivateNotes: item.ownerId === user.id,
    canViewAnalytics: hasPermission(user, 'analytics.view')
  }
}
```

## Role-Based Flags

### Simple Role Check

```typescript
export function addPermissionFlags(pet: any, user: AuthUser) {
  const isOwner = pet.ownerId === user.id
  const isAdmin = user.role === 'admin'
  const isModerator = user.role === 'moderator'
  
  return {
    ...pet,
    canEdit: isOwner || isAdmin || isModerator,
    canDelete: isAdmin,
    canFeature: isAdmin || isModerator,
    canHide: isAdmin || isModerator,
    isOwner
  }
}
```

### Permission-Based

```typescript
export function addPermissionFlags(item: any, user: AuthUser) {
  const permissions = new Set(user.permissions)
  
  return {
    ...item,
    canEdit: permissions.has('items.edit') || item.ownerId === user.id,
    canDelete: permissions.has('items.delete'),
    canPublish: permissions.has('items.publish'),
    canArchive: permissions.has('items.archive')
  }
}
```

## Resource-Specific Flags

### For Blog Posts

```typescript
export function addPostFlags(post: any, user: AuthUser) {
  const isAuthor = post.authorId === user.id
  const isAdmin = user.role === 'admin'
  const isEditor = user.role === 'editor'
  
  return {
    ...post,
    canEdit: isAuthor || isEditor || isAdmin,
    canDelete: isAdmin,
    canPublish: (isAuthor && post.status === 'draft') || isEditor || isAdmin,
    canUnpublish: isAdmin || isEditor,
    canComment: post.commentsEnabled,
    canModerateComments: isAuthor || isEditor || isAdmin,
    isAuthor
  }
}
```

### For E-commerce Products

```typescript
export function addProductFlags(product: any, user: AuthUser) {
  return {
    ...product,
    canAddToCart: product.stock > 0 && product.status === 'active',
    canWishlist: user.authenticated,
    canReview: user.authenticated && !product.reviews?.some(r => r.userId === user.id),
    canEditProduct: user.role === 'admin' || user.role === 'vendor',
    canViewSales: user.role === 'admin' || product.vendorId === user.id,
    canSetPrice: user.role === 'admin' || product.vendorId === user.id
  }
}
```

### For Comments

```typescript
export function addCommentFlags(comment: any, user: AuthUser) {
  const isAuthor = comment.authorId === user.id
  const isPostAuthor = comment.post?.authorId === user.id
  const isModerator = user.role === 'moderator' || user.role === 'admin'
  
  return {
    ...comment,
    canEdit: isAuthor,
    canDelete: isAuthor || isPostAuthor || isModerator,
    canReport: !isAuthor,
    canReply: true,
    canPin: isPostAuthor || isModerator,
    canHide: isModerator,
    isAuthor
  }
}
```

## Complex Permission Logic

### Time-Based Permissions

```typescript
export function addTimebasedFlags(item: any, user: AuthUser) {
  const now = new Date()
  const createdAt = new Date(item.createdAt)
  const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / 60000
  
  const canEditWindow = 15  // 15 minutes
  const withinEditWindow = minutesSinceCreation < canEditWindow
  
  const isOwner = item.ownerId === user.id
  const isAdmin = user.role === 'admin'
  
  return {
    ...item,
    canEdit: (isOwner && withinEditWindow) || isAdmin,
    canDelete: (isOwner && withinEditWindow) || isAdmin,
    editWindowExpired: !withinEditWindow
  }
}
```

### Subscription-Based Permissions

```typescript
export function addSubscriptionFlags(item: any, user: AuthUser) {
  const plan = user.subscription?.plan || 'free'
  const quota = user.subscription?.quota || 0
  
  return {
    ...item,
    canCreate: plan !== 'free' || user.itemCount < 10,
    canExport: plan === 'pro' || plan === 'enterprise',
    canShare: true,
    canCollaborate: plan === 'pro' || plan === 'enterprise',
    hasReachedLimit: user.itemCount >= quota,
    needsUpgrade: plan === 'free' && user.itemCount >= 10
  }
}
```

### Status-Based Permissions

```typescript
export function addStatusBasedFlags(item: any, user: AuthUser) {
  const isOwner = item.ownerId === user.id
  const isAdmin = user.role === 'admin'
  
  return {
    ...item,
    canEdit: item.status === 'draft' && (isOwner || isAdmin),
    canPublish: item.status === 'draft' && (isOwner || isAdmin),
    canUnpublish: item.status === 'published' && (isOwner || isAdmin),
    canArchive: item.status !== 'archived' && (isOwner || isAdmin),
    canRestore: item.status === 'archived' && isAdmin,
    canDelete: item.status === 'draft' && isAdmin
  }
}
```

## Optimizing Flags

### Reusable Permission Checker

```typescript
// server/utils/permissions.ts
export class PermissionChecker {
  constructor(private user: AuthUser, private resource: any) {}
  
  isOwner(): boolean {
    return this.resource.ownerId === this.user.id
  }
  
  isAdmin(): boolean {
    return this.user.role === 'admin'
  }
  
  hasPermission(permission: string): boolean {
    return this.user.permissions?.includes(permission) || false
  }
  
  canEdit(): boolean {
    return this.isOwner() || this.isAdmin()
  }
  
  canDelete(): boolean {
    return this.isAdmin()
  }
  
  canShare(): boolean {
    return this.isOwner() || this.hasPermission('items.share')
  }
  
  getFlags() {
    return {
      canEdit: this.canEdit(),
      canDelete: this.canDelete(),
      canShare: this.canShare(),
      isOwner: this.isOwner()
    }
  }
}

// Usage
export function addPermissionFlags(item: any, user: AuthUser) {
  const checker = new PermissionChecker(user, item)
  return {
    ...item,
    ...checker.getFlags()
  }
}
```

### Cached Permissions

```typescript
const permissionCache = new Map<string, Set<string>>()

function getUserPermissions(user: AuthUser): Set<string> {
  const cacheKey = `${user.id}-${user.role}`
  
  if (permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)!
  }
  
  const permissions = new Set(user.permissions)
  permissionCache.set(cacheKey, permissions)
  
  return permissions
}

export function addPermissionFlags(item: any, user: AuthUser) {
  const permissions = getUserPermissions(user)  // Cached
  
  return {
    ...item,
    canEdit: permissions.has('edit') || item.ownerId === user.id,
    canDelete: permissions.has('delete'),
    canPublish: permissions.has('publish')
  }
}
```

## TypeScript Types

```typescript
export interface PermissionFlags {
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
  canView: boolean
  isOwner: boolean
}

export interface Pet extends PermissionFlags {
  id: number
  name: string
  status: string
}

export function addPermissionFlags(
  pet: any,
  user: AuthUser
): Pet {
  return {
    ...pet,
    canEdit: pet.ownerId === user.id || user.role === 'admin',
    canDelete: user.role === 'admin',
    canShare: true,
    canView: true,
    isOwner: pet.ownerId === user.id
  }
}
```

## Best Practices

### ✅ Do

```typescript
// ✅ Clear, descriptive names
canEdit, canDelete, canShare

// ✅ Boolean values
canEdit: true

// ✅ Check ownership
isOwner: item.ownerId === user.id

// ✅ Consistent naming
canView, canEdit, canDelete  // All start with "can"
```

### ❌ Don't

```typescript
// ❌ Vague names
edit: true  // "can" prefix is clearer

// ❌ String values
canEdit: 'yes'  // Use boolean

// ❌ Expose internal logic
adminOverride: true  // Implementation detail

// ❌ Inconsistent naming
canEdit, deletePermission, shareAllowed  // Mixed styles
```

## Testing

```typescript
import { describe, it, expect } from 'vitest'
import { addPermissionFlags } from './transformers'

describe('Permission Flags', () => {
  it('owner can edit', () => {
    const pet = { id: 1, ownerId: 123 }
    const user = { id: 123, role: 'user' }
    
    const result = addPermissionFlags(pet, user)
    
    expect(result.canEdit).toBe(true)
    expect(result.isOwner).toBe(true)
  })
  
  it('non-owner cannot edit', () => {
    const pet = { id: 1, ownerId: 123 }
    const user = { id: 456, role: 'user' }
    
    const result = addPermissionFlags(pet, user)
    
    expect(result.canEdit).toBe(false)
    expect(result.isOwner).toBe(false)
  })
  
  it('admin can delete', () => {
    const pet = { id: 1, ownerId: 123 }
    const user = { id: 456, role: 'admin' }
    
    const result = addPermissionFlags(pet, user)
    
    expect(result.canDelete).toBe(true)
  })
})
```

## Next Steps

- [Filtering Data →](/server/transformers/filtering-data)
- [Combining Sources →](/server/transformers/combining-sources)
- [Custom Transformers →](/server/transformers/custom-transformers)
- [Examples →](/examples/server/transformers/)
