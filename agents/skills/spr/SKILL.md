---
name: spr
description: >
  Workflow skill for managing stacked pull requests on GitHub using `spr`. Use this skill whenever
  the user wants to implement a feature, fix a bug, or start any non-trivial coding task — proactively
  suggest breaking it into a commit stack with spr before writing code. Also trigger on: "let's implement",
  "let's build", "let's add", "let's refactor", any spr commands (git spr update/status/merge/amend),
  "push my stack", "update my PRs", "merge my stack", "my PR is too big", or any mention of stacked PRs/diffs.
---

# spr — Stacked Pull Requests on GitHub

Every commit on your branch becomes a separate GitHub PR. `spr` handles pushing, creating, updating, and merging the whole stack — no manual `git push` or opening PRs in the browser.

```
branch: main
  └── commit A  →  PR #58  (reviewers see only A's diff)
  └── commit B  →  PR #59  (reviewers see only B's diff)
  └── commit C  →  PR #60  (reviewers see only C's diff)
```

## Step 0: Plan the stack before writing code

When starting any non-trivial task, **always propose a commit decomposition plan first**. Ask:

- What are the logical layers of this change? (schema → API → UI, or types → logic → tests, etc.)
- What's the smallest independently-reviewable slice?
- Does anything need to land first to unblock the rest?

Then present a proposed stack, e.g.:

```
commit 1: "feat(db): add users table migration"
commit 2: "feat(api): add POST /users endpoint"
commit 3: "feat(ui): add user registration form"
```

Confirm with the user before starting. Good stacks have 2–5 commits; each one should make sense on its own.

## Daily workflow

### Committing

Each commit will become one PR. Commit subject → PR title, body → PR body.

```bash
git add <files> && git commit -m "feat: add X"
git add <files> && git commit -m "feat: add Y"
```

Prefix with `WIP` (all caps) to commit without creating a PR yet:
```bash
git commit -m "WIP half-done thing"
```

### Pushing / updating PRs

```bash
git spr update              # sync entire stack → creates/updates all PRs
git spr update --count 2   # sync only the bottom 2
```

This replaces `git push`. For GitHub operations (viewing PRs, adding reviewers, labels, etc.) use the `gh-cli` skill.

### Checking status

```bash
git spr status
```

```
[✅❌✅✅] 61: Feature C   ← awaiting approval
[✅✅✅✅] 60: Feature B
[✅✅✅✅] 59: Feature A
```

Status bits: `[CI checks][approval][conflicts][stack]`

| Symbol | Meaning |
|--------|---------|
| ✅ | passed / approved / clear |
| ❌ | failed / not approved / blocked |
| ⌛ | pending |
| ➖ | not required (configured) |

All 4 bits must be ✅ or ➖ to merge.

### Amending a commit mid-stack

Stage your changes, then use `git amend` instead of `git commit`:

```bash
git add <files>
git amend          # interactive prompt: pick which commit to amend
git spr update     # re-sync the stack
```

### Merging

**Never merge via the GitHub UI** — stacked PRs must merge in order. Use:

```bash
git spr merge              # merge all mergeable PRs
git spr merge --count 2   # merge only bottom 2
```

spr combines all mergeable commits into one PR, merges it, and closes the rest (this avoids redundant CI runs).

### Starting a new stack

```bash
git checkout -b new_branch @{push}   # branch from latest pushed state
```

## Configuration

| File | Scope |
|------|-------|
| `.spr.yml` in repo root | shared repo settings (commit this) |
| `~/.spr.yml` | personal preferences |

### Key repo settings

```yaml
requireChecks: true          # CI must pass to merge
requireApproval: true        # approval required to merge
githubBranch: main           # base branch for PRs
mergeMethod: rebase          # rebase | squash | merge
mergeQueue: false            # use GitHub merge queue
defaultReviewers: []         # auto-add reviewers to every PR
prTemplateType: stack        # stack | basic | why_what | custom
prTemplatePath: ""           # path to custom template file
githubHost: github.com       # override for GitHub Enterprise
showPrTitlesInStack: false   # show PR titles in stack body
branchPushIndividually: false # push one-by-one (fix for push timeouts)
```

### Key user settings

```yaml
createDraftPRs: false        # new PRs start as drafts
preserveTitleAndBody: false  # don't overwrite PR title/body on update
noRebase: false              # skip rebasing on origin
deleteMergedBranches: false  # auto-delete branches after merge
shortPRLink: false           # show PR-<number> instead of full URL
showCommitID: false          # show commit hash next to each PR
```

## Common scenarios

**Reviewer left comments on PR #2 (middle of stack)**
```bash
git add <files>
git amend          # pick commit 2
git spr update
```

**Merge queue / required checks blocking merge**
```yaml
# .spr.yml
mergeQueue: true
requireChecks: true
```

**GitHub Enterprise**
```yaml
# .spr.yml
githubHost: github.mycompany.com
```

**Custom PR template**
```yaml
# .spr.yml
prTemplatePath: .github/PULL_REQUEST_TEMPLATE/template.md
prTemplateInsertStart: "<!-- spr-start -->"
prTemplateInsertEnd: "<!-- spr-end -->"
```
