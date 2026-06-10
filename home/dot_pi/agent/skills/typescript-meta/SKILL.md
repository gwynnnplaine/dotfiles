---
name: typescript-meta
description: TypeScript decision meta-skill for implementation, review, debugging, and refactoring. Use whenever a task touches .ts/.tsx files or TypeScript API/contracts/types, including review-only tasks.
---

# TypeScript Meta Skill

Progressive-disclosure rules for any TypeScript work. The canonical content lives in this folder's numbered docs; this file only routes — read the docs, don't expect the rules inlined here.

## Mandatory flow

1. Read [00-must-have.md](00-must-have.md) and [05-type-safety-philosophy.md](05-type-safety-philosophy.md) — the non-negotiables. Read them every time, before editing.
2. Open [README.md](README.md) and read only the relevant `READ WHEN` doc(s) for the task.
3. Finish with [99-done-checklist.md](99-done-checklist.md).

Policy decisions (local vs shared types, dependency policy, the `any` rule, business vs infrastructure style) live in [README.md](README.md) under **Policy decisions** — defer to it rather than restating policy here.
