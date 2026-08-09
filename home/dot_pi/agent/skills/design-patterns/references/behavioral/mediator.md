# Mediator

**Book reference:** *Dive Into Design Patterns*, pp. 306–321.

## Intent
Mediator is a behavioral design pattern that lets you reduce chaotic dependencies between objects by restricting direct communications and forcing them to collaborate only via a mediator object.

## Problem
The book's problem is dense peer-to-peer dependencies, especially in UI components, where each object knows too much about the others.

## Solution
Centralize coordination in a mediator. Components notify the mediator about events instead of talking directly to each other.

## Structure
- **Mediator** interface
- **Concrete Mediator** coordinating colleagues
- **Colleague / Component** objects delegating interaction to the mediator

## Applicability
Use it when:
- many objects communicate in tangled ways
- behavior is hard to change because logic is scattered across peers
- a central coordination policy would simplify the design

## Pros and cons
**Pros**
- Reduces direct coupling among peers
- Centralizes collaboration logic
- Makes colleagues easier to reuse in other contexts

**Cons**
- The mediator can grow into a god object
- Centralization may hide too much flow in one place

## Related patterns
- [Observer](observer.md) is often used by components to notify a mediator.
- [Facade](../structural/facade.md) also centralizes access, but for a subsystem boundary rather than peer coordination.
- [Chain of Responsibility](chain-of-responsibility.md) and [Command](command.md) route interactions differently.

## TypeScript sketch
```ts
interface Mediator {
  notify(sender: object, event: string): void;
}

class Button {
  constructor(private mediator: Mediator) {}
  click() { this.mediator.notify(this, 'click'); }
}

class TextInput {
  value = '';
  constructor(private mediator: Mediator) {}
  change(value: string) {
    this.value = value;
    this.mediator.notify(this, 'change');
  }
}
```

## PR review cues
- Good fit if the PR removes peer-to-peer entanglement.
- Red flag if the mediator just becomes another giant central switch statement.
