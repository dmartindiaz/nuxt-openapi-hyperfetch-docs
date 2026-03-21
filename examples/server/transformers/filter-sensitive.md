# Filter Sensitive Data

Remove sensitive fields from backend responses before sending to client.

## Basic Filtering

```typescript
// server/api/users/[id].get.ts
import { getServerUser } from '~/server/composables/users'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = await getServerUser(event, Number(id))
  
  // Remove sensitive fields
  const { password, ssn, creditCard, ...safeUser } = user
  
  return safeUser
})
```

## Filter Helper

```typescript
// server/utils/filter.ts
export function filterSensitiveFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[]
): Partial<T> {
  const filtered = { ...obj }
  
  sensitiveFields.forEach(field => {
    delete filtered[field]
  })
  
  return filtered
}
```

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = await getServerUser(event, Number(id))
  
  return filterSensitiveFields(user, ['password', 'ssn', 'creditCard'])
})
```

## Conditional Filtering

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = await getServerUser(event, Number(id))
  
  const currentUser = event.context.user
  
  // Users can see their own sensitive data
  if (currentUser?.id === user.id || currentUser?.role === 'admin') {
    return user
  }
  
  // Others see filtered data
  return filterSensitiveFields(user, ['email', 'phone', 'address'])
})
```

## Nested Filtering

```typescript
// server/utils/filter.ts
export function filterSensitiveFieldsDeep<T>(
  obj: T,
  sensitiveFields: string[]
): T {
  if (Array.isArray(obj)) {
    return obj.map(item => filterSensitiveFieldsDeep(item, sensitiveFields)) as T
  }
  
  if (obj && typeof obj === 'object') {
    const filtered: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      if (!sensitiveFields.includes(key)) {
        filtered[key] = filterSensitiveFieldsDeep(value, sensitiveFields)
      }
    }
    
    return filtered
  }
  
  return obj
}
```

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const result = await getServerPets(event)
  
  // Filter sensitive fields from pets and nested owner data
  return filterSensitiveFieldsDeep(result, [
    'owner.email',
    'owner.phone',
    'internalNotes'
  ])
})
```

## Allow List Approach

```typescript
// server/utils/filter.ts
export function pickFields<T extends Record<string, any>>(
  obj: T,
  allowedFields: string[]
): Partial<T> {
  const picked: any = {}
  
  allowedFields.forEach(field => {
    if (field in obj) {
      picked[field] = obj[field]
    }
  })
  
  return picked
}
```

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = await getServerUser(event, Number(id))
  
  // Only return specific fields
  return pickFields(user, ['id', 'name', 'avatar', 'bio'])
})
```

## Next Steps

- [Combine Multiple Sources →](/examples/server/transformers/combine-sources)
- [Add Permissions →](/examples/server/transformers/add-permissions)
