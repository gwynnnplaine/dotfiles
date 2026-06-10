# Coding Standards — TypeScript & JavaScript (2026)

## Precedence

Project-local config (`AGENTS.md`, `tsconfig.json`, lint config, existing code style) wins over this doc — see `AGENTS.md` for the full precedence rule. On a hard conflict, ask before writing code.

## Formatting

- Semicolons: always.
- Quotes: single (`'`). Double only inside single-quoted strings or JSX attributes.
- Indentation: tabs.
- Trailing commas: everywhere (arrays, objects, params, generics).
- Line width: 100 columns max.
- One blank line between semantic blocks. No multiple consecutive blank lines.
- Enforce via Biome/Prettier config — this doc states the philosophy, tooling enforces it.

## Naming

ALWAYS follow naming conventions — no exceptions. If a reviewer has to ask "what does this do?", the name failed.

### Decision tree

```
Is it a boolean?
├─ Yes → is/has/can/should prefix (isActive, hasPermission, canEdit)
└─ No → Is it a function?
    ├─ Yes → verb phrase (sendEmail, calculateTotal, validateInput)
    └─ No → Is it a class/type/interface?
        ├─ Yes → PascalCase noun (UserService, PaymentProcessor)
        └─ No → Is it a constant?
            ├─ Yes → UPPER_SNAKE_CASE with units (MAX_RETRY_ATTEMPTS, CACHE_DURATION_MS)
            └─ No → camelCase descriptive noun (userProfile, totalAmount)
```

### Rules

- `camelCase` for variables, functions, parameters, methods, properties.
- `PascalCase` for types, interfaces, classes, enums, components, type parameters.
- `SCREAMING_SNAKE_CASE` for true constants (compile-time known, module-level).
- `kebab-case` for file names.
- Treat abbreviations as words: `loadHttpUrl`, not `loadHTTPURL`.
- Booleans: always prefix with `is`, `has`, `can`, `should`. Prefer positive: `isEnabled` not `isDisabled`.
- Constants: always include units: `CACHE_DURATION_MS` not `CACHE_DURATION`.
- Magic numbers MUST be named constants: `if (age > LEGAL_AGE)` not `if (age > 18)`.
- Use `error` in catch blocks, not `err`.
- Singular for entities, plural for collections.

### Banned names

- NEVER use vague names: `data`, `info`, `temp`, `x`, `process()`, `handle()`.
- NEVER abbreviate unless universally known (`html`, `api`, `url`, `id` are fine).
- NEVER use single-letter variables outside loop counters (`i`, `j`, `k`).
- NEVER use misleading names — `getUser()` that also updates `lastLogin` is a lie. Name must reflect all behavior including side effects.
- No Hungarian notation. No `I` prefix on interfaces.

## Functions & Code Structure

- Prefer **arrow functions** for callbacks, closures, short expressions.
- Use **function declarations** for top-level named functions (hoisting + clear intent).
- Functions do one thing. Name = verb phrase describing that one thing. Decompose when a function outgrows its one job.
- Use an options object once positional parameters get unwieldy.
- Prefer early returns for guard clauses — no single-return-point dogma.
- No nested function definitions deeper than 1 level.

## Error Handling

### Classification

- **Programming errors** (bugs): `TypeError`, `ReferenceError`, assertion failures. Fix the code — do not catch and continue.
- **Operational errors** (expected failures): network timeout, file not found, invalid input. These are part of the contract — model them, don't let them surprise the caller.

### Rules

- Expected failures are typed values, not untyped throws. Reach for `Result`/`ok-err`, an effect system (Effect), or a domain error union — whichever the codebase already uses. In an Effect/Result codebase, follow that paradigm; don't fall back to ad-hoc `try/catch`.
- Throw only `Error` or subclasses — never strings, objects, or `undefined`. Throwing is for bugs and truly exceptional cases, not control flow.
- No empty catch blocks, no silent swallowing — handle, rethrow, or convert to a typed failure.
- Validate at the boundary, trust internally.
- At a boundary, map internal errors to known codes — never leak internal error details across it.

## Imports & Exports

- **Named exports only** — no default exports.
- **Named imports** for specific symbols; namespace imports (`import * as foo`) for large APIs.
- Use **`import type`** for type-only imports.
- **Relative imports** (`./foo`) within the same project.
- **Import order**: 1) node built-ins → 2) external packages → 3) internal/relative. Separated by blank lines.
- **No barrel files** (`index.ts` re-exports) except at package boundaries.
- **No `require()`** — ESM only.

## Comments & Documentation

- `/** JSDoc */` for public APIs — types, interfaces, exported functions, classes.
- `//` line comments for implementation details. Never block comments (`/* */`).
- **"Why" over "What"** — don't restate the code, explain the reasoning.
- No commented-out code — that's what git is for.
- Boolean JSDoc: use "Whether..." not "True if..."
- `@param`/`@return` only when they add info beyond what the name/type says.
- TODO format: `// TODO(username): description` — must have an owner.
- No decorative comments — no ASCII art, no section separators.

## Classes & OOP

- Prefer composition over inheritance.
- No container classes with static methods — export standalone functions.
- Omit `public` (it's the default). Use `private`/`protected` explicitly.
- `readonly` on class fields by default.
- Prefer interfaces over classes for defining shapes/contracts.
- No `enum` — use `as const` objects or union types instead.
- Avoid `this` in non-class contexts — arrow functions for callbacks.

## Async & Concurrency

- In an Effect/Result codebase, model concurrency and failure in that system — the rules below are for plain Promise code.
- No floating promises — every Promise is awaited, returned, or explicitly `void promise` + comment for fire-and-forget.
- `Promise.all()` for independent parallel operations.
- Prefer `AbortController` for cancellation.
- No `async` on functions that don't `await` — return the Promise directly.
- Don't mix `.then()` chains with `await` in the same function.

## Immutability & State

- `const` by default. `let` only when reassignment is necessary. `var` never.
- `readonly` on class fields by default.
- `as const` for literal objects/arrays that shouldn't change.
- Prefer spread/map/filter over in-place mutation.
- No `delete` operator — use destructuring or `Omit<>`.
- Function params are immutable — never mutate arguments; return new values.
- Exception: performance-critical hot paths may mutate with a `// PERF:` comment.

## Testing

### Philosophy — ALWAYS follow

- **Test behaviour through public interfaces, never implementation details.** A test must survive internal refactors. If you rename a function, change how data is fetched, or restructure modules and tests break — but behaviour didn't change — those tests were wrong.
- **Assert on what the system does, never how.** Assert on return values, rendered output, user-visible state. NEVER assert on call counts, argument shapes to internal functions, or execution order.
- **Name tests after behaviour.** Good: "user sees error when payment fails". Bad: "calls paymentService.process with correct args".

### Anti-Patterns — NEVER do

**Test-only methods in production code.** NEVER add methods to production classes that are only called from tests — `destroy()`, `reset()`, `_testOnly_*`. They pollute the public API, risk accidental production use, and confuse object lifecycle.

```ts
// ❌ BAD: cleanup method only used in afterEach
class BookingSession {
  async destroy() {
    await this.cache.clear(this.id)
  }
}
// In tests
afterEach(() => session.destroy())

// ✅ GOOD: test utility owns cleanup
// packages/testing/utils/booking.ts
export async function cleanupBookingSession(session: BookingSession) {
  const cacheKey = session.getId()
  await testCache.clear(cacheKey)
}
// In tests
afterEach(() => cleanupBookingSession(session))
```

**Incomplete mocks.** NEVER create partial mock responses. Mocking only fields your immediate test uses hides structural assumptions. Downstream code may depend on fields you omitted — tests pass, integration fails.

```ts
// ❌ BAD: partial mock — missing fields downstream code reads
server.use(
  http.get('/api/offers/:id', () =>
    HttpResponse.json({
      id: '123',
      price: 99,
      // missing: currency, availability, location that OfferCard reads
    }),
  ),
)

// ✅ GOOD: mirror real API response shape
server.use(
  http.get('/api/offers/:id', () =>
    HttpResponse.json({
      id: '123',
      price: 99,
      currency: 'EUR',
      availability: { start: '2026-05-01', end: '2026-05-15' },
      location: { city: 'Lisbon', country: 'PT' },
    }),
  ),
)
```

When unsure what fields the real API returns, check the endpoint handler or API types — never guess.

**Tests written after the fact.** Tests SHOULD be written alongside implementation, not bolted on after. When tests come last, they tend to verify the shape of existing code (data structures, call signatures) rather than real behaviour. Writing tests close to implementation — ideally one behaviour at a time — forces you to think about what the code actually does.

### Red flags

- Assertion checks for `*-mock` test IDs.
- Methods in production classes only called from test files.
- Mock setup is >50% of test body.
- Test breaks when you remove a mock but behaviour hasn't changed.
- Can't explain why a specific mock is needed.
- Mocking "just to be safe".
- Mock response has fewer fields than real API.

### Style

- File naming: `foo.test.ts` co-located next to `foo.ts`.
- Structure: `describe` for grouping, `it` for individual cases. Name: `it('should [verb] when [condition]')`.
- AAA pattern: Arrange → Act → Assert, separated by blank lines.

For the red-green-refactor workflow, use the `tdd` skill.

## Modern Patterns (Endorsed — only if the current runtime/target supports them)

Check `tsconfig.json` target/lib and the runtime version before using these. If unsupported, fall back to the closest equivalent.

- `using` / `await using` for resource cleanup (Explicit Resource Management).
- `structuredClone()` for deep copies.
- `Object.groupBy()` / `Map.groupBy()`.
- `Array.fromAsync()`.
- `Set` methods: `.union()`, `.intersection()`, `.difference()`.
- Optional chaining `?.` and nullish coalescing `??` (prefer over `||` for defaults).
- `satisfies` operator for type-safe object literals.
- Template literal types for string patterns.

## Banned

- `var`, `arguments` object, `with` statement.
- `eval()` / `Function()` constructor.
- `const enum`, `namespace`.
- `@ts-ignore` — use `@ts-expect-error` only in tests with justification.
- Wrapper objects: `new String()`, `new Boolean()`, `new Number()`.
- Relying on ASI (Automatic Semicolon Insertion).
- `delete` operator on objects — use destructuring or `Omit<>`.
- `for...in` on arrays.
