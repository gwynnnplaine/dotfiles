#!/usr/bin/env bash
# dotfiles install script
# Creates symlinks from dotfiles into the expected system locations.
# Safe to re-run — uses -f to overwrite existing symlinks.
# Skips sections if the source directory doesn't exist.

DOTFILES="$HOME/dotfiles"

# --- Brew ---
if command -v brew &> /dev/null && [[ -f "$DOTFILES/Brewfile" ]]; then
  echo "🍺 Installing Homebrew packages..."
  brew bundle install --file="$DOTFILES/Brewfile" --no-upgrade
  echo "  ✔ brew packages"
fi

# --- Pi ---
if ! command -v pi &> /dev/null; then
  echo "📦 Installing pi..."
  npm install -g @mariozechner/pi-coding-agent
  echo "  ✔ pi"
fi

# --- Fonts ---
FONTS_DIR="$DOTFILES/fonts"
if [[ -d "$FONTS_DIR" ]]; then
  echo "🔤 Installing fonts..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    TARGET_FONTS="$HOME/Library/Fonts"
  else
    TARGET_FONTS="$HOME/.local/share/fonts"
  fi
  mkdir -p "$TARGET_FONTS"
  find "$FONTS_DIR" \( -name "*.ttf" -o -name "*.otf" \) | while read -r font; do
    cp -n "$font" "$TARGET_FONTS/"
  done
  if [[ "$OSTYPE" != "darwin"* ]]; then
    fc-cache -fv "$TARGET_FONTS" &>/dev/null
  fi
  echo "  ✔ fonts"
fi

# --- Symlinks ---
echo "🔗 Linking dotfiles..."

# Ghostty
if [[ -d "$DOTFILES/ghostty" ]]; then
  mkdir -p "$HOME/.config/ghostty"
  ln -sf "$DOTFILES/ghostty/config" "$HOME/.config/ghostty/config"
  echo "  ✔ ghostty"
fi

# Neovim
if [[ -d "$DOTFILES/nvim" ]]; then
  mkdir -p "$HOME/.config/nvim"
  ln -sf "$DOTFILES/nvim" "$HOME/.config/nvim"
  echo "  ✔ nvim"
fi

# Zellij
if [[ -d "$DOTFILES/zellij" ]]; then
  mkdir -p "$HOME/.config/zellij"
  ln -sf "$DOTFILES/zellij" "$HOME/.config/zellij"
  echo "  ✔ zellij"
fi

# Pi
if [[ -d "$DOTFILES/pi" ]]; then
  ln -sf "$DOTFILES/pi" "$HOME/.pi"
  echo "  ✔ pi"
fi

echo ""
echo "✅ Done!"
