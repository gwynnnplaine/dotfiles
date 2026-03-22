# Config path map (macOS)

This is the single source of truth for where each tool reads config.

| Tool | Effective config path | How verified |
|---|---|---|
| Ghostty | `~/.config/ghostty/config.ghostty` | `ghostty +edit-config --help` + `ghostty +show-config` |
| Ghostty (macOS alt path) | `~/Library/Application Support/com.mitchellh.ghostty/config.ghostty` | Ghostty docs/help; symlinked to `~/.config` in `install.sh` |
| Lazygit | `~/Library/Application Support/lazygit/config.yml` | `lazygit --print-config-dir` |
| Neovim | `~/.config/nvim` | `nvim --headless '+lua print(vim.fn.stdpath("config"))' +qa` |
| Pi (global) | `~/.pi/agent/settings.json` and `~/.pi/agent/*` | Pi README (`Settings`, `Customization`) |
| Pi (project override) | `.pi/settings.json` | Pi README (`Settings`) |
| Shared agent skills | `~/.agents/skills` | Pi README (`Skills` search paths) |
| Claude Code | `~/.claude` (with `CLAUDE.md`, `skills`) | Existing working setup + Anthropic docs conventions |

## Policy in this repo

- `chezmoi` manages everything from `home/`.
- macOS App Support paths that differ from XDG paths are symlinked back to `~/.config`:
  - Ghostty
  - Lazygit
- `~/.pi/agent/AGENTS.md` and `~/.pi/agent/skills` are symlinks to `~/.agents`.
- `~/.claude/CLAUDE.md` and `~/.claude/skills` are symlinks to `~/.agents`.
