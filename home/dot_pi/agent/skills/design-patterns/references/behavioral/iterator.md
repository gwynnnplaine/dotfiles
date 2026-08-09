# Iterator

**Book reference:** *Dive Into Design Patterns*, pp. 291–305.

## Intent
Iterator is a behavioral design pattern that lets you traverse elements of a collection without exposing its underlying representation.

## Problem
The book frames this around collections whose internal structure should stay hidden, while clients still need consistent traversal.

## Solution
Move traversal state and logic into iterator objects. Collections expose a way to create iterators instead of exposing internals directly.

## Structure
- **Iterator** interface
- **Concrete Iterators** storing traversal state
- **Collection / Aggregate** producing iterators
- **Client** using the iterator abstraction

## Applicability
Use it when:
- collection internals should remain hidden
- you need multiple traversal strategies over the same collection
- traversal logic should not live in client code

## Pros and cons
**Pros**
- Separates traversal from collection internals
- Supports multiple simultaneous traversals
- Keeps client code uniform

**Cons**
- Can be unnecessary for trivial native collections
- Extra objects may feel heavy in simple cases

## Related patterns
- [Composite](../structural/composite.md) often pairs with iterators for tree traversal.
- [Memento](memento.md) can capture iterator state for restoration.
- [Visitor](visitor.md) may be preferable when operations over elements matter more than traversal mechanics.

## TypeScript sketch
```ts
class Words implements Iterable<string> {
  constructor(private values: string[]) {}

  *[Symbol.iterator]() {
    for (const value of this.values) yield value;
  }
}
```

## PR review cues
- Good fit if the PR hides collection internals while exposing stable traversal.
- Red flag if it wraps built-in iteration with no extra value.
