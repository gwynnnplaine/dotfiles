# dotfiles

Managed with [chezmoi](https://www.chezmoi.io/) for reproducible, idempotent setup.

## Install (new machine)

```bash
chezmoi init --apply gwynnnplaine/dotfiles
```

Clones into `~/.local/share/chezmoi` and applies. Optionally run `./install.sh`
for `brew bundle` + macOS App Support symlinks (Lazygit, Nushell) + Nushell
autoload generation.

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
  - Settings with app-owned keys (Pi `settings.json`, Plannotator
    `config.json`): `modify_` scripts set only our keys and keep the app's key
    order and final newline, so output is byte-identical when nothing changed.
- **`exact_` directories** (`~/.config/nvim/**`): files deleted from the repo
  are deleted from `~` too. Without it, old files stay on every machine.
- Before `chezmoi update` on a machine, run `chezmoi status`. Resolve local
  edits (`re-add` or `apply --force <file>`) first.

## Homebrew

Packages live in [`Brewfile`](./Brewfile). `install.sh` runs `brew bundle`.
Manually: `brew bundle install --file=./Brewfile`. Re-dump current state:
`brew bundle dump --file=./Brewfile --force`.

## Config directories (where apps actually read from)

| Tool | Effective config path |
|---|---|
| Ghostty / cmux | `~/.config/ghostty/config` (cmux renders terminals via libghostty and reads this) |
| Neovim | `~/.config/nvim` |
| Lazygit | `~/Library/Application Support/lazygit/config.yml` (symlinked to `~/.config` by `install.sh`) |
| Nushell | `~/.config/nushell/{config,env}.nu` (App Support symlinked by `install.sh`) |
| zsh | `~/.zprofile` (login env), `~/.zshrc` (bootstrap → `exec nu`) |

Font: `Iosevka Nerd Font Mono`, size 20.

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

Homebrew `node` is kept only as a dependency for brew formulae (`opencode`,
`mongosh`, `mongodb`). **nvm is not used.**

**Pi is a pnpm global** (`@earendil-works/pi-coding-agent`). pnpm's global dir
(`~/Library/pnpm`) is shared by every fnm version, so `pi` survives per-project
Node switches; it runs on the active Node, which must be >= 22.19.

## What's managed via chezmoi

- `~/.config/ghostty/config`
- `~/.config/nvim/**`
- `~/.config/lazygit/config.yml`
- `~/.config/nushell/{config,env}.nu`
- `~/.zshrc`, `~/.zprofile`
- `~/.pi/agent/SYSTEM.md`, `extensions/`, and `settings.json` (via
  `modify_settings.json`; Pi's own volatile fields are left alone)

Machine-local Pi state — `auth.json`, `trust.json`, `sessions/`, `npm/`, `git/`,
caches and logs — is ignored via `home/.chezmoiignore`. Agent skills are
declared under `skills:` in `home/.chezmoidata/packages.yaml` and installed into
`~/.agents/skills`; the list is authoritative, so anything undeclared there is
removed on `chezmoi apply`.
