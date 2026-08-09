# Error Handling

Expected failures are part of the contract. Defects are not. Keep that line sharp so callers can handle normal failures and defects remain loud.

## Core vocabulary

**Expected Failure** — A normal-operation failure: domain rejection, parse failure, authorization denial, dependency unavailability, I/O/persistence failure, or modeled cancellation outcome.

**Unrecoverable Defect** — An impossible branch, violated invariant, startup misconfiguration, catastrophic condition, or explicit temporary unimplemented path.

**Boundary Adapter** — The module that catches exception-based dependencies or framework behavior at a boundary, classifies unknown thrown values, and translates them into local typed failures or protocol/framework responses.

**Custom Error** — A typed, tagged error value with a stable `_tag`, useful message, structured safe fields, and optional `unknown` cause.

**Precise Error Union** — The local set of failures a caller can handle semantically, discriminated by tag.

## Non-negotiables

- Expected failures are visible in the local return type through a typed value channel (a `Result`-style channel).
- Promise rejection is equivalent to throwing; do not use it for ordinary expected failures in local code.
- Domain and functional-core code do not use `try/catch` as normal expected-failure control flow.
- Boundary Adapters may catch exception-based APIs, but they classify `unknown` before translating.
- Catch variables and rejection reasons are treated as `unknown` until classified.
- Cancellation/interruption is recognized before wrapping unknown failures as ordinary errors.
- Startup configuration failure is a defect, but its diagnostic still avoids secrets and unsafe raw values.
- Broad `AppError`-style unions stay near orchestration, rendering, logging, and entrypoints; module interfaces expose precise local failures.

## Strong defaults

Model failure with two ideas: a **Result** return channel and **named (tagged) errors**. The concept is the standard; the implementation is the repository's established choice.

Acceptable Result implementations — use the one the repo already has; if none, pick one and stay consistent:

- **Effect** — its typed error channel + `Schema.TaggedError`.
- **better-result** — `Result<T, E>` + `TaggedError`.
- **manual Result type** — a small local tagged union:
  ```ts
  type Result<T, E extends Error> =
    | { readonly _tag: "ok"; readonly value: T }
    | { readonly _tag: "err"; readonly error: E };
  ```

Named errors: a tagged error class with a stable `_tag`, useful message, and structured safe fields — from whichever mechanism the repo uses (`TaggedError`, `Schema.TaggedError`, or a hand-rolled class). Discriminate a precise union by its tag (e.g. `matchError` or a `switch` on `_tag`).

## Expected failures as values

Prefer:

```ts
function findUser(id: UserId): Promise<Result<User, UserNotFound | UserStoreUnavailable>>;
```

Avoid:

```ts
async function findUser(id: UserId): Promise<User> {
  throw new Error("not found"); // ordinary lookup absence is hidden from the type
}
```

A framework may require throwing or rejected promises at its boundary. Keep the local module typed, then translate at the boundary:

```ts
const result = await users.findById(id);

if (result._tag === "err") {
  throw toFrameworkError(result.error);
}

return result.value;
```

Do not let the framework's exception style leak inward as the service/domain contract.

## Defects may throw

Throwing is for invalid program states:

- impossible branches;
- violated internal invariants;
- startup misconfiguration;
- catastrophic runtime conditions;
- `notYetImplemented` during development.

Prefer shared helpers when they exist:

```ts
casesHandled(unexpectedCase: never): never;
shouldNeverHappen(message?: string): never;
notYetImplemented(message?: string): never;
```

Do not label ordinary domain, parse, authorization, I/O, or persistence failures as defects merely because throwing is convenient.

## Custom errors

A good expected-failure error is useful to callers and safe for telemetry:

```ts
// TaggedError shown here; use your repo's tagged-error mechanism.
export class UserStoreUnavailable extends TaggedError("UserStoreUnavailable")<{
  readonly operation: "findActiveByEmail";
  readonly cause: unknown;
  readonly message: string;
}>() {}
```

A hand-rolled class with a stable `_tag` and structured fields is equally acceptable:

```ts
export class UserNotFound extends Error {
  readonly _tag = "UserNotFound" as const;

  constructor(readonly userId: UserId) {
    super("User not found");
  }
}
```

Avoid public contracts made of raw strings, context-free `Error`, or unstructured messages.

## Precise error unions

Prefer:

```ts
Result<User, UserNotFound | UserStoreUnavailable>
```

Avoid:

```ts
Result<User, AppError>
```

A broad error type hides caller decisions: retry, render not-found, ask for auth, stop workflow, compensate, or report dependency outage. Discriminate with `matchError` or a `switch` on `_tag`.

## Lookup absence

For required lookups, absence is a typed not-found failure:

```ts
findById(id: UserId): Promise<Result<User, UserNotFound | UserStoreUnavailable>>;
```

Use optional results only when optionality is intentional and obvious:

```ts
maybeFindById(id: UserId): Promise<Result<User | undefined, UserStoreUnavailable>>;
exists(id: UserId): Promise<Result<boolean, UserStoreUnavailable>>;
```

## Boundary catch and classification

Prefer:

```ts
try {
  const response = await fetch(url, { signal });
  return ok(response);
} catch (cause: unknown) {
  if (isAbortCause(cause)) {
    return err(new RequestCancelled({ operation: "fetchUser", cause }));
  }

  return err(new HttpRequestFailed({ operation: "fetchUser", cause }));
}
```

Avoid:

```ts
catch (error) {
  logger.error(error.message); // assumes JavaScript threw an Error and may leak data
  throw error;
}
```

Only boundary/rendering/logging code should normalize unknown thrown values for display. Boundary Adapters preserve the original cause where useful.

## Rejected framings

- **"Recoverable exception."** If callers can recover, put it in the return type.
- **"The controller catches it anyway."** Boundary translation does not excuse hidden local failure contracts.
- **"Everything is AppError."** Broad unions erase semantic handling.
- **"Not found is undefined."** Required lookup absence is a failure unless the operation is explicitly optional.
- **"Cancellation is just another dependency error."** Cancellation is a control path and must be classified before wrapping.

## Review checklist

Use this as the final scan after applying the rules above; the rule source of truth remains in the relevant sections.

- `async` functions rejecting for ordinary dependency failures.
- Catching `error` and using `.message` without classification.
- Returning `Result<T, Error>` with no stable tags.
- Throwing parse/authorization/domain failures from core logic.
- Forgetting `cause: unknown` when translating lower-level dependency failures.
- Treating startup config diagnostics as a place to print raw environment values.
