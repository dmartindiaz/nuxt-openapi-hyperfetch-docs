# Release Process

How nuxt-openapi-hyperfetch versions and releases are managed.

## Versioning

We follow [Semantic Versioning](https://semver.org/) (SemVer):

```
MAJOR.MINOR.PATCH

1.2.3
│ │ │
│ │ └─ Patch: Bug fixes
│ └─── Minor: New features (backward compatible)
└───── Major: Breaking changes
```

### Version Types

**Patch (1.0.x)**
- Bug fixes
- Documentation updates
- Performance improvements
- No API changes

**Minor (1.x.0)**
- New features
- Backward compatible changes
- Deprecations (with warnings)

**Major (x.0.0)**
- Breaking changes
- Removed deprecated features
- API redesigns

## Release Schedule

### Regular Releases

- **Patch** - As needed for critical bugs
- **Minor** - Monthly (if new features available)
- **Major** - As needed (when breaking changes required)

### Release Candidates

Major versions go through RC phase:

```
1.0.0-rc.1  → First release candidate
1.0.0-rc.2  → Second release candidate
1.0.0       → Stable release
```

## Release Process

### 1. Preparation

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Ensure all tests pass
npm test

# Ensure build succeeds
npm run build

# Check for outstanding issues
# Review merged PRs since last release
```

### 2. Update Version

```bash
# Patch release (1.0.0 → 1.0.1)
npm version patch

# Minor release (1.0.0 → 1.1.0)
npm version minor

# Major release (1.0.0 → 2.0.0)
npm version major

# Release candidate (1.0.0 → 1.1.0-rc.1)
npm version preminor --preid=rc

# This automatically:
# - Updates package.json version
# - Creates git tag
# - Creates git commit
```

### 3. Update CHANGELOG

Update `CHANGELOG.md` with changes:

```markdown
# Changelog

## [1.2.0] - 2024-03-21

### Added
- Support for OpenAPI 3.1 specifications
- Global callback system for all composables
- Server composable generation mode

### Changed
- Improved type generation for union types
- Better error messages in CLI

### Fixed
- Handle missing operationId in operations
- Correct path parameter types

### Deprecated
- `--legacy` flag (will be removed in 2.0.0)

## [1.1.0] - 2024-02-15
...
```

### 4. Create GitHub Release

```bash
# Push tags
git push origin main --tags
```

On GitHub:

1. Go to **Releases** → **Draft a new release**
2. Choose tag (e.g., `v1.2.0`)
3. Title: `v1.2.0`
4. Description: Copy from CHANGELOG
5. Check **Set as latest release**
6. Click **Publish release**

### 5. Publish to npm

```bash
# Publish to npm
npm publish

# For release candidate
npm publish --tag next
```

### 6. Announce Release

- Tweet announcement
- Post in Discord
- Update documentation site
- Create discussion post

## Release Checklist

Before publishing:

- [ ] All tests pass
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] No uncommitted changes

After publishing:

- [ ] GitHub release created
- [ ] npm package published
- [ ] Announcement posted
- [ ] Documentation deployed

## Hotfix Process

For critical bugs in production:

```bash
# Create hotfix branch from tag
git checkout -b hotfix/1.2.1 v1.2.0

# Make fix
# ... commit changes ...

# Version bump
npm version patch

# Push
git push origin hotfix/1.2.1 --tags

# Create PR to main
# After merge, publish
npm publish
```

## Canary Releases

For testing unreleased features:

```bash
# Create canary version
npm version prerelease --preid=canary

# Publish with canary tag
npm publish --tag canary

# Users can install with:
# npm install nuxt-openapi-hyperfetch@canary
```

## Breaking Changes

When introducing breaking changes:

### 1. Document Changes

```markdown
## Migration Guide

### v2.0.0

#### Breaking Changes

**Changed default output directory**

Before:
\`\`\`bash
npx nxh generate -i swagger.yaml
# Output to ./composables
\`\`\`

After:
\`\`\`bash
npx nxh generate -i swagger.yaml
# Output to ./generated
\`\`\`

**Migration:**
\`\`\`bash
# Specify output directory explicitly
npx nxh generate -i swagger.yaml -o ./composables
\`\`\`
```

### 2. Deprecation Period

Before removing:

1. **Mark as deprecated** in minor version
2. **Add warning** in console
3. **Document alternative** in docs
4. **Remove** in next major version

```typescript
/**
 * @deprecated Use `generateComposables` instead. Will be removed in v2.0.0
 */
export function generate() {
  console.warn('Warning: generate() is deprecated, use generateComposables()')
  return generateComposables()
}
```

## Release Notes Template

```markdown
# v1.2.0

## 🎉 New Features

- **Global Callbacks**: Add global callbacks for all API requests (#234)
- **Server Mode**: Generate server composables for BFF pattern (#245)

## 🐛 Bug Fixes

- Fix handling of missing operationId (#256)
- Correct type generation for nullable fields (#267)

## 📚 Documentation

- Add server composables guide
- Update examples with callbacks
- Improve troubleshooting section

## 🔧 Maintenance

- Upgrade dependencies
- Improve test coverage to 85%

## Breaking Changes

None
```

## Post-Release

### Monitor

- **npm downloads** - Check adoption
- **GitHub issues** - Watch for bug reports
- **Community feedback** - Monitor discussions

### Hotfix If Needed

If critical bug found:

1. Create hotfix branch
2. Fix bug
3. Release patch version
4. Communicate to users

## Next Steps

- [Contributing →](/contributing/)
- [Roadmap →](/contributing/roadmap)
