# Chain of Responsibility

**Book reference:** *Dive Into Design Patterns*, pp. 252–269.

## Intent
Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers. Upon receiving a request, each handler decides either to process it or to pass it to the next handler.

## Problem
The book frames this around senders being tightly coupled to specific receivers or to large conditional dispatch blocks, even though multiple handlers may be able to process the request.

## Solution
Link handlers into a chain behind a common interface. Each handler either handles the request or forwards it.

## Structure
- **Handler** interface
- **Base handler** optionally storing `next`
- **Concrete handlers** deciding whether to process or pass on
- **Client** composing and using the chain

## Applicability
Use it when:
- several handlers may process a request
- the exact receiver should be chosen at runtime
- handler order should stay configurable

## Pros and cons
**Pros**
- Decouples sender from concrete receivers
- Makes handler order configurable
- Supports single-responsibility handlers

**Cons**
- Requests may go unhandled
- Debugging the active path can be harder

## Related patterns
- [Command](command.md), [Mediator](mediator.md), and [Observer](observer.md) also route requests differently.
- [Composite](../structural/composite.md) trees sometimes act as handler chains.

## TypeScript sketch
```ts
abstract class Handler<T> {
  private next?: Handler<T>;

  setNext(next: Handler<T>) {
    this.next = next;
    return next;
  }

  handle(value: T): string | undefined {
    return this.next?.handle(value);
  }
}

class NumberHandler extends Handler<unknown> {
  handle(value: unknown) {
    return typeof value === 'number' ? `number:${value}` : super.handle(value);
  }
}

class StringHandler extends Handler<unknown> {
  handle(value: unknown) {
    return typeof value === 'string' ? `string:${value}` : super.handle(value);
  }
}
```

## PR review cues
- Good fit if the PR makes receiver selection configurable and decoupled.
- Red flag if the chain is just a long linear pipeline where every step always runs.
