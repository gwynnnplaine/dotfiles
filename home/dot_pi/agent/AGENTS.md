## Non-negotiables

Five rules that override convenience. This is how we work — not style preferences.

1. **We always treat types as the real program, not the implementation.** We design the type signatures first; the bodies are a runtime courtesy. If deleting the bodies stops the types telling the structural story (data, errors, states), we are not done.
2. **We always design through the non-happy path first.** We name the failures, empty and boundary cases, and misuse before we write the happy path — the happy path is trivial once the bad cases are covered, and it is the cases we skip that carry the bugs.
3. **We always verify behavior through interfaces; tests are the real program.** Core logic behaves identically in production and in tests. If we have to mock or spy to test it, the design is wrong — we replace behavior through a real seam and assert observable outcomes, never internal calls.
4. **We always make invalid states unrepresentable.** We model invariants in types, constructors, parsers, and transitions. No boolean blindness, no contradictory bags, no stringly-typed field that should be a union or branded type.
5. **We always parse at the boundary and trust inside.** Untrusted, serialized, or persisted input is parsed into refined domain values before core logic sees it; we never trust decoded data with `as`, and expected failures travel as typed values, not hidden throws.

Depth lives in the `coding-standards` skill; these five are the always-on floor.

## Precedence

- Explicit user instructions override this file.
- Project-local `AGENTS.md`, tool config, lint config, `tsconfig.json`, and existing code style override these portable defaults.
- If rules hard-conflict, ask which to follow before editing.
- Keep this file as a portable baseline; put repo-specific setup, test, deploy, and architecture facts in that repo's own `AGENTS.md`.

## Core behavior

Default to **cautious, minimal, verifiable** changes.

- First inspect the codebase when the answer can be found there.
- State important assumptions before implementation.
- **Ask before** decisions that affect architecture, data shape, security, public APIs, migrations, or dependencies.
- Prefer the **smallest solution** that satisfies the request.
- Do not add speculative abstractions, configuration, extensibility, frameworks, or design patterns.
- Touch only files and lines directly related to the task.
- Do not perform drive-by refactors, formatting churn, comment rewrites, or unrelated cleanups.
- Match surrounding style even when it differs from these preferences.
- Mention unrelated issues separately instead of changing them.

## Verification

- Convert non-trivial tasks into verifiable goals before editing.
- Prefer reproducing bugs with tests before fixing them.
- Use TDD for bug fixes and features unless there is a clear reason not to.
- Run the **narrowest meaningful verification** after changes: targeted test, typecheck, lint, or build.
- If commands are unknown, inspect project files (`package.json`, lockfiles, `Makefile`, CI workflows, README) to discover them.
- If verification cannot be run, say why and describe what should be checked manually.

## Shell

Default interactive shell is **Nushell** (`nu`), not zsh/bash. Use Nushell syntax for commands and scripts.

- Always run shell commands through Nushell. If the agent's shell tool spawns bash/zsh, wrap the actual command as `nu -c '<nushell code>'`.
- Fall back to bash/zsh syntax only when `nu` is not installed (check with `which nu`); state that fallback when used.

- Redirection differs: `o> file` (overwrite), `o>> file` (append), `ignore` instead of `> /dev/null`, `o+e>| ignore` to also drop stderr.
- Command substitution is `(cmd)`, not `$(cmd)`. Env vars are `$env.VAR`; set with `$env.VAR = ...`; per-command with `VAR=val cmd`.
- Pipelines carry structured data (tables/records), not raw text. Prefer native filters: `ls | where type == dir`, `ls **/*.rs` for recursive find, `open file.json` to parse, `open --raw` for plain text.
- Sequence with `;`. Nushell has no `&&`/`||`; gate steps with `if` or `try`/`catch`, or check `$env.LAST_EXIT_CODE`.
- External tools (`rg`, `git`, `node`, etc.) work as-is; prefix with `^` only when a built-in shadows the name (e.g. `^ls`).
- Capture exit/stdout/stderr together with `do { cmd } | complete`.
- Keep one-off shell logic in Nushell; do not assume POSIX features like `export`, brace `>`, or `$()`.

## JavaScript and TypeScript

For JS/TS implementation, refactor, debug, review, or API/type-contract work:

- ALWAYS follow [CODING_STANDARDS.md](CODING_STANDARDS.md) when touching `.ts`/`.tsx` files.
- Read [`skills/typescript-meta/README.md`](skills/typescript-meta/README.md).
- Read [MUST HAVE](skills/typescript-meta/00-must-have.md).
- Read [Type Safety Philosophy](skills/typescript-meta/05-type-safety-philosophy.md).
- Read all `READ WHEN` docs from the TypeScript index that match the task.
- If a task mixes business and infrastructure concerns, explicitly choose one style before editing.
- `any` is allowed only with explicit justification in code/comment and a removal follow-up note.

## Keep persistent context lean

- Do not load long docs unless the task needs them.
- Do not include API tutorials, volatile details, or facts that can be inferred from the codebase.
- Prefer project-local nested `AGENTS.md` files for package-specific commands and constraints.
