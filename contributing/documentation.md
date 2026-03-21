# Documentation Guide

Standards for writing and maintaining documentation.

## Documentation Types

### 1. Code Documentation

- **JSDoc Comments** - Function and class documentation
- **Inline Comments** - Complex logic explanations
- **Type Definitions** - TypeScript types and interfaces

### 2. User Documentation

- **Guide** - Tutorial-style learning content
- **Reference** - API documentation
- **Examples** - Code samples and use cases
- **Troubleshooting** - Common issues and solutions

### 3. Contributor Documentation

- **Contributing Guide** - How to contribute
- **Architecture** - Design decisions
- **Development** - Setup and workflow

## Writing Style

### Voice and Tone

- **Clear and Concise** - Get to the point quickly
- **Active Voice** - "Generate composables" not "Composables are generated"
- **Second Person** - "You can use..." not "One can use..."
- **Present Tense** - "useFetch returns..." not "useFetch will return..."

### Examples

```markdown
✅ Good:
"Generate composables from your OpenAPI specification using the CLI."

❌ Bad:
"Composables can be generated from an OpenAPI specification that has been provided by utilizing the command-line interface tool."
```

## Documentation Structure

### Page Structure

Every documentation page should have:

1. **Title** - Clear, descriptive H1
2. **Introduction** - What this page covers (1-2 paragraphs)
3. **Main Content** - Organized with H2/H3 headings
4. **Examples** - Code samples throughout
5. **Next Steps** - Links to related pages

### Example Structure

```markdown
# Feature Name

Brief introduction explaining what this feature does and when to use it.

## Basic Usage

Simple example showing the most common use case.

\`\`\`typescript
// Code example
\`\`\`

## Advanced Usage

More complex examples showing additional features.

## Options

Reference table of available options.

## Examples

Real-world usage examples.

## Next Steps

- [Related Feature →](./related)
- [Examples →](./examples)
```

## Code Examples

### Complete and Runnable

```markdown
✅ Good - complete example:
\`\`\`vue
<script setup lang="ts">
import { useFetchPet } from '~/composables/pets'

const route = useRoute()
const { data: pet } = useFetchPet(() => Number(route.params.id))
</script>

<template>
  <div v-if="pet">
    <h1>{{ pet.name }}</h1>
  </div>
</template>
\`\`\`

❌ Bad - incomplete:
\`\`\`typescript
const { data } = useFetchPet(id)
\`\`\`
```

### Language Tags

Always specify language for syntax highlighting:

```markdown
\`\`\`typescript
// TypeScript code
\`\`\`

\`\`\`bash
# Shell commands
\`\`\`

\`\`\`yaml
# YAML configuration
\`\`\`
```

### Commented Code

Add comments to explain non-obvious code:

```typescript
// ✅ Good - explains WHY
// Retry with exponential backoff to avoid rate limiting
await retry(fetchData, { 
  delay: (attempt) => Math.pow(2, attempt) * 1000 
})

// ❌ Bad - explains WHAT (obvious from code)
// Call retry function with fetchData
await retry(fetchData)
```

## Markdown Conventions

### Headings

```markdown
# H1 - Page Title (one per page)

## H2 - Major sections

### H3 - Subsections

Don't skip levels (H1 → H3)
```

### Links

```markdown
// Internal links - relative paths
[Getting Started](./getting-started)
[Examples](/examples/)

// External links - full URLs
[Nuxt 3 Documentation](https://nuxt.com/docs)
```

### Lists

```markdown
// Unordered lists
- First item
- Second item
  - Nested item
  - Another nested item

// Ordered lists
1. First step
2. Second step
3. Third step
```

### Tables

```markdown
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | `number` | Yes | Pet ID |
| name | `string` | Yes | Pet name |
```

### Admonitions

```markdown
::: tip
Helpful tips and best practices
:::

::: warning
Important warnings
:::

::: danger
Critical information or deprecated features
:::
```

## API Documentation

### Function Documentation

```typescript
/**
 * Generate type-safe composables from OpenAPI specification
 * 
 * @param spec - Parsed OpenAPI specification
 * @param options - Generation options
 * @returns Generated file information
 * 
 * @example
 * ```ts
 * const spec = await parseOpenAPI('./swagger.yaml')
 * const files = await generateComposables(spec, {
 *   mode: 'client',
 *   outputDir: './composables'
 * })
 * ```
 */
export async function generateComposables(
  spec: ParsedSpec,
  options: GeneratorOptions
): Promise<GeneratedFiles> {
  // Implementation
}
```

### Interface Documentation

```typescript
/**
 * Options for generating composables
 */
export interface GeneratorOptions {
  /**
   * Generation mode
   * - `client` - Generate useFetch/useAsyncData composables
   * - `server` - Generate server composables for Nitro routes
   */
  mode: 'client' | 'server'
  
  /**
   * Output directory for generated files
   * @example './composables'
   */
  outputDir: string
  
  /**
   * Base URL for API requests (optional)
   * @example 'https://api.example.com'
   */
  baseUrl?: string
}
```

## Maintaining Documentation

### When to Update

Update documentation when:

- **Adding Features** - Document new functionality
- **Changing APIs** - Update affected pages
- **Fixing Bugs** - Update incorrect information
- **Deprecating** - Mark as deprecated and provide alternatives

### Documentation Checklist

- [ ] Code examples are correct and tested
- [ ] Links work and point to correct pages
- [ ] Spelling and grammar are correct
- [ ] Formatting is consistent
- [ ] Screenshots are up to date (if any)
- [ ] Version information is accurate

### Review Process

1. **Self-Review** - Check your own documentation
2. **Spell Check** - Run spell checker
3. **Link Check** - Verify all links work
4. **Build Check** - Ensure docs build without errors
5. **Peer Review** - Get feedback from others

## Tools

### Spell Checking

```bash
# Install
npm install -g cspell

# Run spell check
cspell "docs/**/*.md"
```

### Link Checking

```bash
# Install
npm install -g markdown-link-check

# Check links
markdown-link-check docs/**/*.md
```

### Build Documentation

```bash
# Build VitePress docs
npm run docs:build

# Preview built docs
npm run docs:preview
```

## Examples

### Good Documentation Example

```markdown
# useFetch

Generate a composable that uses Nuxt's `useFetch` for data fetching with SSR support.

## Basic Usage

```typescript
const { data: pet, pending, error } = useFetchPet(1)
\`\`\`

The composable automatically:
- Fetches data on component mount
- Works with SSR (Server-Side Rendering)
- Caches results automatically

## Reactive Parameters

Pass refs for reactive fetching:

\`\`\`typescript
const petId = ref(1)
const { data: pet } = useFetchPet(petId)

// Automatically refetches when petId changes
petId.value = 2
\`\`\`

## See Also

- [useAsyncData →](./useAsyncData) - Alternative with more control
- [Examples →](/examples/composables/basic/simple-get)
```

## Next Steps

- [Pull Request Guidelines →](/contributing/pull-requests)
- [Code Style →](/contributing/code-style)
