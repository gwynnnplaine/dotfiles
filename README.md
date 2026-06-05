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
- `.agents` (symlink) → `home/dot_agents` (compat path for local agent tooling)

## Daily workflow

```bash
chezmoi update   # pull + apply (routine sync)
chezmoi diff     # preview pending changes
chezmoi apply    # apply
```

See also: [`AGENTS.md`](./AGENTS.md), [`CONFIG_PATHS.md`](./CONFIG_PATHS.md)

## Config directories (where apps actually read from)

| Tool | Config location |
|---|---|
| Ghostty | `~/.config/ghostty/config.ghostty` |
| Ghostty (macOS alt) | `~/Library/Application Support/com.mitchellh.ghostty/config.ghostty` |
| Neovim | `~/.config/nvim` |
| Lazygit | `~/Library/Application Support/lazygit` (on this macOS setup via `lazygit --print-config-dir`) |
| Pi (global) | `~/.pi/agent` |
| Pi (project override) | `.pi/settings.json` inside a repo |
| Shared skills | `~/.agents/skills` |
| Claude Code | `~/.claude` |

Notes:
- Ghostty config is managed at `~/.config/ghostty/config.ghostty` and `install.sh` symlinks the macOS App Support path to it.
- Font configured: `Iosevka Nerd Font Mono`, size 20.

## What's managed via chezmoi

- `~/.config/ghostty/config.ghostty`
- `~/.config/nvim/**`
- `~/.config/lazygit/config.yml`
- `~/.agents/**`
- `~/.claude/{CLAUDE.md,skills}` (as symlinks to `~/.agents`)

> `~/.pi` is **not** managed here — it is owned solely by the
> `i-love-this-shitty-agent` repo and is ignored via `home/.chezmoiignore`.
