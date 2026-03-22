---
name: monorepo-improver
description: Analyze and improve architecture of ONE app/package in a monorepo, with emphasis on maintainability, scalability, and readability. Use this whenever the user asks to improve codebase architecture, reduce coupling, simplify module boundaries, prepare incremental refactors, or produce an architecture RFC. Prefer this skill even if the user only says "improve this app structure," "make this codebase scalable," or "how should we refactor this package professionally."
---

# monorepo-improver

Analyze one monorepo app/package and produce a **detailed Markdown RFC**.

## Scope and guardrails

- Analyze exactly **one** app/package per run.
- **Analysis-only**. Do not edit code. Do not add packages. Do not refactor files.
- Focus on:
  - maintainability
  - scalability
  - readability
- Recommend **incremental rollout**, not big-bang rewrite.

## Required inputs

Ask for these before deep analysis (if missing):
1. Target app/package path or name
2. Key pain signals (slow onboarding, frequent regressions, hard-to-test seams, unclear ownership)
3. Constraints (timeline, team size, release pressure, risk tolerance)

If user cannot provide all, infer from repository evidence and clearly mark assumptions.

## Mandatory process

### 1) Baseline architecture scan

- Identify workspace shape (workspace package layout, task pipeline)
- Map target app/package dependencies:
  - internal package deps
  - shared util/platform deps
  - cross-boundary imports
- Identify architecture friction:
  - high fan-in/fan-out modules
  - shallow modules (thin wrappers leaking complexity)
  - cyclic/near-cyclic dependency patterns
  - mixed responsibilities in same module
  - frequent cross-layer reaching

### 2) Explain problem and impact

For each top issue, explain:
- **Problem**: what is structurally wrong
- **Why it is a problem**: delivery speed, defect risk, cognitive load, onboarding cost
- **Evidence**: concrete file/module/dependency signals

### 3) Research external patterns (mandatory)

Use both skills every run:
- `web-search` skill to discover current references/case studies/patterns
- `web-fetch` skill to read selected pages and extract key points

If those skills are not available in this environment, state this explicitly and continue with best-effort references from known sources.

Then summarize:
- how other teams handle similar monorepo architecture issues
- what is transferable vs not transferable
- cite source URLs inline

### 4) Professional adoption strategy (incremental)

Propose staged plan that a real team can execute under constraints:
- Phase 0: guardrails/observability (architecture checks, ownership clarity)
- Phase 1: tracer-bullet slice (small boundary improvement end-to-end)
- Phase 2: expand by adjacency (neighbor modules/packages)
- Phase 3: stabilization and docs

For each phase include:
- scope
- expected benefit
- risks
- rollback strategy
- readiness gate to move forward

### 5) Concerns and counterarguments

Include explicit “what can go wrong” section:
- migration churn
- temporary duplication
- partial adoption inconsistency
- CI/task graph side effects in the monorepo task runner
- team coordination overhead

Provide mitigations for each concern.

### 6) Produce detailed Markdown RFC

Use exact structure below.

## Output format (Markdown only)

```md
# RFC: Architecture Improvement Plan for <app-or-package>

## 1. Context
- Scope (single app/package)
- Current business/engineering constraints
- Success criteria (maintainability, scalability, readability)

## 2. Current-State Findings
### 2.1 Architecture snapshot
### 2.2 Top friction points

For each friction point:
- Problem
- Why this matters now
- Evidence (paths, dependency shape, coupling signals)

## 3. Industry Patterns and External Validation
- Pattern A
  - How others do it
  - Source
  - Applicability here
- Pattern B
- Pattern C

## 4. Options Considered
### Option 1: Minimal boundary deepening
### Option 2: Domain-oriented module consolidation
### Option 3: Ports/adapters at high-risk seams

For each option:
- Expected impact
- Cost/effort
- Risk level
- Why/when to choose

## 5. Recommended Approach
- Chosen option + rationale
- What not to change yet
- Trade-offs accepted

## 6. Incremental Rollout Plan (Professional Execution)
### Phase 0: Preconditions and guardrails
### Phase 1: Tracer-bullet implementation
### Phase 2: Progressive expansion
### Phase 3: Stabilization and institutionalization

Per phase include:
- Deliverables
- Owner profile
- Exit criteria
- Rollback plan

## 7. Concerns, Risks, and Mitigations
- Concern
- Impact
- Mitigation
- Trigger signal to watch

## 8. Metrics and Review Cadence
- Maintainability indicators
- Scalability indicators
- Readability indicators
- Weekly review ritual / governance

## 9. Decision Log
- Assumptions made
- Open questions
- Follow-up RFCs needed
```

## Quality bar

- Be concrete; cite real modules/paths.
- Distinguish facts vs assumptions.
- Avoid rewrite-everything advice.
- Prioritize decisions that reduce cognitive load for future contributors.
- End with concise executive summary + next 2 weeks of actions.
