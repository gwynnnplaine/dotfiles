#!/usr/bin/env bash
set -euo pipefail

# Installs the global Vite+ CLI (vp), which also manages Node.js. The installer
# appends to ~/.zshrc and writes ~/.zshenv; chezmoi then overwrites both with
# the managed versions (dot_zshenv loads Vite+).
if [ -x "$HOME/.local/share/vite-plus/bin/vp" ]; then
  exit 0
fi
echo "⚡ Installing Vite+ (vp)..."
curl -fsSL https://vite.plus | VP_NODE_MANAGER=yes CI=1 bash </dev/null
"$HOME/.local/share/vite-plus/bin/vp" env default lts
