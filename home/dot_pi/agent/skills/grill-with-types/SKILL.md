---
name: grill-with-types
description: Engineering grilling session that stress-tests a plan and produces type signatures as the design artifact before any implementation. Use when user wants to design a TypeScript feature, stress-test an engineering plan with types, or mentions "grill with types".
---

<what-to-do>

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time. ALWAYS only 1 question per message.

If a structured question tool is available (e.g. ask_user, ask, user_input), use it for every question instead of plain text. Only the question goes through the tool — context and reasoning stay in the message body.

If a question can be answered by exploring the codebase, explore the codebase instead.

When the questions stop revealing new constraints or trade-offs, the grilling is done. Summarize the key decisions, then design the types.

</what-to-do>

<type-first-design>

## When the grilling converges

ALWAYS present the solution as type signatures before writing any implementation. Types are the actual program; implementation is a runtime courtesy.

Produce them with the `type-design` skill ([../type-design/SKILL.md](../type-design/SKILL.md)): the type contracts, the disambiguation results (resolved decisions, with unresolved ambiguities as open questions), and the prod/test call graph. Then wait for explicit approval before writing any implementation code.

</type-first-design>
