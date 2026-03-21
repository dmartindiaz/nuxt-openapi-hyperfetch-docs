# Combining Data Sources

Aggregate and combine data from multiple backend APIs into unified responses optimized for your frontend.

## Why Combine Sources?

### Problem: Multiple Client Requests

```typescript
// ❌ Client makes 3 separate requests
const pets = await $fetch('/api/pets')          // 200ms
const owners = await $fetch('/api/owners')      // 200ms
const stats = await $fetch('/api/stats')        // 200ms
// Total: 600ms + client-side processing

// Client combines data
const enriched = pets.map(pet => ({
  ...pet,
  owner: owners.find(o => o.id === pet.ownerId)
}))
```

### Solution: BFF Aggregation

```typescript
// ✅ Client makes 1 request
const data = await $fetch('/api/pets-dashboard')  // 200ms

// ✅ BFF combines in parallel
export default defineEventHandler(async () => {
  const [pets, owners, stats] = await Promise.all([
    $fetch(`${backend}/pets`),
    $fetch(`${backend}/owners`),
    $fetch(`${backend}/stats`)
  ])
  
  return combinePetsWithOwners(pets, owners, stats)
})
// Total: ~200ms (3x faster!)
```

## Basic Combining

### Join Two Sources

```typescript
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Fetch both in parallel
  const [pets, owners] = await Promise.all([
    $fetch(`${config.backendUrl}/pets`),
    $fetch(`${config.backendUrl}/owners`)
  ])
  
  // Combine
  return pets.map(pet => ({
    ...pet,
    owner: owners.find(o => o.id === pet.ownerId)
  }))
})
```

### Join Multiple Sources

```typescript
export default defineEventHandler(async (event) => {
  const [pets, owners, categories, photos] = await Promise.all([
    fetchPets(),
    fetchOwners(),
    fetchCategories(),
    fetchPhotos()
  ])
  
  return pets.map(pet => ({
    id: pet.id,
    name: pet.name,
    owner: owners.find(o => o.id === pet.ownerId),
    category: categories.find(c => c.id === pet.categoryId),
    photos: photos.filter(p => p.petId === pet.id)
  }))
})
```

## Dashboard Aggregation

### Dashboard Endpoint

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  // Fetch all dashboard data in parallel
  const [
    pets,
    orders,
    stats,
    recentActivity,
    notifications
  ] = await Promise.all([
    fetchUserPets(user.id),
    fetchUserOrders(user.id),
    fetchUserStats(user.id),
    fetchRecentActivity(user.id),
    fetchNotifications(user.id)
  ])
  
  // Combine into dashboard response
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    summary: {
      totalPets: pets.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length
    },
    pets: pets.slice(0, 5),  // Latest 5
    orders: orders.slice(0, 10),  // Latest 10
    stats,
    recentActivity: recentActivity.slice(0, 20),
    notifications: notifications.filter(n => !n.read)
  }
})
```

## Nested Relationships

### One-to-One

```typescript
// Pet → Owner (one pet has one owner)
export default defineEventHandler(async () => {
  const [pets, owners] = await Promise.all([
    fetchPets(),
    fetchOwners()
  ])
  
  return pets.map(pet => ({
    ...pet,
    owner: owners.find(o => o.id === pet.ownerId)
  }))
})
```

### One-to-Many

```typescript
// Owner → Pets (one owner has many pets)
export default defineEventHandler(async () => {
  const [owners, pets] = await Promise.all([
    fetchOwners(),
    fetchPets()
  ])
  
  return owners.map(owner => ({
    ...owner,
    pets: pets.filter(p => p.ownerId === owner.id)
  }))
})
```

### Many-to-Many

```typescript
// Pets ↔ Tags (many pets have many tags)
export default defineEventHandler(async () => {
  const [pets, tags, petTags] = await Promise.all([
    fetchPets(),
    fetchTags(),
    fetchPetTags()  // Join table
  ])
  
  return pets.map(pet => ({
    ...pet,
    tags: petTags
      .filter(pt => pt.petId === pet.id)
      .map(pt => tags.find(t => t.id === pt.tagId))
  }))
})
```

## Data Enrichment

### Add Computed Fields

```typescript
export default defineEventHandler(async () => {
  const [pets, reviews, favorites] = await Promise.all([
    fetchPets(),
    fetchReviews(),
    fetchFavorites()
  ])
  
  return pets.map(pet => {
    const petReviews = reviews.filter(r => r.petId === pet.id)
    
    return {
      ...pet,
      // Computed from reviews
      averageRating: calculateAverage(petReviews.map(r => r.rating)),
      reviewCount: petReviews.length,
      // Computed from favorites
      favoriteCount: favorites.filter(f => f.petId === pet.id).length,
      topReview: petReviews.sort((a, b) => b.helpful - a.helpful)[0]
    }
  })
})
```

### Add Metadata

```typescript
export default defineEventHandler(async () => {
  const [pets, views, shares] = await Promise.all([
    fetchPets(),
    fetchViews(),
    fetchShares()
  ])
  
  return pets.map(pet => ({
    ...pet,
    metadata: {
      totalViews: views.filter(v => v.petId === pet.id).length,
      totalShares: shares.filter(s => s.petId === pet.id).length,
      lastViewed: views
        .filter(v => v.petId === pet.id)
        .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp
    }
  }))
})
```

## Efficient Combining

### Create Lookup Maps

```typescript
export default defineEventHandler(async () => {
  const [pets, owners] = await Promise.all([
    fetchPets(),
    fetchOwners()
  ])
  
  // ❌ Slow: O(n²) with .find()
  return pets.map(pet => ({
    ...pet,
    owner: owners.find(o => o.id === pet.ownerId)  // Slow!
  }))
  
  // ✅ Fast: O(n) with Map lookup
  const ownerMap = new Map(owners.map(o => [o.id, o]))
  
  return pets.map(pet => ({
    ...pet,
    owner: ownerMap.get(pet.ownerId)  // Fast!
  }))
})
```

### Batch Multiple Lookups

```typescript
export default defineEventHandler(async () => {
  const [pets, owners, categories, photos] = await Promise.all([
    fetchPets(),
    fetchOwners(),
    fetchCategories(),
    fetchPhotos()
  ])
  
  // Create lookup maps
  const ownerMap = new Map(owners.map(o => [o.id, o]))
  const categoryMap = new Map(categories.map(c => [c.id, c]))
  const photosByPet = new Map()
  photos.forEach(photo => {
    if (!photosByPet.has(photo.petId)) {
      photosByPet.set(photo.petId, [])
    }
    photosByPet.get(photo.petId).push(photo)
  })
  
  // Efficient combining
  return pets.map(pet => ({
    ...pet,
    owner: ownerMap.get(pet.ownerId),
    category: categoryMap.get(pet.categoryId),
    photos: photosByPet.get(pet.id) || []
  }))
})
```

## GraphQL-Style Queries

### Conditional Data Loading

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const include = ((query.include as string) || '').split(',')
  
  // Always fetch pets
  const pets = await fetchPets()
  
  // Conditionally fetch related data
  const promises: Promise<any>[] = []
  
  if (include.includes('owner')) {
    promises.push(fetchOwners())
  }
  if (include.includes('photos')) {
    promises.push(fetchPhotos())
  }
  if (include.includes('reviews')) {
    promises.push(fetchReviews())
  }
  
  const results = await Promise.all(promises)
  const [owners, photos, reviews] = results
  
  // Combine based on what was requested
  return pets.map(pet => {
    const combined: any = { ...pet }
    
    if (owners) {
      combined.owner = owners.find(o => o.id === pet.ownerId)
    }
    if (photos) {
      combined.photos = photos.filter(p => p.petId === pet.id)
    }
    if (reviews) {
      combined.reviews = reviews.filter(r => r.petId === pet.id)
    }
    
    return combined
  })
})
```

**Usage:**
```
GET /api/pets?include=owner,photos
GET /api/pets?include=owner,photos,reviews
```

## Combining with Transformation

### Transform While Combining

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  const [pets, owners] = await Promise.all([
    fetchPets(),
    fetchOwners()
  ])
  
  const ownerMap = new Map(owners.map(o => [o.id, o]))
  
  return pets.map(pet => {
    const owner = ownerMap.get(pet.ownerId)
    
    return {
      // Filtered pet fields
      id: pet.id,
      name: pet.name,
      status: pet.status,
      
      // Filtered owner fields
      owner: owner ? {
        id: owner.id,
        name: owner.name
        // Remove email, phone, etc.
      } : null,
      
      // User-specific flags
      isOwner: pet.ownerId === user.id,
      canEdit: pet.ownerId === user.id || user.role === 'admin'
    }
  })
})
```

## Error Handling

### Partial Failures

```typescript
export default defineEventHandler(async () => {
  const [pets, ownersResult, statsResult] = await Promise.allSettled([
    fetchPets(),
    fetchOwners(),
    fetchStats()
  ])
  
  const petList = pets.status === 'fulfilled' ? pets.value : []
  const owners = ownersResult.status === 'fulfilled' ? ownersResult.value : []
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null
  
  return {
    pets: petList.map(pet => ({
      ...pet,
      owner: owners.find(o => o.id === pet.ownerId) || null
    })),
    stats: stats || { error: 'Stats unavailable' }
  }
})
```

### Fallback Data

```typescript
export default defineEventHandler(async () => {
  try {
    const [pets, owners] = await Promise.all([
      fetchPets(),
      fetchOwners()
    ])
    
    return combinePetsWithOwners(pets, owners)
  } catch (error) {
    // Return partial data if available
    try {
      const pets = await fetchPets()
      return pets  // Without owners
    } catch {
      return []  // Empty fallback
    }
  }
})
```

## Real-World Examples

### E-commerce Product Page

```typescript
export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, 'id')
  const user = await verifyAuth(event)
  
  const [
    product,
    reviews,
    relatedProducts,
    userWishlist,
    inventory
  ] = await Promise.all([
    fetchProduct(productId),
    fetchProductReviews(productId),
    fetchRelatedProducts(productId),
    fetchUserWishlist(user.id),
    fetchInventory(productId)
  ])
  
  return {
    product: {
      ...product,
      inStock: inventory.quantity > 0,
      stockLevel: inventory.quantity,
      averageRating: calculateAverage(reviews.map(r => r.rating)),
      reviewCount: reviews.length,
      isInWishlist: userWishlist.includes(productId)
    },
    reviews: reviews.slice(0, 10),
    relatedProducts: relatedProducts.slice(0, 6)
  }
})
```

### Social Media Feed

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  
  const [posts, users, likes, comments] = await Promise.all([
    fetchFeedPosts(user.id),
    fetchUsers(),
    fetchLikes(user.id),
    fetchComments()
  ])
  
  const userMap = new Map(users.map(u => [u.id, u]))
  
  return posts.map(post => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.authorId,
      name: userMap.get(post.authorId)?.name,
      avatar: userMap.get(post.authorId)?.avatar
    },
    stats: {
      likeCount: likes.filter(l => l.postId === post.id).length,
      commentCount: comments.filter(c => c.postId === post.id).length
    },
    userActions: {
      isLiked: likes.some(l => l.postId === post.id && l.userId === user.id),
      isAuthor: post.authorId === user.id
    }
  }))
})
```

## Best Practices

### ✅ Do

```typescript
// ✅ Use Promise.all for parallel requests
const [pets, owners] = await Promise.all([
  fetchPets(),
  fetchOwners()
])

// ✅ Create Maps for O(1) lookups
const ownerMap = new Map(owners.map(o => [o.id, o]))

// ✅ Handle partial failures
const results = await Promise.allSettled([...])

// ✅ Filter/transform while combining
return pets.map(pet => ({
  id: pet.id,
  owner: ownerMap.get(pet.ownerId)
}))
```

### ❌ Don't

```typescript
// ❌ Don't make sequential requests
const pets = await fetchPets()
const owners = await fetchOwners()  // Waiting!

// ❌ Don't use .find() in loops
pets.map(pet =>
  owners.find(o => o.id === pet.ownerId)  // O(n²)!
)

// ❌ Don't combine everything
// Only fetch what frontend needs

// ❌ Don't ignore errors
const [pets, owners] = await Promise.all([...])
// What if one fails?
```

## Next Steps

- [Custom Transformers →](/server/transformers/custom-transformers)
- [Permission Flags →](/server/transformers/permission-flags)
- [Filtering Data →](/server/transformers/filtering-data)
- [Examples →](/examples/server/transformers/)
