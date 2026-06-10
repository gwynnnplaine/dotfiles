---
name: type-review
description: Score an existing change's type system 0–5 and label it fast or lasts, using the type-design lens. Use when reviewing a diff or PR for type quality, not when designing types from scratch.
---

Score the change's type system; don't redesign it. Apply the `type-design` lens to the code that's actually there, then rate it. One verdict, with the deciding evidence — not a re-derivation of the whole design.

## Lens

Judge against the `type-design` "Challenge the types" checklist ([../type-design/SKILL.md](../type-design/SKILL.md)):

- Can invalid states be represented? Are they narrowed out?
- Stringly-typed fields that should be unions or branded types?
- Is the interface **deep** (simple surface, hidden complexity) or **shallow** (interface as complex as the impl)?
- Are the **seams** between modules well-typed, or do types leak across boundaries?
- Do the signatures reveal the data flow, or hide it? Delete the bodies — do the types still tell the story?
- Can the interface be tested at the boundary, without mocking internals?

## Score

Rate **0–5**, then label **fast** or **lasts** (lasts is the goal). One sentence each, with the deciding evidence.

- **0–1**: invalid states freely representable, stringly-typed fields, types leak across seams.
- **2–3**: typed but defensive — `??` / `||` / `?.` papering over states that shouldn't exist, shallow interfaces.
- **4–5**: invalid states unrepresentable, deep narrow interface, well-typed seams; delete the bodies and the types still tell the story.
- **fast** = solves today, needs rework when requirements shift. **lasts** = absorbs likely change without API churn.
