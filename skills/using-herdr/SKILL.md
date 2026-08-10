---
name: using-herdr
description: "Spawn a pi subagent in a Herdr pane instead of a native subagent — the user does not use native subagents. Use whenever work calls for a subagent, a separate or different agent, delegating to another agent, or parallel agents. Requires HERDR_ENV=1; the herdr skill owns the pane and agent mechanics."
---

# Using Herdr for a pi subagent

A subagent is a `pi` process in its own Herdr pane. You dispatch it, wait, and report — you never do the task yourself.

Guard: `HERDR_ENV` must be `1`. Otherwise there is nowhere to spawn it; say so and stop.

## Ask the model

Always ask which model the subagent runs on — one question, recommended default attached. Never assume.

- Default: `anthropic/claude-opus-4-8`. Other enabled: `anthropic/claude-fable-5`, `openai-codex/gpt-5.6-sol`, `anthropic/claude-opus-5`. `pi --list-models <search>` for more.

## Working with pi

pi runs as Herdr agent kind `pi`. Pass pi's own flags after `--`:

- `--model <model>` — the chosen model; append `:<thinking>` for a thinking level (`...opus-4-8:medium`).
- `@<file>` — seed pi's first message from a file, for a long brief.
- `-p "<prompt>"` — non-interactive: process once and exit, for a one-shot with no follow-up.

## Then Herdr does the rest

Drive the pane and agent through the [`herdr`](../herdr/SKILL.md) skill — it owns every command:

1. Split a sibling pane (herdr geometry rule); read the new pane ID.
2. `herdr agent start sub --kind pi --pane <id> -- --model <model>`
3. `herdr agent prompt sub "<task>" --wait --timeout 180000`
4. `herdr agent read sub --source recent-unwrapped` — relay the result.

The pane stays alive for follow-up; reuse `agent prompt sub`. Close it only when the user asks. For anything past this recipe, read the herdr skill.
