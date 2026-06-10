# Prompts

Workflow rails for Pi. Not magic spells, just guardrails so the agent slows down instead of sprinting into the wall.

## `/tonight-is-the-night-for-donuts`

Dexter brought donuts. Use it to **design something new** when the domain language and the type system both need pinning down.

Two phases on a rail:

- **Grill against the docs** (`grill-with-docs`): sharpen fuzzy words into `CONTEXT.md`, record hard-to-reverse choices as ADRs, probe concept boundaries with concrete scenarios. The glossary becomes the type names.
- **Hand off to a subagent**: it reads `type-design` in a fresh context, no grilling transcript, and turns decisions into type contracts, a disambiguation ledger, and a prod/test call graph. It never guesses. A new ambiguity comes back as an open question.

The gate stays with you. Nothing ships until you approve the types. For a quick in-head design with no docs, plain `grill-with-types` is lighter.

## `/review`

Deep code review. Read-only. Works on local changes, staged changes, a commit/range, or a GitHub PR via `gh`.

Trace changed behavior **vertically**, input to state to output, not file-by-file like a sleepy diff bot. Ask on every slice: **what can break?** No proof, no finding. Show code evidence and a failing path, or move it to questions.

Goal: fewer dumb comments, fewer missed regressions.
