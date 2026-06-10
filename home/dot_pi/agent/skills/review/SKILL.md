---
name: review
description: Deep, read-only code review of local changes, a commit/range, or a GitHub PR, with a type-first lens and a strict question-led finding format. Use via /skill:review with an optional target (staged | commit/range | pr <number|url> | GitHub PR URL).
disable-model-invocation: true
---
Review target: the argument appended to this skill invocation (shown below as `User: <target>`). If empty, default to local staged + unstaged.

GitHub PR URL → use `gh`. No target → local staged + unstaged. Otherwise git ref or review focus.

PR checkout protocol (GitHub PR URL or `pr N`):
```bash
# enter — persist state to files; shell vars do NOT survive across turns/sessions
git branch --show-current > /tmp/pi-review.branch
gh pr view N --json baseRefName --jq '.baseRefName' > /tmp/pi-review.base
BASE_REF=$(cat /tmp/pi-review.base)
# stash only if the tree is dirty, and record that we did
if [ -n "$(git status --porcelain)" ]; then
  git stash push --include-untracked -q -m pi-review && : > /tmp/pi-review.stashed
fi
gh pr checkout N
git fetch origin "$BASE_REF" --quiet
# All diffs MUST use three-dot syntax against the fetched base:
#   git diff "origin/$BASE_REF"...HEAD
# Three dots = merge-base to HEAD = exactly what GitHub shows.
# Two dots or a stale origin ref will include unrelated commits.
# stay on the PR branch. DO NOT checkout back automatically.
```
All diff and file reads are local after checkout. **Do not switch back to the original branch until the user explicitly says so** — they may want to keep poking at the PR after the review. When the user says to restore:
```bash
git checkout "$(cat /tmp/pi-review.branch)" --quiet
[ -f /tmp/pi-review.stashed ] && git stash pop -q && rm -f /tmp/pi-review.stashed
rm -f /tmp/pi-review.branch /tmp/pi-review.base
```

Your first tool calls MUST be:
1. Read the project ./AGENTS.md at the repo root (NOT the global ~/.pi/agent/AGENTS.md)
2. If .ts/.tsx in diff: read the `type-review` skill — the type lens you review with, plus the 0–5 / fast-lasts verdict.

Pull a specific `typescript-meta` READ WHEN doc only when a finding needs that depth (runtime schemas, trust boundaries, typed errors, variance) — don't bulk-load it.

Do not analyze the diff until these are read.

## How to review

Goal: make the change and the codebase better in the long run — not maximize findings. A clean change with two sharp findings beats a noisy one with ten. Approving fast is a valid outcome.

**Think in types first** — apply the `type-design` lens ([../type-design/SKILL.md](../type-design/SKILL.md)): the signatures are the program. Delete the bodies mentally — if the types stop telling the structural story (data shapes, errors, state transitions), that's the finding.

- Trace changed behavior through the codebase. Never review a diff in isolation.
- No evidence, no finding.
- Investigate before asking. git, gh, types, tests, repo files — use them.
- Vertical slices (source → domain → UI → tests), not file lists.
- For each slice: classify design risk, ask what breaks.
- Have taste. Flag mediocrity, not just bugs.

Before writing findings, read [references/finding-style.md](references/finding-style.md) — the voice, the strict finding format, the banned list, and team-voice examples. It is mandatory; the findings are worthless in the wrong voice.

## Output

### Flow map
ASCII diagram. Input to output. When the change touches composition, DI, or adapter/seam wiring, draw two paths — production and test — and check they converge below the seam; divergence deeper than the adapter boundary is a finding (the core can't be tested without reaching past the seam).

### Findings
Numbered blocks separated by `---`. Each: number + question + why + `file:line`. Optional bare code block. Every finding MUST cite the exact file and line number. Follow [references/finding-style.md](references/finding-style.md) exactly.

### Type design
Produce the `type-review` verdict: score the change's type system **0–5** and label it **fast** or **lasts**, one sentence each with the deciding evidence.

### Verdict
Answer as tech lead:
- What does this change actually solve?
- What's working that must NOT change, and why does it last? (the one keep-signal allowed — structural, not filler praise)
- What would you push back on in a 1:1?
- What's missing that a strong version would include?

Keep each answer to one sentence. Then: **Approve**, **Request changes**, or **Needs discussion**.

### GitHub
After the review, ask whether to post to PR. If yes, follow [references/github-posting.md](references/github-posting.md) exactly. Always ask before submitting; never auto-post.
