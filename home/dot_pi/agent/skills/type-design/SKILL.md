---
name: type-design
description: Turn resolved design decisions into a type system — type signatures, seams, error channels, and a prod/test call graph — before any implementation. Use after a design discussion converges (a grilling session or a handed-off decisions file), or when asked to "design the types", "define the contracts", or go API-first.
---

Types are the actual program. Implementation is a runtime courtesy.

Use this once the design decisions are settled — from a grilling session, a spec, or a handed-off decisions file. Input: the resolved facts. Output: the type-level contracts and call graph the implementer works from.

Read the project's type conventions before drafting (naming rules, `interface` vs `type` policy, error-handling guide, the AGENTS.md naming tree, and the shared idioms in [`../coding-standards/VOCABULARY.md`](../coding-standards/VOCABULARY.md) — seam, deep/shallow, Expected Failure, Parse-Don't-Validate, Smart Constructor). During design, load the `coding-standards` files the design touches — see [`../coding-standards/ROUTING.md`](../coding-standards/ROUTING.md); design against their non-negotiables, not memory. If a detail can be answered by exploring the codebase (existing names, seams, conventions), explore instead of guessing.

## What to produce

Present the solution as type-level contracts — the public API surface with no function bodies. The types should tell the structural story of the design: data shapes, function signatures, error cases, and state transitions.

Deliver the contracts as one declarations block that typechecks — `declare`d signatures, no bodies. Reference existing types by import; declare only what's new or changed. If it doesn't compile, it's prose in a costume.

Errors are surface, not plumbing. Every fallible signature names its error channel as a closed union — each failure mode a named variant, not `Error`. Follow the project's error convention (here: `Result<T, DomainError>` from better-result). "What errors can X return?" starts in Unresolved and must end as variants in a signature.

No implementation. No function bodies.
Explain design decisions embedded in the type choices.

## Challenge the types

Before asking for approval, stress-test your own type design:

- Can invalid states be represented? Narrow them out.
- Are there stringly-typed fields that should be unions or branded types?
- Is the interface **deep** — simple surface hiding complexity — or **shallow** (interface as complex as the implementation)?
- Are the **seams** between modules well-typed, or do types leak across boundaries?
- Do the function signatures reveal the data flow, or hide it?
- Strip your explanatory prose — do the declarations alone still tell the story?
- Can this interface be tested at the boundary without mocking internals?
- What do these types NOT capture? Invariants that need a runtime assertion (state them as contracts), and behavior over time — accumulation, feedback, delays. Grill those separately; don't let the types pretend they cover the dynamics.

If challenging the types reveals missing constraints, pause and grill until shared understanding before finalizing.

## Six-month test

Before finalizing, invent two radical but plausible changes this design could face in six months — a new variant in a union, a new consumer of the seam, a changed invariant, a swapped backend, an entity that splits in two. For each, ask one question: does adapting stay a **local change**, or does it **force API churn across callers, re-typing, or reworking the seam**?

A design that absorbs both scenarios locally **lasts**; one where either forces churn is **fast**. A scenario "adapts locally" only if the compiler or a test points at every place that must change — a place that can be silently missed (a string filter, a boolean flag, a forgotten `switch` without exhaustiveness) is churn, however small the edit. The cost of the type-level fix is never evidence for the current design. Name which, and if a small structural change now (a union instead of a boolean, a branded id, a narrower seam) would move a fast design toward lasts, make it before finalizing.

This section is the source of truth for the six-month test; `type-review` references it to decide the fast/lasts label.

## If you know it, the types should know it

Do one disambiguation pass — before or while drafting; finish it before the call graph. Challenge above is the generic quality pass; this is the domain-coverage pass. Different questions, both mandatory. List every rule you know about the domain — from the grilling, the ticket, any prose docs. For each fact, pick one:

- **Encode it.** The fact becomes structure: a union member, a branded type, a non-optional field, a narrowed input. "Only a pending invite can be accepted" -> `acceptInvite(invite: PendingInvite)`, not a runtime `if (status !== "pending")`. Distinct states are distinct types in a union, not a `status` string plus optional fields.
- **Contract it.** The type genuinely can't carry it (an invariant across calls, an ordering, a numeric range). State it as an explicit runtime contract and name where it's enforced. When TypeScript can't express the shape itself, reach for a runtime validator (zod, arktype, Effect Schema) — the schema *is* the contract, and its inferred type feeds back into the design.
- **Reject it.** Investigation disproves the "fact" — the field never arrives, the state can't occur. The decision is a deletion, recorded with evidence. Dead rules encoded defensively are how ghost branches and wrong units survive review.

**ALWAYS validate at the boundary, trust internally.** External/untrusted data (HTTP bodies, env, DB rows, JSON) is decoded by a runtime schema before it becomes a branded or encoded type — that decode is the only place a raw `string` earns the right to be a `WorkspaceId`. Inside the boundary, the types are trusted; no re-checking.

A known fact with no home — neither encoded, contracted, nor rejected — is an unresolved ambiguity. Surface it and resolve it before finalizing. Prose lets ambiguity hide; types force it into the open.

Make the pass explicit, not just a mental check — for each fact, state the decision it forced and the source it traces to (an encoded rule, a contracted invariant, or a disproven "fact" deleted with cited evidence). Any fact with no home yet is an open question that blocks finalizing; resolve or grill each before the call graph.

Trace both ways: every fact has a home, and every non-conventional type decision has a source fact. Structure with no source is invention — cut it or surface it as a question.

## Then the call graph

Types give the shape and the seams. They do not give the flow. After the types converge, sketch the call graph — the second artifact, and the one you hand to the implementer.

Produce two views of the same call tree — identical below the seam, differing only at the leaves:

- **Production**: handlers -> service -> real adapters -> store/IO.
- **Test**: the same core, fakes/memory adapters swapped in at the seam.

In React/Next code the same shape reads: route/component -> hook (seam) -> pure core (reducer, domain fn) -> API module. The test graph drives the core directly, fakes swapped at the hook/API seam. The convergence rule is unchanged.

The views MUST converge below the seam. If prod and test paths diverge deeper than the adapter boundary, the seam is in the wrong place — the core can't be tested without reaching past it. That divergence point is the proof your seams are real.

Format: indented tree, one call per line. Annotate non-obvious ordering and compensation inline, e.g. `createAlias -> store.insert -> index.put -> on index failure: store.delete`. Ordering and rollback are flow facts the types can't carry.

## Gate

Wait for explicit approval of the type signatures before writing any implementation code.

If you produced these as a subagent, do NOT gate yourself: return the type contracts, the disambiguation results (resolved decisions plus any unresolved ambiguities as open questions), and the call graph. The approving session holds the gate. A new ambiguity found while designing is surfaced as an open question and returned — never guessed.
