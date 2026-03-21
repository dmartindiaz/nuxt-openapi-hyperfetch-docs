# Build Issues

Solutions for build, dependency, and configuration problems.

## Installation Issues

### Package Not Found

```bash
npm install nuxt-openapi-hyperfetch
npm ERR! 404 Not Found
```

**Cause:** Package not published or wrong name

**Solution:**

```bash
# Check exact package name
npm search nuxt-openapi

# Or install from git
npm install github:dmartindiaz/nuxt-openapi-hyperfetch

# Or install locally
cd /path/to/nuxt-openapi-hyperfetch
npm link
cd /path/to/your-project
npm link nuxt-openapi-hyperfetch
```

### Peer Dependency Errors

```bash
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! peer nuxt@"^3.0.0" from nuxt-openapi-hyperfetch
```

**Cause:** Incompatible Nuxt version

**Solution:**

```bash
# Update Nuxt to compatible version
npm install nuxt@^3.0.0

# Or use --legacy-peer-deps
npm install --legacy-peer-deps

# Or use --force (not recommended)
npm install --force
```

### Node Version Error

```bash
error nuxt-openapi-hyperfetch@1.0.0: The engine "node" is incompatible
```

**Cause:** Wrong Node.js version

**Solution:**

```bash
# Check required version
cat package.json | grep -A2 engines

# Install correct Node version
nvm install 20
nvm use 20

# Or with volta
volta install node@20
```

## Build Errors

### TypeScript Compilation Failed

```bash
npm run build
TS2307: Cannot find module './generated/pets'
```

**Cause:** Generated files missing or wrong path

**Solution:**

```bash
# 1. Generate composables first
nxh generate -i swagger.yaml -o ./composables

# 2. Check files exist
ls composables/

# 3. Build again
npm run build
```

### Module Resolution Error

```bash
Cannot find module '@/composables/pets'
```

**Cause:** Path alias not configured

**Solution:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  alias: {
    '@': '.',
    '~': '.'
  }
})

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./*"],
      "@/*": ["./*"]
    }
  }
}
```

### Type Declaration Error

```bash
TS2688: Cannot find type definition file for 'node'
```

**Cause:** Missing type declarations

**Solution:**

```bash
# Install type declarations
npm install --save-dev @types/node

# For Nuxt types
npm install --save-dev @nuxt/types
```

## Runtime Build Errors

### Nitro Build Failed

```bash
[nitro] Error: Cannot resolve server/composables/pets
```

**Cause:** Server composables not generated

**Solution:**

```bash
# Generate server composables
echo nuxtServer | nxh generate -i swagger.yaml -o ./server/composables

# Verify files exist
ls server/composables/

# Rebuild
npm run build
```

### Import Analysis Failed

```bash
Error: Failed to analyze server/api/pets.ts
```

**Cause:** Syntax error or wrong import

**Solution:**

```typescript
// ❌ Bad - wrong import
import { getServerPet } from '~/server/composables/pets'

// ✅ Good - relative import for server
import { getServerPet } from '../composables/pets'
```

### Rollup Error

```bash
[rollup]: Could not resolve './pets' from composables/index.ts
```

**Cause:** File not found or wrong extension

**Solution:**

```typescript
// ❌ Bad - missing extension
export * from './pets'

// ✅ Good - with extension
export * from './pets.ts'

// Or let Nuxt auto-import
// Don't manually export from index
```

## Dependency Issues

### Conflicting Dependencies

```bash
npm ERR! Cannot read properties of null (reading 'get')
```

**Cause:** Corrupted node_modules

**Solution:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or with pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Or with yarn
rm -rf node_modules yarn.lock
yarn install
```

### Missing Dependencies

```bash
Error: Cannot find module 'h3'
```

**Cause:** Dependencies not installed

**Solution:**

```bash
# Install all dependencies
npm install

# Or install specific dependency
npm install h3

# Check package.json includes it
cat package.json | grep h3
```

### Version Conflicts

```bash
npm WARN ERESOLVE overriding peer dependency
```

**Cause:** Multiple versions of same package

**Solution:**

```bash
# Check what's conflicting
npm ls <package-name>

# Use resolutions (package.json)
{
  "overrides": {
    "h3": "^1.10.0"
  }
}

# Or with pnpm (pnpm.overrides)
{
  "pnpm": {
    "overrides": {
      "h3": "^1.10.0"
    }
  }
}
```

## Configuration Issues

### Nuxt Config Error

```bash
Error: Invalid nuxt.config.ts
```

**Cause:** Syntax error in config

**Solution:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ❌ Bad - trailing comma on last property
  modules: [
    '@nuxt/devtools',
  ],
})

// ✅ Good - valid syntax
export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools'
  ],
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL
    }
  }
})
```

### Runtime Config Not Loaded

```bash
Cannot read properties of undefined (reading 'apiBase')
```

**Cause:** Runtime config not properly configured

**Solution:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8080'  // ✅ Default value
    }
  }
})

// .env
API_BASE_URL=https://api.production.com

// Use in code
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
```

### TypeScript Config Issues

```bash
TS2307: Cannot find module or its corresponding type declarations
```

**Cause:** TypeScript config incomplete

**Solution:**

```json
// tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "types": ["@nuxt/types", "@types/node"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

## Memory Issues

### JavaScript Heap Out of Memory

```bash
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Cause:** Build requires more memory

**Solution:**

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or add to package.json scripts
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' nuxt build"
  }
}

# Windows PowerShell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## Cache Issues

### Stale Build Cache

```bash
# Build uses old generated files
```

**Cause:** Build cache not cleared

**Solution:**

```bash
# Clear Nuxt cache
rm -rf .nuxt .output

# Rebuild
npm run build

# Or use nuxt cleanup
npx nuxt cleanup
```

### Module Resolution Cache

```bash
# Changes not reflected in build
```

**Cause:** Node module cache

**Solution:**

```bash
# Clear node cache
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

## Production Build Issues

### Build Succeeds but Runtime Fails

```bash
# Development works, production fails
```

**Cause:** Environment differences

**Solution:**

```typescript
// Check environment-specific code
const isDev = process.dev

// ❌ Bad - only works in dev
if (isDev) {
  console.log('Debug info')
}

// ✅ Good - works in both
if (process.env.DEBUG) {
  console.log('Debug info')
}
```

### Missing Environment Variables

```bash
Error: NUXT_PUBLIC_API_BASE is not defined
```

**Cause:** Environment variables not set in production

**Solution:**

```bash
# .env.production
NUXT_PUBLIC_API_BASE=https://api.production.com

# Or set in deployment platform
# Vercel/Netlify/etc: Add environment variables in dashboard

# nuxt.config.ts - provide defaults
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080'
    }
  }
})
```

### Tree Shaking Issues

```bash
# Bundle size too large
```

**Cause:** Unused code not removed

**Solution:**

```typescript
// Use named imports
// ❌ Bad - imports everything
import * as utils from './utils'

// ✅ Good - tree-shakeable
import { specificFunction } from './utils'

// nuxt.config.ts - enable optimizations
export default defineNuxtConfig({
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
})
```

## Debugging Build

### Enable Verbose Logging

```bash
# Nuxt verbose mode
npm run build -- --verbose

# Or debug mode
DEBUG=nuxt:* npm run build
```

### Check Build Output

```bash
# Analyze bundle
npm run build
npx nuxi analyze

# Check output directory
ls -lah .output/
```

### Validate Generated Files

```bash
# Check generated composables
cat composables/pets.ts

# Look for syntax errors
npx tsc --noEmit composables/*.ts
```

## Common Fixes

### 1. Clean Reinstall

```bash
rm -rf node_modules package-lock.json .nuxt .output
npm install
npm run build
```

### 2. Update Dependencies

```bash
# Update Nuxt
npm install nuxt@latest

# Update all dependencies
npm update

# Check for major updates
npx npm-check-updates
```

### 3. Check Node Version

```bash
# Check current version
node --version

# Use LTS version
nvm install --lts
nvm use --lts
```

## Next Steps

- [Type Errors →](/troubleshooting/type-errors)
- [Runtime Errors →](/troubleshooting/runtime-errors)
- [Nuxt Deployment Docs](https://nuxt.com/docs/getting-started/deployment)
