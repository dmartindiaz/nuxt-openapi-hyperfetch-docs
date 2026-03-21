# ADR 002: Callback System

**Status:** Accepted

**Date:** 2024-01-20

## Context

Generated composables need a way for users to execute custom logic at different stages of the request lifecycle (before request, after success, on error, after completion).

## Requirements

1. **Per-Request Callbacks** - Component-specific logic
2. **Global Callbacks** - App-wide logic (auth, analytics, errors)
3. **Skip Mechanism** - Ability to bypass global callbacks
4. **Type Safety** - Typed callback parameters
5. **Composability** - Multiple callbacks can run

## Decision

**Implement a two-tier callback system: per-request callbacks in options and global callbacks via Nuxt plugin.**

### Per-Request Callbacks

```typescript
const { execute } = useCreatePet({
  onRequest: (ctx) => console.log('Starting...'),
  onSuccess: (data) => navigateTo('/pets'),
  onError: (error) => toast.error(error.message),
  onFinish: () => console.log('Done')
})
```

### Global Callbacks

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => ({
  provide: {
    apiCallbacks: {
      onRequest: (ctx) => { /* global logic */ },
      onSuccess: (data, ctx) => { /* global logic */ },
      onError: (error, ctx) => { /* global logic */ },
      onFinish: (ctx) => { /* global logic */ }
    }
  }
}))
```

### Skip Flags

```typescript
const { execute } = useFetchPet(1, {
  skipGlobalError: true // Handle error locally
})
```

## Implementation

### Callback Execution Order

```
1. Global onRequest
2. Per-Request onRequest
3. HTTP Request
4a. Success Path:
    - Global onSuccess
    - Per-Request onSuccess
5a. Error Path:
    - Global onError (if not skipped)
    - Per-Request onError
6. Global onFinish
7. Per-Request onFinish
```

### Generated Code

```typescript
export function useFetchPet(
  id: MaybeRef<number>,
  options?: UseFetchOptions<Pet>
) {
  const nuxtApp = useNuxtApp()
  const globalCallbacks = nuxtApp.$apiCallbacks
  
  return useFetch<Pet>(
    () => `/pets/${unref(id)}`,
    {
      ...options,
      onRequest: (ctx) => {
        globalCallbacks?.onRequest?.(ctx)
        options?.onRequest?.(ctx)
      },
      onSuccess: (data, ctx) => {
        if (!options?.skipGlobalSuccess) {
          globalCallbacks?.onSuccess?.(data, ctx)
        }
        options?.onSuccess?.(data, ctx)
      },
      onError: (error, ctx) => {
        if (!options?.skipGlobalError) {
          globalCallbacks?.onError?.(error, ctx)
        }
        options?.onError?.(error, ctx)
      },
      onFinish: (ctx) => {
        if (!options?.skipGlobalFinish) {
          globalCallbacks?.onFinish?.(ctx)
        }
        options?.onFinish?.(ctx)
      }
    }
  )
}
```

## Consequences

### Positive

- **Flexible** - Works for both local and global use cases
- **Composable** - Multiple callbacks can execute
- **Type Safe** - All callbacks are typed
- **Opt-Out** - Skip flags provide escape hatch
- **Separation of Concerns** - Local vs global logic separated

### Negative

- **Complexity** - More code in generated composables
- **Bundle Size** - Callback handling adds bytes
- **Learning Curve** - Users need to understand both tiers
- **Execution Order** - Must document callback order

## Alternatives Considered

### Alternative 1: Only Per-Request Callbacks

**Rejected** - Requires duplicating global logic (auth, analytics) in every component

### Alternative 2: Only Global Callbacks

**Rejected** - No way to add component-specific logic

### Alternative 3: Event Bus

**Rejected** - Less type-safe, harder to debug, loose coupling issues

### Alternative 4: Interceptors (axios-style)

**Rejected** - More complex, not idiomatic for Nuxt composables

## Use Cases

### Authentication

```typescript
// plugins/auth.ts
globalCallbacks.onRequest = (ctx) => {
  const token = useCookie('auth_token')
  if (token.value) {
    ctx.headers.Authorization = `Bearer ${token.value}`
  }
}

globalCallbacks.onError = (error) => {
  if (error.statusCode === 401) {
    navigateTo('/login')
  }
}
```

### Analytics

```typescript
// plugins/analytics.ts
globalCallbacks.onRequest = (ctx) => {
  gtag('event', 'api_request', { url: ctx.url })
}

globalCallbacks.onError = (error, ctx) => {
  gtag('event', 'api_error', { url: ctx.url, status: error.statusCode })
}
```

### Loading State

```typescript
// plugins/loading.ts
const loading = useState('global-loading', () => false)

globalCallbacks.onRequest = () => {
  loading.value = true
}

globalCallbacks.onFinish = () => {
  loading.value = false
}
```

## Related

- [Callbacks Documentation](/composables/features/callbacks)
- [Global Callbacks Guide](/composables/features/global-callbacks)
- [Skip Patterns Examples](/examples/composables/global-callbacks/skip-patterns)
