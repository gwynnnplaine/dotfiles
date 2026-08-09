# PR checkout protocol

Persist state to files — shell vars do NOT survive across turns/sessions.

## Enter

```bash
git branch --show-current > /tmp/pi-review.branch
gh pr view N --json baseRefName --jq '.baseRefName' > /tmp/pi-review.base
BASE_REF=$(cat /tmp/pi-review.base)
if [ -n "$(git status --porcelain)" ]; then
  git stash push --include-untracked -q -m pi-review && : > /tmp/pi-review.stashed
fi
gh pr checkout N
git fetch origin "$BASE_REF" --quiet
```

All diffs MUST use three-dot syntax: `git diff "origin/$BASE_REF"...HEAD`. Three dots = merge-base to HEAD = exactly what GitHub shows; two dots or a stale origin ref includes unrelated commits.

## Restore (only when the user explicitly asks)

```bash
git checkout "$(cat /tmp/pi-review.branch)" --quiet
[ -f /tmp/pi-review.stashed ] && git stash pop -q && rm -f /tmp/pi-review.stashed
rm -f /tmp/pi-review.branch /tmp/pi-review.base
```
