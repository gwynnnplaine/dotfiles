---
name: grill-with-types
description: Engineering grilling session that stress-tests a plan and produces type signatures as the design artifact before any implementation. Use when user wants to design a TypeScript feature, stress-test an engineering plan with types, or mentions "grill with types".
---

<what-to-do>

Run the `grill-me` interview protocol ([../grill-me/SKILL.md](../grill-me/SKILL.md)): one question per message, each with your recommended answer, walking the decision tree. One addition: if a question can be answered by exploring the codebase, explore instead of asking.

When the questions stop revealing new constraints or trade-offs, the grilling is done. Summarize the key decisions, then design the types.

</what-to-do>

<type-first-design>

## When the grilling converges

ALWAYS present the solution as type signatures before writing any implementation — the types are the program (the `type-design` lens, [../type-design/SKILL.md](../type-design/SKILL.md)).

Produce them with the `type-design` skill ([../type-design/SKILL.md](../type-design/SKILL.md)): the type contracts, the disambiguation results (resolved decisions, with unresolved ambiguities as open questions), and the prod/test call graph. Then wait for explicit approval before writing any implementation code.

</type-first-design>
