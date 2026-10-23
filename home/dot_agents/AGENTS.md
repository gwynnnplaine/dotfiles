## Non-negotiables

Five rules that override convenience. This is how we work — not style preferences.

1. **We always treat types as the real program, not the implementation.** We design the type signatures first; the bodies are a runtime courtesy. If deleting the bodies stops the types telling the structural story (data, errors, states), we are not done.
2. **We always design through the non-happy path first.** We name the failures, empty and boundary cases, and misuse before we write the happy path — the happy path is trivial once the bad cases are covered, and it is the cases we skip that carry the bugs.
3. **We always verify behavior through interfaces; tests are the real program.** Core logic behaves identically in production and in tests. If we have to mock or spy to test it, the design is wrong — we replace behavior through a real seam and assert observable outcomes, never internal calls.
4. **We always make invalid states unrepresentable.** We model invariants in types, constructors, parsers, and transitions. No boolean blindness, no contradictory bags, no stringly-typed field that should be a union or branded type.
5. **We always parse at the boundary and trust inside.** Untrusted, serialized, or persisted input is parsed into refined domain values before core logic sees it; we never trust decoded data with `as`, and expected failures travel as typed values, not hidden throws.

Depth lives in the `coding-standards` skill; these five are the always-on floor.

## Shell

Default interactive shell is **Nushell** (`nu`), not zsh/bash. Use Nushell syntax for commands and scripts.

- Always run shell commands through Nushell. If the agent's shell tool spawns bash/zsh, wrap the actual command as `nu -c '<nushell code>'`.
- This includes commands sent into Herdr panes via `herdr_pane run`: they execute in the pane's Nushell, so use nu syntax and prefix externals with `^` (e.g. `^uname -sm`, not `uname -sm`).
- Fall back to bash/zsh syntax only when `nu` is not installed (check with `which nu`); state that fallback when used.
- Redirection differs: `o> file` (overwrite), `o>> file` (append), `ignore` instead of `> /dev/null`, `o+e>| ignore` to also drop stderr.
- Command substitution is `(cmd)`, not `$(cmd)`. Env vars are `$env.VAR`; set with `$env.VAR = ...`; per-command with `VAR=val cmd`.
- Pipelines carry structured data (tables/records), not raw text. Prefer native filters: `ls | where type == dir`, `ls **/*.rs` for recursive find, `open file.json` to parse, `open --raw` for plain text.
- Sequence with `;`. Nushell has no `&&`/`||`; gate steps with `if` or `try`/`catch`, or check `$env.LAST_EXIT_CODE`.
- External tools (`rg`, `git`, `node`, etc.) work as-is; prefix with `^` only when a built-in shadows the name (e.g. `^ls`).
- Capture exit/stdout/stderr together with `do { cmd } | complete`.
- Nushell does not interpolate a variable inside a bareword after `=`: an external arg like `-f body=$var` sends the literal string `body=$var`. Build the whole token with interpolation instead — `-f $"body=($var)"` — for any `key=value` external argument (e.g. `gh api -f`, `curl -d`) whose value comes from a variable.
- Keep one-off shell logic in Nushell; do not assume POSIX features like `export`, brace `>`, or `$()`.

## Subagents

Delegate through codex subagents: `spawn_agent`, steered with `send_message`. Results arrive on their own; call `wait_agent` only when the next step depends on the answer.

- Size every task with `model` and `thinking`: haiku for lookups and research; opus for everything else, including any code change. Use the `researcher` template for read-only research.
- Write each task self-contained: goal, paths, constraints, and what the answer must contain. Children load no AGENTS.md, skills, or extensions beyond their template.

Herdr panes are for when the user asks for a pane or tab: a visible agent they can watch and talk to. Run it with the `herdr_*` tools: `herdr_layout pane_split` (or `tab_create`) → `herdr_agent start` → `herdr_agent prompt`, which waits until the agent settles. Then:

- Read the reply with `herdr_agent read` and `source: "recent"`; the default visible screen often shows only the editor and footer.
- When starting `pi` in a pane, pass model and thinking explicitly, sized to the task: `agentArgs: ["--model", "claude-bridge/<model>:<level>"]`. Use the `claude-bridge` provider, never `anthropic/`: direct Anthropic OAuth is billed as paid extra usage.
- Close panes you opened when the work is done.

## Worktrees

To start work in a new worktree, create it with `wt switch --create <branch>` so worktrunk's setup steps run (env files, installs, codegen). Herdr's own worktree commands skip them. Then open the worktree as a Herdr workspace and start `pi` there with a self-contained prompt; it does not see this conversation.

Use `herdr_worktree_jump` only when the user explicitly asks to move this session, and warn first that it creates the worktree with Herdr and skips worktrunk setup.
