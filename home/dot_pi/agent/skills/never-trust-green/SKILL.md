---
name: never-trust-green
description: Lock existing behavior with a characterization test, then prove the net is real with a sabotage check, before any change that could break behavior that already runs. Invoke via /skill:never-trust-green when modifying existing code, adding logic to it, or wiring new code into an existing flow. For isolated new behavior, use the tdd skill instead.
disable-model-invocation: true
---

# Never Trust Green

A test that's green from the first run proves nothing. Make it bleed once — then trust it.

## When

Trace the flow your change sits in — entry point to output. List what already runs through it: callers, consumers, side effects. Then one question: **can this change break something that works today?**

- **Yes — anything existing can break** → apply this. Always.
- **No — isolated new behavior, nothing wired to it yet** → skip. Use [tdd](../tdd/SKILL.md).

"New code" is not the test. A new function wired into an old flow can break that flow → apply. The line is risk, not file age.

Characterize only what you could break — the affected paths, not the whole system. The trace tells you which ones.

## Why

Existing code already works. A test you add now is **green from the first run** — and a green test proves nothing. It might never touch the code at all. That's a **false safety net**: you change the logic, the test stays green, the bug ships.

So make the test fail on purpose. A test you've watched go red is a test you can trust.

## How to write the test

This skill is the *when*; the *how* lives in [tdd](../tdd/SKILL.md)'s references. Read these before characterizing — they are not optional:

- [tests.md](../tdd/tests.md) — good vs bad tests. Test behavior through the **public interface**. A characterization test that asserts internals dies on the next refactor — the exact moment you need it.
- [mocking.md](../tdd/mocking.md) — mock at **system boundaries** only. Never mock the code you're about to sabotage: a mocked path can't bleed, and the check turns into theater.
- [interface-design.md](../tdd/interface-design.md) — read it **when the test can't get in**: the code builds its own dependencies, hits globals, hides its output. Cut the **minimal seam** that lets the test through — accept a dependency, return a value — and stop there. No redesign before the net is up.

[deep-modules.md](../tdd/deep-modules.md) and [refactoring.md](../tdd/refactoring.md) stay out of this phase on purpose. They describe what code **should** look like; characterization pins what code **does**. Improving code before the net is up is the exact failure this skill exists to prevent. They apply in the implementation phase — the tdd skill routes them.

## Loop

1. **Characterize.** Write a test for each behavior you could break — through the public interface, per [tests.md](../tdd/tests.md). Assert what the code does **now**, not what it should do. Don't know the output? Assert a guess, run it, let the failure tell you the real value, bake it in.
2. **Sabotage.** Break the production code on purpose — flip a condition, return a wrong value.
3. **Watch it go red.** Red → the net is real, move on. Still green → the test is worthless. Fix the test, sabotage again.
4. **Revert** the sabotage. Green again.
5. **Implement** your task. If you move behavior you didn't mean to, the net catches you.

## Example

You're about to add a discount tier to this shipping function:

```ts
function priceFor(plan: Plan): number {
  return plan.base * (plan.annual ? 0.8 : 1);
}
```

**Characterize** — lock today's behavior:

```ts
test("annual plans get 20% off", () => {
  expect(priceFor({ base: 100, annual: true })).toBe(80);
});
```

Green on the first run. Useless until you've seen it bite.

**Sabotage** — break the math:

```ts
return plan.base * (plan.annual ? 1 : 1); // 0.8 -> 1
```

Test goes red: `expected 80, got 100`. The net is real.

**Revert**, confirm green, then add your tier — knowing this test will scream if you touch the 20% path by accident.

## Then

The safety net is up. Implement the new behavior with [tdd](../tdd/SKILL.md): red, green, refactor.
