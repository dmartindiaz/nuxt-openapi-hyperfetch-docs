# Composables

The `useFetch` and `useAsyncData` generators create type-safe composables for your Nuxt application. These composables wrap Nuxt's built-in data fetching composables with additional features.

## What the CLI Adds

Generated composables enhance Nuxt's `useFetch` and `useAsyncData` with:

- ✅ **Type Safety**: Request parameters and responses are fully typed from OpenAPI schemas
- ✅ **Lifecycle Callbacks**: `onRequest`, `onSuccess`, `onError`, `onFinish`
- ✅ **Global Callbacks**: Define callbacks once in a plugin, apply to all requests
- ✅ **Request Interception**: Modify headers, body, query params before sending
- ✅ **SSR Compatible**: Works seamlessly with Nuxt's server-side rendering
- ✅ **Zero Dependencies**: Only uses Nuxt built-in APIs

::: tip Nuxt Documentation
Generated composables wrap Nuxt's built-in composables. For complete documentation on standard options like `immediate`, `watch`, `server`, `lazy`, `transform`, see:

- **[Nuxt useFetch Documentation →](https://nuxt.com/docs/api/composables/use-fetch)**
- **[Nuxt useAsyncData Documentation →](https://nuxt.com/docs/api/composables/use-async-data)**
:::

## Two Composable Types

### useFetch Composables

Generated when using `--generator useFetch`:

```typescript
const { data, pending, error, refresh } = useFetchGetPets()
```

**Best for:** Simple API calls, basic CRUD operations

[Learn more about useFetch →](/composables/use-fetch/)

### useAsyncData Composables

Generated when using `--generator useAsyncData`:

```typescript
const { data, pending, error, refresh } = useAsyncDataGetPets()
```

**Best for:** Complex logic, data transformations, raw responses

[Learn more about useAsyncData →](/composables/use-async-data/)

## Shared Features

Both composable types share the same powerful features:

### Callbacks

Execute code at different stages of the request lifecycle:

```typescript
useFetchGetPet(
  { petId: 123 },
  {
    onRequest: () => console.log('Starting...'),
    onSuccess: (data) => console.log('Success!', data),
    onError: (error) => console.error('Failed!', error),
    onFinish: ({ success }) => console.log('Done!', success ? '✓' : '✗')
  }
)
```

[Learn more about callbacks →](/composables/features/callbacks/overview)

### Global Callbacks

Define callbacks once in a plugin, apply them everywhere:

```typescript
// plugins/api.ts
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    headers['Authorization'] = `Bearer ${getToken()}`
  }
})
```

[Learn more about global callbacks →](/composables/features/global-callbacks/overview)

### Request Interception

Modify requests before they're sent:

```typescript
useFetchGetUsers({}, {
  onRequest: ({ headers, query }) => {
    headers['X-Custom'] = 'value'
    query.limit = 100
  }
})
```

[Learn more about request interception →](/composables/features/request-interception)

### Data Transformation

Transform response data with `transform` option:

```typescript
useAsyncDataGetPets({}, {
  transform: (pets) => pets.map(p => ({ ...p, displayName: p.name.toUpperCase() }))
})
```

[Learn more about data transformation →](/server/transformers/)

### Authentication

Add auth tokens and handle unauthorized responses:

```typescript
useGlobalCallbacks({
  onRequest: ({ headers }) => {
    headers['Authorization'] = `Bearer ${getToken()}`
  },
  onError: (error) => {
    if (error.status === 401) {
      navigateTo('/login')
    }
  }
})
```

[Learn more about authentication →](/composables/features/authentication)

### Error Handling

Centralized error handling with global callbacks:

```typescript
useGlobalCallbacks({
  onError: (error) => {
    if (error.status === 404) {
      showToast('Resource not found', 'error')
    } else if (error.status >= 500) {
      showToast('Server error, please try again', 'error')
    }
  }
})
```

[Learn more about error handling →](/composables/features/callbacks/on-error)

## Quick Comparison

| Feature | useFetch | useAsyncData |
|---------|----------|--------------|
| **CLI Features** | | |
| Type Safety (from OpenAPI) | ✅ Full | ✅ Full |
| Callbacks (CLI adds) | ✅ Full | ✅ Full |
| Global Callbacks (CLI adds) | ✅ Full | ✅ Full |
| **Nuxt Features** | | |
| SSR Compatible | ✅ Yes | ✅ Yes |
| Raw Response | ❌ No | ✅ Yes |
| Data Transform | ✅ Yes | ✅ Yes |
| Cache Key | Auto | Auto (custom optional) |
| **Best For** | Simple calls | Complex logic |

## Architecture

```
      ┌───────────────────┐
      │  Your Component   │
      └─────────┬─────────┘
                │
                ▼
      ┌───────────────────────────┐
      │  Generated Composable     │  useFetchGetPets()
      └─────────┬─────────────────┘
                │
                ▼
      ┌───────────────────────────┐
      │useApiRequest /            │  Runtime helper
      │useApiAsyncData            │
      └─────────┬─────────────────┘
                │
                ▼
      ┌───────────────────────────┐
      │   Execute Callbacks       │  onRequest, onSuccess, etc.
      └─────────┬─────────────────┘
                │
                ▼
      ┌───────────────────────────┐
      │Nuxt useFetch /            │  Built-in Nuxt composables
      │useAsyncData               │
      └─────────┬─────────────────┘
                │
                ▼
      ┌───────────────────────────┐
      │      API Server           │
      └───────────────────────────┘
```

1. **Your Component** calls the generated composable
2. **Generated Composable** wraps request with type safety
3. **Runtime Helper** executes callbacks and delegates to Nuxt
4. **Nuxt Composable** makes the actual HTTP request
5. **API Server** responds with data

## Next Steps

- **Learn useFetch**: [useFetch Introduction →](/composables/use-fetch/)
- **Learn useAsyncData**: [useAsyncData Introduction →](/composables/use-async-data/)
- **See Examples**: [Basic Usage →](/composables/use-fetch/basic-usage)
- **Explore Features**: [Shared Features →](/composables/features/)
