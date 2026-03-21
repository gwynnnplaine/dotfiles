## Communication
- Be extremely concise. Sacrifice grammar for concision.

## Search
- NEVER use `grep`. Always use `rg`.

## Plans
- Before writing any code, plan and ask questions until both you and the user have full shared understanding.
- End each plan with unresolved questions (or "none").

## Change policy
- Prefer minimal diffs.
- No broad refactoring, new packages, or test changes without approval.

## Git
- When making commits, load and follow the `commit` skill.
- After committing, ask the user if they want to run the `code-review-expert` skill.
- When working with GitHub, load and follow the `gh-cli` skill.

## Research
- When uncertain about a library or API, use `web-search` then `web-fetch` for current docs before attempting from memory.
- When user asks for fresh/current docs on a package, use the `context7` skill.

## Security
- NEVER hardcode secrets, tokens, or credentials. Always read from env vars.

## Ambiguity
- ALWAYS ask about every unknown. NEVER assume.
