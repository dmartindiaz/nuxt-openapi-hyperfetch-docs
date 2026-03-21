# Architecture

Understanding the design and architecture of nuxt-openapi-hyperfetch.

## Overview

Nuxt OpenAPI Hyperfetch is a CLI tool that generates type-safe Nuxt composables from OpenAPI specifications. It bridges the gap between your API documentation and your frontend code.

## Core Concepts

### Code Generation

Generate composables at build time, not runtime:

- **Static Generation** - All composables generated as TypeScript files
- **Type Safety** - Full type inference from OpenAPI schemas
- **Tree Shakeable** - Only import what you use
- **No Runtime Overhead** - Pure TypeScript, no parser at runtime

### Dual Mode

Support both client and server environments:

- **Client Mode** - Generate `useFetch`/`useAsyncData` composables for Vue components
- **Server Mode** - Generate server composables for Nitro routes (BFF pattern)

### OpenAPI First

Let your API specification be the source of truth:

- **Schema to Types** - OpenAPI schemas → TypeScript interfaces
- **Operations to Composables** - API operations → Type-safe functions
- **Documentation to Comments** - OpenAPI descriptions → JSDoc comments

## Architecture Sections

### Design Patterns

Common patterns used in generated code:

- [Client Composables →](/architecture/patterns/client-composables)
- [Server Composables →](/architecture/patterns/server-composables)
- [BFF Pattern →](/architecture/patterns/bff-pattern)
- [Error Handling →](/architecture/patterns/error-handling)

### Architecture Decisions

Key decisions and their rationale:

- [ADR 001: useFetch vs useAsyncData →](/architecture/decisions/001-useFetch-vs-useAsyncData)
- [ADR 002: Callback System →](/architecture/decisions/002-callback-system)
- [ADR 003: Server Composables →](/architecture/decisions/003-server-composables)
- [ADR 004: Type Generation →](/architecture/decisions/004-type-generation)

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              OpenAPI Specification              │
│         (swagger.yaml / openapi.json)           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           nuxt-openapi-hyperfetch CLI                    │
│  ┌──────────────────────────────────────────┐   │
│  │  Parser (OpenAPI → AST)                  │   │
│  └──────────────┬───────────────────────────┘   │
│                 ▼                               │
│  ┌──────────────────────────────────────────┐   │
│  │  Type Generator (Schemas → Interfaces)   │   │
│  └──────────────┬───────────────────────────┘   │
│                 ▼                               │
│  ┌──────────────────────────────────────────┐   │
│  │  Composable Generator (Operations)       │   │
│  └──────────────┬───────────────────────────┘   │
│                 ▼                               │
│  ┌──────────────────────────────────────────┐   │
│  │  File Writer (TS files)                  │   │
│  └──────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Generated Composables                  │
│                                                  │
│  composables/                                    │
│  ├── pets/                                       │
│  │   ├── useFetchPet.ts                         │
│  │   └── useCreatePet.ts                        │
│  └── types.ts                                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              Your Nuxt App                      │
│                                                  │
│  <script setup>                                  │
│  const { data } = useFetchPet(1)                │
│  </script>                                       │
└─────────────────────────────────────────────────┘
```

## Contributing

Want to contribute? See the [Contributing Guide →](/contributing/).

## Next Steps

- [Design Patterns →](/architecture/patterns/)
- [Architecture Decisions →](/architecture/decisions/)
- [Contributing →](/contributing/)
