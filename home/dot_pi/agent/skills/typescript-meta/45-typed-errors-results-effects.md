# READ WHEN modeling expected failures

Expected business failures should be visible in types. Unexpected bugs and infrastructure surprises can still throw.

## Classify first

- Expected domain failures: not found, permission denied, already exists, validation failed, insufficient balance.
- Unexpected failures: programming errors, impossible states, dependency outages, transport bugs, corrupted runtime assumptions.

## Default policy

- Model expected domain failures as typed values: `Result`, `Either`, discriminated unions, or the project-native equivalent.
- Keep `throw` for unexpected failures and boundary escape hatches.
- Convert typed failures to HTTP/UI/CLI output at the imperative boundary with `match`/switch/exhaustive handling.
- For async workflows, use the project-native `ResultAsync` or Effect-style abstraction when available.

## Dependency policy

- If the project already uses Neverthrow, Effect, fp-ts, or a local Result type, follow it.
- If not, use the smallest local shape that solves the current task.
- Ask before adding a new dependency.

```ts
type Result<Value, Failure> =
	| { readonly ok: true; readonly value: Value }
	| { readonly ok: false; readonly error: Failure };

type CreateUserError =
	| { readonly type: 'EmailAlreadyUsed' }
	| { readonly type: 'InvalidInvite' };
```

## Effect-style operations

Use an Effect-style model when the operation benefits from typed success, typed expected failure, lazy execution, dependency injection, retries, cancellation, resource handling, or observability composition.

Do not introduce Effect-style complexity for a simple one-step operation with no meaningful composition needs.
