# Troubleshooting

Common issues and solutions when using nuxt-openapi-hyperfetch.

## Quick Diagnosis

### Generation Issues

- **CLI won't run** → [Build Issues](/troubleshooting/build-issues)
- **OpenAPI parsing fails** → [Generation Errors](/troubleshooting/generation-errors)
- **Generated code has errors** → [Type Errors](/troubleshooting/type-errors)

### Runtime Issues

- **Composables not working** → [Composables Issues](/troubleshooting/composables-issues)
- **Server errors** → [Server Issues](/troubleshooting/server-issues)
- **API calls failing** → [Runtime Errors](/troubleshooting/runtime-errors)

### Performance Issues

- **Slow generation** → [Performance](/troubleshooting/performance)
- **Large bundle size** → [Performance](/troubleshooting/performance)

## Common Problems

### 1. CLI Command Not Found

```bash
nxh: command not found
```

**Solution:**

```bash
# Install globally
npm install -g nuxt-openapi-hyperfetch

# Or use npx
npx nuxt-openapi-hyperfetch generate -i swagger.yaml
```

### 2. Generation Fails

```bash
Error: Failed to parse OpenAPI specification
```

**Solution:**
- Validate your OpenAPI spec: [Generation Errors](/troubleshooting/generation-errors)
- Check file path is correct
- Ensure spec is valid OpenAPI 3.0

### 3. TypeScript Errors

```typescript
Type 'unknown' is not assignable to type 'Pet'
```

**Solution:**
- Regenerate types after spec changes
- Check [Type Errors](/troubleshooting/type-errors)

### 4. Composables Not Found

```typescript
Cannot find module '~/composables/pets'
```

**Solution:**
- Ensure generation completed successfully
- Check output directory matches import path
- Restart Nuxt dev server

### 5. API Calls Fail

```bash
404 Not Found
CORS error
```

**Solution:**
- Configure correct `baseURL`
- Check [Runtime Errors](/troubleshooting/runtime-errors)
- Verify API endpoint is accessible

## By Category

### Generation & Build

| Issue | Guide |
|-------|-------|
| OpenAPI parsing errors | [Generation Errors](/troubleshooting/generation-errors) |
| TypeScript compilation fails | [Type Errors](/troubleshooting/type-errors) |
| Build failures | [Build Issues](/troubleshooting/build-issues) |
| Slow generation | [Performance](/troubleshooting/performance) |

### Client Composables

| Issue | Guide |
|-------|-------|
| useFetch not working | [Composables Issues](/troubleshooting/composables-issues) |
| Type errors in components | [Composables Issues](/troubleshooting/composables-issues) |
| Data not reactive | [Composables Issues](/troubleshooting/composables-issues) |
| Callbacks not firing | [Composables Issues](/troubleshooting/composables-issues) |

### Server Composables

| Issue | Guide |
|-------|-------|
| H3Event errors | [Server Issues](/troubleshooting/server-issues) |
| Auth not working | [Server Issues](/troubleshooting/server-issues) |
| Headers not forwarded | [Server Issues](/troubleshooting/server-issues) |
| Server errors | [Server Issues](/troubleshooting/server-issues) |

### Runtime

| Issue | Guide |
|-------|-------|
| Network errors | [Runtime Errors](/troubleshooting/runtime-errors) |
| CORS issues | [Runtime Errors](/troubleshooting/runtime-errors) |
| 401/403 errors | [Runtime Errors](/troubleshooting/runtime-errors) |
| Timeout errors | [Runtime Errors](/troubleshooting/runtime-errors) |

## Getting Help

If you can't find a solution:

1. **Search Issues** - Check [GitHub Issues](https://github.com/dmartindiaz/nuxt-openapi-hyperfetch/issues)
2. **Ask Community** - Post in [GitHub Discussions](https://github.com/dmartindiaz/nuxt-openapi-hyperfetch/discussions)
3. **Join Discord** - Get help in #support channel
4. **Create Issue** - Report bug with reproduction

### Creating a Good Bug Report

Include:

```markdown
**Environment:**
- OS: Windows 11
- Node: v20.10.0
- nuxt-openapi-hyperfetch: v1.2.0
- Nuxt: v3.10.0

**OpenAPI Spec:**
```yaml
# Minimal spec that reproduces issue
```

**Steps to Reproduce:**
1. Run `nxh generate -i spec.yaml`
2. Import generated composable
3. See error

**Expected:**
Should generate valid composable

**Actual:**
Error: ...

**Error Output:**
```

## Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=nxh:* nxh generate -i swagger.yaml

# Or use verbose flag (if available)
nxh generate -i swagger.yaml --verbose
```

## Next Steps

Choose your issue category:

- [Generation Errors →](/troubleshooting/generation-errors)
- [Composables Issues →](/troubleshooting/composables-issues)
- [Server Issues →](/troubleshooting/server-issues)
- [Type Errors →](/troubleshooting/type-errors)
- [Build Issues →](/troubleshooting/build-issues)
- [Runtime Errors →](/troubleshooting/runtime-errors)
- [Performance →](/troubleshooting/performance)
