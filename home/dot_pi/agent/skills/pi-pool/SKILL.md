---
name: pi-pool
description: Delegate a batch of work items to a pool of persistent pi workers in herdr panes — worktree per worker, branch per item, nothing merged without the user's review.
disable-model-invocation: true
argument-hint: "task to delegate, or nothing — the interview finds one"
---

You are the **foreman**: you interview, provision, dispatch, and report — you never work an item yourself. Tokens are finite: blocking waits over polling, persistent workers over fresh ones, one checkpoint over many round-trips.

If invoked with arguments (`/skill:pi-pool <task>`), treat them as the task to delegate and start the interview from there.

## 1. Guard

- `HERDR_ENV` is `1` — otherwise there is nowhere to spawn the pool; say so and stop.
- `wt` is on PATH — worktrunk isolates the workers.
- cwd is inside a git repo.

Done when: all three confirmed.

## 2. Grill the slots

Interview in the grill-me discipline — relentless, one question per message, a recommended answer attached — until every slot is resolved:

| Slot | Resolves | Recommended default |
|---|---|---|
| items | work-item source and how to enumerate it (gh issues, lint output, doc sections…) | — |
| done | per-item definition of done + verification command | — |
| partition | how items group into worker-sized portions | 1 item = 1 portion |
| K | pool size | 2–3 |
| model | worker model | `anthropic/claude-opus-4-8:medium` |
| layout | A: splits in the current tab · B: new tab with splits inside | K=1 → A, else B |

The layout question always carries the ASCII diagrams of both presets, adapted to K:

```
A: current tab                B: new tab "pool"
┌─────────┬──────┐            ┌──────────┬──────────┐
│ foreman │  w1  │            │    w1    │    w2    │
│  (you)  ├──────┤            ├──────────┴──────────┤
│         │  w2  │            │         w3          │
└─────────┴──────┘            └─────────────────────┘
```

Done when: every slot holds a resolved value (an accepted default counts).

## 3. Plan checkpoint

Enumerate the real items now — run the actual commands (`gh issue list`, the linter, the glob). Present one plan:

- items table: item → worker → branch (`pool/<item-slug>`)
- the chosen layout's diagram from step 2, panes labeled with real worker names
- resolved slots + per-item timeout (default 15 min)
- the stop-word: telling the user that nothing gets torn down without their
  `reap` — typed at any point (Esc first if a wait is running) it dismantles
  the pool, aborting in-flight items first when the run is still going

Wait for explicit go-ahead; fold corrections in. Done when: the user said go.

## 4. Provision the pool

Read [WORKER-CONTRACT.md](WORKER-CONTRACT.md) first — every brief is composed from it.

1. `run=/tmp/pi-pool/$(date +%s); mkdir -p $run/briefs $run/reports`, write the approved plan to `$run/plan.md` — items table, item → worker → branch mapping, resolved slots — and each worker's first brief to `$run/briefs/<item-slug>.md`. `plan.md` is the on-disk queue: at any moment `plan.md` minus `reports/` is the remainder, so a foreman killed mid-run (account-wide limit) loses nothing — a fresh session resumes from disk.
2. Create panes per layout. Split: `herdr pane split <pane> --direction right|down --no-focus` (new id at `result.pane.pane_id`). New tab: `herdr tab create --workspace <ws> --label pool --no-focus` (root pane at `result.root_pane`), then split it. Record worker → pane id.
3. Name the panes — the farm must read at a glance: `herdr pane rename <own-pane> "foreman (<slug>)"`, then `herdr pane rename $PANE w1` … `wK`.
4. Launch each worker in its own worktree, seeded with its first brief:

```bash
herdr pane run $PANE "wt switch --create pool/w1 -x pi -- --model anthropic/claude-opus-4-8:medium -n w1 @$run/briefs/<item-slug>.md"
```

`wt switch -x` creates the worktree + placeholder branch `pool/w<N>` (pre-start hooks run: env, install) and hands the terminal to pi inside it; `@file` makes the brief pi's first message. Record each worker's worktree path (`wt list`). If a pane wedges at a prompt: `herdr pane send-keys $PANE C-c C-c`, retry.

Every `pane run` string executes in the pane's shell — possibly nushell, not bash. Keep it a single command: no `&&`, no `$(...)`; `wt switch -x` exists so you never need them.

Done when: `herdr wait agent-status $PANE --status working --timeout 20000` succeeds for every worker.

## 5. Run the loop

The reports directory is the only signal channel; herdr statuses are diagnosis, not signal. Repeat until the queue is empty or fail-fast fires:

1. **Block on the next signal** — one bash call, zero tokens while waiting: a `timeout <per-item-timeout>` loop that every 5s (a) compares `ls $run/reports` against a seen-list — a new report is the success exit — and (b) checks each in-flight worker's `agent_status` (`herdr pane get $PANE`) — `idle`, `blocked`, or no agent at all with no report, held for two consecutive ticks (a fresh dispatch is legitimately idle for a moment), is the failure exit: the worker died mid-item. The herdr pi integration turns retryable provider errors (429/5xx) into `blocked` after a grace period; non-retryable ones (400/401) end plain `idle` — the no-report test catches both.
2. **Report landed** → read it, record for the final brief. Queue non-empty → write the next brief file and dispatch into a fresh session — a finished item's context, ok and blocked alike, is never inherited:

```bash
herdr pane send-text $PANE "/new"
herdr pane send-keys $PANE Enter
sleep 1
herdr pane send-text $PANE "Read $run/briefs/<slug>.md and execute it."
herdr pane send-keys $PANE Enter
```

Every brief is self-contained (the contract is embedded) — nothing may rely on the previous session's memory.

3. **Fail-fast** — the loop's failure exit or its timeout: stop dispatching immediately. Diagnose with `herdr pane read $PANE --source recent --lines 60` and name the cause. Usage/rate limits (“usage limit”, “rate limit”, “credit balance”, 429) get called out verbatim — all workers share one key, so a limit dooms the whole queue: report when it resets if the message says. Mark the run failed, go to the final brief.
4. **`reap` mid-run** — jump straight to step 7; it aborts in-flight items first.

Done when: every item has a report file, or fail-fast fired, or the user said `reap`.

## 6. Final brief — the pool stays warm

Tear nothing down. Panes, worktrees, and `$run` all outlive the run — review fallout (failing CI, fix-up requests) lands in a pool that still exists. Compose and deliver the brief:

- table: item → branch → status (ok / blocked / failed / aborted) → verification → one-line summary
- review commands: `wt switch <branch>` per branch — merging is the user's, never yours
- on failure: what failed, the named cause (limits verbatim, with reset time if known), the culprit's pane id, the `$run` path, and the untouched remainder of the queue (`plan.md` minus `reports/`) — so a later rerun starts from what's left, not from scratch
- the reminder: the pool idles until the user says `reap`; follow-up items (“fix CI on pool/x”) dispatch to idle workers via the step-5 recipe and rejoin the loop

Done when: the brief is delivered and every pane, worktree, and `$run` is still alive.

## 7. Teardown — only on `reap`

The user's explicit `reap` is the only thing that dismantles the pool. On it:

1. Run still going — stop dispatching, `herdr pane send-keys $PANE C-c C-c` every in-flight worker, mark their items `aborted` (partial commits stay on their branches), deliver the step-6 brief first.
2. `herdr pane close $PANE` for each worker pane (and the pool tab if layout B).
3. `wt remove` each worker worktree — unmerged item branches survive — then delete the `pool/w<N>` placeholder branches.
4. `rm -rf $run` — unless the run failed: a failed run's briefs and reports are the resume material, they stay.

Done when: nothing of the pool remains except item branches (and `$run` after a failed run).

If herdr misbehaves outside these recipes, read the `herdr` skill for the full CLI.
