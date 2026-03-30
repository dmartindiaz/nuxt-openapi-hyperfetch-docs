# How connectors detect endpoints

When the generator reads your OpenAPI spec, it maps each endpoint to one of five intents: **list**, **detail**, **create**, **update**, **delete**. Each connector gets exactly one endpoint per intent — the best match from the spec.

Understanding this lets you structure your spec so the generator picks the right endpoints without any additional configuration.

---

## Detection rules

Detection is based on the HTTP method and path shape — no naming conventions required.

| Intent | HTTP method | Path shape | Response shape |
|---|---|---|---|
| `list` | `GET` | any (no `{id}` at the end) | array or paginated object |
| `detail` | `GET` | ends with `/{id}` or similar path param | single object |
| `create` | `POST` | any (no path param at the end) | any |
| `update` | `PUT` or `PATCH` | any | any |
| `delete` | `DELETE` | any | any |

The response body determines whether a GET is a list or detail:
- If the 2xx response schema is `type: array` (or has `items`) → **list**
- If the path ends with a path parameter → **detail**
- Otherwise → **list** (assumed to be a paginated envelope like `{ data: [], total: n }`)

---

## When there are multiple candidates for the same intent

Your spec may have more than one GET endpoint that returns an array for the same resource. The generator picks the **simplest** one:

1. Fewest path parameters first
2. Shortest path as tiebreaker

**Example:**

```yaml
# Both return Pet[] — both detect as 'list'
GET /pet/findByStatus   # 0 path params, 16 chars → picked
GET /pet/findByTags     # 0 path params, 15 chars → picked if shorter (in practice: depends on exact length)
GET /users/{id}/pets    # 1 path param → deprioritized
```

The winner is the endpoint that requires the least context to call — typically the flat root collection endpoint.

---

## Ideal spec structure for full connector support

For a connector to have all five sub-connectors, you need at least one endpoint per intent under the same tag. This is the recommended structure:

```yaml
paths:
  /pets:
    get:
      tags: [pet]
      operationId: getPets          # ← list
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
    post:
      tags: [pet]
      operationId: createPet        # ← create
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PetInput'

  /pets/{petId}:
    get:
      tags: [pet]
      operationId: getPetById       # ← detail
      parameters:
        - name: petId
          in: path
          required: true
    put:
      tags: [pet]
      operationId: updatePet        # ← update
    delete:
      tags: [pet]
      operationId: deletePet        # ← delete
```

With this structure, `usePetsConnector()` will have all five sub-connectors wired automatically.

---

## When there is no list endpoint

Some resources only have a detail or mutation endpoint — no GET that returns an array. For example, a `/profile` resource that only has `GET /profile` (single object) and `PUT /profile`.

In that case:
- `table` is present in the return type but its value is `undefined` at runtime
- The connector still works for `detail`, `createForm`, `updateForm`, `deleteAction`

If you still need a table for that resource, pass a factory as the first argument to provide your own list composable:

```ts
// No getPets endpoint exists, but you can wire any composable as the list source
const { table, updateForm } = useProfileConnector(
  () => useAsyncDataSearchUsers({ role: 'admin' })
)
```

The factory receives the result of the composable call — `table.rows`, `table.loading`, `table.pagination`, etc., all work normally.

---

## Forcing a specific endpoint with `x-nxh-intent`

If the automatic detection picks the wrong endpoint, you can override it directly in the spec with the `x-nxh-intent` extension:

```yaml
paths:
  /pet/findByStatus:
    get:
      tags: [pet]
      operationId: findPetsByStatus
      x-nxh-intent: list            # ← force this as the list endpoint
```

Valid values: `list`, `detail`, `create`, `update`, `delete`, `unknown`.

Setting `x-nxh-intent: unknown` excludes an endpoint from connector generation entirely.

---

## Connector sub-connectors by intent

| Sub-connector | Intent required | What happens if missing |
|---|---|---|
| `table` | `list` | `undefined` at runtime; use factory to provide one |
| `detail` | `detail` | Not included in return type |
| `createForm` | `create` | Not included in return type |
| `updateForm` | `update` | Not included in return type |
| `deleteAction` | `delete` | Not included in return type |

When a sub-connector is not included, TypeScript will give a compile error if you try to destructure it — so missing endpoints are caught at development time, not runtime.
