#!/usr/bin/env bash
set -euo pipefail

DOTFILES="${DOTFILES:-$HOME/Documents/dotfiles}"

# --- Brew ---
if command -v brew &>/dev/null && [[ -f "$DOTFILES/Brewfile" ]]; then
  echo "🍺 Installing Homebrew packages..."
  brew bundle install --file="$DOTFILES/Brewfile" --no-upgrade
fi

# --- Pi ---
echo "📦 Installing/updating pi..."
npm install -g @mariozechner/pi-coding-agent

# --- Neovim (merge updates) ---
mkdir -p "$HOME/.config/nvim"
rsync -a "$DOTFILES/nvim/" "$HOME/.config/nvim/"

# --- Ghostty ---
mkdir -p "$HOME/.config/ghostty"
install -m 644 "$DOTFILES/ghostty/config" "$HOME/.config/ghostty/config"
mkdir -p "$HOME/Library/Application Support/com.mitchellh.ghostty"
install -m 644 "$DOTFILES/ghostty/config" "$HOME/Library/Application Support/com.mitchellh.ghostty/config"

# --- Lazygit ---
mkdir -p "$HOME/.config/lazygit"
install -m 644 "$DOTFILES/lazygit/config.yml" "$HOME/.config/lazygit/config.yml"
mkdir -p "$HOME/Library/Application Support/lazygit"
install -m 644 "$DOTFILES/lazygit/config.yml" "$HOME/Library/Application Support/lazygit/config.yml"

# --- Bin helpers ---
mkdir -p "$HOME/bin"
install -m 755 "$DOTFILES/bin/delta-auto" "$HOME/bin/delta-auto"

# --- Shared agents (single source in repo: .agents) ---
mkdir -p "$HOME/.agents"
rsync -a "$DOTFILES/.agents/" "$HOME/.agents/"

# --- Pi agent (merge updates; keep runtime local) ---
mkdir -p "$HOME/.pi/agent"
rsync -a "$DOTFILES/pi/agent/" "$HOME/.pi/agent/"
rm -rf "$HOME/.pi/agent/skills"
ln -sf "$HOME/.agents/skills" "$HOME/.pi/agent/skills"

# --- Claude Code ---
mkdir -p "$HOME/.claude"
install -m 644 "$HOME/.agents/AGENTS.md" "$HOME/.claude/CLAUDE.md"
mkdir -p "$HOME/.claude/skills"
rsync -a "$HOME/.agents/skills/" "$HOME/.claude/skills/"

echo "✅ Done!"
