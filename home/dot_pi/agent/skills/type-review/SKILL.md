---
name: type-review
description: Score an existing change's type system 0–5 and label it fast or lasts, using the type-design lens. Use when reviewing a diff or PR for type quality, not when designing types from scratch.
---

Score the change's type system; don't redesign it. Apply the `type-design` lens to the code that's actually there, then rate it. One verdict, with the deciding evidence — not a re-derivation of the whole design.

Term definitions (deep/shallow, seam, Expected Failure, Parse-Don't-Validate) live in [`../coding-standards/VOCABULARY.md`](../coding-standards/VOCABULARY.md).

## Lens

Before scoring, open [`../coding-standards/ROUTING.md`](../coding-standards/ROUTING.md) and read **every** topic file it routes to for the change — always `DOMAIN_MODELING.md` and `TYPESCRIPT_CONTRACTS.md`. Do not score from memory or from `ROUTING.md` alone; score against the non-negotiables in the files you actually opened.

## Verdict derivation

The verdict is computed, not judged. Produce this worksheet verbatim in the output — a verdict without the worksheet is invalid:

```
DOMAIN_MODELING: VIOLATED — types permit activeTab === 'documents'; only a runtime filter forbids it (finding #1) → cap 2
TYPESCRIPT_CONTRACTS: holds — proof: parse() returns Result<EmailAddress, InvalidEmail>; no as/any/! in the diff
ERROR_HANDLING: n/a — no error paths changed
score = min(band, caps) = 2   label = fast (forced by cap)
```

One row per topic file loaded in the Lens step: **holds**, **VIOLATED**, or **n/a**. Each row answers that file's probe with **concrete evidence** — a named value, a quoted type, or a cited finding. Adjectives ("clean", "sound", "soundness-preserving") are not evidence.

Probes — a row may say **holds** only when its probe comes back empty:

- `DOMAIN_MODELING`: Name a concrete value or state that the changed code's types permit but a runtime guard, filter, redirect, or comment forbids. The invariant this change itself introduces counts as the changed surface — "the state was already representable before" is not a defense when forbidding it is the change's own purpose. Found one → VIOLATED; write the value in the row.
- `DOMAIN_MODELING` (comment probe): For every diff comment asserting an invariant ("X can't happen here", "backs the type", "always set when Y", "flip to re-enable"), quote the type that makes the compiler enforce the claim. No such type → VIOLATED. A comment is a hope; a type is a guarantee — an invariant living in a comment is by definition not modeled.
- `TYPESCRIPT_CONTRACTS`: List every `as` on boundary data, `any`, obligation-erasing `!`, and every predicate or return type wider or narrower than what the body establishes. Non-empty list → VIOLATED.
- `ERROR_HANDLING`: Name an expected failure on the changed path that travels as a throw, rejected promise, or silent `undefined` instead of a typed channel. Found one → VIOLATED.
- Other loaded topic files: apply their non-negotiables the same way — name the violating value or quote the proof.

Rules:

- **holds requires quoted proof.** Quote the type, signature, or constructor that enforces the invariant. Cannot quote it → the row is VIOLATED or n/a, never holds by impression.
- A VIOLATED row MUST cite the finding number that proves it. No finding to cite → the review missed one — go back and write the finding before scoring.
- **Author comments are claims, not evidence.** Never accept a diff comment as design rationale for a row.
- **Impossibility requires a sketch.** Before writing "can't cheaply express this in types", attempt the two-line version — `Exclude<...>`, `as const satisfies`, a derived subtype, a discriminated union. If the sketch works, it is the finding's fix, not the design's defense.
- Caps: an `as` trust cast on boundary data / `any` / obligation-erasing non-null → cap **1**; any other violated non-negotiable → cap **2**. Any cap also forces **label = fast**; the six-month test is not run.
- No caps → run the six-month test from [`../type-design/SKILL.md`](../type-design/SKILL.md) against the changed surface. A scenario "adapts locally" only if the compiler or a test points at every place that must change; a place that can be silently missed is churn → **fast**. The cost of the type-level fix is never evidence for the current design.
- **label = fast caps the score at 3.** Bands 4–5 are reachable only with label = lasts.
- Guilty until proven innocent: ambiguous evidence scores down; never round up for effort or partial improvement.

Completion criterion: every topic file loaded in the Lens step has a row; every row carries a named value, quoted type, or cited finding — not an adjective; every VIOLATED row cites a finding number; and the final line is `score = min(band, caps)` with the label.

Bands (only reachable when no row is VIOLATED):

- **2–3**: every non-negotiable holds, but at least one applicable standard is only *defensively* satisfied — `??` / `||` / `?.` papering over states that shouldn't exist, a shallow interface — or the six-month test comes back **fast**.
- **4**: every applicable standard's non-negotiables hold, invalid states are unrepresentable on the changed surface, and the six-month test comes back **lasts**.
- **5**: 4, plus the deletion test passes (delete the bodies, the types still tell the story).
