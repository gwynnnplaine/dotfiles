# READ WHEN calibrating strictness

Increase strictness when these grow:

- system complexity
- team size
- contributor/agent count
- code lifetime/churn

Rules:

- Keep one consistent pattern set project-wide.
- Prefer strong type-safety defaults for new or isolated code.
- If adopting a pattern (`Result`, branded types, Effect-style operations, etc.), roll out consistently.
- Respect existing architecture; mention migrations separately instead of doing drive-by rewrites.
- Invest in lint/rules/templates so humans + agents converge on same output quality.
