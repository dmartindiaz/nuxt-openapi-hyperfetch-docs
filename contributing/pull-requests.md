# Pull Request Guidelines

Guidelines for submitting pull requests to nuxt-openapi-hyperfetch.

## Before You Start

### Check Existing Work

- **Search Issues** - Check if issue already exists
- **Check PRs** - Look for related pull requests
- **Discuss First** - For large changes, create an issue first

### Fork and Branch

```bash
# Fork repository on GitHub

# Clone your fork
git clone https://github.com/dmartindiaz/nuxt-openapi-hyperfetch.git

# Create feature branch
git checkout -b feature/my-feature

# Or bugfix branch
git checkout -b fix/bug-description
```

## Branch Naming

Use descriptive branch names:

- **Features**: `feature/add-typescript-validation`
- **Bugs**: `fix/handle-missing-schema`
- **Docs**: `docs/update-contributing-guide`
- **Chore**: `chore/upgrade-dependencies`

## Making Changes

### Code Quality

- [ ] Follow [Code Style Guide](/contributing/code-style)
- [ ] Add TypeScript types
- [ ] Write clear, descriptive comments
- [ ] Remove commented code
- [ ] Remove debug console.logs

### Testing

- [ ] Write tests for new features
- [ ] Update tests for modified features
- [ ] Ensure all tests pass: `npm test`
- [ ] Check test coverage: `npm run test:coverage`

### Documentation

- [ ] Update relevant documentation
- [ ] Add JSDoc comments
- [ ] Include usage examples
- [ ] Update CHANGELOG.md

## Commit Messages

### Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(generator): add support for oneOf schemas"

# Bug fix
git commit -m "fix(parser): handle missing operationId"

# Documentation
git commit -m "docs(guide): add server composables examples"

# Breaking change
git commit -m "feat(cli): change default output directory

BREAKING CHANGE: default output is now ./generated instead of ./composables"
```

## Pull Request Process

### 1. Create PR

**Title Format:**
```
<type>: <description>

Examples:
feat: add support for OpenAPI 3.1
fix: handle empty response schemas
docs: update installation guide
```

**Description Template:**

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Fixes #123
Related to #456

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added
- [ ] All tests passing
```

### 2. CI Checks

Your PR must pass all CI checks:

- ✅ **Linting** - ESLint passes
- ✅ **Type Checking** - TypeScript compiles
- ✅ **Tests** - All tests pass
- ✅ **Build** - Project builds successfully
- ✅ **Coverage** - Coverage targets met

### 3. Code Review

**Responding to Reviews:**

- Address all comments
- Don't take feedback personally
- Ask questions if unclear
- Update code based on feedback
- Mark conversations as resolved

**Making Changes:**

```bash
# Make requested changes
git add .
git commit -m "fix: address review comments"
git push origin feature/my-feature
```

### 4. Merge

Once approved:

- PR will be merged by maintainer
- Branch will be deleted automatically
- You'll be added to contributors

## PR Size

### Keep PRs Small

- **Focused** - One feature/fix per PR
- **Reviewable** - < 500 lines changed preferred
- **Logical** - Cohesive set of changes

### Large Changes

If change is large:

1. **Split into Multiple PRs** - Create series of smaller PRs
2. **Create Draft PR** - Get early feedback
3. **Document Plan** - Explain approach in issue first

## Examples

### Good PR Example

```markdown
feat: add support for callbacks in generated composables

## Description
Adds `onRequest`, `onSuccess`, `onError`, and `onFinish` callbacks to generated composables.

## Type of Change
- [x] New feature

## Related Issues
Fixes #234
Related to #189

## Changes Made
- Added callback interfaces to types
- Updated composable generator to include callbacks
- Added tests for callback execution
- Updated documentation with callback examples

## Testing
- [x] Unit tests added for callback system
- [x] Integration tests updated
- [x] Manual testing in example project

## Breaking Changes
None - this is a backward-compatible addition.
```

### Good Commit History

```bash
feat: add callback interfaces
feat: generate callback code in composables
test: add callback execution tests
docs: add callback examples to guide
```

## Review Timeline

- **Initial Review** - Within 48 hours
- **Follow-up** - Within 24 hours of updates
- **Merge** - After approval and passing CI

## Getting Help

If you need help with your PR:

- **Comment on PR** - Ask questions in PR comments
- **Tag Maintainer** - `@maintainer` in comments
- **Discord** - Ask in #contributors channel
- **Issue** - Create separate issue for discussion

## After Merge

### Update Local Fork

```bash
# Switch to main
git checkout main

# Fetch upstream
git fetch upstream

# Merge upstream main
git merge upstream/main

# Push to your fork
git push origin main

# Delete feature branch
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

### Celebrate

Your contribution is now part of nuxt-openapi-hyperfetch! Thank you! 🎉

## Next Steps

- [Code Style →](/contributing/code-style)
- [Testing →](/contributing/testing)
- [Documentation →](/contributing/documentation)
