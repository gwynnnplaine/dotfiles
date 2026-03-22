# dotfiles

Managed with [chezmoi](https://www.chezmoi.io/) for reproducible, idempotent setup.

## Install

```bash
git clone https://github.com/gwynnnplaine/dotfiles ~/dotfiles
cd ~/dotfiles
./install.sh
```

## Layout

- `home/` — chezmoi source state (`.chezmoiroot` points here)
- `.agents` (symlink) → `home/dot_agents` (compat path for local agent tooling)
- `pi/agent` (symlink) → `home/dot_pi/agent` (compat path)

## Daily workflow

```bash
# preview
chezmoi -S ~/dotfiles diff

# apply
chezmoi -S ~/dotfiles apply
```

See also: [`CONFIG_PATHS.md`](./CONFIG_PATHS.md)

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
- Font configured: `FiraCode Nerd Font Mono`.

## What's managed via chezmoi

- `~/.config/ghostty/config.ghostty`
- `~/.config/nvim/**`
- `~/.config/lazygit/config.yml`
- `~/.agents/**`
- `~/.pi/agent/{extensions,prompts,settings.json,system-theme.json}`
- `~/.pi/agent/{AGENTS.md,skills}` (as symlinks to `~/.agents`)
- `~/.claude/{CLAUDE.md,skills}` (as symlinks to `~/.agents`)
