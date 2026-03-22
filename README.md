# Nuxt OpenAPI Hyperfetch

A powerful CLI tool that automatically generates **type-safe Nuxt 3 composables** from OpenAPI/Swagger specifications. Eliminate repetitive API integration code and get production-ready composables that work seamlessly with Nuxt's SSR architecture.

## ✨ Features

- 🎯 **100% Type-Safe** - Full TypeScript support with automatic type inference from OpenAPI schemas
- ⚡ **SSR Compatible** - Built on top of Nuxt's `useFetch` and `useAsyncData` for seamless server-side rendering
- 🔄 **Lifecycle Callbacks** - Per-request and global callbacks for authentication, logging, error handling, and more
- 🔌 **Dual Mode** - Generate client composables (useFetch/useAsyncData) or server composables for BFF patterns
- 📦 **Zero Runtime Dependency** - Generated code copies runtime helpers into your project
- 🎨 **Customizable** - Edit runtime files without losing changes on regeneration
- 🏗️ **Clean Architecture** - Two-stage generation pattern keeps wrappers simple and maintainable

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **Nuxt**: v3.0.0 or higher
- **OpenAPI**: v3.0.0 or Swagger v2.0 specification file

## 🚀 Quick Start

### Installation

Install globally via npm:

```bash
npm install -g nuxt-openapi-hyperfetch
```

Or use with npx (no installation required):

```bash
npx nxh generate -i swagger.yaml -o ./composables
```

### Basic Usage

1. **Generate client composables** from your OpenAPI spec:

```bash
npx nxh generate -i swagger.yaml -o ./composables/api
```

2. **Use in your Vue components**:

```vue
<script setup lang="ts">
// Import the generated composable
const { data: pets, pending, error } = useFetchGetPets()

// With parameters and callbacks
const { data: pet } = useFetchGetPetById(
  { petId: 123 },
  {
    onSuccess: (data) => {
      console.log('Pet loaded:', data.name)
    },
    onError: (error) => {
      console.error('Failed to load pet:', error)
    }
  }
)
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <h1>Pets</h1>
      <ul>
        <li v-for="pet in pets" :key="pet.id">
          {{ pet.name }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 🎯 CLI Commands

### Generate Command

Generate type-safe composables from OpenAPI specifications:

```bash
npx nxh generate [options]
```

#### Options

| Option | Description | Example |
|--------|-------------|---------|
| `-i, --input <path>` | Path or URL to OpenAPI spec (required) | `-i swagger.yaml` |
| `-o, --output <path>` | Output directory (required) | `-o ./composables` |
| `--baseUrl <url>` | Override base URL for API requests | `--baseUrl https://api.staging.com` |
| `--mode <client\|server>` | Generation mode (default: client) | `--mode server` |
| `--tags <tags>` | Generate only specific tags | `--tags pets,users` |

#### Examples

```bash
# Generate from local file
npx nxh generate -i ./swagger.yaml -o ./composables

# Generate from remote URL
npx nxh generate -i https://api.example.com/openapi.json -o ./composables

# Generate server composables
echo nuxtServer | npx nxh generate -i swagger.yaml -o ./server/composables

# Generate specific tags only
npx nxh generate -i swagger.yaml -o ./composables --tags pets,users

# Override base URL
npx nxh generate -i swagger.yaml -o ./composables --baseUrl https://staging.api.com
```

## 🔧 Generated Structure

```
composables/
├── auth/
│   ├── useFetchCurrentUser.ts
│   └── useFetchLogin.ts
├── pets/
│   ├── useFetchGetPets.ts
│   ├── useFetchGetPetById.ts
│   ├── useFetchCreatePet.ts
│   └── useFetchUpdatePet.ts
├── runtime/
│   ├── use-api-request.ts      # Customizable runtime helper
│   └── types.ts                 # Shared types
└── index.ts                     # Export all composables
```

## 📚 Key Concepts

### Two-Stage Generation

1. **Stage 1: Generate Wrappers** - Creates thin composable wrappers (auto-generated, don't edit)
2. **Stage 2: Copy Runtime** - Copies shared helpers (copied once, can be customized)

### Lifecycle Callbacks

Every composable supports four lifecycle callbacks:

```typescript
useFetchGetPetById(
  { petId: 123 },
  {
    onRequest: ({ url, params }) => {
      // Before request is sent
    },
    onSuccess: (data) => {
      // When request succeeds (200-299)
    },
    onError: (error) => {
      // When request fails (400+, network error)
    },
    onFinish: () => {
      // Always runs (success or failure)
    }
  }
)
```

### Global Callbacks

Define callbacks once in a Nuxt plugin:

```typescript
// plugins/api-global-callbacks.ts
export default defineNuxtPlugin(() => {
  useGlobalCallbacks({
    onRequest: ({ headers }) => {
      // Add auth token to ALL requests
      const token = useCookie('auth_token')
      if (token.value) {
        headers['Authorization'] = `Bearer ${token.value}`
      }
    },
    onError: (error) => {
      // Handle all API errors
      console.error('API Error:', error)
    }
  })
})
```

## 🏗️ Architecture Patterns

### Client Composables

Use in Vue components for data fetching:

```typescript
// Auto-imported in Vue components
const { data, pending, error, refresh } = useFetchGetPets()
```

### Server Composables (BFF Pattern)

Generate server composables for Backend-for-Frontend architecture:

```bash
echo nuxtServer | npx nxh generate -i swagger.yaml -o ./server/composables
```

Use in Nitro server routes:

```typescript
// server/api/pets/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // Server composable with auth context
  const pet = await getPetById(event, { petId: Number(id) })
  
  return pet
})
```

## 📖 Full Documentation

For comprehensive documentation, including examples, troubleshooting, and API reference:

- 🌐 **[Online Documentation](https://nuxt-openapi-hyperfetch.dev)** - Complete guide and API reference
- 📘 **[Getting Started Guide](./guide/getting-started.md)** - Detailed installation and setup
- 🎓 **[Core Concepts](./guide/core-concepts.md)** - Understanding the architecture
- 💡 **[Examples](./examples/)** - Real-world usage examples
- 🔧 **[Troubleshooting](./troubleshooting/)** - Common issues and solutions

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](./contributing/index.md) for details.

- 📝 [Code Style Guide](./contributing/code-style.md)
- 🧪 [Testing Guidelines](./contributing/testing.md)
- 🎯 [Roadmap](./contributing/roadmap.md)

## 📄 License

MIT License

## 🔗 Links

- [Documentation](https://nuxt-openapi-hyperfetch.dev)
- [GitHub Repository](https://github.com/your-org/nuxt-openapi-hyperfetch)
- [Issue Tracker](https://github.com/your-org/nuxt-openapi-hyperfetch/issues)

---

Made with ❤️ for the Nuxt community
