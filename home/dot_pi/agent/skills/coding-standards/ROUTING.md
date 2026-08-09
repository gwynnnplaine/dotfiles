# Routing

Which standards to read for a change. Load only what the change touches — never all of it.

Always load [`VOCABULARY.md`](VOCABULARY.md) and [`SKILL.md`](SKILL.md). For any TypeScript change, always also load [`DOMAIN_MODELING.md`](DOMAIN_MODELING.md) and [`TYPESCRIPT_CONTRACTS.md`](TYPESCRIPT_CONTRACTS.md) — boolean blindness and loose contracts are the most-missed defects. Then match by smell:

| Smell in the diff | Load |
|---|---|
| boolean/enum/status flag, optional soup, lifecycle states, `as SomeId` | [`DOMAIN_MODELING.md`](DOMAIN_MODELING.md) |
| `throw` / `try`/`catch`, `Result`, not-found, broad error union | [`ERROR_HANDLING.md`](ERROR_HANDLING.md) |
| `console`/logger/telemetry, a token/secret/`process.env` near a log | [`OBSERVABILITY.md`](OBSERVABILITY.md) |
| new class/interface/adapter/dependency, DI, a `deps` bag | [`DESIGNING_MODULES.md`](DESIGNING_MODULES.md) |
| request body, `JSON.parse`, `.json()`, env, DB row, DTO, schema | [`BOUNDARIES_AND_PARSING.md`](BOUNDARIES_AND_PARSING.md) |
| `await`, `Promise`, `AbortSignal`, retry, transaction, concurrency | [`ASYNC_WORKFLOW.md`](ASYNC_WORKFLOW.md) |
| `.test.`, `vi.mock`/`spyOn`, fixtures, fakes | [`TESTING_AND_VERIFICATION.md`](TESTING_AND_VERIFICATION.md) |
| `any`, `!`, `as`, `readonly`, object spread, `filter(Boolean)`, JSDoc | [`TYPESCRIPT_CONTRACTS.md`](TYPESCRIPT_CONTRACTS.md) |
