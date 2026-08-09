# MUST HAVE

## Core model

- Type = set of values.
- Narrow type = smaller set; wide type = bigger set.
- Every new type increases safety and maintenance burden.
- Prefer local/module types by default. Promote to shared/global only with clear ownership.

## Runtime trust model

- TypeScript types are erased at runtime.
- External/boundary data is untrusted until runtime validation.
- Boundary pattern: `unknown` -> validate once -> trusted internal type.

## Baseline defaults

- Prefer discriminated unions for branching.
- Prefer generated/shared contracts over manual FE/BE duplication at boundaries.
- Business code can optimize for domain documentation.
- Infrastructure code must optimize for strict I/O contracts.

## Hard rules

- Avoid `any`; if unavoidable, justify inline and add removal note.
- Avoid double assertions (`as unknown as X`) unless explicitly justified.
- Do not rely on non-discriminator `in` checks for critical narrowing.
