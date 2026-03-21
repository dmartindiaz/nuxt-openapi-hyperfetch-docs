# ADR 001: useFetch vs useAsyncData

**Status:** Accepted

**Date:** 2024-01-15

## Context

Nuxt 3 provides two main composables for data fetching: `useFetch` and `useAsyncData`. When generating composables from OpenAPI specs, we need to decide which to use as the default pattern.

### useFetch

```typescript
const { data, pending, error } = useFetch('/api/pets/1')
```

- Built-in URL handling
- Simpler API
- Automatic key generation
- Direct $fetch wrapper

### useAsyncData

```typescript
const { data, pending, error } = useAsyncData(
  'pet-1',
  () => $fetch('/api/pets/1')
)
```

- Manual key specification
- More control over fetching
- Separate fetch function
- More flexible

## Decision

**Generate both `useFetch*` and `useAsyncData*` variants for GET requests.**

For GET operations:
- `useFetchPet(id)` - Default, recommended
- `useAsyncDataPet(id)` - When custom key needed

For POST/PUT/DELETE operations:
- Only `useFetch*` with `immediate: false`

## Rationale

### Why Both?

1. **Default Simplicity** - Most users want simple `useFetch`
2. **Advanced Control** - Some users need `useAsyncData` features
3. **Choice** - Let developers choose based on needs
4. **No Breaking Changes** - Supporting both means no forced migration

### Why useFetch as Default?

1. **Simpler API** - Fewer parameters needed
2. **Auto Key Generation** - No manual key management
3. **Nuxt Recommended** - Official docs recommend useFetch
4. **Better DX** - Less boilerplate

### Why Include useAsyncData?

1. **Custom Keys** - When you need specific cache keys
2. **Shared Data** - Multiple components sharing same data
3. **Advanced Patterns** - Complex data transformation
4. **Migration** - Users coming from Nuxt 2 patterns

## Implementation

```typescript
// Generated for each GET operation
export function useFetchPet(
  id: MaybeRef<number>,
  options?: UseFetchOptions<Pet>
) {
  return useFetch<Pet>(
    () => `/pets/${unref(id)}`,
    options
  )
}

export function useAsyncDataPet(
  id: MaybeRef<number>,
  options?: UseAsyncDataOptions<Pet>
) {
  return useAsyncData(
    () => `pet-${unref(id)}`,
    () => $fetch<Pet>(`/pets/${unref(id)}`),
    options
  )
}
```

## Consequences

### Positive

- **Flexibility** - Developers can choose what they need
- **Better DX** - Simpler default for common cases
- **No Lock-In** - Easy to switch between variants
- **Complete** - Covers all use cases

### Negative

- **More Code** - Generator creates twice as many GET composables
- **Documentation** - Need to explain when to use each
- **Choice Overload** - Beginners might be confused
- **Bundle Size** - Slightly larger (mitigated by tree-shaking)

## Alternatives Considered

### Alternative 1: Only useFetch

**Rejected** - Some users need useAsyncData features like custom keys

### Alternative 2: Only useAsyncData

**Rejected** - More verbose, harder for beginners

### Alternative 3: Configuration Option

**Rejected** - Adds complexity, forces choice at generation time

## Next Steps

- Document when to use each variant in guide
- Add examples for both patterns
- Consider CLI flag to skip one variant if needed

## Related

- [Composables Guide](/composables/useFetch/)
- [Choosing Between useFetch and useAsyncData](/guide/choosing-composable)
