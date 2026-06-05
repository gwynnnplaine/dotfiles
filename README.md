# dotfiles

Managed with [chezmoi](https://www.chezmoi.io/) for reproducible, idempotent setup.

See [`AGENTS.md`](./AGENTS.md) for the full workflow and best practices.

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

See [`AGENTS.md`](./AGENTS.md) for conventions and best practices.

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

Daily shell is **Nushell**; zsh just bootstraps the env and hands off. See the
Shell & PATH section in [`AGENTS.md`](./AGENTS.md) for how to add to PATH or
define aliases.

## Node

**fnm is the only Node version manager** (works in Nushell; auto-switches per
project from `.node-version` / `.nvmrc`). Global CLIs like `pi` live in the fnm
default version. Homebrew `node` is kept only as a dependency for brew formulae
(`opencode`, `mongosh`, `mongodb`). **nvm is not used.** Pi installs as
`@earendil-works/pi-coding-agent`. Full policy in [`AGENTS.md`](./AGENTS.md).

## What's managed via chezmoi

- `~/.config/ghostty/config`
- `~/.config/nvim/**`
- `~/.config/lazygit/config.yml`
- `~/.config/nushell/{config,env}.nu`
- `~/.zshrc`, `~/.zprofile`

> `~/.pi` is **not** managed here — it is owned solely by the
> `i-love-this-shitty-agent` repo and is ignored via `home/.chezmoiignore`.
