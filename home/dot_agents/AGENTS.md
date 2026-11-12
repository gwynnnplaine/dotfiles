## The rule

Everything is designed and written under one hard rule: **explicit, declarative code with optimal feedback loops.** It binds every plan, change, review, and answer, in every language and stack; in review, every violation is a finding. Each value is settled at design time, in the plan, before code exists: a problem fixed in design costs a fraction of one fixed in implementation, and far less than one fixed in production. The values below say what it means in practice.

- **Explicit**: a signature tells the whole story: data, errors, dependencies, states. Nothing rides on ambient context, hidden throws, or convention.
- **Declarative**: state _what_ (schemas, state machines, data, config) and let an interpreter run _how_. Anything that moves through stages is a state machine: named states, the events that move it, and the legal transitions, in one place.
- **Optimal feedback loops**: every change lands with the fastest check that proves it (types → lint → tests); a bug goes red before it is fixed; a repeated correction becomes a check, not a sentence of prose.
- **Rigor > conciseness**: between two working designs, pick the one that encodes more in types, schemas, and transitions, even when it is longer.
- **Retrieval > pre-training**: ground every claim about a library, API, or this codebase in something read this session (installed source, lockfile version, docs, `--help`), not recall.
- **Mechanical sympathy**: performance is a hard constraint. Every plan, PR, and review carries the numbers:
  - **Napkin math**: operation count × cost per operation (latency numbers every programmer should know), at a realistic n; Big-O matters only at that n. Name what it spends (network, disk, memory, CPU) to save what.
  - **Round trips**: network and database calls per user action or request. N+1 is a design bug.
  - **Budget**: the threshold the change must stay inside. Browser: Core Web Vitals at p75 (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1), no main-thread task over 50 ms, bytes shipped. Server: p95/p99 latency, queries per request, allocations.
  - **Delta**: before → after against the base branch, over repeated runs with the noise stated; a delta inside the noise is no change. An unmeasured number is an estimate, marked `~`.
  - **Limit**: the bound on every loop, queue, payload, and retry it adds.

  Napkin math picks the design; micro-tuning waits for a profile.

## Design

1. **Assign responsibility before reaching for a pattern.** A behavior lives with the data it needs (Information Expert); resilience to change comes next; a pattern comes last and earns its place by naming the change it absorbs. Rigor means constraints, not indirection.
2. **Follow the existing codebase's stack.** Bring rigor through the shape of new code, and propose a more rigorous library or framework to the user rather than migrating to it unasked.
3. **Practice restraint.** Build what was asked. Every feature, option, dependency, and file is a claim on the codebase and the user's attention; extras go to the user as suggestions.
4. **Preserve option value.** Prefer changes that keep future moves open, and name any one-way door (schema, public API, data migration, deleted history) before walking through it.

## Shell

Every command runs in Nushell, never bash or zsh. Pi's shell tool runs `nu` directly (`shellPath`); in any harness that spawns bash, wrap the command: `nu -c '<nushell>'`. Herdr panes already run Nushell.

- `$env.VAR` and `(cmd)`, not `$VAR` and `$(cmd)`.
- No `&&` or `||`: chain with `;`, gate with `if` or `try { } catch { }`.
- Only the last pipeline's value is printed; `print` earlier ones (external commands stream on their own).
- Redirect with `o> file` and `o>> file`; discard with `| ignore`, or `o+e>| ignore` to drop stderr too.
- Prefix an external with `^` when a built-in shares its name (`^ls`).
- Interpolate whole tokens: `-f $"body=($var)"`, since `body=$var` sends the literal text.
- `do { cmd } | complete` returns exit code, stdout, and stderr together.

## Subagents

Never start a subagent on your own initiative: spawn one only when the user explicitly asks, and exactly as many as asked. Otherwise do the work yourself, however large it is.

When asked:

- Use `spawn_agent`, steered with `send_message`. Results arrive on their own; call `wait_agent` only when the next step depends on the answer.
- Size it with `model` and `thinking`: haiku for lookups and research (`researcher` template), opus for everything else, including any code change.
- Write the task self-contained: goal, paths, constraints, and what the answer must contain. The child sees no conversation, AGENTS.md, or skills beyond its template.

When the user asks for a Herdr pane or tab (a visible agent they can talk to), use the `herdr_*` tools instead:

- Start `pi` with an explicit model and thinking: `agentArgs: ["--model", "pi-claude-cli/<model>:<level>"]`. Use `pi-claude-cli`, never `anthropic/`: direct Anthropic OAuth is billed as extra usage.
- Read replies with `herdr_agent read` and `source: "recent"`; the visible screen often shows only the editor and footer.
- Close panes you opened when the work is done.
