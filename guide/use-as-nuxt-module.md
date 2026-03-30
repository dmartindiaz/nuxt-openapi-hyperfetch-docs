# Use as Nuxt Module

Use the Nuxt module when you want generation to be configured directly in your Nuxt app.

## Important change

`nxh.config` is not used in module mode.

When using the Nuxt module, configure everything in `nuxt.config.ts` through `nuxtOpenApiHyperfetch`.

## Install and register the module

Install the package:

```bash
npm install nuxt-openapi-hyperfetch
```

Register it in Nuxt:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-openapi-hyperfetch']
})
```

## Configure `nuxtOpenApiHyperfetch`

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-openapi-hyperfetch'],
  nuxtOpenApiHyperfetch: {
    openApiHyperFetch: {
      input: './swagger.yaml',
      output: './swagger',
      baseUrl: 'https://api.example.com',
      generators: ['useFetch', 'useAsyncData', 'nuxtServer'],
      generator: 'heyapi',
      createUseAsyncDataConnectors: false,
      serverRoutePath: 'server/api',
      enableBff: false,
      enableDevBuild: true,
      enableProductionBuild: true,
      enableAutoGeneration: false,
      enableAutoImport: true,
      tags: ['pets', 'users'],
      excludeTags: ['internal'],
      overwrite: false,
      verbose: false
    }
  }
})
```

## `openApiHyperFetch` options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `input` | `string` | Yes | - | Path or URL to your OpenAPI spec. |
| `output` | `string` | No | `./composables` | Output directory for generated files. |
| `baseUrl` | `string` | No | - | Base URL for generated client requests. |
| `generators` | `Array<'useFetch' \| 'useAsyncData' \| 'nuxtServer'>` | No | Module default | Which outputs to generate. |
| `generator` | `'heyapi' \| 'openapi'` | No | Module default | Engine used for generation (`heyapi` runs on Node, `openapi` requires Java). |
| `createUseAsyncDataConnectors` | `boolean` | No | `false` | Generates headless connectors to wire fetch flows faster with UI patterns such as tables, modals, and similar components. |
| `serverRoutePath` | `string` | No | `server/api` | Target directory for `nuxtServer` routes. |
| `enableBff` | `boolean` | No | `false` | Enables BFF mode with auth context and transformers. |
| `enableDevBuild` | `boolean` | No | `true` | Generates files when running `npm run dev`. |
| `enableProductionBuild` | `boolean` | No | `true` | Generates files when running `npm run build`. |
| `enableAutoGeneration` | `boolean` | No | `false` | Regenerates on input changes (development only). |
| `enableAutoImport` | `boolean` | No | `true` | Auto-imports generated composables in Nuxt. |
| `tags` | `string[]` | No | `[]` | Generate only selected tags. |
| `excludeTags` | `string[]` | No | `[]` | Exclude selected tags from generation. |
| `overwrite` | `boolean` | No | `false` | Overwrite files without confirmation. |
| `verbose` | `boolean` | No | `false` | Enables detailed generation logs. |

## Related

- [Use as CLI](/guide/use-as-cli)
- [Getting Started](/guide/getting-started)
