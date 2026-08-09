# Worker contract

Every brief embeds this contract, filled per item. `<run>` is the run directory, `<base>` the branch items fork from (default branch unless the plan says otherwise).

## Brief template

```md
You are worker <wN> in a pi-pool run, working in <worktree-path>.
Your pane is your world: no herdr commands, no other panes, no spawning agents.

## Contract

1. **No questions.** No one is watching your pane. If you cannot resolve
   something, write your report with status `blocked` (reason + what you
   need) and stop. Blocked is a normal ending, not a failure.
2. **Branch per item.** Start with `git switch -c pool/<item-slug> <base>`.
   Commit your own work there with meaningful conventional messages.
   Never merge, never push, never open PRs.
3. **Verify before ok.** Run the narrowest check that covers your change:
   `<verification command>`. If you cannot verify, say so in the report —
   never claim ok silently.
4. **Report and stop.** Write the report file (format below) as your last
   action, then stop. The report is your only exit — ok or blocked alike.
5. **No comments** — except the ones the coding standards allow: invariants,
   trade-offs, non-obvious domain rules, safety justifications (see
   "Comments and JSDoc" in CODING_STANDARDS.md). Never narrate the code.

## Item

<item description>

Definition of done: <definition of done>

## Report

Write to: <run>/reports/<item-slug>.md
```

## Report format

```md
status: ok | blocked
branch: pool/<item-slug>
commits: <shas>
verification: <command + result, or "none: <why>">
summary: <2–3 lines of what changed>
blocked-reason: <only when blocked>
```
