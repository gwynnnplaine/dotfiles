---
name: structured-handoff
description: After completing work, generate a structured handoff report. Use this whenever finishing a task, feature, layer, or component. Reports must include all 5 mandatory sections (results, risks, invariants, open questions, recommendations) to hand off to other agents or review. Enforce this structure on every final deliverable.
---

# Structured Handoff

After completing work, produce a handoff report that captures what you built, what risks exist, what's locked in, what's still open, and how others should use it.

## Mandatory Report Structure

Generate a report with all 5 sections. Use this template exactly:

```
# Structured Handoff: [TASK/LAYER/COMPONENT NAME]

## 1. Final implementation results
- What was built/changed
- Key files, functions, behavior
- How to verify it works
- Links to commits/code if applicable

## 2. Potentially identified RISKS
- Security, performance, compatibility issues
- Edge cases not handled
- Dependencies on external state
- What could break this

## 3. What CANNOT be changed (invariants)
- Design decisions that are locked in
- Why they're locked (constraints, dependencies, requirements)
- Assumptions baked into the code
- What future changes must preserve

## 4. Open questions and issues postponed
- Ambiguities or unknowns encountered
- Deferred implementation details
- Performance/scale concerns not yet addressed
- Things that need user/stakeholder input

## 5. Recommendations for using this layer by other agents
- How to integrate this into other work
- Common use patterns
- What not to do
- Suggested next steps
```

## Guidelines

**Section 1 (Results):** Be specific. "Fixed auth bug" → "Fixed JWT token refresh logic in `/auth/refresh.ts:42-58`. Tokens now valid for 24h instead of 1h. Tests in `auth.test.ts` line 120-140 verify."

**Section 2 (Risks):** Name the actual risk, not the worry. "Risky code" → "Token refresh race condition under 100+ concurrent requests; tested up to 50. Load test at 200 needed."

**Section 3 (Invariants):** What's decided and why. "Database schema now requires user_id FK. Can't change without migration + client updates. Rationale: enforce referential integrity."

**Section 4 (Open questions):** Concise, actionable. "How should deleted users' posts be handled? Currently cascade-delete, but unclear if that's desired. Needs product input."

**Section 5 (Recommendations):** Practical next steps. "Integrate via `getUser(id)` export. Cache token in localStorage max 24h. Don't call refresh more than every 60s."

## Structure matters

- All 5 sections must be present and substantive (not empty).
- Each section should be 2-5 bullet points minimum.
- Use context from the work completed. Never fudge or fabricate sections.
- If a section genuinely has no content (e.g., no risks identified), say so explicitly but briefly: "No risks identified." Then explain why if it's non-obvious.

## When to use

- After implementing a feature
- After fixing a bug
- After refactoring code
- After completing a design/architecture task
- Before handing off to another agent
- At the end of sprint/milestone work

## Output rules

**NEVER write the report content in the chat response.**

Save the report to `.pi/handoff/` with a descriptive timestamped filename:

```
.pi/handoff/[TASK_NAME]-[YYYY-MM-DD_HH-MM-SS].md
```

Examples:
- `.pi/handoff/jwt-token-refresh-2026-03-08_22-30-45.md`
- `.pi/handoff/sql-injection-fix-2026-03-08_14-02-30.md`
- `.pi/handoff/payment-async-refactor-2026-03-08_09-15-30.md`

Use `mkdir -p .pi/handoff` then write the file with the bash tool.

In the chat response write only a short confirmation, e.g.: "Handoff saved to .pi/handoff/jwt-token-refresh-2026-03-08_22-30-45.md"
