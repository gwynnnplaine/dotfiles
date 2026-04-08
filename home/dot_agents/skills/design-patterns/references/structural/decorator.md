# Decorator

**Book reference:** *Dive Into Design Patterns*, pp. 194–211.

## Intent
Decorator is a structural design pattern that lets you attach new behaviors to objects by placing them inside wrapper objects that contain the behaviors.

## Problem
The book presents Decorator as a way to avoid subclass explosion when optional combinations of behavior must be added dynamically.

## Solution
Keep the same component interface across the base object and wrappers. Each decorator holds a wrapped component and adds behavior before or after delegating.

## Structure
- **Component** common interface
- **Concrete Component** base behavior
- **Base Decorator** storing wrapped component
- **Concrete Decorators** layering responsibilities

## Applicability
Use it when:
- behavior should be combinable at runtime
- subclassing for all combinations would explode
- callers should keep using the same interface

## Pros and cons
**Pros**
- Add responsibilities dynamically
- Combine behaviors without subclass explosion
- Follow composition over inheritance

**Cons**
- Many small wrapper objects can make debugging harder
- Order of decorators can affect behavior
- Removing a middle layer can be awkward

## Related patterns
- [Adapter](adapter.md) changes interface; Decorator preserves it.
- [Proxy](proxy.md) has a similar wrapper shape but controls access instead of adding responsibilities.
- [Composite](composite.md) also uses recursive composition, but for part-whole trees.

## TypeScript sketch
```ts
interface Notifier {
  send(message: string): string[];
}

class EmailNotifier implements Notifier {
  send(message: string) { return [`email:${message}`]; }
}

class SlackDecorator implements Notifier {
  constructor(private inner: Notifier) {}
  send(message: string) {
    return [...this.inner.send(message), `slack:${message}`];
  }
}

class SmsDecorator implements Notifier {
  constructor(private inner: Notifier) {}
  send(message: string) {
    return [...this.inner.send(message), `sms:${message}`];
  }
}
```

## PR review cues
- Good fit if the PR adds optional layers while preserving the same contract.
- Red flag if the wrapper is really doing access control or API translation instead.
