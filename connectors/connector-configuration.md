---
title: Connector Configuration
description: Advanced configuration for connectors (manual/hybrid), custom resources, and operation overrides.
---

# Connector Configuration

This page documents the real connector configuration supported by the current codebase.

## Where You Can Configure It

You can configure connectors in:

- `nxh.config.ts` (CLI)
- `nuxt.config.ts` under `openApiHyperFetch` (Nuxt module)

Both use the same shared config contract.

## Supported Shape

Current connector config supports only these keys:

- `enabled?: boolean`
- `strategy?: 'manual' | 'hybrid'`
- `resources?: Record<string, { operations?: Partial<Record<'getAll' | 'get' | 'create' | 'update' | 'delete', { operationId?: string; path?: string }>> }>`

Important:

- For each operation, you can define `operationId` or `path`.
- Defining both is invalid.
- Defining neither is invalid.

## How Connectors Are Considered "Requested"

Connectors generation is considered requested if any of these is true:

- `createUseAsyncDataConnectors === true`
- `generators` includes `'connectors'`
- `connectors` has meaningful config (`enabled: true`, or `strategy`, or non-empty `resources`)

When connectors are requested, `useAsyncData` is enforced in the internal generator selection.

## Strategy Behavior

## `hybrid`

`hybrid` is the default strategy.

Behavior:

- Start from inferred resources (from OpenAPI analysis).
- Apply user overrides for matching resources.
- Add custom resources that do not exist in inferred set.
- Partial overrides are allowed (for example only `getAll` and `get`).

## `manual`

Behavior:

- Generate only resources declared by the user.
- No automatic inferred resources are included unless explicitly declared.
- Partial operation definitions are allowed.

## Operation Resolution Rules

When resolving each configured operation:

1. If both `operationId` and `path` are provided, generation fails.
2. If neither is provided, generation fails.
3. If `operationId` is provided, it must exist in the OpenAPI operation index.
4. If `path` is provided, at least one endpoint must exist for that path with compatible HTTP method:
   - `getAll` -> `GET`
   - `get` -> `GET`
   - `create` -> `POST`
   - `update` -> `PUT` or `PATCH`
   - `delete` -> `DELETE`
5. For ambiguous path matches, resolver prioritizes by intent:
   - `getAll`: prefer endpoint with `list` intent
   - `get`: prefer endpoint with `detail` intent
   - `update`: prefer `PUT` over `PATCH`

## Real Example: `hybrid` with Petstore Operations

This example uses real Petstore operationIds (`findPetsByStatus`, `getPetById`, `addPet`, `updatePet`, `deletePet`, `findPetsByTags`).

```ts
// nxh.config.ts
import type { GeneratorConfig } from 'nuxt-openapi-hyperfetch'

const config: GeneratorConfig = {
  input: './swagger.yaml',
  output: './composables/api',
  generators: ['useAsyncData', 'connectors'],
  connectors: {
    strategy: 'hybrid',
    resources: {
      pets: {
        operations: {
          getAll: { operationId: 'findPetsByStatus' },
          get: { operationId: 'getPetById' },
          create: { operationId: 'addPet' },
          update: { operationId: 'updatePet' },
          delete: { operationId: 'deletePet' }
        }
      },
      featuredPets: {
        operations: {
          getAll: { operationId: 'findPetsByTags' },
          get: { path: '/pet/{petId}' }
        }
      }
    }
  }
}

export default config
```

What happens:

- `pets` overrides inferred mapping with your explicit operations.
- `featuredPets` is generated as a custom resource.
- Any non-overridden operations in existing inferred resources remain as inferred in `hybrid` mode.

## Real Example: `manual` (partial operations)

```ts
// nxh.config.ts
import type { GeneratorConfig } from 'nuxt-openapi-hyperfetch'

const config: GeneratorConfig = {
  input: './swagger.yaml',
  output: './composables/api',
  connectors: {
    strategy: 'manual',
    resources: {
      pets: {
        operations: {
          getAll: { operationId: 'findPetsByStatus' },
          get: { path: '/pet/{petId}' }
        }
      }
    }
  }
}

export default config
```

What happens:

- Only `pets` is generated.
- Only configured operations are overridden/defined.
- Partial CRUD is valid.

## Nuxt Module Example (same contract)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-openapi-hyperfetch'],
  openApiHyperFetch: {
    input: './swagger.yaml',
    output: './composables/api',
    connectors: {
      strategy: 'hybrid',
      resources: {
        pets: {
          operations: {
            getAll: { operationId: 'findPetsByStatus' },
            get: { operationId: 'getPetById' }
          }
        }
      }
    }
  }
})
```

## Backward Compatibility

The legacy switch `createUseAsyncDataConnectors` is still supported.

- If `true`, connectors are generated.
- If advanced `connectors` config is present, connectors are also generated and that config is passed to the resolver.

## Validation Errors You Should Expect

Generation fails with explicit errors when config is invalid, including:

- both `operationId` and `path` defined for the same operation
- missing both `operationId` and `path`
- unknown `operationId`
- unknown `path`
- path exists but has no compatible HTTP method for the configured operation

These checks are enforced during connector resource map resolution before file generation starts.
