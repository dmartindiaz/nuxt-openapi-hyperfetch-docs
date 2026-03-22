# Examples

Practical examples showing how to use nuxt-openapi-hyperfetch in real-world applications.

## Composables Examples

Learn how to use the generated composables in your Vue components.

### Basic Usage

- [Simple GET Request →](/examples/composables/basic/simple-get) - Fetch data with useFetch
- [Path Parameters →](/examples/composables/basic/path-parameters) - Dynamic routes with parameters
- [Query Parameters →](/examples/composables/basic/query-parameters) - Filter and search with queries
- [POST Request →](/examples/composables/basic/post-request) - Create resources

### Callbacks

- [Success Navigation →](/examples/composables/callbacks/success-navigation) - Navigate after success
- [Error Toast →](/examples/composables/callbacks/error-toast) - Show error notifications
- [Loading Spinner →](/examples/composables/callbacks/loading-spinner) - Display loading state
- [Request Logging →](/examples/composables/callbacks/request-logging) - Log API calls

### Global Callbacks

- [Auth Token Refresh →](/examples/composables/global-callbacks/auth-token) - Handle token expiration
- [Global Error Handling →](/examples/composables/global-callbacks/error-handling) - Centralized error management
- [Analytics Tracking →](/examples/composables/global-callbacks/analytics) - Track API usage
- [Skip Patterns →](/examples/composables/global-callbacks/skip-patterns) - Conditionally skip callbacks

### Advanced Patterns

- [Authentication Flow →](/examples/composables/advanced/authentication-flow) - Login/logout flow
- [File Upload →](/examples/composables/advanced/file-upload) - Upload files with progress
- [Pagination →](/examples/composables/advanced/pagination) - Paginated lists
- [Caching Strategy →](/examples/composables/advanced/caching) - Optimize with caching

## Server Examples

Learn how to build BFF routes with the generated server utilities.

### Basic BFF Routes

- [Simple Route →](/examples/server/basic-bff/simple-route) - Basic backend-for-frontend route
- [With Authentication →](/examples/server/basic-bff/with-auth) - Protected BFF route

### Data Transformers

- [Add Permissions →](/examples/server/transformers/add-permissions) - Add canEdit/canDelete flags
- [Filter Sensitive Data →](/examples/server/transformers/filter-sensitive) - Remove internal fields
- [Combine Sources →](/examples/server/transformers/combine-sources) - Aggregate multiple APIs

### Authentication Patterns

- [JWT Verification →](/examples/server/auth-patterns/jwt-verification) - Verify JWT tokens
- [Role-Based Access →](/examples/server/auth-patterns/role-based) - Check user roles
- [Session-Based Auth →](/examples/server/auth-patterns/session-based) - Session authentication

## Quick Start

### 1. Generate Code

```bash
npx nxh generate -i swagger.yaml -o ./
```

### 2. Use in Component

```vue
<script setup lang="ts">
const { data: pets, loading, error } = await useFetchPets()
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="pet in pets" :key="pet.id">
      {{ pet.name }}
    </div>
  </div>
</template>
```

### 3. Create BFF Route

```typescript
// server/api/pets/index.get.ts
export default defineEventHandler(async (event) => {
  const user = await verifyAuth(event)
  const pets = await fetchPets()
  
  return pets.map(pet => ({
    ...pet,
    canEdit: pet.ownerId === user.id
  }))
})
```

## Example Projects

Complete example projects demonstrating different use cases:

- **Pet Store** - CRUD operations with authentication
- **E-commerce** - Product catalog with cart and checkout
- **Social Media** - Posts, comments, and user profiles
- **Dashboard** - Analytics dashboard with multiple data sources

## Next Steps

- [Composables Guide →](/composables/)
- [Server Routes Guide →](/server/)
- [API Reference →](/api/)
