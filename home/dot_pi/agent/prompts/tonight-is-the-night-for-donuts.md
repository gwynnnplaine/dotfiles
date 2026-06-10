---
description: Docs-grounded grilling, then a subagent designs the type system from the resolved decisions
argument-hint: "[feature, plan, or domain area to design]"
---
Target: $ARGUMENTS

Two phases. Phase 1 is interactive and runs here. Phase 2 is delegated to a subagent so this context never carries the grilling transcript into type design.

## Phase 1 — grill against the docs (this session)

Use the `grill-with-docs` skill. Grill one question at a time, each with your recommended answer. If the codebase can answer a question, explore it instead of asking. As decisions crystallise:

- sharpen vocabulary into `CONTEXT.md` (glossary only),
- record load-bearing, hard-to-reverse choices as ADRs under `docs/adr/`.

When the grilling converges, write the resolved decisions to `<os-tmp>/<slug>-decisions.md`: the settled domain facts, the shape of the work, constraints, and any open questions. `CONTEXT.md` and the ADRs stay in the repo; this file is the session handoff. State its path before moving on.

## Phase 2 — design the types (subagent, fresh context)

Delegate to a subagent so the design phase reads only the artifacts, not this conversation. Inject the `type-design` skill into the subagent (by name — the skill is loaded by the runtime, not read from the project tree), and give it this task:

> Read `CONTEXT.md`, the relevant ADRs under `docs/adr/`, and `<os-tmp>/<slug>-decisions.md` (paths are relative to the project root). Following the `type-design` skill, produce: the type contracts (no bodies), the disambiguation ledger (Resolved → type decision; Unresolved → open question), and the prod/test call graph. Use `CONTEXT.md` vocabulary for type and seam names. Do NOT guess — a new ambiguity goes into **Unresolved** and is returned, never resolved. Return the contracts, the ledger, and the call graph. Do not start implementation.

## Gate (this session)

Present the subagent's types, ledger, and call graph. If **Unresolved** is non-empty, grill those here one at a time, update `CONTEXT.md`/ADRs as needed, then re-run Phase 2. Wait for explicit approval of the type signatures before any implementation — the gate lives here, never in the subagent.
