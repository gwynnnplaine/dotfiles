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

# Lazygit on macOS reads from Application Support; symlink it to ~/.config.
# (Ghostty/cmux read ~/.config/ghostty/config directly — no symlink needed.)
if [[ "$(uname -s)" == "Darwin" ]]; then
  mkdir -p "$HOME/Library/Application Support/lazygit"
  ln -snf "$HOME/.config/lazygit/config.yml" \
    "$HOME/Library/Application Support/lazygit/config.yml"

  # Nushell on macOS reads from Application Support; symlink config to ~/.config.
  NU_SUPPORT="$HOME/Library/Application Support/nushell"
  mkdir -p "$NU_SUPPORT"
  ln -snf "$HOME/.config/nushell/config.nu" "$NU_SUPPORT/config.nu"
  ln -snf "$HOME/.config/nushell/env.nu" "$NU_SUPPORT/env.nu"
  # Generate prompt/jump integrations into Nu's autoload dir.
  if command -v nu >/dev/null 2>&1; then
    NU_AUTOLOAD="$NU_SUPPORT/vendor/autoload"
    mkdir -p "$NU_AUTOLOAD"
    command -v starship >/dev/null 2>&1 && starship init nu > "$NU_AUTOLOAD/starship.nu"
    command -v zoxide  >/dev/null 2>&1 && zoxide init nushell > "$NU_AUTOLOAD/zoxide.nu"
    command -v fzf     >/dev/null 2>&1 && fzf --nushell > "$NU_AUTOLOAD/fzf.nu"
  fi
fi

# --- Pi binary ---
echo "🤖 Installing/updating pi..."
npm install -g @mariozechner/pi-coding-agent

echo "✅ Done!"
