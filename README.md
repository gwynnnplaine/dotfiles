# dotfiles

Managed with [chezmoi](https://www.chezmoi.io/) for reproducible, idempotent setup.

See [`AGENTS.md`](./AGENTS.md) for the full workflow and best practices.

## Install (new machine)

```bash
chezmoi init --apply gwynnnplaine/dotfiles
```

Clones into `~/.local/share/chezmoi` and applies. Optionally run `./install.sh`
for `brew bundle` + macOS App Support symlinks (Ghostty, Lazygit).

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
| Ghostty | `~/.config/ghostty/config.ghostty` |
| Ghostty (macOS alt) | `~/Library/Application Support/com.mitchellh.ghostty/config.ghostty` (symlinked to `~/.config` by `install.sh`) |
| Neovim | `~/.config/nvim` |
| Lazygit | `~/Library/Application Support/lazygit/config.yml` (symlinked to `~/.config` by `install.sh`) |
| Shared skills | `~/.agents/skills` |
| Claude Code | `~/.claude` (`CLAUDE.md`, `skills` → symlinks to `~/.agents`) |

Font: `Iosevka Nerd Font Mono`, size 20.

## What's managed via chezmoi

- `~/.config/ghostty/config.ghostty`
- `~/.config/nvim/**`
- `~/.config/lazygit/config.yml`
- `~/.agents/**`
- `~/.claude/{CLAUDE.md,skills}` (as symlinks to `~/.agents`)

> `~/.pi` is **not** managed here — it is owned solely by the
> `i-love-this-shitty-agent` repo and is ignored via `home/.chezmoiignore`.
