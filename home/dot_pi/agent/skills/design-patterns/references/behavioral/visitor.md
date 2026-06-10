# Visitor

**Book reference:** *Dive Into Design Patterns*, pp. 395–410.

## Intent
Visitor is a behavioral design pattern that lets you separate algorithms from the objects on which they operate.

## Problem
The book frames Visitor around a stable object structure that needs new operations added over time. Adding every operation into every element class causes class bloat and mixes unrelated concerns.

## Solution
Move each operation into a visitor object. Elements accept visitors and dispatch to the correct overload, giving the visitor access to the element's type-specific behavior.

## Structure
- **Visitor** interface with one method per element type
- **Concrete Visitors** implementing operations
- **Element** interface with `accept`
- **Concrete Elements** dispatching to the visitor

## Applicability
Use it when:
- the object structure is relatively stable
- new operations are added more often than new element types
- operations should be kept outside element classes

## Pros and cons
**Pros**
- Makes it easy to add new operations
- Keeps unrelated behaviors out of element classes
- Groups one operation's logic in one visitor

**Cons**
- Hard to add new element types because all visitors must change
- Requires exposing enough structure for visitors to work

## Related patterns
- [Composite](../structural/composite.md) is a common structure for visitors to traverse.
- [Iterator](iterator.md) and Visitor both traverse structures, but Visitor focuses on operations while Iterator focuses on access/traversal.
- [Strategy](strategy.md) changes one algorithm behind a context; Visitor adds many operations across many element types.

## TypeScript sketch
```ts
interface ShapeVisitor {
  visitCircle(circle: Circle): number;
  visitRectangle(rectangle: Rectangle): number;
}

interface Shape {
  accept(visitor: ShapeVisitor): number;
}

class Circle implements Shape {
  constructor(readonly radius: number) {}
  accept(visitor: ShapeVisitor) { return visitor.visitCircle(this); }
}

class Rectangle implements Shape {
  constructor(readonly width: number, readonly height: number) {}
  accept(visitor: ShapeVisitor) { return visitor.visitRectangle(this); }
}
```

## PR review cues
- Good fit if the PR adds new operations across a stable element hierarchy.
- Red flag if new element types are changing frequently or the visitor adds too much ceremony.
