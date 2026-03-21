# Filtering Data

Remove sensitive, internal, or unnecessary fields from your API responses to protect data and reduce payload size.

## Why Filter Data?

### Security
```typescript
// ❌ Backend returns sensitive data
{
  id: 1,
  name: "Fluffy",
  password_hash: "$2b$10$...",  // 🚨 Exposed!
  api_key: "sk_live_abc123",     // 🚨 Exposed!
  internal_notes: "..."          // 🚨 Internal data!
}

// ✅ BFF filters sensitive fields
{
  id: 1,
  name: "Fluffy"
  // Sensitive fields removed
}
```

### Performance
```typescript
// Backend: 5KB response
{
  id: 1,
  name: "Fluffy",
  full_description: "...",  // 2KB
  audit_log: [...],         // 2KB
  metadata: {...}           // 1KB
}

// BFF: 500 bytes response (10x smaller)
{
  id: 1,
  name: "Fluffy"
}
```

## Basic Filtering

### Whitelist Approach

```typescript
// Only include specific fields
export function filterPet(pet: any) {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    age: pet.age,
    status: pet.status
    // All other fields excluded by default
  }
}
```

**Benefits:**
- Secure by default
- Explicit about what's included
- Easy to audit

### Blacklist Approach

```typescript
// Exclude specific fields
export function filterPet(pet: any) {
  const {
    // Remove these
    password_hash,
    api_key,
    internal_notes,
    cost_price,
    supplier_id,
    ...safeFields
  } = pet
  
  return safeFields
}
```

**Caution:**
- Easy to forget fields
- New fields passed through
- Less secure

## Role-Based Filtering

### Different Data for Different Roles

```typescript
export function filterPet(pet: any, user: AuthUser) {
  // Base fields for all users
  const base = {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    status: pet.status
  }
  
  // Regular users
  if (user.role === 'user') {
    return base
  }
  
  // Moderators see more
  if (user.role === 'moderator') {
    return {
      ...base,
      reportCount: pet.reportCount,
      lastModified: pet.lastModified
    }
  }
  
  // Admins see everything
  if (user.role === 'admin') {
    return pet  // No filtering
  }
  
  return base
}
```

### Permission-Based Filtering

```typescript
export function filterPet(pet: any, user: AuthUser) {
  const response: any = {
    id: pet.id,
    name: pet.name
  }
  
  // Add fields based on permissions
  if (hasPermission(user, 'pets.view_details')) {
    response.species = pet.species
    response.age = pet.age
    response.description = pet.description
  }
  
  if (hasPermission(user, 'pets.view_price')) {
    response.price = pet.price
  }
  
  if (hasPermission(user, 'pets.view_cost')) {
    response.cost = pet.cost
  }
  
  return response
}
```

## Ownership-Based Filtering

```typescript
export function filterPet(pet: any, user: AuthUser) {
  const isOwner = pet.ownerId === user.id
  const isAdmin = user.role === 'admin'
  
  // Public fields
  const response: any = {
    id: pet.id,
    name: pet.name,
    species: pet.species
  }
  
  // Owner-only fields
  if (isOwner) {
    response.privateNotes = pet.privateNotes
    response.purchasePrice = pet.purchasePrice
    response.veterinaryRecords = pet.veterinaryRecords
  }
  
  // Admin-only fields
  if (isAdmin) {
    response.internalId = pet.internalId
    response.costPrice = pet.costPrice
    response.supplierInfo = pet.supplierInfo
  }
  
  return response
}
```

## Common Filters

### Remove Sensitive Fields

```typescript
const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'api_key',
  'secret_key',
  'access_token',
  'refresh_token',
  'ssn',
  'credit_card',
  'bank_account'
]

export function removeSensitiveFields(data: any) {
  const filtered = { ...data }
  
  SENSITIVE_FIELDS.forEach(field => {
    delete filtered[field]
  })
  
  return filtered
}
```

### Remove Internal Fields

```typescript
export function removeInternalFields(data: any) {
  const {
    internal_id,
    internal_status,
    internal_notes,
    internal_metadata,
    created_by_id,
    updated_by_id,
    deleted_at,
    ...publicFields
  } = data
  
  return publicFields
}
```

### Remove Null/Undefined

```typescript
export function removeNullFields(data: any) {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) =>
      value !== null && value !== undefined
    )
  )
}
```

### Remove System Fields

```typescript
export function removeSystemFields(data: any) {
  const {
    __v,
    _id,
    __typename,
    createdAt,
    updatedAt,
    ...cleanData
  } = data
  
  return cleanData
}
```

## Nested Filtering

### Filter Nested Objects

```typescript
export function filterPetWithOwner(pet: any, user: AuthUser) {
  return {
    id: pet.id,
    name: pet.name,
    owner: pet.owner ? {
      id: pet.owner.id,
      name: pet.owner.name
      // Remove: email, phone, address
    } : null
  }
}
```

### Filter Arrays

```typescript
export function filterPetWithPhotos(pet: any) {
  return {
    id: pet.id,
    name: pet.name,
    photos: pet.photos?.map((photo: any) => ({
      id: photo.id,
      url: photo.url,
      thumbnail: photo.thumbnail
      // Remove: original_url, upload_info
    }))
  }
}
```

### Deep Filtering

```typescript
function filterRecursive(obj: any, allowedFields: string[]): any {
  if (Array.isArray(obj)) {
    return obj.map(item => filterRecursive(item, allowedFields))
  }
  
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => allowedFields.includes(key))
        .map(([key, value]) => [key, filterRecursive(value, allowedFields)])
    )
  }
  
  return obj
}

export function filterDeep(data: any) {
  const allowed = ['id', 'name', 'status', 'owner', 'photos']
  return filterRecursive(data, allowed)
}
```

## Dynamic Filtering

### Query Parameter Filtering

```typescript
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const query = getQuery(event)
  const fields = query.fields?.split(',') || []
  
  const pets = await fetchPets()
  
  // Filter by requested fields
  if (fields.length > 0) {
    return pets.map(pet =>
      Object.fromEntries(
        fields.map(field => [field, pet[field]])
      )
    )
  }
  
  return pets.map(pet => filterPet(pet, user))
})
```

**Usage:**
```
GET /api/pets?fields=id,name,status
```

### Sparse Fieldsets (JSON:API)

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fields = query['fields[pets]']?.split(',') || []
  
  const pets = await fetchPets()
  
  return pets.map(pet => {
    if (fields.length === 0) return pet
    
    return fields.reduce((acc, field) => {
      if (pet[field] !== undefined) {
        acc[field] = pet[field]
      }
      return acc
    }, {} as any)
  })
})
```

**Usage:**
```
GET /api/pets?fields[pets]=id,name,age
```

## PII Protection

### Mask Personal Information

```typescript
export function maskPII(user: any) {
  return {
    ...user,
    email: user.email ? maskEmail(user.email) : null,
    phone: user.phone ? maskPhone(user.phone) : null,
    ssn: user.ssn ? '***-**-' + user.ssn.slice(-4) : null
  }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  return `${name[0]}${'*'.repeat(name.length - 1)}@${domain}`
}

function maskPhone(phone: string): string {
  return `***-***-${phone.slice(-4)}`
}
```

### Remove PII for Non-Owners

```typescript
export function filterUser(user: any, currentUser: AuthUser) {
  const isOwn = user.id === currentUser.id
  const isAdmin = currentUser.role === 'admin'
  
  const response: any = {
    id: user.id,
    name: user.name,
    avatar: user.avatar
  }
  
  // Only show PII to owner or admin
  if (isOwn || isAdmin) {
    response.email = user.email
    response.phone = user.phone
    response.address = user.address
  }
  
  return response
}
```

## TypeScript Support

```typescript
interface RawPet {
  id: number
  name: string
  species: string
  age: number
  status: string
  // Internal fields
  internal_id: string
  cost_price: number
  api_key: string
}

interface PublicPet {
  id: number
  name: string
  species: string
  age: number
  status: string
}

export function filterPet(pet: RawPet): PublicPet {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    age: pet.age,
    status: pet.status
    // TypeScript ensures no extra fields
  }
}
```

## Helper Functions

### Pick Fields

```typescript
export function pick<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key]
    }
    return acc
  }, {} as Pick<T, K>)
}

// Usage
const filtered = pick(pet, ['id', 'name', 'status'])
```

### Omit Fields

```typescript
export function omit<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const filtered = { ...obj }
  keys.forEach(key => delete filtered[key])
  return filtered
}

// Usage
const filtered = omit(pet, ['password_hash', 'api_key'])
```

## Best Practices

### ✅ Do

```typescript
// ✅ Use whitelist approach
function filter(pet) {
  return {
    id: pet.id,
    name: pet.name
  }
}

// ✅ Filter by role
if (user.role === 'admin') return allFields

// ✅ Remove null values
return removeNullFields(data)

// ✅ Test filtering
expect(result).not.toHaveProperty('api_key')
```

### ❌ Don't

```typescript
// ❌ Don't trust blacklist alone
const { password, ...rest } = user
return rest  // Might expose new fields

// ❌ Don't expose dates unnecessarily
createdAt: pet.created_at  // Do users need this?

// ❌ Don't return everything for admins
if (admin) return pet  // Consider filtering anyway

// ❌ Don't forget nested objects
return { ...pet, owner: pet.owner }  // owner not filtered!
```

## Performance

### Efficient Filtering

```typescript
// ❌ Slow: Multiple operations
let filtered = pet
filtered = removeSensitive(filtered)
filtered = removeInternal(filtered)
filtered = removeNull(filtered)

// ✅ Fast: Single pass
const filtered = {
  id: pet.id,
  name: pet.name,
  status: pet.status
}
```

### Memoize Filters

```typescript
const filterCache = new Map()

export function filterPet(pet: any, user: AuthUser) {
  const cacheKey = `${pet.id}-${user.role}`
  
  if (filterCache.has(cacheKey)) {
    return filterCache.get(cacheKey)
  }
  
  const filtered = {
    id: pet.id,
    name: pet.name
  }
  
  filterCache.set(cacheKey, filtered)
  return filtered
}
```

## Next Steps

- [Combining Sources →](/server/transformers/combining-sources)
- [Custom Transformers →](/server/transformers/custom-transformers)
- [Permission Flags →](/server/transformers/permission-flags)
- [Examples →](/examples/server/transformers/)
