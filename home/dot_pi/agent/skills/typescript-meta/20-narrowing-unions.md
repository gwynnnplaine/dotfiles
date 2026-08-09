# READ WHEN narrowing unions / control flow

- Prefer discriminator fields (`type` / `kind`).
- Add exhaustive checks with `never`.
- Treat non-discriminator `in` narrowing as risky.

```ts
type E = { type: 'ok'; value: string } | { type: 'err'; error: Error };
const assertNever = (x: never): never => { throw new Error('unreachable'); };

function handle(e: E) {
  if (e.type === 'ok') return e.value;
  if (e.type === 'err') return e.error.message;
  return assertNever(e);
}
```
