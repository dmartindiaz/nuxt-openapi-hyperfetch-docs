# Getting Started

Use Nuxt OpenAPI Hyperfetch in one of two ways:

- As a Nuxt module (recommended for Nuxt projects)
- As a CLI workflow

> [!NOTE]
> You can choose between two backends for code generation:
> - **OpenAPI Generator (official)** - requires **Java 11+** ([Download JDK](https://www.oracle.com/java/technologies/downloads/))
> - **@hey-api/openapi-ts** - runs entirely on Node.js, no Java required

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **Nuxt**: v3.0.0 or higher
- **OpenAPI**: v3.0.0 or Swagger v2.0 specification file

## 1. Install

```bash
npm install nuxt-openapi-hyperfetch
```

## 2. Choose your workflow

### Use as Nuxt module

Add the module and configure it in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-openapi-hyperfetch'],
  nuxtOpenApiHyperfetch: {
    openApiHyperFetch: {
      input: './swagger.yaml',
      output: './swagger',
      generators: ['useFetch']
    }
  }
})
```

Read the full setup and all module options in [Use as Nuxt Module](/guide/use-as-nuxt-module).

### Use as CLI

Run the generator directly from the terminal:

```bash
npx nxh generate
```

Read the complete CLI guide in [Use as CLI](/guide/use-as-cli).

## Next Steps

- Continue with [Core Concepts](/guide/core-concepts)
- Learn [Choosing a Generator](/guide/choosing-a-generator)
