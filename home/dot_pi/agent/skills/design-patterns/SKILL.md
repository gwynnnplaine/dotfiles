---
name: design-patterns
description: Book-grounded guide for teaching, choosing, comparing, and reviewing GoF design patterns from Dive Into Design Patterns. Use whenever the user asks which pattern fits, when to use a pattern, how two patterns differ, whether a refactor matches a pattern, how to review a PR through a design-pattern lens, or wants TypeScript examples for Factory Method, Abstract Factory, Builder, Prototype, Singleton, Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy, Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, or Visitor.
compatibility: read, write, edit, bash. Bundled markdown references only.
---

# Design Patterns

Use this skill as a **book-grounded** reference based on *Dive Into Design Patterns*.

The priority order is:
1. follow the book's framing of the pattern
2. explain the design pressure clearly
3. translate the idea into practical TypeScript
4. use the pattern for PR review only after checking that the code really matches the book's intent

## Source policy

- Treat the bundled references as summaries/adaptations of the book, not replacements for the book.
- Keep the book's structure first: **intent → problem → solution → structure → applicability → pros/cons → related patterns**.
- If you add a practical TypeScript note, label it clearly as practical guidance rather than book text.

## Reading order

1. Read `references/overview.md` for quick triage.
2. Read the relevant family index:
   - `references/creational.md`
   - `references/structural.md`
   - `references/behavioral.md`
3. Read the detailed pattern file(s) linked from that family index.

## Modes

### 1) Teaching / explanation
Use when the user wants to learn a pattern.

Prefer this format:
- **Pattern**
- **Intent**
- **Problem**
- **Solution**
- **Applicability**
- **Pros and cons**
- **Related patterns**
- **TypeScript sketch**

### 2) Pattern selection / comparison
Use when the user asks which pattern fits.

Workflow:
1. Identify whether the pressure is creational, structural, or behavioral.
2. Narrow to 1-3 candidates.
3. Compare them using the book's intent and applicability sections.
4. Recommend the simplest pattern that genuinely matches the problem.
5. Say explicitly when no pattern is needed.

### 3) PR review / code review
Use when reviewing the user's work or someone else's PR.

Workflow:
1. Detect whether a pattern is explicitly used or only implicitly approximated.
2. Compare the PR's problem to the **Problem** and **Applicability** sections of the detailed pattern file.
3. Compare the code's shape to the book's **Structure** section.
4. Check whether the PR gains the pattern's benefits or only adds indirection.
5. Produce a concise review comment.

Use this exact review shape:

### Pattern detected
- Name, or `none / pattern attempted`

### Why it fits / doesn't
- Tie the judgment to the book's problem/applicability framing

### Risks
- Overengineering, hidden coupling, wrong abstraction boundary, subclass explosion, global state, etc.

### Suggested review comment
- A short review-ready comment the user can paste into a PR

### Alternative
- Simpler code, or a better-fit pattern, with a one-line reason

## Guidance

- Do not force a named pattern onto ordinary code.
- Distinguish **book intent** from **practical TypeScript implementation**.
- Prefer composition over inheritance when that is also consistent with the book's motivation.
- When two patterns look structurally similar, explain the difference in **intent**.
- If the code is overabstracted, say so directly.
- If the code is under-abstracted and repeating the book's motivating problem, call that out directly.

## Reference map

- `references/overview.md`
- `references/principles.md`
- `references/creational.md`
- `references/structural.md`
- `references/behavioral.md`
