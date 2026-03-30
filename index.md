---
layout: home

hero:
  name: Nuxt OpenAPI Hyperfetch
  text: Generate API Code for Nuxt
  tagline: Point it at your OpenAPI spec and get fully typed useFetch composables, useAsyncData composables, or Nuxt server routes — ready to use, nothing to write by hand.
  image:
    src: /logo.png
    alt: Nuxt OpenAPI Hyperfetch
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on npm
      link: https://www.npmjs.com/package/nuxt-openapi-hyperfetch
    - theme: alt
      text: ⭐ Star on GitHub
      link: https://github.com/dmartindiaz/nuxt-openapi-hyperfetch

features:
  - icon: ⚙️
    title: Three generators, one CLI
    details: Choose useFetch, useAsyncData, or Nuxt server routes (BFF mode). Mix and match per project.

  - icon: 🎯
    title: Fully typed, no manual effort
    details: Types are derived directly from your OpenAPI schemas. Parameters, request bodies, and responses are all typed automatically.

  - icon: 🟢
    title: Nuxt-native output
    details: Generated composables wrap Nuxt's own useFetch and useAsyncData. No new APIs to learn, no runtime dependencies.

  - icon: 🔄
    title: Lifecycle callbacks
    details: Every composable exposes onRequest, onSuccess, onError, and onFinish. Define them per call or globally in a plugin.

  - icon: 🔒
    title: BFF mode — credentials stay on the server
    details: Server routes proxy your backend with API keys from runtimeConfig. Auth context and response transformers are generated once and never overwritten.

  - icon: ♻️
    title: Safe to regenerate
    details: Route files update automatically when your spec changes. Your auth context and transformers are never touched.
---

## How to Start

Choose one of these two workflows:

### 1. Use with npx (no installation)

```bash
npx nuxt-openapi-hyperfetch generate
```

### 2. Install first, then run `nxh`

Install the package (project or global), then run:

```bash
npm install nuxt-openapi-hyperfetch
nxh generate
```

## What gets generated

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

## Why use this CLI?

<div class="vp-doc">

<details>
  <summary><strong>You stop writing boilerplate</strong></summary>

Every endpoint in your OpenAPI spec becomes a ready-to-use composable or server route. If your spec has 40 endpoints, you get 40 typed composables with one command.
</details>

<details>
  <summary><strong>Nuxt-native, but enhanced</strong></summary>

Generated composables use Nuxt's own `useFetch` and `useAsyncData` under the hood - fully SSR-compatible, works in components and pages without any setup. On top of that, you get lifecycle callbacks (`onRequest`, `onSuccess`, `onError`, `onFinish`), `pick` to trim the response, global callback plugins, and request interception. All the SSR guarantees of Nuxt, with more control where you need it.
</details>

<details>
  <summary><strong>Raw responses when you need them</strong></summary>

The `useAsyncData` generator exposes raw response access - read status codes, response headers, and the full HTTP response before it hits your component. Useful for pagination headers, `ETag` caching, or any API that communicates via headers.
</details>

<details>
  <summary><strong>Your API keys never reach the browser</strong></summary>

In BFF mode, credentials live in Nuxt `runtimeConfig` and are only used in server routes. The client calls `/api/pet`, not your backend directly.
</details>

<details>
  <summary><strong>Your custom logic survives regeneration</strong></summary>

Transformers and auth context are generated once. When you regenerate after a spec update, only the route files change - your business logic is untouched.
</details>

</div>

## What's Next?

<div class="vp-doc">

- **New here?** Start with the [Getting Started Guide](/guide/getting-started)
- **Choosing a generator?** Read [useFetch vs useAsyncData vs Server Routes](/guide/choosing-a-generator)
- **Building with BFF mode?** Go to [Server Routes](/server/)

</div>
