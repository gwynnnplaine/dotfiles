# Observer

**Book reference:** *Dive Into Design Patterns*, pp. 338–353.

## Intent
Observer is a behavioral design pattern that lets you define a subscription mechanism to notify multiple objects about events that happen to the object they are observing.

## Problem
The book's problem is one-to-many dependency. A subject changes, and multiple dependent objects need to react, but direct hard-coded calls make the system rigid.

## Solution
Give the subject subscription management and notification behavior. Observers implement a common update interface and subscribe or unsubscribe dynamically.

## Structure
- **Publisher / Subject**
- **Subscriber / Observer** interface
- **Concrete Subscribers**
- subscription list and notify operation

## Applicability
Use it when:
- many objects should react to another object's changes
- subscribers should come and go dynamically
- direct coupling between publisher and dependents is undesirable

## Pros and cons
**Pros**
- Supports dynamic subscriptions
- Decouples publisher from concrete subscribers
- Works well for event-driven updates

**Cons**
- Notification order can matter and become subtle
- Subscribers may be notified unexpectedly if lifecycle is unclear

## Related patterns
- [Mediator](mediator.md) may use Observer for component notifications.
- [Chain of Responsibility](chain-of-responsibility.md), [Command](command.md), and [Observer](observer.md) differ mainly in how requests are routed and who knows whom.

## TypeScript sketch
```ts
type Listener<T> = (value: T) => void;

class Subject<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(listener: Listener<T>) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(value: T) {
    for (const listener of this.listeners) listener(value);
  }
}
```

## PR review cues
- Good fit if the PR models one-to-many notifications cleanly.
- Red flag if observers are really just synchronous hidden dependencies with unclear lifecycle.
