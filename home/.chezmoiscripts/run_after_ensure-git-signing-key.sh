#!/usr/bin/env bash
set -euo pipefail

# Per-machine SSH commit-signing key referenced by ~/.gitconfig
# (user.signingkey). Keys are never synced: each machine mints its own and
# registers it on GitHub as a signing key. Losing one is harmless — delete it,
# run `chezmoi apply`, re-register.
#
# Runs on every `chezmoi apply`: generates the key only when missing, and
# rewrites ~/.config/git/allowed_signers (machine-local, not managed) so
# `git log --show-signature` can verify locally.

key="$HOME/.ssh/id_ed25519_signing"
signers="$HOME/.config/git/allowed_signers"
email="$(git config --global user.email)"
host="$(hostname -s)"

if [[ ! -f "$key" ]]; then
  echo "🔏 Generating git signing key ${key}"
  mkdir -p "$HOME/.ssh"
  chmod 700 "$HOME/.ssh"
  ssh-keygen -t ed25519 -N "" -q -C "${email} signing ${host}" -f "$key"
  echo "   Register it on GitHub (once per machine):"
  echo "     gh auth refresh -h github.com -s admin:ssh_signing_key"
  echo "     gh ssh-key add ${key}.pub --type signing --title ${host}"
fi

mkdir -p "$(dirname "$signers")"
printf '%s namespaces="git" %s\n' "$email" "$(cut -d' ' -f1,2 "${key}.pub")" >"$signers"
