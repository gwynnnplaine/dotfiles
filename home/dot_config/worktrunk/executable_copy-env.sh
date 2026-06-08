#!/usr/bin/env bash
# Copy gitignored .env* files from the primary worktree into the current
# (new) worktree, preserving per-app paths (e.g. apps/web/.env.local).
#
# Invoked by worktrunk pre-start hooks; runs in the new worktree (cwd).
# Usage: copy-env.sh <primary-worktree-path>
#
# - Source list comes from git, so only gitignored env files are copied
#   (tracked .env.test etc. are left to git, registered worktrees are skipped).
# - build/ and node_modules/ are excluded (stale artifacts / rebuilt by install).
# - No pipefail: an empty grep result is normal (repo with no env files) and
#   must not abort this blocking hook. Real cp failures still surface via set -e.
set -eu

src=${1:?usage: copy-env.sh <primary-worktree-path>}

git -C "$src" ls-files -o -i --exclude-standard \
  | grep -E '(^|/)\.env([._-]|$)' \
  | grep -vE '(^|/)(build|node_modules)/' \
  | while IFS= read -r rel; do
      mkdir -p "$(dirname "$rel")"
      cp "$src/$rel" "$rel"
    done
