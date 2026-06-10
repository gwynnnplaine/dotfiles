# READ WHEN crossing trust boundaries

Boundary examples: user input, HTTP input, localStorage/IndexedDB reads, external APIs, microservices.

- Validate boundary data at ingress.
- Treat untrusted boundary data as `unknown` until decoded.
- Trust internal same-system module calls by default.
- For irreversible external writes (money/critical side effects), add extra validation.
- For schema details, read [35-runtime-schemas.md](35-runtime-schemas.md).

```ts
function parseInput(input: unknown): CreateUser {
  // runtime validation here
  return validated;
}
```
