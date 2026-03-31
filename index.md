---
layout: home

hero:
  name: Nuxt OpenAPI Hyperfetch
  text: Generate ready-to-use composables for Nuxt
  tagline: Point it at your OpenAPI spec and get fully typed useFetch composables, useAsyncData composables, Nuxt server routes, and headless UI connectors — ready to use, nothing to write by hand.
  image:
    src: /logo.png
    alt: Nuxt OpenAPI Hyperfetch
  actions:
    - theme: brand
      text: 🚀 Get started
      link: /guide/getting-started
    - theme: alt
      text: 📦 View on npm
      link: https://www.npmjs.com/package/nuxt-openapi-hyperfetch
    - theme: alt
      text: 🐙 View on GitHub
      link: https://github.com/dmartindiaz/nuxt-openapi-hyperfetch

features:
  - icon: ⚙️
    title: One CLI, full API layer
    details: Generate useFetch, useAsyncData, Nuxt server routes, and connectors from one OpenAPI spec.

  - icon: 🎯
    title: Types from your OpenAPI
    details: Request params, bodies, and responses are inferred automatically. No manual type maintenance.

  - icon: 🟢
    title: Nuxt-native composables
    details: Generated wrappers use Nuxt's useFetch and useAsyncData, so the API feels native from day one.

  - icon: 🧩
    title: Headless UI connectors
    details: Get getAll, get, create, update, and delete flows per resource, ready for tables, forms, and dialogs.

  - icon: 🔒
    title: Server-first security with BFF
    details: Keep secrets on the server with generated Nuxt routes, auth context, and transformers.

  - icon: ♻️
    title: Safe regeneration workflow
    details: Re-generate when the spec changes without losing your custom auth and transformer code.
---

## How to Start

Choose one workflow:

### 1. Use with npx (no installation)

```bash
npx nuxt-openapi-hyperfetch generate
```

### 2. Install first, then run `nxh`

Install the package, then run:

```bash
npm install nuxt-openapi-hyperfetch
nxh generate
```

## What You Get

From one OpenAPI spec, you can generate:

- `useFetch` composables
- `useAsyncData` composables
- Nuxt server routes (`nuxtServer`)
- Headless CRUD connectors

## Generated Composables and Server Routes

Run the CLI and pick your generators:

```bash
npx nxh generate
```

**Composables (useFetch or useAsyncData):**

```vue
<script setup lang="ts">
// Fully typed — petId: number, data: Pet | null, error typed
const { data: pet, pending, error } = useFetchGetPetById(
  { petId: 123 },
  {
    onSuccess: (pet) => console.log('Loaded:', pet.name),
    onError: (err) => showToast(err.message, 'error'),
  }
)
</script>
```

**Server routes (BFF mode):**

```typescript
// Generated: server/api/pet.post.ts
export default defineEventHandler(async (event): Promise<Pet> => {
  const auth = await getAuthContext(event)   // your auth logic

  const data = await $fetch(`${config.apiBaseUrl}/pet`, {
    headers: { Authorization: `Bearer ${config.apiSecret}` }, // key never exposed
  })

  return transformPet(data, event, auth)     // your transform logic
})
```

Your transformer stub (`server/bff/transformers/pet.ts`) is generated once and never overwritten — add your business logic there:

```typescript
export async function transformPet<T = any>(
  data: T,
  event: H3Event,
  auth: AuthContext | null
): Promise<T> {
  return {
    ...(data as any),
    canEdit: auth?.permissions.includes('pet:write') ?? false,
  } as T
}
```

## Connectors (Headless CRUD)

<div class="vp-doc">

A connector groups CRUD behavior for one resource in one composable.

```ts
const { getAll, get, create, update, del } = usePetsConnector()
```

This gives you a clean base for tables, detail views, forms, and delete flows without wiring each operation manually.

- `getAll`: list with SSR (`useAsyncData`)
- `get`: load one item by ID
- `create`: validated create form
- `update`: validated update form
- `del`: staged delete with confirmation

Read more:

- [Connectors Overview](/connectors/)
- [OpenAPI Conventions for Connectors](/connectors/openapi-conventions)

</div>

## What's Next?

<div class="vp-doc">

- **New here?** Start with the [Getting Started Guide](/guide/getting-started)
- **Choosing a generator?** Read [useFetch vs useAsyncData vs Server Routes](/guide/choosing-a-generator)
- **Building with BFF mode?** Go to [Server Routes](/server/)
- **Using connectors?** Start at [Connectors](/connectors/)

</div>
