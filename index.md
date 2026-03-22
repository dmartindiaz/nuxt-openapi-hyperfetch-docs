---
layout: home

hero:
  name: Nuxt OpenAPI Hyperfetch
  text: Type-Safe API Composables
  tagline: Generate Nuxt 3 composables from OpenAPI/Swagger specifications with full TypeScript support and lifecycle callbacks
  image:
    src: /logo.png
    alt: Nuxt OpenAPI Hyperfetch
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/dmartindiaz/nuxt-openapi-hyperfetch

features:
  - icon: 🎯
    title: Type-Safe
    details: Full TypeScript support with types automatically derived from your OpenAPI schemas
  
  - icon: ⚡
    title: SSR Compatible
    details: All composables work seamlessly with Nuxt's server-side rendering
  
  - icon: 🔄
    title: Lifecycle Callbacks
    details: Built-in onRequest, onSuccess, onError, and onFinish callbacks for complete control
  
  - icon: 🔌
    title: Global Callbacks
    details: Define callbacks once in a plugin and apply them to all API requests automatically
  
  - icon: 🎛️
    title: Request Interception
    details: Modify headers, body, and query params before sending requests
  
  - icon: 📦
    title: Zero Dependencies
    details: Generated code only uses Nuxt built-in APIs - no runtime dependencies
  
  - icon: 🚀
    title: Multiple Generators
    details: Support for useFetch, useAsyncData, and Nuxt server routes with BFF pattern
  
  - icon: 🎨
    title: Developer Experience
    details: Interactive CLI with smart defaults and comprehensive error messages
---

## Quick Example

Generate type-safe composables in seconds:

```bash
# Install
npm install -g nuxt-openapi-hyperfetch

# Generate
nxh generate -i swagger.yaml -o ./api
```

Use in your Nuxt components:

```vue
<script setup lang="ts">
const { data: pet, error, pending } = useFetchGetPetById(
  { petId: 123 },
  {
    onSuccess: (pet) => {
      console.log('Pet loaded:', pet.name)
    },
    onError: (error) => {
      showToast('Failed to load pet', 'error')
    }
  }
)
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>{{ pet.name }}</div>
</template>
```

## Why Nuxt OpenAPI Hyperfetch?

<div class="vp-doc">

### Automated API Integration

Stop writing repetitive API integration code. Nuxt OpenAPI Hyperfetch automatically creates type-safe composables from your OpenAPI specification.

### Type Safety Everywhere

Get full TypeScript support without manual type definitions. Types are automatically generated from your API schemas.

### Nuxt-Native

Generated composables use Nuxt's built-in `useFetch` and `useAsyncData` - no learning curve, no external dependencies.

### Production Ready

Used in production applications handling millions of requests. Includes comprehensive error handling, SSR support, and performance optimizations.

</div>

## What's Next?

<div class="vp-doc">

- **New to Nuxt OpenAPI Hyperfetch?** Start with the [Getting Started Guide](/guide/getting-started)
- **Want to see examples?** Check out [Practical Examples](/examples/composables/basic/simple-get)
- **Need API reference?** Browse the [API Documentation](/api/)
- **Building server routes?** Learn about [BFF Pattern](/server/)

</div>
