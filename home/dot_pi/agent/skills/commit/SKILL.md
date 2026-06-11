---
name: commit
description: >
  git commit workflow plus terse, exact Conventional Commits messages, signed with the Dexter
  attribution footer (the one sanctioned exception to the no-attribution rule below). Inspects the
  staged change, writes the message, and runs git to apply it. Use when user says "commit", "write a
  commit", "commit message", "generate commit", "/commit", or is sealing work in a git repo.
---

# commit (git)

Terse and exact. Conventional Commits. No fluff. **Why over what.** Then apply with `git`.

## Workflow

1. **Inspect** — `git status` and `git diff --staged` (what's about to be committed); `git diff`
   for unstaged context. If nothing is staged, stage what's relevant (`git add <paths>` /
   `git add -p`) or say so.
2. **Write** the message (rules below).
3. **Append** the Dexter footer (always — see Footer).
4. **Apply** — pipe the full multi-line message to git via stdin:
   ```nu
   "<full message>" | git commit -F -            # commit staged changes
   ```
   Bash fallback: `git commit -F - <<'EOF' … EOF`. Use `git commit --amend -F -` to rewrite the
   last (unpushed) commit.

## Subject line

`<type>(<scope>): <imperative summary>` — `<scope>` optional

- Types: `feat fix refactor perf docs test chore build ci style revert`
- Imperative mood: "add", "fix", "remove" — not "added", "adds", "adding"
- ≤50 chars when possible, hard cap 72
- No trailing period
- Match project convention for capitalization after the colon
- `!` before the colon marks a breaking change

## Body (only if needed)

- Skip entirely when the subject is self-explanatory
- Add only for: non-obvious *why*, breaking changes, migration notes, linked issues
- Wrap at 72 chars; bullets `-` not `*`
- Reference issues/PRs at end: `Closes #42`, `Refs #17`

**Auto-clarity** — always include a body for: breaking changes, security fixes, data migrations,
or anything reverting a prior commit. Never compress these into subject-only; future debuggers need
the context.

## What NEVER goes in

- "This commit does X", "I", "we", "now", "currently" — the diff says *what*
- "As requested by…" — use a `Co-authored-by` trailer instead
- "Generated with Claude Code" or any AI attribution (**except** the Dexter footer below)
- Emoji (**except** the Dexter footer below)
- Restating the file name when the scope already says it

## Footer (always append)

The one documented exception to the no-emoji / no-attribution rules: a sanctioned
project-convention signature. Blank line, then exactly one line:

```
🩸 Co-Authored-By: Dexter - @gwynnnplaine's Pi (https://pi.dev/) assistant
```

## Examples

New endpoint, body explains the *why*:

```
feat(api): add GET /users/:id/profile

Mobile client needs profile data without the full user payload
to reduce LTE bandwidth on cold-launch screens.

Closes #128

🩸 Co-Authored-By: Dexter - @gwynnnplaine's Pi (https://pi.dev/) assistant
```

Breaking change (note `!` + `BREAKING CHANGE:`):

```
feat(api)!: rename /v1/orders to /v1/checkout

BREAKING CHANGE: clients on /v1/orders must migrate to /v1/checkout
before 2026-06-01. Old route returns 410 after that date.

🩸 Co-Authored-By: Dexter - @gwynnnplaine's Pi (https://pi.dev/) assistant
```

## Boundaries

Applies the message via `git commit` only. Does **not** push, rebase, or move branches unless
asked. Always inspect before writing. "normal mode" / "stop caveman" → verbose message style,
footer still added.
