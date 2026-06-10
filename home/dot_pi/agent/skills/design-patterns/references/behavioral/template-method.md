# Template Method

**Book reference:** *Dive Into Design Patterns*, pp. 383–394.

## Intent
Template Method is a behavioral design pattern that defines the skeleton of an algorithm in the superclass but lets subclasses override specific steps without changing the algorithm's overall structure.

## Problem
The book motivates Template Method with workflows that share a stable sequence but differ in a few steps. Duplicating the whole workflow across subclasses wastes code and increases drift.

## Solution
Put the common algorithm in a base class. Mark variable steps as abstract or overridable hooks for subclasses.

## Structure
- **Abstract Class** defining the template method
- **Primitive operations** implemented by subclasses
- optional **hooks** with default behavior
- **Concrete Classes** overriding steps

## Applicability
Use it when:
- the overall algorithm order should stay fixed
- subclasses should customize only certain steps
- you want to eliminate duplicate workflow code

## Pros and cons
**Pros**
- Reuses a stable algorithm skeleton
- Restricts variation to well-defined extension points
- Reduces duplicated workflow code

**Cons**
- Ties variation to inheritance
- Base-class changes can affect all subclasses
- Hooks can become subtle if overused

## Related patterns
- [Factory Method](../creational/factory-method.md) is often used as a specialized step inside a template method.
- [Strategy](strategy.md) solves similar variation via composition instead of inheritance.

## TypeScript sketch
```ts
abstract class DataMiner {
  run(path: string) {
    const raw = this.read(path);
    const parsed = this.parse(raw);
    return this.analyze(parsed);
  }

  protected abstract read(path: string): string;
  protected abstract parse(raw: string): unknown;

  protected analyze(parsed: unknown) {
    return { parsed };
  }
}

class CsvMiner extends DataMiner {
  protected read(path: string) { return `csv:${path}`; }
  protected parse(raw: string) { return raw.split(':'); }
}
```

## PR review cues
- Good fit if the PR preserves one stable workflow and varies just a few steps.
- Red flag if inheritance is used where strategy composition would be clearer.
