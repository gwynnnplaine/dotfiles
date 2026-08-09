---
name: review
description: Deep, read-only, standards-backed code review of local changes, a commit/range, or a GitHub PR. Use via /skill:review with an optional target (staged | commit/range | pr <number|url> | GitHub PR URL).
disable-model-invocation: true
---
Review target: the argument appended to this skill invocation. If empty, default to local staged + unstaged. This is review-only: do not edit files, apply patches, or "fix as you go" unless the user explicitly asks after the review.

## 1. Select the review target

GitHub PR URL or `pr N` → follow [references/pr-checkout.md](references/pr-checkout.md) exactly for checkout and, later, restore. Stay on the PR branch; switch back only when the user explicitly says so. All diffs use three-dot syntax: `git diff "origin/$BASE_REF"...HEAD`. No target → local staged + unstaged. Otherwise a git ref or review focus. State the selected target before reviewing.

Completion criterion: the target is explicit and backed by inspected git state or the user's instruction.

## 2. Load standards and local context

Read these IN ORDER before you look at the diff:

1. The project ./AGENTS.md at the repo root (NOT the global AGENTS.md).
2. [`../coding-standards/SKILL.md`](../coding-standards/SKILL.md) and [`../coding-standards/VOCABULARY.md`](../coding-standards/VOCABULARY.md).
3. [`../coding-standards/ROUTING.md`](../coding-standards/ROUTING.md), then open **every** topic file it routes to for the concerns this diff touches. For any `.ts`/`.tsx` change this ALWAYS includes `DOMAIN_MODELING.md` and `TYPESCRIPT_CONTRACTS.md`. Reading `ROUTING.md` without opening the files it points to does not count.
4. If the diff touches `.ts`/`.tsx`, read the [`type-review`](../type-review/SKILL.md) skill — it defines the verdict worksheet you must produce below.

Then inspect local code for conventions around errors, schemas, testing, DI, observability, and module layout before reporting a pattern deviation.

Completion criterion: every file above is open via a read call this session, **read in full** (a truncated read with `limit` does not count), **before any diff hunk or changed file content is read** — the only git operations allowed before then are the checkout protocol and `git diff --stat`. Name the topic files you opened; a file you did not read completely this session does not count as loaded.

## 3. Review the change

Design through the **non-happy path first** — name the failures, empty and boundary cases, and misuse before judging the happy path. Trace changed behavior through the codebase, never a diff hunk in isolation, following values across:

- external input → parser → domain type;
- domain invariant → constructor/transition → persistence;
- result → caller handling → protocol response;
- secret source → error/log/trace sink;
- async work → cancellation, promise ownership, retry/idempotency;
- interface → adapter → dependency;
- test → public interface / real seam → observable behavior.

Hunt the smells agents commonly miss — Boolean Blindness, representable invalid states, validated-but-not-parsed data, hidden Expected Failures, secret leaks, pass-through wrappers, hidden globals, floating promises, module mocks — their definitions live in the topic files you just read.

Treat every diff comment that asserts an invariant ("X can't happen", "backs the type", "always set when Y", "hidden until Z lands") as a lead, not a rationale: find the type that makes the compiler enforce the claim. No such type → that is a DOMAIN_MODELING finding. A comment is a hope; a type is a guarantee — an author's comment can never close a finding, only open one.

Work in vertical slices (source → domain → UI → tests), not file lists. Name findings in the shared vocabulary (VOCABULARY.md), not ad-hoc words.

Completion criterion: each material changed behavior, boundary, failure path, seam, async path, and test claim has either no issue or a concrete candidate finding.

## 4. Require proof for every finding

A finding survives only with concrete evidence. Quote the actual problematic code (path + line range), not a paraphrase. When behavior is the issue, show the value flow: real inputs, resulting outputs, the call path. When absent (missing contract/test), say what is missing. Every finding cites the exact `file:line`. If proof is missing, downgrade to **Question** or drop it.

Completion criterion: every candidate finding has a precise location and behavioral proof, not a standards preference.

## 5. Self-challenge findings

Before final output, try to disprove each finding: did local convention already solve this elsewhere? is there a parser/seam/test setup outside the diff that satisfies it? is the value actually redacted? is the async intentionally sequential? is the broad type narrowed by a surrounding interface? is it merely a preference with no behavioral consequence? Drop or downgrade what does not survive.

**Guard:** a finding that a changed path violates a `coding-standards` **non-negotiable** cannot be dropped or downgraded below **Should Fix** by self-challenge. A non-negotiable either holds or it doesn't — boolean blindness, a representable invalid state, a trust cast, a hidden expected failure do not become nits because the fix is a little work.

Two disproofs are banned: "the author explains it in a comment" (comments are claims, not evidence) and "the type-level fix is too awkward" without an attempted sketch — if an `Exclude<...>`, derived subtype, or discriminated-union sketch works in two lines, the finding stands with that sketch as its fix.

Completion criterion: final findings have survived an explicit attempt to disprove them, and no non-negotiable violation was silently dropped.

## Severity

- **Blocker** — likely correctness, safety, security, data-loss, idempotency, boundary, observability, or test-integrity issue in changed code; or a changed path violates a non-negotiable with behavioral consequence.
- **Should Fix** — meaningful design, contract, or verification issue to address before merge; the guard floor for any non-negotiable violation.
- **Simplification** — a clearer/deeper/smaller design that removes complexity without changing semantics.
- **Nit** — small local issue, low behavioral risk.
- **Question** — unresolved ambiguity where the right call depends on product/domain/local intent.

## Output

Compose the full review — flow map, findings, type design — then deliver it as an **HTML report** plus a **terminal summary**. The full review lives in the HTML file; do not dump it into the terminal.

### Flow map
ASCII diagram, input → output. When the change touches composition, DI, or adapter/seam wiring, draw two paths — production and test — and check they converge below the seam; divergence deeper than the adapter boundary is a finding (the core can't be tested without reaching past the seam).

Every "can't happen" edge in the map must cite the guard that makes it impossible (`file:line`) and account for the paths that bypass it — client-side navigation, direct state writes, alternative entry points. An unverified "can't happen" is a **Question**, not a fact.

### Findings
Grouped by severity in order: Blocker, Should Fix, Simplification, Nit, Question. Follow [references/finding-style.md](references/finding-style.md) exactly — the team voice, the question-first format, the banned list. It is mandatory; findings in the wrong voice are worthless. If two findings share a root cause, merge them. If nothing survives, say so briefly and list the standards areas checked. No praise, no "what's good" section.

### Type design
Only for `.ts`/`.tsx` changes: the `type-review` verdict. Produce its derivation worksheet verbatim — a Type design section without the worksheet is invalid. Do not reconstruct the rubric from memory; the rules live only in that skill.

### HTML report
Render the three sections above into a self-contained HTML file following [references/html-report.md](references/html-report.md) exactly — fill the fixed skeleton, do not redesign it. Write it to `/tmp/pi-review-<target>.html` and open it with `open`. Escape `&`, `<`, `>` inside code blocks.

### Terminal summary
After opening the report, print only: one line per non-empty severity with counts, the worksheet's final `score = … label = …` line, the report path, and the GitHub question below. Nothing else — the details are in the report.

### GitHub
After the review, ask whether to post to the PR. If yes, follow [references/github-posting.md](references/github-posting.md) exactly. The review `event` derives from severity: any Blocker or Should Fix → `REQUEST_CHANGES`; otherwise → `COMMENT`. Never `APPROVE` automatically. Always ask before submitting; never auto-post.
