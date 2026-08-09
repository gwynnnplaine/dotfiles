# dotfiles

chezmoi source state. `.chezmoiroot` points at `home/`, so `home/dot_zshrc`
becomes `~/.zshrc`.

## Edit the source, not the target

Files under `~` are output. Edit `home/…`, then `chezmoi apply`. When a change
was already made directly in `~`, capture it with `chezmoi re-add <path>` before
touching the source, or `chezmoi apply` will overwrite it.

`chezmoi status` letters: first column is the target, second is what `apply`
will do. `R` on a `run_` script means "will run", not "will remove".

## settings.json is a script, not a file

`home/dot_pi/agent/modify_settings.json` receives the live file on stdin and
merges chosen fields with `jq`. Pi rewrites `lastChangelogVersion`,
`enabledModels`, `defaultModel`, `defaultProvider` and `defaultThinkingLevel`
itself; managing those made the file permanently dirty. Add a field by adding a
`jq` line. Keep it a script — a full-content `settings.json` brings the drift
back.

## Skills are a list, not files

Declared under `skills:` in `home/.chezmoidata/packages.yaml`, installed by
`run_onchange_install-skills.sh.tmpl` into `~/.agents/skills`. The list is
authoritative both ways: **a skill missing from it is deleted from disk on the
next apply**, including one installed by hand.

Sources are `/tree/<branch>/…` URLs and the branch must be real —
`herdrdev/herdr` is `master`. The `skills` CLI exits 0 on a failed clone, so the
script checks the installed directory instead.

## herdr owns one extension

`~/.pi/agent/extensions/herdr-agent-state.ts` is generated and overwritten by
herdr, so it stays in `.chezmoiignore`. `run_onchange_after_install-herdr-
integration.sh.tmpl` reinstalls it after a herdr upgrade; the `herdr_version`
variable is what makes chezmoi notice the upgrade, so it is load-bearing.

## Shell scripts

Prose lives in commit messages and in this file. Keep source files free of
comments — when a comment feels necessary, it usually marks a line that should
be clearer or a fact that belongs in the commit body.

A fresh machine runs `/bin/bash` 3.2, where `"${arr[@]}"` on an empty array
under `set -u` aborts. Prefer here-docs and `while read` over arrays. Read from
fd 3 (`while read … <&3; done 3<<<"$x"`) whenever the loop body runs a command
that reads stdin.

Verify before committing:

```bash
chezmoi execute-template < home/run_onchange_<name>.sh.tmpl > /tmp/r.sh
shellcheck /tmp/r.sh && /bin/bash -n /tmp/r.sh
```

Scripts must be idempotent. A non-zero exit is a feature: chezmoi re-runs a
`run_onchange_` script whose last run did not succeed.

## Nushell

`home/dot_config/nushell/config.nu` is Nushell, not POSIX. `$(…)`, `&&` and
`export VAR=` are syntax errors there.

## Commits

Conventional commits. The subject says what changed; the body says why, and
names the evidence — the version that renamed a key, the branch that did not
exist, the shell that aborted. A reader six months out should not have to
rediscover it.
