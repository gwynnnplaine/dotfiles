# dotfiles

## Install

```bash
git clone https://github.com/gwynnnplaine/dotfiles ~/Documents/dotfiles
cd ~/Documents/dotfiles
./install.sh
```

Requires [Homebrew](https://brew.sh) and [Node.js](https://nodejs.org) (via nvm) pre-installed.

## What's included

### Shell & Terminal
- **Ghostty** — terminal config with FiraCode Nerd Font
- **Starship** — prompt

### Editor
- **Neovim** — full config with plugins (LSP, Treesitter, ui icons via nvim-web-devicons)

### Git
- **lazygit** — TUI config
- **git-delta** — diff viewer

### AI Agents
- **pi** — agent config, extensions, themes (rose-pine)
- **Shared skills** (`~/.agents/skills/`) — loaded by pi, Claude Code, and OpenCode
- **Claude Code** — CLAUDE.md + skills wired to shared agents dir
- **AGENTS.md** — global instructions for all agents

### CLI tools
- `fd`, `fzf`, `rg`, `bat`, `btop`, `yazi`, `zoxide`, `gh`, `bun`, `opencode`

### Fonts
- FiraCode Nerd Font (installed via Homebrew cask)
