# Development Setup

Set up your local development environment for contributing to nuxt-openapi-hyperfetch.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** 2.0 or higher
- **TypeScript** knowledge
- **VSCode** (recommended) or other editor

## Initial Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/dmartindiaz/nuxt-openapi-hyperfetch.git
cd nuxt-openapi-hyperfetch

# Add upstream remote
git remote add upstream https://github.com/dmartindiaz/nuxt-openapi-hyperfetch.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Project

```bash
npm run build
```

## Project Structure

```
nuxt-openapi-hyperfetch/
├── src/              # Source code
│   ├── cli/         # CLI implementation
│   ├── parser/      # OpenAPI parser
│   ├── generator/   # Code generator
│   └── templates/   # Generation templates
├── test/            # Tests
│   ├── unit/        # Unit tests
│   ├── integration/ # Integration tests
│   └── fixtures/    # Test fixtures
├── docs/            # Documentation
├── examples/        # Example projects
└── package.json
```

## Development Commands

### Build

```bash
# Build project
npm run build

# Build in watch mode
npm run dev

# Clean build artifacts
npm run clean
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.spec.ts

# Run with coverage
npm run test:coverage
```

### Linting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### Generate

```bash
# Test generation locally
npm run generate -- -i test/fixtures/petstore.yaml -o ./output

# Test server mode
echo nuxtServer | npm run generate -- -i test/fixtures/petstore.yaml -o ./output
```

## VSCode Setup

### Recommended Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Language support
- **GitLens** - Git integration
- **Vitest** - Test runner

### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n"
}
```

## Debugging

### VSCode Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI",
      "program": "${workspaceFolder}/src/cli/index.ts",
      "args": [
        "generate",
        "-i", "test/fixtures/petstore.yaml",
        "-o", "./output"
      ],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Testing Changes

### 1. Unit Tests

Add tests for new features:

```typescript
// test/unit/parser.spec.ts
import { describe, it, expect } from 'vitest'
import { parseOpenAPI } from '~/src/parser'

describe('parseOpenAPI', () => {
  it('should parse valid OpenAPI spec', async () => {
    const spec = await parseOpenAPI('./test/fixtures/petstore.yaml')
    expect(spec.openapi).toBe('3.0.0')
  })
})
```

### 2. Integration Tests

Test end-to-end generation:

```typescript
// test/integration/generate.spec.ts
import { describe, it, expect } from 'vitest'
import { generateComposables } from '~/src/generator'

describe('generateComposables', () => {
  it('should generate composables', async () => {
    const files = await generateComposables(spec, {
      mode: 'client',
      outputDir: './tmp'
    })
    expect(files.length).toBeGreaterThan(0)
  })
})
```

### 3. Manual Testing

Test with real project:

```bash
# Link package locally
npm link

# In test project
cd ../test-nuxt-app
npm link nuxt-openapi-hyperfetch

# Generate
npx nuxt-openapi-hyperfetch generate -i swagger.yaml -o ./composables
```

## Keeping Up to Date

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## Common Issues

### Node Version

```bash
# Check Node version
node --version

# Use nvm to switch versions
nvm use 18
```

### Dependencies Out of Sync

```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm run build
```

## Next Steps

- [Code Style →](/contributing/code-style)
- [Testing →](/contributing/testing)
- [Pull Requests →](/contributing/pull-requests)
