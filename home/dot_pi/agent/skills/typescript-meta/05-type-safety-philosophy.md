# Type Safety Philosophy

Use these defaults for TypeScript work unless the local project rules or architecture clearly conflict.

## Mental model

- Type = set of possible values.
- Narrow types encode stronger guarantees; wide types encode flexibility.
- Every new type adds safety and maintenance cost. Add types when they protect an invariant, document a domain concept, or clarify a boundary.
- Prefer making invalid states unrepresentable in new or isolated code.

## Strong defaults

- Treat untrusted runtime data as `unknown` until decoded or validated.
- Prefer domain-specific primitives for values that are easy to mix up or that carry invariants.
- Model expected business failures as typed values, not hidden `throw` paths.
- Prefer functional composition for business transformations: data in, data out, explicit dependencies.
- Keep side effects at imperative boundaries: HTTP handlers, UI event handlers, CLI entrypoints, persistence adapters.
- Use discriminated unions for branching and exhaustive handling.
- Derive types from existing contracts where possible instead of duplicating shapes by hand.

## Dependency policy

- Use project-native libraries and patterns first.
- If a project already uses schema, Result/Either, or Effect-style libraries, follow that stack.
- Do not add new libraries only because these rules prefer them. Ask first.
- Without an existing library, use small local patterns that fit the task.

## Architecture policy

- Respect the existing project architecture.
- Apply these defaults strongly for new or isolated code.
- Do not perform drive-by migrations to Result, Effect, branded types, or functional style.
- If the surrounding code conflicts with these defaults, match the local style and mention a separate migration path.

## OOP vs FP

- Prefer FP for validation, transformations, pipelines, and typed error composition.
- Use OOP when identity, lifecycle, stateful resources, framework integration, or polymorphic adapters are the central concern.
