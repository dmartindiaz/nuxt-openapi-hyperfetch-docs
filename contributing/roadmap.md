# Roadmap

Future plans and features for nuxt-openapi-hyperfetch.

## Current Status (2026)

**v1.0.0** - Production-ready with core features

The project is currently stable and production-ready. We've successfully implemented:

- ✅ Type-safe composables generation from OpenAPI specs
- ✅ `useFetch` and `useAsyncData` generators
- ✅ Server composables for Nitro
- ✅ Global and per-request callbacks
- ✅ Data transformation with `pick` and `transform`
- ✅ Configuration file support (`nxh.config.js`)
- ✅ CLI with comprehensive options
- ✅ Tag filtering and mode selection

## Upcoming Features

The following features are planned for implementation throughout 2026. Each phase builds upon the previous, creating a comprehensive solution for API-driven applications.

### Phase 1: TanStack Query Integration
**Coming Soon - Q2 2026**

Integrate **TanStack Vue Query** to provide advanced data fetching capabilities:

- [ ] Replace current fetch implementation with TanStack Query
- [ ] Automatic caching with intelligent cache invalidation
- [ ] Background refetching and stale-while-revalidate pattern
- [ ] Optimistic updates and rollback support
- [ ] Query deduplication and request batching
- [ ] Infinite queries for pagination
- [ ] Prefetching utilities
- [ ] DevTools integration for debugging

**Benefits:**
- Superior caching and performance
- Better developer experience with DevTools
- Industry-standard solution for data fetching
- Reduced boilerplate for common patterns

### Phase 2: Full Nuxt Module
**Coming Soon - Q3 2026**

Transform the CLI tool into a **complete Nuxt module** with first-class integration:

- [ ] Nuxt module with hooks and lifecycle integration
- [ ] Configuration via `nuxt.config.ts`
- [ ] Auto-import generated composables
- [ ] **Automatic regeneration on OpenAPI file changes**
- [ ] Hot module replacement (HMR) during development
- [ ] TypeScript types auto-generated and imported
- [ ] Build-time optimization and tree-shaking
- [ ] SSR and SSG compatibility

**Configuration Example:**
```typescript
export default defineNuxtConfig({
  modules: ['nuxt-openapi-hyperfetch'],
  
  openapiHyperfetch: {
    spec: './swagger.yaml',
    output: './composables/api',
    baseURL: process.env.API_BASE_URL,
    generators: ['useFetch', 'useAsyncData'],
    watch: true  // Auto-regenerate on spec changes
  }
})
```

**Benefits:**
- Zero configuration needed - just install and configure
- Automatic updates when API changes
- Full TypeScript IntelliSense
- Seamless Nuxt ecosystem integration

### Phase 3: Reusable CRUD Components
**Coming Soon - Q4 2026**

Create **plug-and-play UI components** for common CRUD operations using **Nuxt UI**:

- [ ] `<ApiTable>` - Auto-generated data tables
- [ ] `<ApiForm>` - Forms for POST/PUT operations
- [ ] `<ApiModal>` - Modals for create/edit/delete
- [ ] `<ApiDetail>` - Detail views for single resources
- [ ] Full Nuxt UI integration (design system)
- [ ] Customizable columns, filters, and sorting
- [ ] Validation based on OpenAPI schemas
- [ ] Pagination and infinite scroll support
- [ ] Search and filtering utilities

**Usage Example:**
```vue
<template>
  <ApiTable
    :fetch="useFetchGetPets"
    :columns="['id', 'name', 'status']"
    :actions="{ edit: true, delete: true }"
    @edit="handleEdit"
    @delete="handleDelete"
  />
  
  <ApiForm
    :submit="useFetchCreatePet"
    :schema="petSchema"
    @success="handleSuccess"
  />
</template>
```

**Benefits:**
- Build admin panels in minutes
- Consistent UI/UX across application
- Automatic validation and error handling
- Fully typed with IntelliSense

### Phase 4: Auto-Generated Vue Pages
**Coming Soon - Early 2027**

Generate **complete `.vue` pages** directly from OpenAPI endpoints:

- [ ] List pages with tables and filters
- [ ] Detail pages for individual resources
- [ ] Create/edit pages with forms
- [ ] Delete confirmations and actions
- [ ] Routing configuration included
- [ ] Navigation breadcrumbs
- [ ] Permission-based rendering
- [ ] Responsive layouts out of the box

**Generated Structure:**
```
pages/
  pets/
    index.vue          # List all pets
    [id].vue           # Pet detail view
    create.vue         # Create new pet
    [id]/edit.vue      # Edit existing pet
```

**Benefits:**
- Instant CRUD interfaces without writing code
- Customizable templates
- Production-ready pages
- Consistent structure across resources

### Phase 5: Complete Admin Dashboard
**Coming Soon - Mid 2027**

Generate a **full-featured admin panel** from OpenAPI documentation:

- [ ] Complete application with navigation menu
- [ ] Dashboard with statistics and charts
- [ ] All CRUD pages auto-generated
- [ ] User authentication and authorization
- [ ] Dark mode and theme customization
- [ ] Responsive sidebar navigation
- [ ] Search across all resources
- [ ] Activity logs and audit trails
- [ ] Multi-language support (i18n)
- [ ] Deployment-ready application

**Generated Application Features:**
- Navigation automatically built from OpenAPI tags
- Search bar with global resource search
- User profile and settings pages
- Notifications and alerts system
- Role-based access control (RBAC)
- API documentation viewer
- Export data to CSV/Excel
- Customizable branding

**Benefits:**
- Zero-to-production admin panel instantly
- Enterprise-grade features included
- Fully customizable and extensible
- Reduces development time by 90%+

## Timeline Summary

| Phase | Focus | Quarter |
|-------|-------|---------|
| **Phase 1** | TanStack Query Integration | Q2 2026 |
| **Phase 2** | Full Nuxt Module | Q3 2026 |
| **Phase 3** | Reusable CRUD Components | Q4 2026 |
| **Phase 4** | Auto-Generated Pages | Early 2027 |
| **Phase 5** | Complete Admin Dashboard | Mid 2027 |

## Vision

Our ultimate goal is to **eliminate repetitive API integration work**. By providing a complete solution from OpenAPI spec to production-ready admin panel, developers can:

1. **Define once** - Write your API in OpenAPI
2. **Generate everything** - Composables, types, components, pages, and apps
3. **Customize freely** - Override any generated code
4. **Deploy fast** - Production-ready in minutes

We're building the **most comprehensive OpenAPI-to-Nuxt solution** available.

## Contributing to Roadmap

Have ideas for the roadmap? We welcome community input!

1. **Check Existing Issues** - See if already discussed
2. **Create Discussion** - Start discussion in GitHub Discussions
3. **Upvote Features** - 👍 features you want
4. **Submit Proposal** - Detailed feature proposal in issue

### Feature Proposal Template

```markdown
## Feature Name

### Problem
What problem does this solve?

### Solution
How would this feature work?

### Alternatives
What alternatives exist?

### Use Cases
Who would use this? When?

### Implementation
(Optional) Implementation ideas
```

## Stay Updated

- **GitHub Discussions** - Join conversations about future features
- **GitHub Issues** - Track feature requests and bug reports
- **Release Notes** - Follow releases for updates on progress

The roadmap is a living document and may change based on community feedback and project priorities.
| v2.0.0 | Major Update | January 2025 |

### Support Policy

- **Latest Major** - Full support
- **Previous Major** - Security fixes for 1 year
- **Older Versions** - No support

## Experimental Features

Features in development:

### Code Generation Plugins

Allow custom transformations:

```typescript
// nuxt-openapi-hyperfetch.config.ts
export default {
  plugins: [
    {
      name: 'add-analytics',
      transform: (code) => {
        // Add analytics to all composables
        return addAnalytics(code)
      }
    }
  ]
}
```

### Smart Defaults

Detect common patterns:

```typescript
// Auto-detect pagination patterns
GET /pets?page=1&limit=10 → useFetchPets({ pagination: true })

// Auto-detect search patterns
GET /pets?search=fluffy → useFetchPets({ search: true })
```

## Staying Updated

- **GitHub Releases** - Watch releases
- **Discussions** - Follow announcements
- **Discord** - Join #announcements
- **Twitter** - Follow @nuxt_generator

## Feedback

We want to hear from you:

- 💡 Feature ideas
- 🐛 Bug reports
- 📚 Documentation improvements
- 🎯 Use cases we haven't considered

Create issue or discussion on GitHub!

## Next Steps

- [Contributing →](/contributing/)
- [Development →](/contributing/development)
- [GitHub Issues](https://github.com/dmartindiaz/nuxt-openapi-hyperfetch/issues)
