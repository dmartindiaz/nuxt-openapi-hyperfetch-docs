# Guide

Welcome to the Nuxt OpenAPI Hyperfetch guide! This comprehensive guide will help you get started with generating type-safe Nuxt composables from OpenAPI specifications.

## What You'll Learn

This guide covers everything you need to know about using nuxt-openapi-hyperfetch:

### Getting Started

- **[What is Nuxt OpenAPI Hyperfetch?](./what-is-nuxt-openapi-hyperfetch)** - Understand what this tool does and why you should use it
- **[Getting Started](./getting-started)** - Fast setup with the two available workflows
- **[Use as Nuxt Module](./use-as-nuxt-module)** - Configure generation in `nuxt.config.ts`
- **[Use as CLI](./use-as-cli)** - Full CLI installation, commands, and examples
- **[Core Concepts](./core-concepts)** - Learn the fundamental concepts

### Usage

- **[Generating Composables](./generating-composables)** - Learn how to generate composables from your OpenAPI spec
- **[Choosing a Generator](./choosing-a-generator)** - Understand when to use useFetch vs useAsyncData

## Quick Start

```bash
# Install
npm install nuxt-openapi-hyperfetch

# CLI workflow
npx nxh generate -i swagger.yaml -o ./composables
```

## Key Features

- ✅ **Type-Safe** - Full TypeScript support from OpenAPI schemas
- ✅ **Dual Mode** - Generate client composables (useFetch/useAsyncData) or server composables
- ✅ **SSR Support** - Works seamlessly with Nuxt's Server-Side Rendering
- ✅ **Callbacks** - Per-request and global callbacks for auth, logging, etc.
- ✅ **BFF Pattern** - Server composables for Backend-for-Frontend architecture

## Learning Path

We recommend following this path:

1. Start with **[What is Nuxt OpenAPI Hyperfetch?](./what-is-nuxt-openapi-hyperfetch)** to understand the basics
2. Follow **[Getting Started](./getting-started)** and choose your workflow
3. If you use Nuxt module mode, continue with **[Use as Nuxt Module](./use-as-nuxt-module)**
4. If you use terminal-first mode, continue with **[Use as CLI](./use-as-cli)**
5. Read **[Core Concepts](./core-concepts)** to understand how it works
6. Learn about **[Generating Composables](./generating-composables)** in detail
7. Explore the **[Composables](/composables/)** section for detailed API documentation
8. Check out the **[Composables](/composables/)** section for all API details

## Need Help?

- **[Troubleshooting](/troubleshooting/)** - Common issues and solutions
- **[Contributing](/contributing/)** - How to contribute

## Next Steps

Ready to get started?

- [What is Nuxt OpenAPI Hyperfetch? →](./what-is-nuxt-openapi-hyperfetch)
- [Getting Started →](./getting-started)
- [Use as Nuxt Module →](./use-as-nuxt-module)
- [Use as CLI →](./use-as-cli)
- [Core Concepts →](./core-concepts)
