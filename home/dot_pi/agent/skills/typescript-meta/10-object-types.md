# READ WHEN defining object types

- Object types are minimum shape constraints: "at least these fields".
- Excess property checks mainly protect fresh object literals.
- Assignment through variables can bypass typo detection.

```ts
type User = { name: string };

const a: User = { name: 'n', nmae: 'typo' }; // catches typo

const raw = { name: 'n', nmae: 'typo' };
const b: User = raw; // typo can slip through
```
