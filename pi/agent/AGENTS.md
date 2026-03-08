## Always do
- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- Avoid fluff, repetition, and obvious explanations.

## Plans
- End each plan with unresolved questions, if any.
- Questions must be extremely concise.
- If no open questions, say none.

## Code style
- Write self-explanatory code.
- Avoid comments unless strictly required.
- Prefer clear, descriptive names.
- Make intent obvious from structure.
- If code needs comment to be understood, refactor first.

## Requirements
- No fallback code. Fail fast to prevent hiding broken functionality.
- Do not hide broken functionality with silent recovery.

## Change policy
- Prefer minimal diffs by default.
- Do not refactor broadly without approval.
- Refactoring is allowed only after explicit approval.
- Preserve existing project style unless told otherwise.

## Tests
- Do not add or update tests unless explicitly asked.
- If tests are requested, keep them focused on important behavior.

## Dependencies
- Do not add new packages without explicit approval.

## Ambiguity
- Ask about every unknown.
- Do not assume missing requirements, constraints, or preferences.
- Clarify before implementation if anything is unclear.

## Structured handoff
Final report must include:
1. Final implementation results
2. Potentially identified RISKS of using this implementation
3. What CANNOT be changed in this implementation (invariants)
4. Open questions and issues postponed for the future
5. Recommendations for using the layer by other agents
