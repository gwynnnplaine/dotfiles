#!/usr/bin/env bash
set -euo pipefail

DOTFILES="${DOTFILES:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)}"

echo "📁 Dotfiles: $DOTFILES"

# --- Homebrew packages ---
if command -v brew >/dev/null 2>&1 && [[ -f "$DOTFILES/Brewfile" ]]; then
  echo "🍺 Installing Homebrew packages..."
  brew bundle install --file="$DOTFILES/Brewfile" --no-upgrade
fi

# --- Ensure chezmoi ---
if ! command -v chezmoi >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "📦 Installing chezmoi via Homebrew..."
    brew install chezmoi
  else
    echo "❌ chezmoi is required. Install Homebrew (or chezmoi manually) and re-run."
    exit 1
  fi
fi

# --- Apply managed dotfiles ---
echo "🧩 Applying dotfiles with chezmoi..."
chezmoi -S "$DOTFILES" apply --force

# Ghostty on macOS may prioritize Application Support path.
# Keep a single source of truth by symlinking it to ~/.config.
if [[ "$(uname -s)" == "Darwin" ]]; then
  mkdir -p "$HOME/Library/Application Support/com.mitchellh.ghostty"
  ln -snf "$HOME/.config/ghostty/config.ghostty" \
    "$HOME/Library/Application Support/com.mitchellh.ghostty/config.ghostty"

  mkdir -p "$HOME/Library/Application Support/lazygit"
  ln -snf "$HOME/.config/lazygit/config.yml" \
    "$HOME/Library/Application Support/lazygit/config.yml"
fi

# --- Pi binary ---
echo "🤖 Installing/updating pi..."
npm install -g @mariozechner/pi-coding-agent

echo "✅ Done!"
