# Custom Transformers

Create reusable, composable data transformers for consistent API responses across your application.

## Why Custom Transformers?

### Problem: Duplicate Logic

```typescript
// ❌ Logic repeated in every route
// server/api/pets/index.get.ts
return pets.map(pet => ({
  ...pet,
  canEdit: pet.ownerId === user.id || user.role === 'admin',
  canDelete: user.role === 'admin'
}))

// server/api/pets/[id]/index.get.ts
return {
  ...pet,
  canEdit: pet.ownerId === user.id || user.role === 'admin',  // Duplicate!
  canDelete: user.role === 'admin'  // Duplicate!
}
```

### Solution: Reusable Transformers

```typescript
// ✅ Define once, use everywhere
// server/utils/transformers.ts
export const transformPet = (pet: any, user: AuthUser) => ({
  ...pet,
  canEdit: pet.ownerId === user.id || user.role === 'admin',
  canDelete: user.role === 'admin'
})

// Use in routes
return pets.map(pet => transformPet(pet, user))
return transformPet(pet, user)
```

## Basic Transformer

### Simple Transformer

```typescript
// server/utils/transformers.ts
export function transformPet(pet: any) {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    status: pet.status
  }
}

// Usage
export default defineEventHandler(async () => {
  const pets = await fetchPets()
  return pets.map(transformPet)
})
```

### With User Context

```typescript
export function transformPet(pet: any, user: AuthUser) {
  return {
    id: pet.id,
    name: pet.name,
    canEdit: pet.ownerId === user.id || user.role === 'admin',
    isOwner: pet.ownerId === user.id
  }
}

// Usage
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchPets()
  return pets.map(pet => transformPet(pet, user))
})
```

## Transformer Class

### Class-Based Transformer

```typescript
// server/utils/transformers.ts
export class PetTransformer {
  constructor(private user: AuthUser) {}
  
  transform(pet: any) {
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      status: pet.status,
      canEdit: this.canEdit(pet),
      canDelete: this.canDelete(pet),
      isOwner: this.isOwner(pet)
    }
  }
  
  transformMany(pets: any[]) {
    return pets.map(pet => this.transform(pet))
  }
  
  private canEdit(pet: any): boolean {
    return this.isOwner(pet) || this.user.role === 'admin'
  }
  
  private canDelete(pet: any): boolean {
    return this.user.role === 'admin'
  }
  
  private isOwner(pet: any): boolean {
    return pet.ownerId === this.user.id
  }
}

// Usage
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchPets()
  
  const transformer = new PetTransformer(user)
  return transformer.transformMany(pets)
})
```

## Composable Transformers

### Compose Multiple Transformers

```typescript
// Base transformers
export const removeSensitiveFields = (data: any) => {
  const { password_hash, api_key, ...safe } = data
  return safe
}

export const formatDates = (data: any) => ({
  ...data,
  createdAt: new Date(data.created_at).toISOString(),
  created_at: undefined
})

export const addTimestamps = (data: any) => ({
  ...data,
  transformedAt: new Date().toISOString()
})

// Composed transformer
export const transformPet = (pet: any) => {
  let result = pet
  result = removeSensitiveFields(result)
  result = formatDates(result)
  result = addTimestamps(result)
  return result
}
```

### Pipeline Pattern

```typescript
export function compose<T>(...fns: Array<(arg: T) => T>) {
  return (value: T) => fns.reduce((acc, fn) => fn(acc), value)
}

// Define transformers
const removeSensitive = (pet: any) => {
  const { internal_id, cost, ...safe } = pet
  return safe
}

const formatDates = (pet: any) => ({
  ...pet,
  createdAt: new Date(pet.created_at).toISOString()
})

const addFlags = (user: AuthUser) => (pet: any) => ({
  ...pet,
  canEdit: pet.ownerId === user.id
})

// Compose pipeline
export const createPetTransformer = (user: AuthUser) =>
  compose(
    removeSensitive,
    formatDates,
    addFlags(user)
  )

// Usage
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchPets()
  
  const transform = createPetTransformer(user)
  return pets.map(transform)
})
```

## Generic Transformers

### Base Transformer

```typescript
export interface Transformer<TInput, TOutput> {
  transform(input: TInput): TOutput
  transformMany(inputs: TInput[]): TOutput[]
}

export abstract class BaseTransformer<TInput, TOutput>
  implements Transformer<TInput, TOutput> {
  
  abstract transform(input: TInput): TOutput
  
  transformMany(inputs: TInput[]): TOutput[] {
    return inputs.map(input => this.transform(input))
  }
}
```

### Implement Specific Transformer

```typescript
interface BackendPet {
  id: number
  name: string
  owner_id: number
  internal_status: string
}

interface FrontendPet {
  id: number
  name: string
  canEdit: boolean
  isOwner: boolean
}

export class PetTransformer extends BaseTransformer<BackendPet, FrontendPet> {
  constructor(private user: AuthUser) {
    super()
  }
  
  transform(pet: BackendPet): FrontendPet {
    return {
      id: pet.id,
      name: pet.name,
      canEdit: pet.owner_id === this.user.id || this.user.role === 'admin',
      isOwner: pet.owner_id === this.user.id
    }
  }
}

// Usage
const transformer = new PetTransformer(user)
const result: FrontendPet[] = transformer.transformMany(pets)
```

## Conditional Transformers

### Transform Based on Role

```typescript
export class PetTransformer {
  constructor(private user: AuthUser) {}
  
  transform(pet: any) {
    // Choose transformer based on role
    switch (this.user.role) {
      case 'admin':
        return this.transformForAdmin(pet)
      case 'moderator':
        return this.transformForModerator(pet)
      default:
        return this.transformForUser(pet)
    }
  }
  
  private transformForUser(pet: any) {
    return {
      id: pet.id,
      name: pet.name,
      status: pet.status
    }
  }
  
  private transformForModerator(pet: any) {
    return {
      ...this.transformForUser(pet),
      reportCount: pet.reportCount,
      canModerate: true
    }
  }
  
  private transformForAdmin(pet: any) {
    return {
      ...pet,  // All fields
      canEdit: true,
      canDelete: true
    }
  }
}
```

### Transform Based on Context

```typescript
export class PetTransformer {
  constructor(
    private user: AuthUser,
    private context: 'list' | 'detail' | 'dashboard'
  ) {}
  
  transform(pet: any) {
    switch (this.context) {
      case 'list':
        return this.transformForList(pet)
      case 'detail':
        return this.transformForDetail(pet)
      case 'dashboard':
        return this.transformForDashboard(pet)
    }
  }
  
  private transformForList(pet: any) {
    return {
      id: pet.id,
      name: pet.name,
      status: pet.status
    }
  }
  
  private transformForDetail(pet: any) {
    return {
      ...this.transformForList(pet),
      description: pet.description,
      photos: pet.photos,
      owner: pet.owner
    }
  }
  
  private transformForDashboard(pet: any) {
    return {
      id: pet.id,
      name: pet.name,
      status: pet.status,
      lastActive: pet.lastActive
    }
  }
}
```

## Factory Pattern

### Transformer Factory

```typescript
export class TransformerFactory {
  static createPetTransformer(user: AuthUser, context?: string) {
    return new PetTransformer(user, context)
  }
  
  static createUserTransformer(currentUser: AuthUser) {
    return new UserTransformer(currentUser)
  }
  
  static createOrderTransformer(user: AuthUser) {
    return new OrderTransformer(user)
  }
}

// Usage
const transformer = TransformerFactory.createPetTransformer(user, 'list')
const pets = transformer.transformMany(rawPets)
```

## Transformer Registry

### Register Transformers

```typescript
type TransformerFn<T = any> = (data: any, user: AuthUser) => T

class TransformerRegistry {
  private transforms = new Map<string, TransformerFn>()
  
  register(name: string, transformer: TransformerFn) {
    this.transforms.set(name, transformer)
  }
  
  get(name: string): TransformerFn | undefined {
    return this.transforms.get(name)
  }
  
  transform(name: string, data: any, user: AuthUser) {
    const transformer = this.get(name)
    if (!transformer) {
      throw new Error(`Transformer '${name}' not found`)
    }
    return transformer(data, user)
  }
}

// Global registry
export const transformers = new TransformerRegistry()

// Register transformers
transformers.register('pet', (pet, user) => ({
  id: pet.id,
  name: pet.name,
  canEdit: pet.ownerId === user.id
}))

transformers.register('user', (userData, currentUser) => ({
  id: userData.id,
  name: userData.name,
  isMe: userData.id === currentUser.id
}))

// Usage
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchPets()
  
  return pets.map(pet =>
    transformers.transform('pet', pet, user)
  )
})
```

## Async Transformers

### Transformer with Additional Data Fetching

```typescript
export class PetTransformer {
  constructor(private user: AuthUser) {}
  
  async transform(pet: any) {
    // Fetch additional data during transformation
    const [owner, photos, reviews] = await Promise.all([
      this.fetchOwner(pet.ownerId),
      this.fetchPhotos(pet.id),
      this.fetchReviews(pet.id)
    ])
    
    return {
      id: pet.id,
      name: pet.name,
      owner: {
        id: owner.id,
        name: owner.name
      },
      photoCount: photos.length,
      averageRating: this.calculateAverage(reviews),
      canEdit: pet.ownerId === this.user.id
    }
  }
  
  async transformMany(pets: any[]) {
    return Promise.all(pets.map(pet => this.transform(pet)))
  }
  
  private async fetchOwner(ownerId: number) {
    return $fetch(`/api/owners/${ownerId}`)
  }
  
  private async fetchPhotos(petId: number) {
    return $fetch(`/api/photos?petId=${petId}`)
  }
  
  private async fetchReviews(petId: number) {
    return $fetch(`/api/reviews?petId=${petId}`)
  }
  
  private calculateAverage(reviews: any[]) {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / reviews.length
  }
}
```

## Caching Transformers

### Cache Transformation Results

```typescript
export class CachedPetTransformer {
  private cache = new Map<string, any>()
  
  constructor(private user: AuthUser) {}
  
  transform(pet: any) {
    const cacheKey = `${pet.id}-${this.user.id}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    const transformed = {
      id: pet.id,
      name: pet.name,
      canEdit: pet.ownerId === this.user.id || this.user.role === 'admin',
      isOwner: pet.ownerId === this.user.id
    }
    
    this.cache.set(cacheKey, transformed)
    return transformed
  }
  
  clearCache() {
    this.cache.clear()
  }
}
```

## Testing Transformers

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { PetTransformer } from './transformers'

describe('PetTransformer', () => {
  const mockUser = {
    id: 123,
    role: 'user',
    permissions: []
  }
  
  it('should transform pet correctly', () => {
    const transformer = new PetTransformer(mockUser)
    const pet = {
      id: 1,
      name: 'Fluffy',
      ownerId: 123,
      internal_id: 'secret'
    }
    
    const result = transformer.transform(pet)
    
    expect(result).toEqual({
      id: 1,
      name: 'Fluffy',
      canEdit: true,
      isOwner: true
    })
    expect(result).not.toHaveProperty('internal_id')
  })
  
  it('should mark owner correctly', () => {
    const transformer = new PetTransformer({ id: 456, role: 'user' })
    const pet = { id: 1, ownerId: 123 }
    
    const result = transformer.transform(pet)
    
    expect(result.isOwner).toBe(false)
    expect(result.canEdit).toBe(false)
  })
  
  it('should allow admin to edit', () => {
    const adminUser = { id: 456, role: 'admin' }
    const transformer = new PetTransformer(adminUser)
    const pet = { id: 1, ownerId: 123 }
    
    const result = transformer.transform(pet)
    
    expect(result.canEdit).toBe(true)
  })
})
```

## Best Practices

### ✅ Do

```typescript
// ✅ Create reusable transformers
export const transformPet = (pet, user) => ({ ... })

// ✅ Use TypeScript for type safety
export function transformPet(pet: BackendPet): FrontendPet

// ✅ Keep transformers pure (no side effects)
export const transform = (data) => ({ ...data, canEdit: true })

// ✅ Test transformers
expect(transform(input)).toEqual(expectedOutput)

// ✅ Use composition
const transform = compose(step1, step2, step3)
```

### ❌ Don't

```typescript
// ❌ Don't duplicate transformation logic
// Define once, use everywhere

// ❌ Don't mutate input
pet.canEdit = true  // Mutates!

// ❌ Don't make API calls in transformers (unless async)
const owner = await $fetch(...)  // Side effect

// ❌ Don't hardcode values
canEdit: userId === 123  // Use dynamic user.id

// ❌ Don't return everything
return { ...pet }  // Filter fields!
```

## Next Steps

- [Permission Flags →](/server/transformers/permission-flags)
- [Filtering Data →](/server/transformers/filtering-data)
- [Combining Sources →](/server/transformers/combining-sources)
- [Examples →](/examples/server/transformers/)
