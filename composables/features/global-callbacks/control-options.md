# Global Callback Control Options

Three mechanisms let you control when and how global callbacks run.

## skipGlobalCallbacks

Skip global callbacks for a specific composable call.

### Skip all global callbacks

```typescript
const { data } = useFetchGetPublicPets({}, {
  skipGlobalCallbacks: true
})
```

### Skip specific callbacks

Pass an array of callback names to skip only those:

```typescript
const { data } = useFetchGetPets({}, {
  skipGlobalCallbacks: ['onRequest', 'onSuccess']
})
```

Accepted values: `'onRequest'`, `'onSuccess'`, `'onError'`, `'onFinish'`.

---

Common use cases:

```typescript
// Public endpoint — no auth header needed
useFetchGetPublicArticles({}, { skipGlobalCallbacks: true })

// External API — skip internal auth, use its own
useFetchExternalService({}, {
  skipGlobalCallbacks: true,
  onRequest: ({ headers }) => {
    return { headers: { ...headers, 'X-API-Key': externalKey } }
  }
})

// Skip only auth header, keep error handling
useFetchGetPets({}, {
  skipGlobalCallbacks: ['onRequest']
})
```

## return false from Global Callback

Return `false` from a global callback to prevent the corresponding local callback from running.

```typescript
// plugins/api-callbacks.ts
const globalCallbacks = {
  onError: (error) => {
    if (error.status === 401) {
      navigateTo('/login')
      return false // ← local onError will NOT run
    }
  }
}
```

When global `onError` returns `false`, any `onError` defined on the composable call is skipped:

```typescript
useFetchGetPets({}, {
  onError: (error) => {
    console.log('This will not run for 401 errors')
  }
})
```

## patterns (URL Filter)

Add a `patterns` array to `globalCallbacks` to restrict all global callbacks to specific URLs. Uses glob-style matching.

```typescript
// plugins/api-callbacks.ts
const globalCallbacks = {
  patterns: ['/api/private/**', '/api/admin/**'],
  onRequest: ({ headers }) => {
    const token = useCookie('auth-token').value
    return { headers: { ...headers, 'Authorization': `Bearer ${token}` } }
  }
}
```

When `patterns` is set, global callbacks are silently skipped for URLs that don't match.

::: tip
Use `patterns` when global callbacks should apply to a defined group of routes. Use `skipGlobalCallbacks` per composable call for one-off exceptions.
:::

## Execution Flow

**Without `skipGlobalCallbacks`:**

```
Request → Global onRequest → Local onRequest → HTTP → Global onSuccess → Local onSuccess
```

**With `skipGlobalCallbacks: true`:**

```
Request → Local onRequest → HTTP → Local onSuccess
          (Global skipped)
```

**With `return false` from global callback:**

```
Request → ... → HTTP → Global onError (returns false) → Local onError skipped
```

## Next Steps

- [URL Patterns →](/composables/features/global-callbacks/patterns)
- [Setup Guide →](/composables/features/global-callbacks/setup)
