---
name: typescript-meta
description: TypeScript decision meta-skill for implementation, review, debugging, and refactoring. Use whenever a task touches .ts/.tsx files or TypeScript API/contracts/types, including review-only tasks.
---

# TypeScript Meta Skill

Use progressive disclosure docs in this folder.

## Mandatory flow

1. Read the MUST HAVE and Type Safety Philosophy sections below (inlined).
2. Read [README.md](README.md) and open only relevant `READ WHEN` file(s).
3. Finish with [99-done-checklist.md](99-done-checklist.md).

## Policies

- Local vs shared types: local inside modules; shared/generated contracts at boundaries.
- Strong defaults: runtime decoding, branded domain primitives, typed expected failures, and functional business core.
- Dependency policy: use project-native libraries first; ask before adding new schema/Result/Effect libraries.
- `any`: allowed only with explicit inline justification and removal follow-up.
- If task mixes business + infrastructure concerns, choose style explicitly before editing.

---

## MUST HAVE

### Core model
- Type = set of values. Narrow type = smaller set; wide type = bigger set.
- Every new type increases safety and maintenance burden.
- Prefer local/module types by default. Promote to shared/global only with clear ownership.

### Runtime trust model
- TypeScript types are erased at runtime.
- External/boundary data is untrusted until runtime validation.
- Boundary pattern: `unknown` → validate once → trusted internal type.

### Baseline defaults
- Prefer discriminated unions for branching.
- Prefer generated/shared contracts over manual FE/BE duplication at boundaries.
- Business code can optimize for domain documentation.
- Infrastructure code must optimize for strict I/O contracts.

### Hard rules
- Avoid `any`; if unavoidable, justify inline and add removal note.
- Avoid double assertions (`as unknown as X`) unless explicitly justified.
- Do not rely on non-discriminator `in` checks for critical narrowing.

---

## Type Safety Philosophy

### Mental model
- Type = set of possible values.
- Narrow types encode stronger guarantees; wide types encode flexibility.
- Every new type adds safety and maintenance cost. Add types when they protect an invariant, document a domain concept, or clarify a boundary.
- Prefer making invalid states unrepresentable in new or isolated code.

### Strong defaults
- Treat untrusted runtime data as `unknown` until decoded or validated.
- Prefer domain-specific primitives for values that are easy to mix up or that carry invariants.
- Model expected business failures as typed values, not hidden `throw` paths.
- Prefer functional composition for business transformations: data in, data out, explicit dependencies.
- Keep side effects at imperative boundaries: HTTP handlers, UI event handlers, CLI entrypoints, persistence adapters.
- Use discriminated unions for branching and exhaustive handling.
- Derive types from existing contracts where possible instead of duplicating shapes by hand.

### Dependency policy
- Use project-native libraries and patterns first.
- If a project already uses schema, Result/Either, or Effect-style libraries, follow that stack.
- Do not add new libraries only because these rules prefer them. Ask first.

### Architecture policy
- Respect the existing project architecture.
- Apply these defaults strongly for new or isolated code.
- Do not perform drive-by migrations to Result, Effect, branded types, or functional style.
- If the surrounding code conflicts with these defaults, match the local style and mention a separate migration path.

### OOP vs FP
- Prefer FP for validation, transformations, pipelines, and typed error composition.
- Use OOP when identity, lifecycle, stateful resources, framework integration, or polymorphic adapters are the central concern.
