---
name: coding-standards
description: TypeScript coding standards and design taste. Use when adding or changing domain models, parsers, typed errors, modules and seams, async work, tests, or TypeScript contracts; or when another skill needs these coding standards.
---

# Coding Standards

Use these standards while designing and editing TypeScript. They encode correctness first, precise domain modeling, typed failures, deep modules, explicit boundaries, real-seam tests, and strict TypeScript contracts.

This skill is standalone. Load the topic files that match the code you are touching; do not treat the top-level summary as the whole standard.

## Core tenets

- Correctness, safety, debuggability, boundary integrity, and test integrity come before convenience.
- Local conventions matter when they are compatible with these standards; a local convention that is itself a smell or violation does not override them — prefer the standard on the changed path.
- Parse boundary input before it reaches core logic; pass refined/domain values inward.
- Model invariants in types, constructors, parsers, and transitions.
- Model expected failures in typed channels; reserve throws for defects and boundary translation.
- Design deep modules with intentional seams, small interfaces, and explicit dependencies.
- Verify observable behavior through real seams.
- Keep TypeScript contracts strict, local, documented, and boring.
- Improve changed paths without forcing broad migrations unless explicitly requested.

## Non-negotiables

These are not aesthetic preferences. When they conflict with existing code, preserve compatibility at the seam and improve the changed path rather than copying the violation.

- You MUST design every interface, type, and change through the non-happy path first — ALWAYS name the failures, empty and boundary cases, and misuse before writing the happy path. The happy path is easy to write and easy to over-trust; correctness lives in the cases that are easy to forget.
- Untrusted, serialized, or persisted input MUST be parsed before core logic sees it.
- Decoded data MUST NOT be trusted with `as SomeType`.
- Expected failures MUST be visible in typed return channels, never hidden throws or rejected promises.
- Secrets MUST NOT enter errors, logs, traces, or snapshots.
- Raw framework and platform types MUST stay at composition seams or local adapters, never in core logic.
- Dependencies MUST be explicit; hidden globals and ambient time, randomness, or IDs MUST NOT drive behavior.
- Tests MUST prove observable behavior through module interfaces or real seams; module mocks and method spies are out.
- Type escape hatches MUST be local, justified with a `SAFETY:` note, and hidden behind precise interfaces.
- Promises MUST be owned: awaited, returned, collected, or handed to explicit detached-work machinery.
- Broad migrations, backwards compatibility, rollout, and backfills MUST have explicit user intent.

## How to apply the standards

1. **Audit the local codebase.** Before choosing a library, pattern, adapter shape, schema style, error representation, test strategy, or module layout, inspect until the existing choice for each touched concern is identified or confirmed absent.
2. **Classify the change.** Identify the concerns touched: domain state, parsing, errors, observability, modules, async, tests, or TypeScript contracts.
3. **Load every relevant topic file** (see [`ROUTING.md`](ROUTING.md)). The routing layer only points; the topic file is the source of truth for its concern.
4. **Apply safety standards before local convention.** Follow established architecture where compatible. When local convention violates a non-negotiable, isolate compatibility at the seam and improve the changed path.
5. **Prefer the smallest coherent improvement.** Do not start unrelated migrations or rollout/backfill plans. Do not add abstractions, adapters, libraries, or config layers without a concrete reason.
6. **Verify through the right seam.** Tests should observe outcomes at the module interface that callers use.
7. **Name trade-offs.** If a standard cannot be fully applied without a broad migration, state the compatibility constraint and the local improvement made.

## Topic routing

See [`ROUTING.md`](ROUTING.md) — which topic file to load for a change, plus the always-load set.

## Strong defaults

Use the repository's established choice when it exists and satisfies these standards. When no established choice exists, load the topic file that owns the concern and follow its strong defaults.

Do not treat this root file as enough context for library, schema, error, testing, or toolchain choices — the topic file owns those.

## Rejected framings

- **"The existing code throws, so new expected failures can throw."** Preserve compatibility at boundaries; do not copy unsafe failure contracts into new local logic.
- **"Validation is enough."** Parsing must return the refined value and pass it inward.
- **"A wrapper is architecture."** A pass-through module earns its keep only when it hides complexity, owns policy, or translates across a real seam.
- **"Mocks make tests isolated."** Module mocks isolate the wrong thing. Replace behavior through real seams.
- **"Types are proof."** Serialized data and persisted rows become less structured at runtime. Parse them.
- **"Future flexibility justifies an interface."** A seam is real when behavior varies, a boundary translates, or tests substitute through an intentional seam.
- **"A lint suppression is a fix."** Suppressions must be targeted and explain the safety invariant.
- **"The codebase already does it this way, so I'll keep the pattern."** Matching an existing anti-pattern — throwing instead of `Result`, validate-instead-of-parse, no seam, boolean blindness — propagates the violation into new code. A local convention is worth following only when it is compatible with these standards; when it is a smell, improve the changed path and isolate the old pattern at the boundary instead of copying it.
