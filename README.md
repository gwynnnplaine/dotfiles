# dotfiles

Managed with [chezmoi](https://www.chezmoi.io/) for reproducible, idempotent setup.

## Install (new machine)

```bash
# 1. Homebrew (asks for your password, so it stays manual)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# 2. Everything else
brew install chezmoi && chezmoi init --apply gwynnnplaine/dotfiles
# 3. Once more: scripts that check for a tool (herdr, nu, npm) were planned
#    before Homebrew installed it
chezmoi apply
```

`apply` installs Homebrew packages, writes the files and symlinks, generates the
Nushell integrations, installs Pi, npm globals, skills and Herdr plugins. The
scripts live in `home/.chezmoiscripts/`.

## Layout

- `home/` — chezmoi source state (`.chezmoiroot` points here)

## Daily workflow

```bash
chezmoi update   # pull + apply (routine sync)
chezmoi diff     # preview pending changes
chezmoi apply    # apply
```

## Rules that keep `apply` from asking "has changed since chezmoi last wrote it"

chezmoi asks when a file in `~` differs from what it last wrote. So:

- **Edit through the repo, never in `~`.** Use `chezmoi edit --apply <file>`, or
  edit `~` and then run `chezmoi re-add <file>` at once. Edits left only in `~`
  cause the prompt on the next `update`.
- **Files an app rewrites are not plain managed files.**
  - Lock files (`nvim-pack-lock.json`): the real file is in `linked/`, and
    `~` gets a symlink (`symlink_*.tmpl`). The app writes into the repo; commit it.
  - Settings with app-owned keys (Pi `settings.json`, Claude `settings.json`,
    Plannotator `config.json`): `modify_` files set only our keys and pass the
    rest through, so the app's own changes (model, effort) never show as drift.
    Pi's is a `chezmoi:modify-template` (Pi sorts keys, so `toPrettyJson`
    matches it); Claude and Plannotator keep their own key order, so theirs
    are jq scripts.
- **`exact_` directories** (`~/.config/nvim/**`): files deleted from the repo
  are deleted from `~` too. Without it, old files stay on every machine.
- Before `chezmoi update` on a machine, run `chezmoi status`. Resolve local
  edits (`re-add` or `apply --force <file>`) first.

## Homebrew

Formulae and casks are listed under `brew:` in
[`home/.chezmoidata/packages.yaml`](./home/.chezmoidata/packages.yaml).
`chezmoi apply` pipes them to `brew bundle` whenever the list changes
(`--no-upgrade`; upgrade with `brew upgrade`), then `brew bundle cleanup --force`:
**the list is authoritative**, so removing an entry uninstalls it, and anything
installed with a bare `brew install` is removed on the next list change. Add
it to the list instead. To see installed packages missing from the list:
`brew bundle dump --file=- | grep -E '^(brew|cask) ' | grep -vFf <(chezmoi data | jq -r '.brew[][] | .name? // .')`.
Third-party tap packages carry `trusted: true`; cleanup resets Homebrew's trust
store to those entries, so trust is declared only there.

## Config directories (where apps actually read from)

| Tool | Effective config path |
|---|---|
| Ghostty / cmux | `~/.config/ghostty/config` (cmux renders terminals via libghostty and reads this) |
| Neovim | `~/.config/nvim` |
| Lazygit | `~/Library/Application Support/lazygit/config.yml` (`symlink_` to `~/.config`) |
| Nushell | `~/.config/nushell/{config,env}.nu` (App Support copies are `symlink_`s) |
| zsh | `~/.zprofile` (login env), `~/.zshrc` (bootstrap → `exec nu`) |

Font: set by a profile in `~/.config/ghostty/fonts/` (`geist`, `maple`, `iosevka`); swap the `config-file` line in the ghostty config to change it.

Daily shell is **Nushell**; zsh just bootstraps the env and hands off. PATH and
aliases live in the `$env.PATH` and alias blocks of
`home/dot_config/nushell/config.nu`.

## Node

**fnm is the only Node version manager** (works in Nushell). `config.nu` runs
a PWD hook that auto-switches to a project's `.node-version` / `.nvmrc`
(`fnm use --install-if-missing`; fnm's own `--use-on-cd` freezes Nushell).
Each fnm version has its own npm globals, so the LSP servers from
`.chezmoidata/packages.yaml` live in the fnm default version; upgrading means
`fnm install <new> --reinstall-packages-from=default && fnm default <new>`.

There is no Homebrew `node`, and **nvm is not used.**

**Pi is installed into Homebrew's prefix** (`/opt/homebrew/lib/node_modules`) by
a `run_once_` script, so `pi` survives per-project Node switches and updates
itself; it runs on the active Node, which must be >= 22.19.

## What's managed via chezmoi

- `~/.config/ghostty/config`
- `~/.config/nvim/**`
- `~/.config/lazygit/config.yml`
- `~/.config/nushell/{config,env}.nu`
- `~/.zshrc`, `~/.zprofile`
- `~/.pi/agent/SYSTEM.md`, `extensions/`, and `settings.json` (via
  `modify_settings.json`; Pi's own volatile fields are left alone)

Machine-local Pi state — `auth.json`, `trust.json`, `sessions/`, `npm/`, `git/`,
caches and logs — is ignored via `home/.chezmoiignore`. Agent skills in
`~/.agents/skills` come from two places: our own as plain files in
`home/dot_agents/skills/`, and third-party ones from GitHub via
`home/.chezmoiexternal.toml` (refreshed weekly; `chezmoi -R apply` refreshes now).
To drop an external skill, delete its entry and add the path to `.chezmoiremove`.
