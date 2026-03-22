# Guide

Welcome to the Nuxt OpenAPI Hyperfetch guide! This comprehensive guide will help you get started with generating type-safe Nuxt composables from OpenAPI specifications.

## What You'll Learn

This guide covers everything you need to know about using nuxt-openapi-hyperfetch:

### Getting Started

- **[What is Nuxt OpenAPI Hyperfetch?](./what-is-nuxt-openapi-hyperfetch)** - Understand what this tool does and why you should use it
- **[Getting Started](./getting-started)** - Install and create your first composables
- **[Core Concepts](./core-concepts)** - Learn the fundamental concepts

### Usage

- **[Generating Composables](./generating-composables)** - Learn how to generate composables from your OpenAPI spec
- **[Choosing a Generator](./choosing-a-generator)** - Understand when to use useFetch vs useAsyncData

## Quick Start

```bash
# Install
npm install -D nuxt-openapi-hyperfetch

# Generate client composables
npx nxh generate -i swagger.yaml -o ./composables

# Generate server composables
echo nuxtServer | npx nxh generate -i swagger.yaml -o ./server/composables
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
2. Follow the **[Getting Started](./getting-started)** guide to install and generate your first composables
3. Read **[Core Concepts](./core-concepts)** to understand how it works
4. Learn about **[Generating Composables](./generating-composables)** in detail
5. Explore the **[Composables](/composables/)** section for detailed API documentation
6. Check out **[Examples](/examples/composables/basic/simple-get)** for real-world use cases

## Need Help?

- **[Troubleshooting](/troubleshooting/)** - Common issues and solutions
- **[Examples](/examples/)** - Real-world code examples
- **[API Reference](/api/)** - Complete API documentation

## Next Steps

Ready to get started?

- [What is Nuxt OpenAPI Hyperfetch? →](./what-is-nuxt-openapi-hyperfetch)
- [Getting Started →](./getting-started)
- [Core Concepts →](./core-concepts)
