# Strategy

**Book reference:** *Dive Into Design Patterns*, pp. 370–382.

## Intent
Strategy is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.

## Problem
The book frames Strategy around one context supporting multiple algorithm variants. Keeping them inside one class leads to conditionals and entangled implementations.

## Solution
Extract each algorithm into a strategy type behind a common interface. The context delegates work to the current strategy and may swap strategies at runtime.

## Structure
- **Context** using a strategy
- **Strategy** interface
- **Concrete Strategies** implementing algorithm variants

## Applicability
Use it when:
- several algorithm variants solve the same task
- algorithm choice should be swappable at runtime
- you want to replace conditionals with composition

## Pros and cons
**Pros**
- Swaps algorithms without changing the context
- Isolates algorithm implementations
- Favors composition over inheritance

**Cons**
- Clients must understand strategy differences to choose one well
- Adds several classes/objects for algorithm variants

## Related patterns
- [State](state.md) has a similar structure but different intent.
- [Template Method](template-method.md) solves similar variation with inheritance rather than composition.
- [Flyweight](../structural/flyweight.md) can sometimes share stateless strategies.

## TypeScript sketch
```ts
interface CompressionStrategy {
  compress(data: string): string;
}

class ZipCompression implements CompressionStrategy {
  compress(data: string) { return `zip:${data}`; }
}

class GzipCompression implements CompressionStrategy {
  compress(data: string) { return `gzip:${data}`; }
}

class Compressor {
  constructor(private strategy: CompressionStrategy) {}
  setStrategy(strategy: CompressionStrategy) { this.strategy = strategy; }
  run(data: string) { return this.strategy.compress(data); }
}
```

## PR review cues
- Good fit if the PR extracts real algorithm variants behind one contract.
- Red flag if the “strategies” are just one-line wrappers without meaningful variation.
