#!/usr/bin/env bash
set -e

DOTFILES="$HOME/Documents/dotfiles"

# --- Brew ---
if command -v brew &>/dev/null && [[ -f "$DOTFILES/Brewfile" ]]; then
  echo "🍺 Installing Homebrew packages..."
  brew bundle install --file="$DOTFILES/Brewfile" --no-upgrade
fi

# --- Pi ---
echo "📦 Installing/updating pi..."
npm install -g @mariozechner/pi-coding-agent

# --- Stow ---
echo "🔗 Stowing dotfiles..."
stow --restow --dir="$DOTFILES" --target="$HOME" nvim
stow --restow --dir="$DOTFILES" --target="$HOME" ghostty
stow --restow --dir="$DOTFILES" --target="$HOME" lazygit

# --- Pi agent (manual — pi manages ~/.pi/ itself) ---
AGENT_LINK="$HOME/.pi/agent"
AGENT_TARGET="$DOTFILES/pi/agent"
if [[ "$(readlink "$AGENT_LINK")" != "$AGENT_TARGET" ]]; then
  rm -rf "$AGENT_LINK"
  ln -sf "$AGENT_TARGET" "$AGENT_LINK"
fi

# --- Agents (shared skills across pi, claude code, opencode) ---
rm -rf "$HOME/.agents"
ln -sf "$DOTFILES/agents" "$HOME/.agents"

# --- Claude Code ---
mkdir -p "$HOME/.claude"
ln -sf "$DOTFILES/agents/AGENTS.md" "$HOME/.claude/CLAUDE.md"
rm -rf "$HOME/.claude/skills"
ln -sf "$DOTFILES/agents/skills" "$HOME/.claude/skills"

echo "✅ Done!"
