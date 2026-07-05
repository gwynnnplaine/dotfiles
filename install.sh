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
    if command -v oh-my-posh >/dev/null 2>&1; then
      # oh-my-posh v26+ self-writes the init script into NU_AUTOLOAD (nothing on
      # stdout) and skips rewriting when version+config are unchanged. Drop any
      # stale/empty copy first so a changed config always regenerates.
      rm -f "$NU_AUTOLOAD/oh-my-posh.nu"
      oh-my-posh init nu --config "$HOME/.config/oh-my-posh/config.json"
    fi
    command -v zoxide  >/dev/null 2>&1 && zoxide init nushell > "$NU_AUTOLOAD/zoxide.nu"
    # fzf's shipped script still uses `str downcase`, deprecated in nu 0.114
    # in favor of `str lowercase` (nushell#18364); drop the sed once fzf updates.
    command -v fzf     >/dev/null 2>&1 && fzf --nushell | sed 's/str downcase/str lowercase/g' > "$NU_AUTOLOAD/fzf.nu"
    command -v wt      >/dev/null 2>&1 && wt config shell install nu --yes
  fi
fi

# --- Pi binary ---
# Pi moved from @mariozechner to @earendil-works on 2026-05-07 (>= 0.74.0).
# --- corepack: enable pnpm shim in fnm's default Node ---
if command -v fnm >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
  echo "📦 Enabling corepack pnpm shim..."
  FNM_DEFAULT=$(fnm default)
  FNM_DIR="${FNM_DIR:-$HOME/.local/share/fnm}"
  NODE_BIN="$FNM_DIR/node-versions/$FNM_DEFAULT/installation/bin"
  if [[ -d "$NODE_BIN" ]]; then
    corepack enable pnpm --install-directory "$NODE_BIN"
  fi
fi

echo "🤖 Installing/updating pi..."
npm install -g --ignore-scripts @earendil-works/pi-coding-agent

# Other npm globals (LSP servers, etc.) are installed declaratively by chezmoi
# via .chezmoidata/packages.yaml + run_onchange_install-npm-globals.sh.tmpl,
# which runs during the `chezmoi apply` below.

echo "✅ Done!"
